import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Sparkles,
  FileDown,
  Plus,
  Globe,
  Trash2,
  Edit3,
  ExternalLink,
  LogOut,
  User as UserIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { siteApi, authApi } from '../lib/api.js';
import { logout, setUser, setQuotaRemaining } from '../features/auth/authSlice.js';
import PromptModal from '../features/generate/PromptModal.jsx';
import ImportWizard from '../features/generate/ImportWizard.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreatingBlank, setIsCreatingBlank] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Sync user profile & quota
      const meData = await authApi.getMe();
      if (meData.user) {
        dispatch(setUser(meData.user));
      }

      // Load sites
      const sitesData = await siteApi.list();
      setSites(sitesData.sites || []);
    } catch (err) {
      setError(err.message || 'Failed to load your sites.');
      if (err.status === 401) {
        dispatch(logout());
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateBlank = async () => {
    setIsCreatingBlank(true);
    try {
      const res = await siteApi.create({ title: 'New Portfolio' });
      navigate(`/editor/${res.site._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create site.');
    } finally {
      setIsCreatingBlank(false);
    }
  };

  const handleDeleteSite = async (siteId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this portfolio?')) return;

    try {
      await siteApi.delete(siteId);
      setSites((prev) => prev.filter((s) => s._id !== siteId));
    } catch (err) {
      alert(err.message || 'Failed to delete site.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account and all your portfolios? This cannot be undone.')) return;

    try {
      await authApi.deleteAccount();
      dispatch(logout());
      navigate('/');
    } catch (err) {
      alert(err.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-zinc-900 selection:bg-[#B6FF4D]">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-200 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-extrabold tracking-tight">Thirty Seconds</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Daily Quota Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-[#111111]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{user?.remainingGenerations ?? 5} / 5 AI Generations Left Today</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
              <span className="hidden md:inline">@{user?.username}</span>
              <button
                onClick={() => {
                  dispatch(logout());
                  navigate('/');
                }}
                title="Log Out"
                className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-200">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              Welcome, {user?.name || 'Developer'}
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              Create and manage your lightning-fast portfolio sites.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Prompt Mode Button */}
            <button
              onClick={() => setIsPromptOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#111111] text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all hover:translate-y-[-1px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Describe It (Prompt)</span>
            </button>

            {/* Import Button */}
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
            >
              <FileDown className="w-4 h-4 text-[#B6FF4D]" />
              <span>Import Info</span>
            </button>

            {/* Blank Site Button */}
            <button
              onClick={handleCreateBlank}
              disabled={isCreatingBlank}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-sm flex items-center gap-1.5 transition-colors"
            >
              {isCreatingBlank ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Blank</span>
            </button>
          </div>
        </div>

        {/* Sites Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-4">
            Your Portfolios
          </h2>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Loading your portfolios...</p>
            </div>
          ) : sites.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200 p-8">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#111111] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">No portfolios created yet</h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
                Click "Describe It" or "Import Info" to have the AI craft your complete site in about 30 seconds.
              </p>
              <button
                onClick={() => setIsPromptOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-[#111111] text-white font-bold text-sm inline-flex items-center gap-2 hover:bg-[#111111] transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Build First Portfolio</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.map((site) => (
                <div
                  key={site._id}
                  onClick={() => navigate(`/editor/${site._id}`)}
                  className="p-6 bg-white rounded-2xl border border-zinc-200 hover:border-[#111111] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600">
                        {site.draft?.blocks?.length || 0} blocks
                      </span>

                      {site.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <Globe className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-zinc-400">
                          Draft
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#111111] transition-colors mb-1">
                      {site.title}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Updated {new Date(site.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/editor/${site._id}`);
                        }}
                        className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>

                      {site.isPublished && (
                        <a
                          href={`/p/${user?.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </a>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleDeleteSite(site._id, e)}
                      title="Delete site"
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Management footer */}
        <div className="mt-16 pt-8 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div>
            Logged in as <strong>{user?.email}</strong>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="text-red-500 hover:text-red-700 font-semibold hover:underline"
          >
            Delete Account & All Data
          </button>
        </div>
      </main>

      {/* Modals */}
      <PromptModal isOpen={isPromptOpen} onClose={() => { setIsPromptOpen(false); loadDashboardData(); }} />
      <ImportWizard isOpen={isImportOpen} onClose={() => { setIsImportOpen(false); loadDashboardData(); }} />
    </div>
  );
}
