import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import {
  achievementSchema,
  educationSchema,
  experienceSchema,
  judgeSchema,
  postSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
} from './content/schemas';

export const collections = {
  profile: defineCollection({ loader: file('src/content/profile.yaml'), schema: profileSchema }),
  experience: defineCollection({
    loader: file('src/content/experience.yaml'),
    schema: experienceSchema,
  }),
  projects: defineCollection({
    loader: glob({ pattern: '*.md', base: 'src/content/projects' }),
    schema: projectSchema,
  }),
  achievements: defineCollection({
    loader: file('src/content/achievements.yaml'),
    schema: achievementSchema,
  }),
  blog: defineCollection({
    loader: glob({ pattern: '*.md', base: 'src/content/blog' }),
    schema: postSchema,
  }),
  judges: defineCollection({ loader: file('src/content/judges.yaml'), schema: judgeSchema }),
  education: defineCollection({
    loader: file('src/content/education.yaml'),
    schema: educationSchema,
  }),
  skills: defineCollection({ loader: file('src/content/skills.yaml'), schema: skillGroupSchema }),
};
