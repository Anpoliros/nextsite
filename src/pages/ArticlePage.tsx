/** ArticlePage：显示构建端准备的数据，保留原有页面布局。 */
import ArticleBody from '@/components/shared/ArticleBody';
import ArticleToc from '@/components/shared/ArticleToc';
import PageShell from '@/components/layout/PageShell';
import { Dices, ChevronLeft, ChevronRight } from 'lucide-react';

import type { PageData } from '@/site/types';
import { formatDate } from '@/site/date';
import { tagPath } from '@/site/paths';

export default function ArticlePage({ data }: { data: Extract<PageData, { kind: 'article' }> }) {
  const { meta, rendered, prevPost, nextPost, randomPost } = data;
  const category = meta.post_category;
  return (
    <PageShell>
      <article className="flex flex-col">
      {/* 顶部位置提示栏（面包屑） */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <a href="/" className="hover:text-blue-500 hover:underline">Home</a>
        <span>/</span>
        <a href={`/${category}`} className="hover:text-blue-500 hover:underline">{category}</a>
        <span>/</span>
        <span className="text-gray-800 dark:text-gray-200 line-clamp-1">{meta.post_title}</span>
      </nav>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {meta.post_tag.map((tag: string) => (
          <a
            key={tag}
            href={tagPath(tag)}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 text-xs rounded-md transition-colors"
          >
            #{tag}
          </a>
        ))}
      </div>

      <div className="prose prose-blue dark:prose-invert max-w-none prose-pre:m-0 prose-pre:p-0 prose-pre:bg-transparent">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
          {meta.post_title}
        </h1>
        <div className="text-sm text-gray-500 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
          {meta.post_datetime && <time>{formatDate(meta.post_datetime)}</time>}
        </div>

        {meta.post_show_toc && <ArticleToc items={rendered.toc} />}

        {/* 渲染真实的 Markdown 内容 */}
        <ArticleBody html={rendered.html} />
      </div>

      {/* 底部信息区 */}
      <hr className="my-12 border-t border-gray-100 dark:border-gray-800" />

      <div className="flex flex-col gap-6 mb-8">
        {/* 左对齐：位置提示栏 */}
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <a href="/" className="hover:text-blue-500 hover:underline">Home</a>
          <span>/</span>
          <a href={`/${category}`} className="hover:text-blue-500 hover:underline">{category}</a>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 line-clamp-1">{meta.post_title}</span>
        </nav>

        {/* 左对齐：文章category和tags */}
        <div className="flex items-center gap-3">
          <a href={`/${category}`} className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded text-xs hover:opacity-80 transition-opacity">
            {category}
          </a>
          <div className="flex flex-wrap gap-2">
            {meta.post_tag.map((tag: string) => (
              <a
                key={tag}
                href={tagPath(tag)}
                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 text-xs rounded transition-colors"
              >
                #{tag}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 居中对齐：上一篇、随机、下一篇 */}
      <div className="flex justify-center items-center gap-6 mt-4">
        {prevPost ? (
          <a
            href={prevPost.post_path}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition-colors"
            title={prevPost.post_title}
          >
            <ChevronLeft size={18} />
            <span>上一篇</span>
          </a>
        ) : (
          <span className="flex items-center gap-1 text-sm text-gray-400 cursor-not-allowed">
            <ChevronLeft size={18} />
            <span>上一篇</span>
          </span>
        )}

        {randomPost && (
          <a
            href={randomPost.post_path}
            className="text-gray-600 hover:text-blue-500 transition-colors"
            title="随机一篇"
          >
            <Dices size={24} />
          </a>
        )}

        {nextPost ? (
          <a
            href={nextPost.post_path}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition-colors"
            title={nextPost.post_title}
          >
            <span>下一篇</span>
            <ChevronRight size={18} />
          </a>
        ) : (
          <span className="flex items-center gap-1 text-sm text-gray-400 cursor-not-allowed">
            <span>下一篇</span>
            <ChevronRight size={18} />
          </span>
        )}
      </div>
      </article>
    </PageShell>
  );
}
