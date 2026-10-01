/** 构建端文章读取：解析 frontmatter、摘要与分类，保留现有内容规则。 */
import { execFileSync } from 'node:child_process'
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

/** 复用 Python 图片匹配器，只处理内存中的正文，保留原始文件。 */
export function readContentSources(): Record<string, string> {
  return JSON.parse(execFileSync(process.env.PYTHON || 'python3', ['scripts/prepare_content.py'], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }))
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

function scanPosts(sources: Record<string, string>): RawPost[] {
  return Object.entries(sources)
    .filter(([relativePath]) => relativePath.includes('/'))
    .sort(([a], [b]) => a.localeCompare(b, 'en'))
    .map(([relativePath, source]) => {
      const { data, content } = matter(source)
      return { filePath: path.resolve('articles/content', relativePath), content, frontmatter: data }
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
export function readPostIndex(sources = readContentSources()): PostIndex {
  const posts = normalizePosts(scanPosts(sources))
  return {
    categories: [...new Set(posts.map(post => post.post_category))].sort(),
    tags: [...new Set(posts.flatMap(post => post.post_tag))].sort(),
    posts,
  }
}

/**
 * 读取 content/ 下的任意单文件并渲染（用于 about 等非索引页）
 */
export async function getSinglePostContent(relativePath: string, sources: Record<string, string>) {
  const source = sources[relativePath]
  if (source === undefined) return null
  const { data, content } = matter(source)
  const { html, toc } = await renderMarkdownDocument(content)
  return { meta: { title: String(data.title ?? '') }, content: html, toc }
}
