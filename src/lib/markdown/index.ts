/** Markdown 渲染管线：保留高亮、表格、提示和目录规则。 */
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
import { markdownConfig } from '@/config/markdown'

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

  if (markdownConfig.features.enableHeadingId) {
    applyHeadingAnchors(processor, toc, { includeToc: options.includeToc })
  }

  applyNotices(processor)

  if (markdownConfig.features.enableHighlight) {
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

