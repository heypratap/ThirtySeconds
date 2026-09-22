import React from 'react';
import { Mail, ArrowUpRight } from 'lucide-react';

function getRadiusClass(radius) {
  switch (radius) {
    case 'none': return 'rounded-none';
    case 'sm': return 'rounded-md';
    case 'lg': return 'rounded-2xl';
    case 'md':
    default: return 'rounded-xl';
  }
}

export default function ContactBlock({ props, theme }) {
  const { title = 'Get In Touch', email, links = [] } = props || {};
  const isDark = theme?.mode === 'dark';
  const primaryColor = theme?.primaryColor || '#111111';
  const radiusClass = getRadiusClass(theme?.radius);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 w-full">
      <div className="max-w-4xl mx-auto">
        <div className={`p-8 sm:p-12 text-center border ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
            : 'bg-white border-zinc-200/90 text-zinc-700 shadow-sm'
        } ${radiusClass}`}>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 ${
            isDark ? 'text-white' : 'text-zinc-900'
          }`}>
            {title}
          </h2>

          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
            Have an opportunity, question, or just want to connect? My inbox is always open.
          </p>

          {email && (
            <div className="mb-8">
              <a
                href={`mailto:${email}`}
                className={`inline-flex items-center gap-2.5 px-7 py-3.5 text-base font-semibold text-white transition-all shadow hover:opacity-95 hover:scale-[1.01] ${radiusClass}`}
                style={{ backgroundColor: primaryColor }}
              >
                <Mail className="w-4 h-4" />
                <span>{email}</span>
              </a>
            </div>
          )}

          {Array.isArray(links) && links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url?.startsWith('http') ? link.url : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border transition-colors ${
                    isDark
                      ? 'border-zinc-800 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900'
                  } ${radiusClass}`}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
