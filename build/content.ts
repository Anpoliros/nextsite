/** 构建端文章读取：解析 frontmatter、摘要与分类，保留现有内容规则。 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { extractMarkdownExcerpt, renderMarkdownDocument } from '../src/lib/markdown'

// ─── Types ───────────────────────────────────────────────────────────────────

type RawPost = {
  filePath: string
  content: string
  frontmatter: {
    title?: unknown
    date?: Date | string | unknown
    tags?: unknown
    showToc?: unknown
    ShowToc?: unknown
    [key: string]: unknown
  }
}

export type PostMeta = {
  post_id: number
  post_title: string
  post_path: string
  post_filepath: string
  post_category: string
  post_tag: string[]
  post_datetime: string   // raw string, no normalization
  post_timestamp: number  // ms since epoch for sorting; 0 if unparseable
  post_show_toc: boolean
  post_excerpt: string
  post_content: string
}

export type PostIndex = {
  categories: string[]
  tags: string[]
  posts: PostMeta[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function collectFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (fs.statSync(full).isDirectory()) {
      results.push(...collectFiles(full))
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      results.push(full)
    }
  }
  return results
}

function dateToString(date: unknown): string {
  if (date instanceof Date) return date.toISOString().slice(0, 10)
  if (date != null) return String(date)
  return ''
}

function dateToTimestamp(date: unknown): number {
  if (date instanceof Date) return date.getTime()
  if (typeof date === 'string' && date) {
    const t = new Date(date).getTime()
    return isNaN(t) ? 0 : t
  }
  return 0
}

function booleanFromFrontmatter(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'y'].includes(value.trim().toLowerCase())
  }
  return false
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

function scanPosts(): RawPost[] {
  const contentDir = path.resolve('articles/content')
  return collectFiles(contentDir)
    .filter((filePath) => {
      // exclude files placed directly at content root (e.g. about.md)
      const rel = path.relative(contentDir, filePath)
      return rel.includes(path.sep)
    })
    .sort()  // stable alphabetical order → stable post_id across builds
    .map((filePath) => {
      const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'))
      return { filePath, content, frontmatter: data }
    })
}

function normalizePosts(raw: RawPost[]): PostMeta[] {
  const contentDir = path.resolve('articles/content')
  return raw.map(({ filePath, content, frontmatter }, index) => {
    const rel = path.relative(contentDir, filePath)
    const category = rel.split(path.sep)[0]
    const slug = path.basename(filePath, path.extname(filePath))
    const tags = Array.isArray(frontmatter.tags)
      ? frontmatter.tags.map(String)
      : []

    return {
      post_id: index + 1,
      post_title: String(frontmatter.title ?? ''),
      post_path: `/${category}/${slug}`,
      post_filepath: filePath,
      post_category: category,
      post_tag: tags,
      post_datetime: dateToString(frontmatter.date),
      post_timestamp: dateToTimestamp(frontmatter.date),
      post_show_toc: booleanFromFrontmatter(frontmatter.showToc ?? frontmatter.ShowToc),
      post_excerpt: extractMarkdownExcerpt(content),
      post_content: content,
    }
  })
}

/** 每次构建或开发预览创建新索引，避免进程缓存掩盖文章修改。 */
export function readPostIndex(): PostIndex {
  const posts = normalizePosts(scanPosts())
  return {
    categories: [...new Set(posts.map(post => post.post_category))].sort(),
    tags: [...new Set(posts.flatMap(post => post.post_tag))].sort(),
    posts,
  }
}

/**
 * 读取 content/ 下的任意单文件并渲染（用于 about 等非索引页）
 */
export async function getSinglePostContent(relativePath: string) {
  const targetPath = path.resolve('articles/content', relativePath)

  if (!fs.existsSync(targetPath)) {
    return null
  }

  const { data, content } = matter(fs.readFileSync(targetPath, 'utf-8'))
  const { html, toc } = await renderMarkdownDocument(content)

  return {
    meta: { title: String(data.title ?? '') },
    content: html,
    toc,
  }
}
