import { z } from 'zod';
import { randomUUID } from 'crypto';

// Supported font families
export const SUPPORTED_FONTS = [
  'Inter',
  'Poppins',
  'Space Grotesk',
  'Playfair Display',
  'DM Sans'
];

// Hex color regex (e.g. #E43D12 or #FFF)
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Safe URL validator: only http:// and https:// allowed
const safeUrlSchema = z
  .string()
  .max(500, 'URL is too long')
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        // In case of relative or malformed URL, reject
        return false;
      }
    },
    { message: 'URL must use http:// or https://' }
  );

// Optional safe URL
const optionalSafeUrlSchema = safeUrlSchema.optional().or(z.literal(''));

// ==========================================
// BLOCK SCHEMAS (Discriminated Union on "type")
// ==========================================

// 1. Hero Block
export const HeroPropsSchema = z.object({
  heading: z.string().min(1, 'Heading is required').max(150, 'Heading cannot exceed 150 characters'),
  subheading: z.string().max(300, 'Subheading cannot exceed 300 characters').default(''),
  ctaText: z.string().max(50, 'CTA text cannot exceed 50 characters').default('Get in touch'),
  ctaLink: safeUrlSchema.default('https://example.com'),
  imageUrl: optionalSafeUrlSchema,
  alignment: z.enum(['left', 'center']).default('center')
});

export const HeroBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('hero'),
  props: HeroPropsSchema
});

// 2. About Block
export const AboutPropsSchema = z.object({
  title: z.string().min(1).max(100).default('About Me'),
  body: z.string().min(1).max(3000, 'About text cannot exceed 3000 characters'),
  imageUrl: optionalSafeUrlSchema
});

export const AboutBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('about'),
  props: AboutPropsSchema
});

// 3. Skills Block
export const SkillsPropsSchema = z.object({
  title: z.string().min(1).max(100).default('Skills & Technologies'),
  skills: z.array(z.string().max(50)).max(60, 'Maximum 60 skills allowed')
});

export const SkillsBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('skills'),
  props: SkillsPropsSchema
});

// 4. Projects Block
export const ProjectItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(600),
  techStack: z.array(z.string().max(40)).max(20).default([]),
  liveUrl: optionalSafeUrlSchema,
  repoUrl: optionalSafeUrlSchema,
  imageUrl: optionalSafeUrlSchema
});

export const ProjectsPropsSchema = z.object({
  title: z.string().min(1).max(100).default('Featured Projects'),
  items: z.array(ProjectItemSchema).max(20, 'Maximum 20 projects allowed')
});

export const ProjectsBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('projects'),
  props: ProjectsPropsSchema
});

// 5. Experience Block
export const ExperienceItemSchema = z.object({
  role: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  startDate: z.string().max(50),
  endDate: z.string().max(50).default('Present'),
  description: z.string().max(1000).default('')
});

export const ExperiencePropsSchema = z.object({
  title: z.string().min(1).max(100).default('Work Experience'),
  items: z.array(ExperienceItemSchema).max(15, 'Maximum 15 experiences allowed')
});

export const ExperienceBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('experience'),
  props: ExperiencePropsSchema
});

// 6. Education Block
export const EducationItemSchema = z.object({
  school: z.string().min(1).max(120),
  degree: z.string().min(1).max(120),
  startDate: z.string().max(50),
  endDate: z.string().max(50).default('Present')
});

export const EducationPropsSchema = z.object({
  title: z.string().min(1).max(100).default('Education'),
  items: z.array(EducationItemSchema).max(10, 'Maximum 10 education items allowed')
});

export const EducationBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('education'),
  props: EducationPropsSchema
});

// 7. Contact Block
export const ContactLinkSchema = z.object({
  label: z.string().min(1).max(50),
  url: safeUrlSchema
});

export const ContactPropsSchema = z.object({
  title: z.string().min(1).max(100).default('Get In Touch'),
  email: z.string().email('Invalid email address').max(100),
  links: z.array(ContactLinkSchema).max(10).default([])
});

export const ContactBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('contact'),
  props: ContactPropsSchema
});

// 8. Text Block
export const TextPropsSchema = z.object({
  heading: z.string().max(150).optional().or(z.literal('')),
  body: z.string().min(1).max(5000, 'Body text cannot exceed 5000 characters')
});

export const TextBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('text'),
  props: TextPropsSchema
});

// ==========================================
// DISCRIMINATED UNION FOR BLOCKS
// ==========================================
export const BlockSchema = z.discriminatedUnion('type', [
  HeroBlockSchema,
  AboutBlockSchema,
  SkillsBlockSchema,
  ProjectsBlockSchema,
  ExperienceBlockSchema,
  EducationBlockSchema,
  ContactBlockSchema,
  TextBlockSchema
]);

// ==========================================
// THEME SCHEMA
// ==========================================
export const ThemeSchema = z.object({
  mode: z.enum(['light', 'dark']).default('light'),
  primaryColor: z
    .string()
    .regex(HEX_COLOR_REGEX, 'primaryColor must be a valid hex color code (e.g. #E43D12)')
    .default('#E43D12'),
  fontFamily: z
    .enum(['Inter', 'Poppins', 'Space Grotesk', 'Playfair Display', 'DM Sans'])
    .default('Space Grotesk'),
  radius: z.enum(['none', 'sm', 'md', 'lg']).default('md')
});

// ==========================================
// FULL SITE DOCUMENT SCHEMA (v1)
// ==========================================
export const SiteSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  theme: ThemeSchema,
  blocks: z.array(BlockSchema).max(40, 'Maximum 40 blocks allowed')
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Validates a site JSON against the SiteSchema
 * @param {object} json - The site document to validate
 * @returns {{ success: boolean, data?: object, errors?: Array<{ path: string, message: string }> }}
 */
export function validateSite(json) {
  const result = SiteSchema.safeParse(json);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const formattedErrors = result.error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message
  }));
  return { success: false, errors: formattedErrors };
}

/**
 * Generates a default block with clean initial content and a valid UUID
 * @param {string} type - The block type
 * @returns {object} Default block instance
 */
export function getDefaultBlock(type) {
  const id = randomUUID();
  switch (type) {
    case 'hero':
      return {
        id,
        type: 'hero',
        props: {
          heading: 'Hello, I am a Developer',
          subheading: 'Crafting thoughtful digital experiences and scalable web systems.',
          ctaText: 'Get In Touch',
          ctaLink: 'https://example.com',
          alignment: 'center'
        }
      };
    case 'about':
      return {
        id,
        type: 'about',
        props: {
          title: 'About Me',
          body: 'I am a passionate software engineer with a focus on modern web applications, clean architecture, and delightful user experiences.'
        }
      };
    case 'skills':
      return {
        id,
        type: 'skills',
        props: {
          title: 'Skills & Tools',
          skills: ['JavaScript', 'React', 'Node.js', 'Tailwind CSS', 'Git', 'REST APIs']
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
              name: 'Smart Task Flow',
              description: 'A responsive task management dashboard with real-time collaboration.',
              techStack: ['React', 'Node.js', 'Tailwind CSS'],
              liveUrl: 'https://example.com',
              repoUrl: 'https://github.com/example/smart-task-flow'
            }
          ]
        }
      };
    case 'experience':
      return {
        id,
        type: 'experience',
        props: {
          title: 'Work Experience',
          items: [
            {
              role: 'Frontend Developer',
              company: 'Tech Studio',
              startDate: '2023',
              endDate: 'Present',
              description: 'Designed and built customer-facing dashboards and micro-interactions.'
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
              school: 'State University',
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
          title: 'Get In Touch',
          email: 'hello@example.com',
          links: [
            { label: 'GitHub', url: 'https://github.com' },
            { label: 'LinkedIn', url: 'https://linkedin.com' }
          ]
        }
      };
    case 'text':
      return {
        id,
        type: 'text',
        props: {
          heading: 'My Philosophy',
          body: 'Simplicity is about subtracting the obvious and adding the meaningful.'
        }
      };
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
}

/**
 * Migration helper stub to safely upgrade older schema versions
 * @param {object} site - Raw site JSON
 * @returns {object} Migrated site JSON (v1)
 */
export function migrate(site) {
  if (!site || typeof site !== 'object') {
    return {
      schemaVersion: 1,
      theme: {
        mode: 'light',
        primaryColor: '#E43D12',
        fontFamily: 'Space Grotesk',
        radius: 'md'
      },
      blocks: [getDefaultBlock('hero')]
    };
  }

  const currentVersion = site.schemaVersion || 1;

  // Currently at version 1
  if (currentVersion === 1) {
    return site;
  }

  // Future migration stubs:
  // if (currentVersion === 2) { ... }

  return site;
}
