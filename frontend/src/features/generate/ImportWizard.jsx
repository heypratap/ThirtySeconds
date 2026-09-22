import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  FileText,
  Github,
  Type,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { generateApi, siteApi } from '../../lib/api.js';
import { setQuotaRemaining } from '../auth/authSlice.js';

export default function ImportWizard({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1); // 1 = Input sources, 2 = Review profile, 3 = Style & generate
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 inputs
  const [pdfFile, setPdfFile] = useState(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [pastedText, setPastedText] = useState('');

  // Step 2 extracted profile state
  const [profile, setProfile] = useState({
    name: '',
    headline: '',
    bio: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    links: []
  });

  // Step 3 style prompt
  const [stylePrompt, setStylePrompt] = useState('warm minimal with modern typography');

  if (!isOpen) return null;

  // Handler for Step 1: Submit inputs to extract profile
  const handleExtract = async (e) => {
    e?.preventDefault();
    if (!pdfFile && !githubUsername.trim() && !pastedText.trim()) {
      setError('Please provide at least one source (Upload a resume PDF, enter GitHub username, or paste bio).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      if (pdfFile) formData.append('resume', pdfFile);
      if (githubUsername.trim()) formData.append('githubUsername', githubUsername.trim());
      if (pastedText.trim()) formData.append('pastedText', pastedText.trim());

      const result = await generateApi.extractProfile(formData);
      if (result.profile) {
        setProfile(result.profile);
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Failed to extract profile info. Please verify your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for Step 3: Generate site from confirmed profile
  const handleGenerateFinal = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const genResult = await generateApi.fromProfile({
        profile,
        stylePrompt: stylePrompt.trim()
      });

      if (typeof genResult.quotaRemaining === 'number') {
        dispatch(setQuotaRemaining(genResult.quotaRemaining));
      }

      const siteDoc = await siteApi.create({
        title: `${profile.name || 'Developer'}'s Portfolio`,
        draft: genResult.site
      });

      onClose();
      navigate(`/editor/${siteDoc.site._id}`);
    } catch (err) {
      setError(err.message || 'Failed to build site from profile.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Top Header & Step Indicator */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Import Your Information</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                step === 1 ? 'bg-[#111111] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}>
                Step 1: Sources
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">→</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                step === 2 ? 'bg-[#111111] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}>
                Step 2: Review Profile
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">→</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                step === 3 ? 'bg-[#111111] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}>
                Step 3: Generate
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: INPUT SOURCES                                     */}
          {/* ========================================================= */}
          {step === 1 && (
            <form onSubmit={handleExtract} className="space-y-5">
              {/* Option A: PDF Upload */}
              <div className="p-4 border rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  <FileText className="w-4 h-4 text-[#111111]" />
                  <span>Option A: Resume PDF (or LinkedIn "Save to PDF")</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:border-[#111111] transition-colors cursor-pointer bg-white dark:bg-zinc-800 relative">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-zinc-400" />
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {pdfFile ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {pdfFile.name} ({(pdfFile.size / 1024).toFixed(0)} KB)
                        </span>
                      ) : (
                        <span>Click or drag your PDF resume here (Max 5MB)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Option B: GitHub Username */}
              <div className="p-4 border rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  <Github className="w-4 h-4 text-[#111111]" />
                  <span>Option B: GitHub Profile</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-mono">github.com/</span>
                  <input
                    type="text"
                    placeholder="e.g. torvalds"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className="flex-1 text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* Option C: Pasted Bio Text */}
              <div className="p-4 border rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  <Type className="w-4 h-4 text-[#111111]" />
                  <span>Option C: Pasted Bio or Career Summary</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste your LinkedIn About section, personal bio, or notable achievements..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-[#111111] text-white hover:bg-[#111111] disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Extract Profile Data</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 2: REVIEW & EDIT EXTRACTED PROFILE                   */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-zinc-800/60 border border-amber-200 dark:border-zinc-700 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                👉 <strong>Privacy Review:</strong> We extracted the info below. Please review, correct typos, or remove any private details before building your site.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Headline / Role</label>
                  <input
                    type="text"
                    value={profile.headline || ''}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    className="w-full text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full text-sm p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={(profile.skills || []).join(', ')}
                  onChange={(e) => {
                    const skills = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    setProfile({ ...profile, skills });
                  }}
                  className="w-full text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              {/* Projects Review */}
              <div>
                <span className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                  Projects ({profile.projects?.length || 0})
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto p-1 border rounded-lg border-zinc-200 dark:border-zinc-800">
                  {(profile.projects || []).map((proj, pIdx) => (
                    <div key={pIdx} className="p-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 rounded flex justify-between items-start">
                      <div>
                        <strong>{proj.name}</strong> — <span className="text-zinc-500">{proj.description}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const projects = profile.projects.filter((_, idx) => idx !== pIdx);
                          setProfile({ ...profile, projects });
                        }}
                        className="text-zinc-400 hover:text-red-500 pl-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Inputs
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-[#111111] text-white hover:bg-[#111111] flex items-center gap-2 shadow-sm"
                >
                  <span>Confirm & Choose Style</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: STYLE PROMPT & FINAL SITE GENERATION             */}
          {/* ========================================================= */}
          {step === 3 && (
            <form onSubmit={handleGenerateFinal} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-1">
                  Optional Style Prompt
                </label>
                <p className="text-xs text-zinc-500 mb-3">
                  How should your portfolio look and feel?
                </p>
                <input
                  type="text"
                  value={stylePrompt}
                  onChange={(e) => setStylePrompt(e.target.value)}
                  placeholder="E.g. Clean dark minimal, warm sunset, retro modern..."
                  className="w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  'Warm Sunset (Signature)',
                  'Minimal Dark Developer',
                  'Clean Editorial Light'
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setStylePrompt(preset)}
                    className="p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-[#111111] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-orange-50/50 dark:hover:bg-zinc-800"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {loading && (
                <div className="p-4 rounded-xl bg-orange-50 dark:bg-zinc-800 border border-orange-200 dark:border-zinc-700 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#111111]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Assembling your 30-second portfolio...</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Applying theme colors, validating block schema, and generating live preview...
                  </p>
                </div>
              )}

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Review
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-[#111111] text-white hover:bg-[#111111] disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Site...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Portfolio Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
