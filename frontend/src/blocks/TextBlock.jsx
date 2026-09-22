import React from 'react';

function getRadiusClass(radius) {
  switch (radius) {
    case 'none': return 'rounded-none';
    case 'sm': return 'rounded-md';
    case 'lg': return 'rounded-2xl';
    case 'md':
    default: return 'rounded-xl';
  }
}

export default function TextBlock({ props, theme }) {
  const { heading, body } = props || {};
  const isDark = theme?.mode === 'dark';
  const radiusClass = getRadiusClass(theme?.radius);

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 w-full">
      <div className="max-w-4xl mx-auto">
        <div className={`p-8 sm:p-10 border ${
          isDark
            ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
            : 'bg-white/80 border-zinc-200/80 text-zinc-700'
        } ${radiusClass} shadow-sm`}>
          {heading && (
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-4 ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
              {heading}
            </h2>
          )}
          <div className="text-base sm:text-lg leading-relaxed whitespace-pre-line text-zinc-600 dark:text-zinc-300">
            {body}
          </div>
        </div>
      </div>
    </section>
  );
}
