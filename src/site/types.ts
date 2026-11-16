/** 页面数据协议：构建端准备内容，浏览器只接收可序列化的展示数据。 */
import type { MarkdownRenderResult } from '../lib/markdown/types';

export type Article = {
  id: string; title: string; excerpt: string; date: string; category: string; tags: string[];
  icon?: string;
};
export type PostSummary = {
  post_title: string; post_path: string; post_category: string; post_tag: string[];
  post_datetime: string; post_show_toc: boolean; post_excerpt: string;
};
export type Photo = {
  id: string; src: string; alt: string; width: number; height: number;
  title: string; href: string; date: string;
};
type Common = { path: string; title: string; description: string };
export type PageData = Common & (
  | { kind: 'home'; articles: Article[]; photos: Photo[] }
  | { kind: 'article'; meta: PostSummary; rendered: MarkdownRenderResult;
      prevPost: PostSummary | null; nextPost: PostSummary | null; randomPost: PostSummary | null }
  | { kind: 'not-found' }
);
