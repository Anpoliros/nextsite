type HastNode = {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
  value?: string
}

type ParentNode = HastNode & {
  children: HastNode[]
}

type NoticePreset = {
  title: string
  body: string
  variant: string
}

const NOTICE_PRESETS: Record<string, NoticePreset> = {
  'copyright-notice': {
    title: '版权声明',
    body: '本文内容默认遵循站点版权说明。转载或引用时，请保留原文链接和作者信息。',
    variant: 'copyright',
  },
  'copyright-notice-en': {
    title: 'Disclaimer',
    body: 'All papers referenced here remain the copyright of their respective authors and publishers. These notes are for personal learning and non-commercial use only. If there is any infringement, please contact me for immediate removal.',
    variant: 'copyright-en',
  },
  'spoiler-alert': {
    title: '剧透提醒',
    body: '以下内容可能包含关键情节、结局或重要设定，请按需继续阅读。',
    variant: 'spoiler',
  },
}

const NOTICE_DIRECTIVE_RE = /<!--\s*(copyright-notice|spoiler-alert)\s*-->/g

function el(
  tagName: string,
  properties: Record<string, unknown>,
  children: HastNode[] = []
): HastNode {
  return { type: 'element', tagName, properties, children }
}

function text(value: string): HastNode {
  return { type: 'text', value }
}

function buildNoticeNode(name: string): HastNode {
  const preset = NOTICE_PRESETS[name]

  return el('aside', {
    className: ['markdown-notice', `markdown-notice-${preset.variant}`],
    role: 'note',
  }, [
    el('p', { className: ['markdown-notice-title'] }, [text(preset.title)]),
    el('p', { className: ['markdown-notice-body'] }, [text(preset.body)]),
  ])
}

function parseNoticeDirectives(value: string): HastNode[] | null {
  const matches = [...value.matchAll(NOTICE_DIRECTIVE_RE)]
  if (matches.length === 0) return null

  const remainder = value.replace(NOTICE_DIRECTIVE_RE, '').trim()
  if (remainder.length > 0) return null

  return matches.map((match) => buildNoticeNode(match[1]))
}

function transformChildren(parent: ParentNode) {
  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children[index]

    if (child.type === 'raw' && typeof child.value === 'string') {
      const notices = parseNoticeDirectives(child.value)

      if (notices) {
        parent.children.splice(index, 1, ...notices)
        index += notices.length - 1
        continue
      }
    }

    if (child.children) {
      transformChildren(child as ParentNode)
    }
  }
}

export function applyNotices(processor: unknown) {
  // @ts-expect-error bypass processor type
  processor.use(() => (tree: ParentNode) => {
    transformChildren(tree)
  })
}

