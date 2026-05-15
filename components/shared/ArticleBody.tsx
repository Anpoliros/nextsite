import MarkdownEnhancer from './MarkdownEnhancer'
import styles from './ArticleBody.module.css'

type ArticleBodyProps = {
  html: string
  className?: string
}

export default function ArticleBody({ html, className = '' }: ArticleBodyProps) {
  return (
    <>
      <MarkdownEnhancer />
      <div
        className={`${styles.body} text-gray-800 dark:text-gray-200 leading-relaxed space-y-4 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  )
}

