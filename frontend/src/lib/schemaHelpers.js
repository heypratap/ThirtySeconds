export const SUPPORTED_FONTS = [
  'Inter',
  'Poppins',
  'Space Grotesk',
  'Playfair Display',
  'DM Sans'
];

export const BRAND_COLORS = [
  { name: 'Warm Vermilion', hex: '#E43D12' },
  { name: 'Raspberry Rose', hex: '#D6536D' },
  { name: 'Blush Pink', hex: '#FFA2B6' },
  { name: 'Warm Gold', hex: '#EFB11D' },
  { name: 'Warm Cream', hex: '#EBE9E1' },
  { name: 'Deep Carbon', hex: '#161618' },
  { name: 'Ocean Blue', hex: '#2563EB' },
  { name: 'Forest Emerald', hex: '#059669' }
];

export const TEMPLATES = [
  {
    id: 'lime-resume',
    name: 'Lime Resume',
    description: 'Simple lime, black and white resume.',
    theme: {
      mode: 'light',
      primaryColor: '#B6FF4D',
      fontFamily: 'Arial',
      radius: 'md'
    }
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Sleek, high-contrast dark theme designed for developers.',
    theme: {
      mode: 'dark',
      primaryColor: '#FFA2B6',
      fontFamily: 'Inter',
      radius: 'lg'
    }
  },
  {
    id: 'modern-clean',
    name: 'Modern Editorial',
    description: 'Sophisticated editorial look with refined serif headers.',
    theme: {
      mode: 'light',
      primaryColor: '#D6536D',
      fontFamily: 'Playfair Display',
      radius: 'sm'
    }
  }
];

export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDefaultBlock(type) {
  const id = generateUUID();
  switch (type) {
    case 'hero':
      return {
        id,
        type: 'hero',
        props: {
          heading: 'Hello, I am a Creator',
          subheading: 'Building delightful digital products, scalable systems, and thoughtful interfaces.',
          ctaText: 'View My Work',
          ctaLink: 'https://github.com',
          imageUrl: '',
          alignment: 'center'
        }
      };
    case 'about':
      return {
        id,
        type: 'about',
        props: {
          title: 'About Me',
          body: 'I am a passionate engineer who cares deeply about user experience, maintainable code, and solving real-world challenges.',
          imageUrl: ''
        }
      };
    case 'skills':
      return {
        id,
        type: 'skills',
        props: {
          title: 'Skills & Toolkit',
          skills: ['JavaScript', 'React', 'Node.js', 'Tailwind CSS', 'Git', 'REST APIs', 'SQL']
        }
      };
    case 'projects':
      return {
        id,
        type: 'projects',
        props: {
          title: 'Featured Projects',
          items: [
            {
              name: 'HyperTask Workspace',
              description: 'Minimalist productivity application built for fast keyboard-driven workflows.',
              techStack: ['React', 'Node.js', 'Tailwind CSS'],
              liveUrl: 'https://example.com',
              repoUrl: 'https://github.com/example/hypertask'
            },
            {
              name: 'MetricFlow API',
              description: 'Lightweight telemetry collector and real-time event pipeline.',
              techStack: ['Node.js', 'PostgreSQL'],
              liveUrl: '',
              repoUrl: 'https://github.com/example/metricflow'
            }
          ]
        }
      };
    case 'experience':
      return {
        id,
        type: 'experience',
        props: {
          title: 'Experience',
          items: [
            {
              role: 'Full-Stack Developer',
              company: 'Vanguard Studios',
              startDate: '2023',
              endDate: 'Present',
              description: 'Shipped core web applications and led modern frontend migration.'
            }
          ]
        }
      };
    case 'education':
      return {
        id,
        type: 'education',
        props: {
          title: 'Education',
          items: [
            {
              school: 'University of Science & Tech',
              degree: 'B.S. in Computer Science',
              startDate: '2020',
              endDate: '2024'
            }
          ]
        }
      };
    case 'contact':
      return {
        id,
        type: 'contact',
        props: {
          title: 'Connect With Me',
          email: 'hello@example.com',
          links: [
            { label: 'GitHub', url: 'https://github.com' },
            { label: 'LinkedIn', url: 'https://linkedin.com' },
            { label: 'Twitter', url: 'https://twitter.com' }
          ]
        }
      };
    case 'text':
      return {
        id,
        type: 'text',
        props: {
          heading: 'Core Principles',
          body: 'Great software feels effortless. Focus on the user, keep components modular, and iterate relentlessly.'
        }
      };
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
}
