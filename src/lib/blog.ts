import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished, sortNewestFirst } from './posts';

export type BlogPost = CollectionEntry<'blog'>;

const showDrafts = import.meta.env.DEV || process.env.SHOW_DRAFTS === 'true';

/** Published posts, newest first. Drafts appear only in `astro dev` and in draft-preview builds. */
export async function getPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', (post) => showDrafts || isPublished(post));
  return sortNewestFirst(posts);
}
