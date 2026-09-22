import React from 'react';
import { Briefcase } from 'lucide-react';

function getRadiusClass(radius) {
  switch (radius) {
    case 'none': return 'rounded-none';
    case 'sm': return 'rounded-md';
    case 'lg': return 'rounded-2xl';
    case 'md':
    default: return 'rounded-xl';
  }
}

export default function ExperienceBlock({ props, theme }) {
  const { title = 'Work Experience', items = [] } = props || {};
  const isDark = theme?.mode === 'dark';
  const primaryColor = theme?.primaryColor || '#111111';
  const radiusClass = getRadiusClass(theme?.radius);

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 w-full">
      <div className="max-w-4xl mx-auto">
        <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-8 ${
          isDark ? 'text-white' : 'text-zinc-900'
        }`}>
          {title}
        </h2>

        <div className="space-y-4">
          {items.map((exp, idx) => (
            <div
              key={idx}
              className={`p-6 border transition-all ${
                isDark
                  ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                  : 'bg-white/90 border-zinc-200/80 text-zinc-700 shadow-sm'
              } ${radiusClass}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {exp.role} <span className="font-normal text-zinc-400">at</span> {exp.company}
                  </h3>
                </div>
                <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 self-start sm:self-auto">
                  {exp.startDate} – {exp.endDate || 'Present'}
                </div>
              </div>

              {exp.description && (
                <p className="text-sm leading-relaxed mt-3 text-zinc-600 dark:text-zinc-400 pl-10">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
