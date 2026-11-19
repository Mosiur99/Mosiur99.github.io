import { z } from 'astro/zod';
import { icons, type IconName } from '../lib/icons';

const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use the YYYY-MM format, for example 2024-07');

const sitePath = z.string().startsWith('/', 'Use a path that starts with /');

export const socialKinds = ['github', 'linkedin', 'codeforces', 'leetcode', 'email'] as const;

export const profileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  /** The hero introduction; wrap words in **double asterisks** to show them in bold. */
  lead: z.string().min(1).max(400),
  location: z.string().min(1),
  employer: z.object({ name: z.string().min(1), url: z.url() }),
  availability: z.string().min(1),
  contact: z.string().min(1).max(240),
  email: z.email(),
  cvPath: sitePath,
  socials: z
    .array(
      z.object({ kind: z.enum(socialKinds), label: z.string().min(1), url: z.string().min(1) }),
    )
    .min(1)
    .max(6),
  highlights: z
    .array(
      z
        .object({
          label: z.string().min(1),
          value: z.string().min(1).optional(),
          stat: z.enum(['problemsSolved']).optional(),
        })
        .refine((h) => (h.value === undefined) !== (h.stat === undefined), {
          message: 'Give a highlight either a value or a stat, not both',
        }),
    )
    .length(4),
});

const roleSchema = z
  .object({
    title: z.string().min(1),
    start: yearMonth,
    end: yearMonth.nullable(),
    bullets: z.array(z.string().min(1)).max(5).default([]),
    tools: z.array(z.string().min(1)).default([]),
  })
  .refine((role) => role.end === null || role.end >= role.start, {
    message: 'A role cannot end before it starts',
    path: ['end'],
  });

export const experienceSchema = z.object({
  company: z.string().min(1),
  url: z.url(),
  industry: z.string().min(1),
  location: z.string().min(1),
  order: z.number().int(),
  roles: z.array(roleSchema).min(1),
});

export const projectKinds = ['system', 'open-source', 'web-app', 'real-time', 'ai'] as const;
export const projectStatuses = ['complete', 'in-progress', 'under-review'] as const;

export const projectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1).max(260),
  kind: z.enum(projectKinds),
  status: z.enum(projectStatuses).default('complete'),
  featured: z.boolean().default(false),
  year: z.number().int().min(2015).max(2100),
  stack: z.array(z.string().min(1)).default([]),
  highlights: z.array(z.string().min(1)).max(4).default([]),
  flow: z.array(z.string().min(1)).min(2).optional(),
  links: z.array(z.object({ label: z.string().min(1), url: z.url() })).default([]),
  order: z.number().int(),
});

export const achievementCategories = ['icpc', 'contest', 'setting', 'mentoring'] as const;

export const achievementSchema = z
  .object({
    title: z.string().min(1),
    result: z.string().min(1),
    category: z.enum(achievementCategories),
    year: z.number().int().min(2015).max(2100),
    month: z.number().int().min(1).max(12).optional(),
    team: z.string().min(1).optional(),
    endYear: z.number().int().min(2015).max(2100).optional(),
    link: z.url().optional(),
    featured: z.boolean().default(false),
    summary: z.string().min(1).max(200).optional(),
  })
  .refine((a) => a.endYear === undefined || a.endYear >= a.year, {
    message: 'endYear cannot be before year',
    path: ['endYear'],
  })
  .refine((a) => !(a.featured && a.summary), {
    message: 'A featured result is shown in the ICPC card and cannot also have a summary card',
    path: ['summary'],
  });

export const judgePlatforms = [
  'codeforces',
  'atcoder',
  'codechef',
  'leetcode',
  'uva',
  'spoj',
  'lightoj',
  'timus',
] as const;

export const judgeSchema = z
  .object({
    platform: z.enum(judgePlatforms),
    handle: z.string().min(1),
    url: z.url(),
    source: z.enum(['api', 'manual']),
    manual: z
      .object({
        solved: z.number().int().nonnegative(),
        maxRating: z.number().int().positive().optional(),
        asOf: yearMonth,
      })
      .optional(),
  })
  .refine((j) => j.source === 'api' || j.manual !== undefined, {
    message: 'Manual platforms need a manual block with solved and asOf',
    path: ['manual'],
  });

export const educationSchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  url: z.url().optional(),
  startYear: z.number().int().min(1990).max(2100),
  endYear: z.number().int().min(1990).max(2100),
  order: z.number().int(),
});

const iconNames = Object.keys(icons) as [IconName, ...IconName[]];

export const skillGroupSchema = z.object({
  name: z.string().min(1),
  icon: z.enum(iconNames).default('code'),
  items: z.array(z.string().min(1)).min(1),
  order: z.number().int(),
});

export const postSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(160),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(false),
});

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type Judge = z.infer<typeof judgeSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Post = z.infer<typeof postSchema>;
