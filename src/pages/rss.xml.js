import rss from '@astrojs/rss';
import { site } from '../config';
import { getPostExcerpt, getPostPath, getPosts } from '../lib/posts';

export async function GET(context) {
  const posts = await getPosts('zh');
  return rss({
    title: site.locales.zh.title,
    description: site.locales.zh.description,
    site: context.site,
    items: posts.map(post => ({ title: post.data.title, description: getPostExcerpt(post), pubDate: post.data.publishedAt, link: getPostPath(post) })),
  });
}
