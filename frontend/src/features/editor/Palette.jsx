import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Sparkles,
  User,
  Wrench,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Mail,
  FileText,
  Plus,
  Palette as PaletteIcon
} from 'lucide-react';
import { addBlock, applyTemplate } from './editorSlice.js';
import { TEMPLATES } from '../../lib/schemaHelpers.js';

const AVAILABLE_BLOCKS = [
  { type: 'hero', name: 'Hero Header', desc: 'Main headline, subtext & CTA', icon: Sparkles },
  { type: 'about', name: 'About Me', desc: 'Personal story & bio', icon: User },
  { type: 'skills', name: 'Skills & Tools', desc: 'Tech stack & tool badges', icon: Wrench },
  { type: 'projects', name: 'Projects', desc: 'Project showcase with links', icon: FolderGit2 },
  { type: 'experience', name: 'Experience', desc: 'Career history timeline', icon: Briefcase },
  { type: 'education', name: 'Education', desc: 'Degrees & institutions', icon: GraduationCap },
  { type: 'contact', name: 'Contact Form', desc: 'Email CTA & social links', icon: Mail },
  { type: 'text', name: 'Text Section', desc: 'Custom story or notes', icon: FileText }
];

export default function Palette() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('blocks'); // 'blocks' | 'templates'

  return (
    <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full select-none">
      {/* Top Header Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center transition-colors border-b-2 ${
            activeTab === 'blocks'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Add Blocks
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center transition-colors border-b-2 ${
            activeTab === 'templates'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Templates
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'blocks' ? (
          <>
            <p className="text-xs text-zinc-400 font-medium px-1 mb-2">
              Click any block to insert it into your site:
            </p>
            {AVAILABLE_BLOCKS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => dispatch(addBlock({ type: item.type }))}
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-zinc-200/80 dark:border-zinc-800 hover:border-[#111111] dark:hover:border-[#111111] hover:bg-orange-50/50 dark:hover:bg-zinc-800/50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-[#111111] transition-colors">
                      {item.name}
                    </div>
                    <div className="text-xs text-zinc-400 truncate">{item.desc}</div>
                  </div>
                  <Plus className="w-4 h-4 text-zinc-400 group-hover:text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </>
        ) : (
          <>
            <p className="text-xs text-zinc-400 font-medium px-1 mb-2">
              Switch themes without losing your content:
            </p>
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => dispatch(applyTemplate(tmpl))}
                className="w-full p-3.5 text-left rounded-lg border border-zinc-200/80 dark:border-zinc-800 hover:border-[#111111] transition-all bg-white dark:bg-zinc-800/40 hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {tmpl.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tmpl.theme.primaryColor }}
                    />
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                      {tmpl.theme.mode}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {tmpl.description}
                </p>
              </button>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
