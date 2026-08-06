import rss from '@astrojs/rss';
import { getPostExcerpt, getPostPath, getPosts } from '../../lib/posts';
import { getPage } from '../../lib/pages';

export async function GET(context) {
  const homePage = await getPage('home', 'en');
  const posts = await getPosts('en');
  return rss({
    title: homePage.data.title,
    description: homePage.data.title,
    site: new URL('/en/', context.site),
    items: posts.map(post => ({ title: post.data.title, description: getPostExcerpt(post), pubDate: post.data.publishedAt, link: getPostPath(post) })),
  });
}
