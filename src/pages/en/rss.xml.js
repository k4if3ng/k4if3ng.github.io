import rss from '@astrojs/rss';
import { site } from '../../config';
import { getPostExcerpt, getPostPath, getPosts } from '../../lib/posts';

export async function GET(context) {
  const posts = await getPosts('en');
  return rss({
    title: site.locales.en.title,
    description: site.locales.en.description,
    site: new URL('/en/', context.site),
    items: posts.map(post => ({ title: post.data.title, description: getPostExcerpt(post), pubDate: post.data.publishedAt, link: getPostPath(post) })),
  });
}
