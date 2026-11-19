import type { IconName } from './icons';
import type { Profile } from '../content/schemas';

type SocialKind = Profile['socials'][number]['kind'];

export const socialIcons: Record<SocialKind, IconName> = {
  github: 'github',
  linkedin: 'linkedin',
  codeforces: 'codeforces',
  leetcode: 'leetcode',
  email: 'mail',
};

export function isExternal(url: string): boolean {
  return /^https?:\/\//.test(url);
}
