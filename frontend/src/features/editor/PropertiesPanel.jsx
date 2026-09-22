import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Sparkles,
  Sliders,
  Palette as PaletteIcon,
  Bot,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  updateBlockProps,
  updateTheme,
  setActiveTab,
  setSiteDocument
} from './editorSlice.js';
import { setQuotaRemaining } from '../auth/authSlice.js';
import { generateApi } from '../../lib/api.js';
import { SUPPORTED_FONTS, BRAND_COLORS } from '../../lib/schemaHelpers.js';

export default function PropertiesPanel() {
  const dispatch = useDispatch();
  const { present: site, selectedBlockId, activeTab } = useSelector((state) => state.editor);
  const { user } = useSelector((state) => state.auth);

  // AI Refinement local state
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [aiError, setAiError] = useState('');

  if (!site) return null;

  const selectedBlock = site.blocks?.find((b) => b.id === selectedBlockId);

  const handlePropChange = (key, value) => {
    if (!selectedBlockId) return;
    dispatch(updateBlockProps({
      blockId: selectedBlockId,
      props: { [key]: value }
    }));
  };

  const handleRefineSubmit = async (e) => {
    e?.preventDefault();
    if (!refinePrompt.trim() || isRefining) return;

    setIsRefining(true);
    setAiError('');

    try {
      const result = await generateApi.refine({
        siteJson: site,
        instruction: refinePrompt.trim()
      });

      if (result.site) {
        dispatch(setSiteDocument(result.site));
        if (typeof result.quotaRemaining === 'number') {
          dispatch(setQuotaRemaining(result.quotaRemaining));
        }
        setRefinePrompt('');
      }
    } catch (err) {
      setAiError(err.message || 'Failed to refine site. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <aside className="w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col h-full select-none">
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => dispatch(setActiveTab('props'))}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'props'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Block</span>
        </button>

        <button
          onClick={() => dispatch(setActiveTab('theme'))}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'theme'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <PaletteIcon className="w-3.5 h-3.5" />
          <span>Theme</span>
        </button>

        <button
          onClick={() => dispatch(setActiveTab('ai'))}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'ai'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Refine</span>
        </button>
      </div>

      {/* Content Panels */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ========================================================= */}
        {/* 1. BLOCK PROPERTIES PANEL                                 */}
        {/* ========================================================= */}
        {activeTab === 'props' && (
          <div>
            {!selectedBlock ? (
              <div className="py-16 text-center text-zinc-400">
                <Sliders className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No block selected</p>
                <p className="text-xs mt-1">Click any block in the canvas to customize its content.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs uppercase font-bold text-[#111111] tracking-wider">
                    {selectedBlock.type} Block
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    ID: {selectedBlock.id.slice(0, 8)}
                  </span>
                </div>

                {/* Hero Block Editor */}
                {selectedBlock.type === 'hero' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Heading</label>
                      <input
                        type="text"
                        value={selectedBlock.props.heading || ''}
                        onChange={(e) => handlePropChange('heading', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Subheading</label>
                      <textarea
                        rows={3}
                        value={selectedBlock.props.subheading || ''}
                        onChange={(e) => handlePropChange('subheading', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">CTA Text</label>
                        <input
                          type="text"
                          value={selectedBlock.props.ctaText || ''}
                          onChange={(e) => handlePropChange('ctaText', e.target.value)}
                          className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Alignment</label>
                        <select
                          value={selectedBlock.props.alignment || 'center'}
                          onChange={(e) => handlePropChange('alignment', e.target.value)}
                          className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#111111]"
                        >
                          <option value="center">Center</option>
                          <option value="left">Left</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">CTA Link (URL)</label>
                      <input
                        type="url"
                        value={selectedBlock.props.ctaLink || ''}
                        onChange={(e) => handlePropChange('ctaLink', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Avatar Image URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={selectedBlock.props.imageUrl || ''}
                        onChange={(e) => handlePropChange('imageUrl', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                  </>
                )}

                {/* About Block Editor */}
                {selectedBlock.type === 'about' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => handlePropChange('title', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Body Text</label>
                      <textarea
                        rows={6}
                        value={selectedBlock.props.body || ''}
                        onChange={(e) => handlePropChange('body', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Photo Image URL (Optional)</label>
                      <input
                        type="url"
                        value={selectedBlock.props.imageUrl || ''}
                        onChange={(e) => handlePropChange('imageUrl', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </>
                )}

                {/* Skills Block Editor */}
                {selectedBlock.type === 'skills' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => handlePropChange('title', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                        Skills (comma separated)
                      </label>
                      <textarea
                        rows={4}
                        value={(selectedBlock.props.skills || []).join(', ')}
                        onChange={(e) => {
                          const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          handlePropChange('skills', list);
                        }}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </>
                )}

                {/* Projects Block Editor */}
                {selectedBlock.type === 'projects' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => handlePropChange('title', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Project Items</span>
                        <button
                          type="button"
                          onClick={() => {
                            const items = [...(selectedBlock.props.items || [])];
                            items.push({
                              name: 'New Project',
                              description: 'Brief project overview',
                              techStack: ['React'],
                              liveUrl: '',
                              repoUrl: ''
                            });
                            handlePropChange('items', items);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#111111] hover:underline"
                        >
                          <Plus className="w-3 h-3" /> Add Project
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(selectedBlock.props.items || []).map((proj, pIdx) => (
                          <div key={pIdx} className="p-3 border rounded-md border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 relative">
                            <button
                              type="button"
                              onClick={() => {
                                const items = selectedBlock.props.items.filter((_, idx) => idx !== pIdx);
                                handlePropChange('items', items);
                              }}
                              className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"
                              title="Delete project item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="text"
                              value={proj.name}
                              onChange={(e) => {
                                const items = [...selectedBlock.props.items];
                                items[pIdx] = { ...items[pIdx], name: e.target.value };
                                handlePropChange('items', items);
                              }}
                              placeholder="Project Name"
                              className="w-full text-xs font-bold mb-1 p-1 bg-transparent border-b border-zinc-300 dark:border-zinc-600 focus:outline-none"
                            />
                            <textarea
                              rows={2}
                              value={proj.description}
                              onChange={(e) => {
                                const items = [...selectedBlock.props.items];
                                items[pIdx] = { ...items[pIdx], description: e.target.value };
                                handlePropChange('items', items);
                              }}
                              placeholder="Description"
                              className="w-full text-xs p-1 mt-1 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded focus:outline-none"
                            />
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              <input
                                type="url"
                                placeholder="Live URL"
                                value={proj.liveUrl || ''}
                                onChange={(e) => {
                                  const items = [...selectedBlock.props.items];
                                  items[pIdx] = { ...items[pIdx], liveUrl: e.target.value };
                                  handlePropChange('items', items);
                                }}
                                className="text-[11px] p-1 border rounded bg-transparent border-zinc-200 dark:border-zinc-700"
                              />
                              <input
                                type="url"
                                placeholder="Repo URL"
                                value={proj.repoUrl || ''}
                                onChange={(e) => {
                                  const items = [...selectedBlock.props.items];
                                  items[pIdx] = { ...items[pIdx], repoUrl: e.target.value };
                                  handlePropChange('items', items);
                                }}
                                className="text-[11px] p-1 border rounded bg-transparent border-zinc-200 dark:border-zinc-700"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Experience Block Editor */}
                {selectedBlock.type === 'experience' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => handlePropChange('title', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Positions</span>
                        <button
                          type="button"
                          onClick={() => {
                            const items = [...(selectedBlock.props.items || [])];
                            items.push({
                              role: 'Role Title',
                              company: 'Company Name',
                              startDate: '2023',
                              endDate: 'Present',
                              description: 'Role overview and contributions'
                            });
                            handlePropChange('items', items);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#111111] hover:underline"
                        >
                          <Plus className="w-3 h-3" /> Add Position
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(selectedBlock.props.items || []).map((exp, eIdx) => (
                          <div key={eIdx} className="p-3 border rounded-md border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 relative">
                            <button
                              type="button"
                              onClick={() => {
                                const items = selectedBlock.props.items.filter((_, idx) => idx !== eIdx);
                                handlePropChange('items', items);
                              }}
                              className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"
                              title="Delete position"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => {
                                const items = [...selectedBlock.props.items];
                                items[eIdx] = { ...items[eIdx], role: e.target.value };
                                handlePropChange('items', items);
                              }}
                              placeholder="Role"
                              className="w-full text-xs font-bold mb-1 p-1 bg-transparent border-b border-zinc-300 dark:border-zinc-600"
                            />
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => {
                                const items = [...selectedBlock.props.items];
                                items[eIdx] = { ...items[eIdx], company: e.target.value };
                                handlePropChange('items', items);
                              }}
                              placeholder="Company"
                              className="w-full text-xs p-1 mb-1 bg-transparent border-b border-zinc-300 dark:border-zinc-600"
                            />
                            <div className="grid grid-cols-2 gap-1 mb-1">
                              <input
                                type="text"
                                placeholder="Start Date"
                                value={exp.startDate}
                                onChange={(e) => {
                                  const items = [...selectedBlock.props.items];
                                  items[eIdx] = { ...items[eIdx], startDate: e.target.value };
                                  handlePropChange('items', items);
                                }}
                                className="text-[11px] p-1 border rounded bg-transparent border-zinc-200 dark:border-zinc-700"
                              />
                              <input
                                type="text"
                                placeholder="End Date"
                                value={exp.endDate}
                                onChange={(e) => {
                                  const items = [...selectedBlock.props.items];
                                  items[eIdx] = { ...items[eIdx], endDate: e.target.value };
                                  handlePropChange('items', items);
                                }}
                                className="text-[11px] p-1 border rounded bg-transparent border-zinc-200 dark:border-zinc-700"
                              />
                            </div>
                            <textarea
                              rows={2}
                              value={exp.description}
                              onChange={(e) => {
                                const items = [...selectedBlock.props.items];
                                items[eIdx] = { ...items[eIdx], description: e.target.value };
                                handlePropChange('items', items);
                              }}
                              placeholder="Description"
                              className="w-full text-xs p-1 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Education Block Editor */}
                {selectedBlock.type === 'education' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => handlePropChange('title', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Degrees</span>
                        <button
                          type="button"
                          onClick={() => {
                            const items = [...(selectedBlock.props.items || [])];
                            items.push({
                              degree: 'Degree / Major',
                              school: 'University Name',
                              startDate: '2020',
                              endDate: '2024'
                            });
                            handlePropChange('items', items);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#111111] hover:underline"
                        >
                          <Plus className="w-3 h-3" /> Add Item
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(selectedBlock.props.items || []).map((edu, edIdx) => (
                          <div key={edIdx} className="p-3 border rounded-md border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 relative">
                            <button
                              type="button"
                              onClick={() => {
                                const items = selectedBlock.props.items.filter((_, idx) => idx !== edIdx);
                                handlePropChange('items', items);
                              }}
                              className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => {
                                const items = [...selectedBlock.props.items];
                                items[edIdx] = { ...items[edIdx], degree: e.target.value };
                                handlePropChange('items', items);
                              }}
                              placeholder="Degree"
                              className="w-full text-xs font-bold mb-1 p-1 bg-transparent border-b border-zinc-300 dark:border-zinc-600"
                            />
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => {
                                const items = [...selectedBlock.props.items];
                                items[edIdx] = { ...items[edIdx], school: e.target.value };
                                handlePropChange('items', items);
                              }}
                              placeholder="School"
                              className="w-full text-xs p-1 mb-1 bg-transparent border-b border-zinc-300 dark:border-zinc-600"
                            />
                            <div className="grid grid-cols-2 gap-1">
                              <input
                                type="text"
                                placeholder="Start Date"
                                value={edu.startDate}
                                onChange={(e) => {
                                  const items = [...selectedBlock.props.items];
                                  items[edIdx] = { ...items[edIdx], startDate: e.target.value };
                                  handlePropChange('items', items);
                                }}
                                className="text-[11px] p-1 border rounded bg-transparent border-zinc-200 dark:border-zinc-700"
                              />
                              <input
                                type="text"
                                placeholder="End Date"
                                value={edu.endDate}
                                onChange={(e) => {
                                  const items = [...selectedBlock.props.items];
                                  items[edIdx] = { ...items[edIdx], endDate: e.target.value };
                                  handlePropChange('items', items);
                                }}
                                className="text-[11px] p-1 border rounded bg-transparent border-zinc-200 dark:border-zinc-700"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Contact Block Editor */}
                {selectedBlock.type === 'contact' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => handlePropChange('title', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={selectedBlock.props.email || ''}
                        onChange={(e) => handlePropChange('email', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Social Links</span>
                        <button
                          type="button"
                          onClick={() => {
                            const links = [...(selectedBlock.props.links || [])];
                            links.push({ label: 'Link', url: 'https://' });
                            handlePropChange('links', links);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#111111] hover:underline"
                        >
                          <Plus className="w-3 h-3" /> Add Link
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(selectedBlock.props.links || []).map((link, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) => {
                                const links = [...selectedBlock.props.links];
                                links[lIdx] = { ...links[lIdx], label: e.target.value };
                                handlePropChange('links', links);
                              }}
                              placeholder="Label"
                              className="w-24 text-xs p-1.5 border rounded bg-transparent border-zinc-200 dark:border-zinc-700"
                            />
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => {
                                const links = [...selectedBlock.props.links];
                                links[lIdx] = { ...links[lIdx], url: e.target.value };
                                handlePropChange('links', links);
                              }}
                              placeholder="https://..."
                              className="flex-1 text-xs p-1.5 border rounded bg-transparent border-zinc-200 dark:border-zinc-700"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const links = selectedBlock.props.links.filter((_, idx) => idx !== lIdx);
                                handlePropChange('links', links);
                              }}
                              className="p-1 text-zinc-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Text Block Editor */}
                {selectedBlock.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Heading (Optional)</label>
                      <input
                        type="text"
                        value={selectedBlock.props.heading || ''}
                        onChange={(e) => handlePropChange('heading', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Paragraph Body</label>
                      <textarea
                        rows={8}
                        value={selectedBlock.props.body || ''}
                        onChange={(e) => handlePropChange('body', e.target.value)}
                        className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 leading-relaxed"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. THEME SETTINGS PANEL                                   */}
        {/* ========================================================= */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            {/* Dark / Light Mode Toggle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">Theme Mode</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => dispatch(updateTheme({ mode: 'light' }))}
                  className={`py-2 text-xs font-semibold rounded-md transition-all ${
                    site.theme.mode === 'light'
                      ? 'bg-white shadow text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  ☀️ Light Mode
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(updateTheme({ mode: 'dark' }))}
                  className={`py-2 text-xs font-semibold rounded-md transition-all ${
                    site.theme.mode === 'dark'
                      ? 'bg-zinc-900 text-white shadow'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  🌙 Dark Mode
                </button>
              </div>
            </div>

            {/* Primary Accent Color Swatches */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
                Primary Accent Color
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => dispatch(updateTheme({ primaryColor: c.hex }))}
                    className={`h-10 rounded-md border transition-transform flex items-center justify-center ${
                      site.theme.primaryColor?.toLowerCase() === c.hex.toLowerCase()
                        ? 'ring-2 ring-offset-2 ring-zinc-800 scale-105'
                        : 'hover:scale-105 border-zinc-200 dark:border-zinc-700'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">Custom:</span>
                <input
                  type="text"
                  value={site.theme.primaryColor || '#111111'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('#')) {
                      dispatch(updateTheme({ primaryColor: val }));
                    }
                  }}
                  className="w-24 text-xs font-mono p-1.5 border rounded bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                />
              </div>
            </div>

            {/* Typography Font Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
                Font Family
              </label>
              <select
                value={site.theme.fontFamily || 'Space Grotesk'}
                onChange={(e) => dispatch(updateTheme({ fontFamily: e.target.value }))}
                className="w-full text-sm p-2.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                {SUPPORTED_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Corner Radius */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
                Corner Radius
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center">
                {['none', 'sm', 'md', 'lg'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => dispatch(updateTheme({ radius: r }))}
                    className={`py-1.5 text-xs font-semibold uppercase rounded transition-all ${
                      site.theme.radius === r
                        ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. REFINE WITH AI PANEL                                   */}
        {/* ========================================================= */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-3 bg-orange-50 dark:bg-zinc-800/60 border border-orange-200 dark:border-zinc-700 rounded-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111111] mb-1">
                <Sparkles className="w-4 h-4" />
                <span>AI Assistant (Gemini Flash)</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Describe desired modifications in plain english. The AI will safely regenerate the block tree in seconds.
              </p>
              {user && (
                <div className="mt-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  ⚡ {user.remainingGenerations ?? 5} generations left today
                </div>
              )}
            </div>

            <form onSubmit={handleRefineSubmit} className="space-y-3">
              <textarea
                rows={4}
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
                placeholder="E.g. Make the hero heading bolder, move projects right under about, or change primary color to warm amber..."
                className="w-full text-sm p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#111111]"
              />

              {aiError && (
                <div className="p-2.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded">
                  {aiError}
                </div>
              )}

              <button
                type="submit"
                disabled={isRefining || !refinePrompt.trim()}
                className="w-full py-2.5 px-4 rounded-lg bg-[#111111] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#111111] disabled:opacity-50 transition-all shadow-sm"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Refining block tree...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Apply Refinement</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Quick Prompts
              </span>
              <div className="flex flex-col gap-1.5">
                {[
                  'Add a text section highlighting my open-source philosophy',
                  'Make tone punchy and minimalist',
                  'Set theme to warm amber and dark mode',
                  'Reorder blocks: hero, projects, skills, contact'
                ].map((hint, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRefinePrompt(hint)}
                    className="text-left text-xs p-2 rounded border border-zinc-200 dark:border-zinc-800 hover:border-[#111111] dark:hover:border-[#111111] text-zinc-600 dark:text-zinc-300 hover:bg-orange-50/40 dark:hover:bg-zinc-800 transition-colors"
                  >
                    "{hint}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
