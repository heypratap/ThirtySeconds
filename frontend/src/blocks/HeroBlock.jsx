import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

function getRadiusClass(radius) {
  switch (radius) {
    case 'none': return 'rounded-none';
    case 'sm': return 'rounded-md';
    case 'lg': return 'rounded-2xl';
    case 'md':
    default: return 'rounded-xl';
  }
}

export default function HeroBlock({ props, theme }) {
  const { heading, subheading, ctaText, ctaLink, imageUrl, alignment = 'center' } = props || {};
  const isDark = theme?.mode === 'dark';
  const primaryColor = theme?.primaryColor || '#111111';
  const radiusClass = getRadiusClass(theme?.radius);

  const isCenter = alignment === 'center';

  return (
    <section className={`py-16 sm:py-24 px-4 sm:px-6 w-full ${isCenter ? 'text-center' : 'text-left'}`}>
      <div className={`max-w-4xl mx-auto flex flex-col ${isCenter ? 'items-center' : 'items-start'}`}>
        
        {imageUrl && (
          <div className="mb-6 relative">
            <img
              src={imageUrl}
              alt={heading || 'Profile'}
              className={`w-28 h-28 sm:w-36 sm:h-36 object-cover shadow-md border-2 ${
                isDark ? 'border-zinc-700' : 'border-zinc-200'
              } ${theme?.radius === 'none' ? 'rounded-none' : 'rounded-full'}`}
            />
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 text-xs font-semibold tracking-wide uppercase rounded-full border"
             style={{
               color: primaryColor,
               borderColor: `${primaryColor}40`,
               backgroundColor: `${primaryColor}10`
             }}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Available for work</span>
        </div>

        <h1 className={`text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none mb-6 ${
          isDark ? 'text-white' : 'text-zinc-900'
        }`}>
          {heading || 'Hello, I am a Developer'}
        </h1>

        {subheading && (
          <p className={`text-lg sm:text-xl font-normal max-w-2xl leading-relaxed mb-8 ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            {subheading}
          </p>
        )}

        {ctaText && ctaLink && (
          <div>
            <a
              href={ctaLink.startsWith('http') ? ctaLink : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:opacity-95 hover:translate-y-[-1px] ${radiusClass}`}
              style={{ backgroundColor: primaryColor }}
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
