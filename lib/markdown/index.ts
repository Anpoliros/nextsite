import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { applyHighlight } from './codeblock';
import { mdConfig } from '@/md.config';

export interface PostMeta {
  title: string;
  date: string;
  categories: string[];
  tags: string[];
  slug: string;
}

/**
 * 递归获取目录下所有的 .md 文件路径
 */
function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });

  return results;
}

/**
 * 获取所有的文章信息，用于构建时生成路由
 */
export function getAllPosts() {
  const contentDir = mdConfig.contentDir;
  const files = getFilesRecursively(contentDir);

  const posts = files.map((filePath) => {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(rawContent);

    // 计算 slug（取文件名，不含后缀）
    const slug = path.basename(filePath, '.md');
    
    // 推导 category
    const relativePath = path.relative(contentDir, filePath);
    const category = relativePath.split(path.sep)[0];

    // 简单提取摘要：找 `<!--more-->` 或取前段文字
    let excerpt = '';
    const moreIndex = content.indexOf('<!--more-->');
    if (moreIndex !== -1) {
      excerpt = content.slice(0, moreIndex).replace(/#+\s/g, '').replace(/\n/g, ' ').trim().slice(0, 150);
    } else {
      excerpt = content.slice(0, 150).replace(/#+\s/g, '').replace(/\n/g, ' ').trim();
    }

    // 清理一下 excerpt 中的 markdown 符号 (非常基础的正则，仅供参考)
    excerpt += excerpt.length >= 150 ? '...' : '';

    return {
      slug,
      category,
      filePath,
      excerpt,
      meta: {
        title: data.title || '',
        date: data.date ? new Date(data.date).toISOString() : '',
        categories: data.categories || [],
        tags: data.tags || [],
        slug
      } as PostMeta
    };
  });

  return posts;
}

/**
 * 根据 category 和 slug 读取并解析目标 Markdown 文件的正文
 */
export async function getPostBySlug(category: string, slug: string) {
  const posts = getAllPosts();
  const post = posts.find((p) => p.category === category && p.slug === slug);

  if (!post) {
    return null;
  }

  const rawContent = fs.readFileSync(post.filePath, 'utf-8');
  const { data, content } = matter(rawContent);

  // Markdown -> HTML AST -> HTML String
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true });

  // 调用codeblock，渲染代码块组件并高亮
  if (mdConfig.features.enableHighlight) {
    applyHighlight(processor);
  }

  const file = await processor
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return {
    meta: post.meta,
    content: String(file),
  };
}
