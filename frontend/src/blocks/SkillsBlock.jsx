import React from 'react';

function getRadiusClass(radius) {
  switch (radius) {
    case 'none': return 'rounded-none';
    case 'sm': return 'rounded-sm';
    case 'lg': return 'rounded-full';
    case 'md':
    default: return 'rounded-lg';
  }
}

export default function SkillsBlock({ props, theme }) {
  const { title = 'Skills & Toolkit', skills = [] } = props || {};
  const isDark = theme?.mode === 'dark';
  const primaryColor = theme?.primaryColor || '#111111';
  const radiusClass = getRadiusClass(theme?.radius);

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 w-full">
      <div className="max-w-4xl mx-auto">
        <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-6 ${
          isDark ? 'text-white' : 'text-zinc-900'
        }`}>
          {title}
        </h2>

        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className={`px-4 py-2 text-sm font-medium border transition-all hover:scale-[1.02] ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                  : 'bg-white border-zinc-200/90 text-zinc-800 shadow-sm hover:border-zinc-300'
              } ${radiusClass}`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: primaryColor }}
              />
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
