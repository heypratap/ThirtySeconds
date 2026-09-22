import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Globe,
  Share2,
  ArrowLeft
} from 'lucide-react';
import {
  undo,
  redo,
  setDeviceView,
  setSiteTitle
} from './editorSlice.js';

export default function TopBar({ onPublish, onUnpublish, isPublishing }) {
  const dispatch = useDispatch();
  const {
    siteTitle,
    past,
    future,
    deviceView,
    saveStatus,
    isPublished
  } = useSelector((state) => state.editor);

  const { user } = useSelector((state) => state.auth);

  return (
    <header className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between select-none z-30">
      {/* Left: Back to dashboard & Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

        <input
          type="text"
          value={siteTitle}
          onChange={(e) => dispatch(setSiteTitle(e.target.value))}
          className="font-bold text-sm bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 py-1 rounded border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 text-zinc-900 dark:text-white max-w-[200px] sm:max-w-[280px] focus:outline-none focus:border-[#111111]"
        />

        {/* Save Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 pl-1">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              <span className="text-zinc-500">Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-zinc-400">Saved</span>
            </>
          )}
          {saveStatus === 'unsaved' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-zinc-400">Unsaved</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-red-500">Save failed</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Undo/Redo & Device Switcher */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => dispatch(undo())}
            disabled={past.length === 0}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => dispatch(redo())}
            disabled={future.length === 0}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Device Switcher */}
        <div className="hidden md:flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => dispatch(setDeviceView('desktop'))}
            title="Desktop View (100%)"
            className={`p-1.5 rounded transition-all ${
              deviceView === 'desktop'
                ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => dispatch(setDeviceView('tablet'))}
            title="Tablet View (768px)"
            className={`p-1.5 rounded transition-all ${
              deviceView === 'tablet'
                ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => dispatch(setDeviceView('mobile'))}
            title="Mobile View (375px)"
            className={`p-1.5 rounded transition-all ${
              deviceView === 'mobile'
                ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Public View & Publish Action */}
      <div className="flex items-center gap-2.5">
        {isPublished && user?.username && (
          <a
            href={`/p/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">View Live</span>
          </a>
        )}

        {isPublished ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onUnpublish}
              disabled={isPublishing}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              Unpublish
            </button>
            <button
              onClick={onPublish}
              disabled={isPublishing}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#111111] hover:bg-[#111111] text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Update Live</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#111111] hover:bg-[#111111] text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            <span>Publish Site</span>
          </button>
        )}
      </div>
    </header>
  );
}
