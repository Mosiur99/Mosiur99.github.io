import { describe, expect, it } from 'vitest';
import { educationSchema, experienceSchema, profileSchema } from '../../src/content/schemas';
import { personJsonLd } from '../../src/lib/structured-data';
import { readYamlEntries } from './content-loader';

const parse = <T>(file: string, schema: { parse: (d: unknown) => T }) =>
  readYamlEntries(file).map(([, data]) => schema.parse(data));

describe('personJsonLd', () => {
  const [profile] = parse('profile.yaml', profileSchema);
  if (!profile) throw new Error('profile.yaml is empty');
  const data = personJsonLd(
    profile,
    parse('experience.yaml', experienceSchema),
    parse('education.yaml', educationSchema),
  );

  it('describes a Person with the current job', () => {
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe('Mosiur Zzaman');
    expect(data.jobTitle).toBe('Junior Software Engineer, Backend');
    expect(data.worksFor).toEqual({
      '@type': 'Organization',
      name: 'Rokomari.com',
      url: 'https://www.rokomari.com',
    });
  });

  it('links public profiles but not the email address', () => {
    expect(data.sameAs).toContain('https://github.com/Mosiur99');
    expect(data.sameAs.some((url) => url.startsWith('mailto:'))).toBe(false);
  });

  it('lists the university', () => {
    expect(data.alumniOf[0]?.name).toBe('Noakhali Science and Technology University');
  });
});
