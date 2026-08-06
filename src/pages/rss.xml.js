import rss from '@astrojs/rss';
import { getPostExcerpt, getPostPath, getPosts } from '../lib/posts';
import { getPage } from '../lib/pages';

export async function GET(context) {
  const homePage = await getPage('home', 'zh');
  const posts = await getPosts('zh');
  return rss({
    title: homePage.data.title,
    description: homePage.data.title,
    site: context.site,
    items: posts.map(post => ({ title: post.data.title, description: getPostExcerpt(post), pubDate: post.data.publishedAt, link: getPostPath(post) })),
  });
}
