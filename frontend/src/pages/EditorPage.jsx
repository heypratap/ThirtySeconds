import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { siteApi, authApi } from '../lib/api.js';
import {
  initSite,
  undo,
  redo,
  setSaveStatus,
  setPublishedState
} from '../features/editor/editorSlice.js';
import { setUser } from '../features/auth/authSlice.js';
import TopBar from '../features/editor/TopBar.jsx';
import Palette from '../features/editor/Palette.jsx';
import Canvas from '../features/editor/Canvas.jsx';
import PropertiesPanel from '../features/editor/PropertiesPanel.jsx';
import { Loader2 } from 'lucide-react';

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    present: site,
    siteTitle,
    saveStatus,
    isPublished
  } = useSelector((state) => state.editor);

  const { user } = useSelector((state) => state.auth);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Debounced Autosave reference
  const autosaveTimeoutRef = useRef(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    async function loadSite() {
      try {
        setInitialLoading(true);
        // Also ensure user session is active
        if (!user) {
          const me = await authApi.getMe();
          if (me.user) dispatch(setUser(me.user));
        }

        const res = await siteApi.get(id);
        if (res.site) {
          dispatch(
            initSite({
              siteId: res.site._id,
              title: res.site.title,
              draft: res.site.draft,
              isPublished: res.site.isPublished,
              publishedAt: res.site.publishedAt
            })
          );
        }
      } catch (err) {
        setLoadError(err.message || 'Failed to load portfolio.');
      } finally {
        setInitialLoading(false);
      }
    }

    loadSite();
  }, [id, dispatch]);

  // 2. Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y)
  useEffect(() => {
    function handleKeyDown(e) {
      // Avoid intercepting when typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (isCtrlOrCmd) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          dispatch(undo());
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          dispatch(redo());
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  // 3. Debounced Autosave (1.5s)
  useEffect(() => {
    if (saveStatus !== 'unsaved' || !site) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(async () => {
      try {
        dispatch(setSaveStatus('saving'));
        await siteApi.updateDraft(id, {
          title: siteTitle,
          draft: site
        });
        dispatch(setSaveStatus('saved'));
      } catch (err) {
        console.error('Autosave error:', err);
        dispatch(setSaveStatus('error'));
      }
    }, 1500);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [site, siteTitle, saveStatus, id, dispatch]);

  // 4. Publish / Unpublish Actions
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // If there are unsaved changes, save immediately first
      await siteApi.updateDraft(id, {
        title: siteTitle,
        draft: site
      });
      dispatch(setSaveStatus('saved'));

      const res = await siteApi.publish(id);
      dispatch(setPublishedState({ isPublished: true, publishedAt: res.site.publishedAt }));
      alert(`🎉 Published! Your site is live at: ${window.location.origin}/p/${user?.username}`);
    } catch (err) {
      alert(err.message || 'Publishing failed.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm('Unpublishing will take your portfolio offline. Are you sure?')) return;
    setIsPublishing(true);
    try {
      await siteApi.unpublish(id);
      dispatch(setPublishedState({ isPublished: false }));
    } catch (err) {
      alert(err.message || 'Failed to unpublish.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#111111] mb-3" />
        <p className="text-sm font-semibold">Loading your portfolio canvas...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <p className="text-red-400 font-bold mb-3">{loadError}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 overflow-hidden select-none">
      {/* Top Bar */}
      <TopBar
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        isPublishing={isPublishing}
      />

      {/* Editor Body: Left Palette + Center Canvas + Right Properties */}
      <div className="flex-1 flex overflow-hidden">
        <Palette />
        <Canvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
