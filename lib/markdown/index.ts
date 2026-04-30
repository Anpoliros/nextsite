import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { applyHighlight } from './codeblock'
import { applyTable } from './table'
import { mdConfig } from '@/md.config'

function buildProcessor() {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })

  if (mdConfig.features.enableHighlight) {
    applyHighlight(processor)
  }

  applyTable(processor)

  return processor.use(rehypeStringify, { allowDangerousHtml: true })
}

export async function renderMarkdownContent(content: string): Promise<string> {
  const file = await buildProcessor().process(content)
  return String(file)
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
  const html = await renderMarkdownContent(content)

  return {
    meta: { title: String(data.title ?? '') },
    content: html,
  }
}
