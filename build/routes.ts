/** 静态路由清单：枚举列表、分页与文章，按需准备正文渲染数据。 */
import { readPostIndex, type PostMeta } from './content';
import { contentConfig } from '../config/content';
import { siteConfig } from '../config/site';
import { getSinglePostContent, renderMarkdownDocument } from '../lib/markdown';
import { paginationPath, tagPath } from '../src/site/paths';
import type { Article, PageData, PostSummary } from '../src/site/types';

export type Route = { path: string; load: () => Promise<PageData> };
export const notFoundPage: PageData = {
  kind: 'not-found', path: '/404/', title: '页面不存在', description: siteConfig.description,
};

// ============================== 展示数据 ==============================
function summary(post: PostMeta): PostSummary {
  const { post_title, post_path, post_category, post_tag, post_datetime, post_show_toc, post_excerpt } = post;
  return { post_title, post_path, post_category, post_tag, post_datetime, post_show_toc, post_excerpt };
}
function article(post: PostMeta): Article {
  return { id: post.post_path.slice(1), title: post.post_title, excerpt: post.post_excerpt || '暂无简介',
    date: post.post_datetime, category: post.post_category, tags: post.post_tag };
}
function stableIndex(path: string, length: number) {
  let hash = 0;
  for (const char of path) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % length;
}

// ============================== 路由生成 ==============================
export function createRoutes(): Route[] {
  const index = readPostIndex();
  const posts = [...index.posts].sort((a, b) => b.post_timestamp - a.post_timestamp);
  const routes: Route[] = [];
  const seen = new Set<string>();
  const limit = contentConfig.pagination.articlesPerPage;
  if (!Number.isInteger(limit) || limit < 1) throw new Error('articlesPerPage 必须是正整数');

  function add(path: string, load: Route['load']) {
    // 解码后检查冲突，避免不同 URL 编码覆盖同一个输出文件。
    const key = decodeURIComponent(path);
    if (seen.has(key)) throw new Error(`重复页面路径：${path}`);
    seen.add(key);
    routes.push({ path, load });
  }
  function listing(base: string, selected: PostMeta[], make: (data: {
    path: string; articles: Article[]; page: number; totalPages: number; count: number;
  }) => PageData) {
    const totalPages = Math.max(1, Math.ceil(selected.length / limit));
    for (let page = 1; page <= totalPages; page++) {
      const path = paginationPath(base, page);
      add(path, async () => make({ path, page, totalPages, count: selected.length,
        articles: selected.slice((page - 1) * limit, page * limit).map(article) }));
    }
  }
  const common = { title: siteConfig.title, description: siteConfig.description };
  listing('/', posts, data => ({ ...common, ...data, kind: 'home',
    pinnedArticles: posts.filter(post => contentConfig.pinnedArticles.includes(post.post_path.slice(1))).map(article) }));

  for (const category of [...new Set([...index.categories, ...Object.keys(contentConfig.categories)])]) {
    const displayInfo = contentConfig.categories[category] || {
      name: category.toUpperCase(), description: `分类 ${category} 下的所有文章`, image: '', showImage: false,
    };
    listing(`/${encodeURIComponent(category)}`, posts.filter(post => post.post_category === category),
      data => ({ ...common, ...data, kind: 'category', category, displayInfo, title: displayInfo.name }));
  }
  for (const tag of index.tags) {
    listing(tagPath(tag), posts.filter(post => post.post_tag.includes(tag)),
      data => ({ ...common, ...data, kind: 'tag', tag, title: `#${tag}` }));
  }
  const groups = index.categories.map(category => ({
    name: contentConfig.categories[category]?.name || category.toUpperCase(),
    tags: [...new Set(posts.filter(post => post.post_category === category).flatMap(post => post.post_tag))].sort(),
  })).filter(group => group.tags.length).sort((a, b) => a.name.localeCompare(b.name));
  add('/tags/', async () => ({ ...common, path: '/tags/', kind: 'tags', title: 'Tags', groups }));
  add('/about/', async () => {
    const about = await getSinglePostContent('about.md');
    if (!about) throw new Error('缺少 articles/content/about.md');
    return { ...common, path: '/about/', kind: 'about', title: about.meta.title || 'About', html: about.content };
  });
  for (const [position, post] of posts.entries()) {
    // 沿用分类 + 文件名规则，将中文和特殊字符作为完整 URL 片段处理。
    const slug = post.post_path.split('/').at(-1)!;
    post.post_path = `/${encodeURIComponent(post.post_category)}/${encodeURIComponent(slug)}/`;
    const others = posts.filter(item => item !== post);
    add(post.post_path, async () => ({ ...common, path: post.post_path, kind: 'article',
      title: post.post_title, description: post.post_excerpt || siteConfig.description,
      meta: summary(post), rendered: await renderMarkdownDocument(post.post_content, { includeToc: post.post_show_toc }),
      prevPost: position < posts.length - 1 ? summary(posts[position + 1]) : null,
      nextPost: position > 0 ? summary(posts[position - 1]) : null,
      randomPost: others.length ? summary(others[stableIndex(post.post_path.replace(/\/$/, ''), others.length)]) : null,
    }));
  }
  add('/404/', async () => notFoundPage);
  return routes;
}
