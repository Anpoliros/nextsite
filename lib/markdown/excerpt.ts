import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'

type MdastNode = {
  type: string
  value?: string
  children?: MdastNode[]
}

const MORE_RE = /<!--\s*more\s*-->/i

function textFromNode(node: MdastNode): string {
  if (node.type === 'text' || node.type === 'inlineCode') {
    return node.value ?? ''
  }

  if (node.type === 'break') {
    return ' '
  }

  if (node.type === 'html' || node.type === 'code') {
    return ''
  }

  return (node.children ?? []).map(textFromNode).join(' ')
}

function normalizeExcerptText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractMarkdownExcerpt(content: string): string {
  const match = MORE_RE.exec(content)
  if (!match) return ''

  const excerptSource = content.slice(0, match.index).trim()
  if (!excerptSource) return ''

  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(excerptSource) as MdastNode

  return normalizeExcerptText(textFromNode(tree))
}

