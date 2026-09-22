import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import { generateApi, siteApi } from '../../lib/api.js';
import { setQuotaRemaining } from '../auth/authSlice.js';

const QUICK_PROMPTS = [
  'Minimal dark portfolio for a backend engineer, highlighting distributed systems and open-source repos.',
  'Warm editorial portfolio for a frontend developer with vibrant orange accent and project showcase.',
  'Clean modern student portfolio with computer science coursework, internship experience, and hackathon projects.',
  'Creative tech lead portfolio with philosophy, architecture experience, and speaking topics.'
];

export default function PromptModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    if (isGenerating && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => Math.max(0, c - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGenerating, countdown]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setCountdown(30);
    setError('');

    try {
      // 1. Call Gemini to generate site document
      const genResult = await generateApi.fromPrompt(prompt.trim());
      if (typeof genResult.quotaRemaining === 'number') {
        dispatch(setQuotaRemaining(genResult.quotaRemaining));
      }

      // 2. Create site in database
      const siteDoc = await siteApi.create({
        title: prompt.slice(0, 30) + ' Portfolio',
        draft: genResult.site
      });

      // 3. Navigate to editor
      onClose();
      navigate(`/editor/${siteDoc.site._id}`);
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#111111] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Describe Your Portfolio</h2>
              <p className="text-xs text-zinc-500">Thirty Seconds will generate a complete site block tree for you.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          <div>
            <textarea
              rows={4}
              disabled={isGenerating}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. Clean dark minimal portfolio for a full-stack developer with projects, experience, and contact..."
              className="w-full text-sm p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#111111] focus:bg-white dark:focus:bg-zinc-800 transition-all"
            />
          </div>

          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
              {error}
            </div>
          )}

          {/* Quick suggestions */}
          {!isGenerating && (
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Need inspiration? Click an idea:
              </span>
              <div className="flex flex-col gap-1.5">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(qp)}
                    className="text-left text-xs p-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800 hover:border-[#111111] dark:hover:border-[#111111] text-zinc-600 dark:text-zinc-300 hover:bg-orange-50/40 dark:hover:bg-zinc-800 transition-colors"
                  >
                    "{qp}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 30-Second Countdown Animation */}
          {isGenerating && (
            <div className="p-4 rounded-xl bg-orange-50/80 dark:bg-zinc-800 border border-orange-200 dark:border-zinc-700 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#111111]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting your portfolio (~{countdown}s)</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Generating layout, structuring content blocks, and validating schema...
              </p>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#111111] h-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, ((30 - countdown) / 30) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2.5 text-sm font-bold rounded-xl bg-[#111111] text-white hover:bg-[#111111] disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>Build Portfolio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
