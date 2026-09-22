import HeroBlock from './HeroBlock.jsx';
import AboutBlock from './AboutBlock.jsx';
import SkillsBlock from './SkillsBlock.jsx';
import ProjectsBlock from './ProjectsBlock.jsx';
import ExperienceBlock from './ExperienceBlock.jsx';
import EducationBlock from './EducationBlock.jsx';
import ContactBlock from './ContactBlock.jsx';
import TextBlock from './TextBlock.jsx';

export const BLOCK_REGISTRY = {
  hero: {
    name: 'Hero',
    description: 'Header with your title, intro & primary action',
    component: HeroBlock
  },
  about: {
    name: 'About Me',
    description: 'A detailed narrative about your journey and philosophy',
    component: AboutBlock
  },
  skills: {
    name: 'Skills',
    description: 'Pills displaying your technical and core toolkit',
    component: SkillsBlock
  },
  projects: {
    name: 'Projects',
    description: 'Showcase cards with links, tags, and repo URLs',
    component: ProjectsBlock
  },
  experience: {
    name: 'Experience',
    description: 'Career timeline highlighting roles and contributions',
    component: ExperienceBlock
  },
  education: {
    name: 'Education',
    description: 'Academic background and certifications',
    component: EducationBlock
  },
  contact: {
    name: 'Contact',
    description: 'Call-to-action with email and social channels',
    component: ContactBlock
  },
  text: {
    name: 'Text Section',
    description: 'Custom markdown or formatted paragraph block',
    component: TextBlock
  }
};

export {
  HeroBlock,
  AboutBlock,
  SkillsBlock,
  ProjectsBlock,
  ExperienceBlock,
  EducationBlock,
  ContactBlock,
  TextBlock
};
