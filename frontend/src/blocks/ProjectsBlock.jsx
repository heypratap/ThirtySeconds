import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

function getRadiusClass(radius) {
  switch (radius) {
    case 'none': return 'rounded-none';
    case 'sm': return 'rounded-md';
    case 'lg': return 'rounded-2xl';
    case 'md':
    default: return 'rounded-xl';
  }
}

export default function ProjectsBlock({ props, theme }) {
  const { title = 'Featured Projects', items = [] } = props || {};
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((project, idx) => {
            const hasLive = project.liveUrl && project.liveUrl.startsWith('http');
            const hasRepo = project.repoUrl && project.repoUrl.startsWith('http');

            return (
              <div
                key={idx}
                className={`p-6 border flex flex-col justify-between transition-all hover:translate-y-[-2px] ${
                  isDark
                    ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                    : 'bg-white border-zinc-200/80 hover:border-zinc-300 shadow-sm'
                } ${radiusClass}`}
              >
                <div>
                  {project.imageUrl && (
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className={`w-full h-44 object-cover mb-4 border ${
                        isDark ? 'border-zinc-800' : 'border-zinc-100'
                      } ${radiusClass}`}
                    />
                  )}

                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {project.name}
                  </h3>

                  <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {project.description}
                  </p>

                  {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.techStack.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            isDark
                              ? 'bg-zinc-800 text-zinc-300'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                  {hasLive && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:underline"
                      style={{ color: primaryColor }}
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {hasRepo && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                        isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
