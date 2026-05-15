export type MarkdownTocItem = {
  id: string
  text: string
  depth: number
}

export type MarkdownRenderOptions = {
  includeToc?: boolean
}

export type MarkdownRenderResult = {
  html: string
  toc: MarkdownTocItem[]
}

