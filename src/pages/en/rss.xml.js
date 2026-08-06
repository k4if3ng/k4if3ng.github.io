import rss from '@astrojs/rss';
import { getPostExcerpt, getPostPath, getPosts } from '../../lib/posts';
import { site } from '../../config';

export async function GET(context) {
  const posts = await getPosts('en');
  return rss({
    title: site.siteName.en,
    description: site.siteName.en,
    site: new URL('/en/', context.site),
    items: posts.map(post => ({ title: post.data.title, description: getPostExcerpt(post), pubDate: post.data.publishedAt, link: getPostPath(post) })),
  });
}
