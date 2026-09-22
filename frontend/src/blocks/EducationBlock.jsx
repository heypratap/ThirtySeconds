import React from 'react';
import { GraduationCap } from 'lucide-react';

function getRadiusClass(radius) {
  switch (radius) {
    case 'none': return 'rounded-none';
    case 'sm': return 'rounded-md';
    case 'lg': return 'rounded-2xl';
    case 'md':
    default: return 'rounded-xl';
  }
}

export default function EducationBlock({ props, theme }) {
  const { title = 'Education', items = [] } = props || {};
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((edu, idx) => (
            <div
              key={idx}
              className={`p-6 border ${
                isDark
                  ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                  : 'bg-white/90 border-zinc-200/80 text-zinc-700 shadow-sm'
              } ${radiusClass}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {edu.degree}
                  </h3>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {edu.school}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                    {edu.startDate} – {edu.endDate || 'Present'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
