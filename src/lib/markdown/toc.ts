import { visit } from 'unist-util-visit'
import type { MarkdownTocItem } from './types'

type HastNode = {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
  value?: string
}

type HeadingOptions = {
  includeToc?: boolean
}

const HEADING_RE = /^h([1-6])$/
const TOC_MIN_DEPTH = 2
const TOC_MAX_DEPTH = 4

function textContent(node: HastNode): string {
  if (node.type === 'text') return node.value ?? ''
  return (node.children ?? []).map(textContent).join('')
}

function slugifyHeading(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}\-_]+/gu, '')

  return slug || 'section'
}

function uniqueSlug(base: string, slugCounts: Map<string, number>): string {
  const count = slugCounts.get(base) ?? 0
  slugCounts.set(base, count + 1)
  return count === 0 ? base : `${base}-${count + 1}`
}

export function applyHeadingAnchors(
  processor: unknown,
  toc: MarkdownTocItem[],
  options: HeadingOptions = {}
) {
  // @ts-expect-error bypass processor type
  processor.use(() => (tree: unknown) => {
    const slugCounts = new Map<string, number>()

    // @ts-expect-error bypass AST type
    visit(tree, 'element', (node: HastNode) => {
      if (!node.tagName) return

      const match = HEADING_RE.exec(node.tagName)
      if (!match) return

      const depth = Number(match[1])
      const text = textContent(node).trim()
      if (!text) return

      node.properties = node.properties ?? {}

      const existingId = node.properties.id
      const id = typeof existingId === 'string'
        ? existingId
        : uniqueSlug(slugifyHeading(text), slugCounts)

      node.properties.id = id

      // 文章标题由页面渲染，目录默认只收集正文里的 h2-h4。
      if (
        options.includeToc &&
        depth >= TOC_MIN_DEPTH &&
        depth <= TOC_MAX_DEPTH
      ) {
        toc.push({ id, text, depth })
      }
    })
  })
}

