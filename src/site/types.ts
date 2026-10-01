/** 页面数据协议：构建端准备内容，浏览器只接收当前页面的展示数据。 */
import type { MarkdownRenderResult } from '../lib/markdown/types';

export type Article = {
  id: string; title: string; excerpt: string; date: string; category: string; tags: string[];
};
export type PostSummary = {
  post_title: string; post_path: string; post_category: string; post_tag: string[];
  post_datetime: string; post_show_toc: boolean; post_excerpt: string;
};
type Common = { path: string; title: string; description: string };
type Listing = { articles: Article[]; page: number; totalPages: number; count: number };
export type CategoryInfo = { name: string; description: string; image: string; showImage: boolean };
export type PageData = Common & (
  | ({ kind: 'home'; pinnedArticles: Article[] } & Listing)
  | ({ kind: 'category'; category: string; displayInfo: CategoryInfo } & Listing)
  | ({ kind: 'tag'; tag: string } & Listing)
  | { kind: 'tags'; groups: { name: string; tags: string[] }[] }
  | { kind: 'article'; meta: PostSummary; rendered: MarkdownRenderResult;
      prevPost: PostSummary | null; nextPost: PostSummary | null; randomPost: PostSummary | null }
  | { kind: 'about'; html: string }
  | { kind: 'not-found' }
);
