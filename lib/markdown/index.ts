import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { applyHighlight } from './codeblock'
import { applyNotices } from './notices'
import { applyTable } from './table'
import { applyHeadingAnchors } from './toc'
import type {
  MarkdownRenderOptions,
  MarkdownRenderResult,
  MarkdownTocItem,
} from './types'
import { mdConfig } from '@/md.config'

export type {
  MarkdownRenderOptions,
  MarkdownRenderResult,
  MarkdownTocItem,
} from './types'

export { extractMarkdownExcerpt } from './excerpt'

function buildProcessor(toc: MarkdownTocItem[], options: MarkdownRenderOptions = {}) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })

  if (mdConfig.features.enableHeadingId) {
    applyHeadingAnchors(processor, toc, { includeToc: options.includeToc })
  }

  applyNotices(processor)

  if (mdConfig.features.enableHighlight) {
    applyHighlight(processor)
  }

  applyTable(processor)

  return processor.use(rehypeStringify, { allowDangerousHtml: true })
}

export async function renderMarkdownDocument(
  content: string,
  options: MarkdownRenderOptions = {}
): Promise<MarkdownRenderResult> {
  const toc: MarkdownTocItem[] = []
  const file = await buildProcessor(toc, options).process(content)

  return {
    html: String(file),
    toc,
  }
}

export async function renderMarkdownContent(content: string): Promise<string> {
  const result = await renderMarkdownDocument(content)
  return result.html
}

/**
 * 读取 content/ 下的任意单文件并渲染（用于 about 等非索引页）
 */
export async function getSinglePostContent(relativePath: string) {
  const targetPath = path.join(mdConfig.contentDir, relativePath)

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
