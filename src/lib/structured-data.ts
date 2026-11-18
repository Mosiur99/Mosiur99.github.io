import type { Education, Experience, Profile } from '../content/schemas';
import { site } from './site';

export function personJsonLd(profile: Profile, companies: Experience[], education: Education[]) {
  const current = companies.find((company) => company.roles.some((role) => role.end === null));
  const currentRole = current?.roles.find((role) => role.end === null);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: site.url,
    image: `${site.url}/og.png`,
    jobTitle: currentRole?.title ?? profile.role,
    description: site.description,
    address: { '@type': 'PostalAddress', addressLocality: 'Dhaka', addressCountry: 'BD' },
    ...(current && {
      worksFor: { '@type': 'Organization', name: current.company, url: current.url },
    }),
    alumniOf: education.map((item) => ({
      '@type': 'CollegeOrUniversity',
      name: item.institution,
      ...(item.url && { url: item.url }),
    })),
    sameAs: profile.socials.filter((social) => social.url.startsWith('https://')).map((s) => s.url),
  };
}
