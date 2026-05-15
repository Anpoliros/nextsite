import type { MarkdownTocItem } from '@/lib/markdown'

type ArticleTocProps = {
  items: MarkdownTocItem[]
  defaultOpen?: boolean
}

export default function ArticleToc({
  items,
  defaultOpen = true,
}: ArticleTocProps) {
  if (items.length === 0) return null

  return (
    <details
      open={defaultOpen}
      className="not-prose mb-8 rounded-lg border border-gray-200 bg-gray-50/80 dark:border-white/10 dark:bg-white/[0.03]"
    >
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
        目录
      </summary>
      <nav className="border-t border-gray-200 px-4 py-3 dark:border-white/10" aria-label="文章目录">
        <ol className="flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <li
              key={item.id}
              style={{ paddingLeft: `${Math.max(0, item.depth - 2) * 0.875}rem` }}
            >
              <a
                href={`#${item.id}`}
                className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  )
}

