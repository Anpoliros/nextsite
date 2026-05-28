import fs from 'fs'
import path from 'path'
import { cache } from 'react'
import matter from 'gray-matter'
import { contentConfig } from '@/config/content'
import { extractMarkdownExcerpt } from '@/lib/markdown'

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
  const contentDir = contentConfig.contentDir
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
  const contentDir = contentConfig.contentDir
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

function buildLogSnapshot(index: PostIndex): PostIndex {
  return {
    ...index,
    posts: index.posts.map((post) => ({
      ...post,
      // 正文已缓存在内存里；日志快照只保留索引信息，避免生成超大的调试文件。
      post_content: `[markdown content: ${post.post_content.length} chars]`,
    })),
  }
}

function buildIndex(posts: PostMeta[]): PostIndex {
  const categories = [...new Set(posts.map((p) => p.post_category))].sort()
  const tags = [...new Set(posts.flatMap((p) => p.post_tag))].sort()
  return { categories, tags, posts }
}

// ─── Cache ───────────────────────────────────────────────────────────────────

let globalCache: PostIndex | null = null

export const getAllPosts = cache((): PostIndex => {
  if (globalCache) return globalCache

  const raw = scanPosts()
  const normalized = normalizePosts(raw)
  const index = buildIndex(normalized)

  {
    const logsDir = path.join(process.cwd(), '.logs')
    fs.mkdirSync(logsDir, { recursive: true })
    const now = new Date()
    const stamp = [
      String(now.getFullYear()).slice(2),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      '_',
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('')
    fs.writeFileSync(
      path.join(logsDir, `postindex_${stamp}.json`),
      JSON.stringify(buildLogSnapshot(index), null, 2)
    )
  }

  globalCache = index
  return index
})
