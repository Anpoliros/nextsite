/** 静态路由：主页与文章共用真实内容，分类和 tag 仅作主页筛选元数据。 */
import matter from 'gray-matter';
import { readContentSources, readPostIndex, type PostMeta } from './content';
import { siteConfig } from '../src/config/site';
import { renderMarkdownDocument } from '../src/lib/markdown';
import { buildPhotoGallery } from './photos';
import type { Article, PageData, PostSummary } from '../src/site/types';

export type Route = { path: string; load: () => Promise<PageData> };
export const notFoundPage: PageData = {
  kind: 'not-found', path: '/404/', title: '页面不存在', description: siteConfig.description,
};
export function summary(post: PostMeta): PostSummary {
  const { post_title, post_path, post_category, post_tag, post_datetime, post_show_toc, post_excerpt } = post;
  return { post_title, post_path, post_category, post_tag, post_datetime, post_show_toc, post_excerpt };
}
function article(post: PostMeta): Article {
  return { id: post.post_path.slice(1).replace(/\/$/, ''), title: post.post_title,
    excerpt: post.post_excerpt, date: post.post_datetime, category: post.post_category,
    tags: post.post_tag, icon: post.post_icon };
}
export async function createRoutes(photoOutputDirectory?: string): Promise<Route[]> {
  const sources = readContentSources();
  const posts = [...readPostIndex(sources).posts].sort((a, b) => b.post_timestamp - a.post_timestamp);
  for (const post of posts) {
    const slug = post.post_path.split('/').at(-1)!;
    post.post_path = `/${encodeURIComponent(post.post_category)}/${encodeURIComponent(slug)}/`;
  }
  const photos = await buildPhotoGallery(posts, photoOutputDirectory);
  const common = { title: siteConfig.title, description: siteConfig.description };
  const routes: Route[] = [];
  const seen = new Set<string>();
  const add = (path: string, load: Route['load']) => {
    const key = decodeURIComponent(path);
    if (seen.has(key)) throw new Error(`重复页面路径：${path}`);
    seen.add(key);
    routes.push({ path, load });
  };
  add('/', async () => ({ ...common, path: '/', kind: 'home', articles: posts.map(article), photos }));
  for (const [position, post] of posts.entries()) {
    const others = posts.filter(item => item !== post);
    add(post.post_path, async () => ({ ...common, path: post.post_path, kind: 'article',
      title: post.post_title, description: post.post_excerpt || siteConfig.description,
      meta: summary(post), rendered: await renderMarkdownDocument(post.post_content, { includeToc: post.post_show_toc }),
      prevPost: position < posts.length - 1 ? summary(posts[position + 1]) : null,
      nextPost: position > 0 ? summary(posts[position - 1]) : null,
      randomPost: others.length ? summary(others[(position * 17 + 5) % others.length]) : null,
    }));
  }
  // About 也使用文章模板，保持内容类型只有主页和文章两种。
  if (sources['about.md']) {
    const { data, content } = matter(sources['about.md']);
    add('/about/', async () => ({ ...common, path: '/about/', kind: 'article', title: String(data.title || 'About'),
      meta: { post_title: String(data.title || 'About'), post_path: '/about/', post_category: 'walking',
        post_datetime: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date || ''),
        post_tag: [], post_show_toc: true, post_excerpt: '' },
      rendered: await renderMarkdownDocument(content, { includeToc: true }),
      prevPost: null, nextPost: posts[0] ? summary(posts[0]) : null,
      randomPost: posts[0] ? summary(posts[0]) : null,
    }));
  }
  add('/404/', async () => notFoundPage);
  return routes;
}
