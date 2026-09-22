import React from 'react';
import { BLOCK_REGISTRY } from '../blocks/registry.js';

export default function SiteRenderer({ site, isEditor = false, selectedBlockId = null, onSelectBlock = null }) {
  if (!site?.blocks) return <div className="p-12 text-center text-zinc-500">No resume sections yet.</div>;
  return <div className="min-h-full w-full bg-white text-[#111111]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
    {site.blocks.map((block) => {
      const Component = BLOCK_REGISTRY[block.type]?.component;
      if (!Component) return null;
      const selected = isEditor && selectedBlockId === block.id;
      return <div key={block.id} id={'block-' + block.id} onClick={isEditor && onSelectBlock ? (event) => { event.stopPropagation(); onSelectBlock(block.id); } : undefined} className={'relative ' + (isEditor ? 'cursor-pointer ' : '') + (selected ? 'ring-2 ring-[#B6FF4D] ring-offset-2' : '')}><Component props={block.props} theme={{ ...site.theme, primaryColor: '#B6FF4D', fontFamily: 'Arial', mode: 'light' }} /></div>;
    })}
  </div>;
}
