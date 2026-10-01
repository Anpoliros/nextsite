/** AboutPage：显示构建端准备的数据，保留原有页面布局。 */
import ArticleBody from '@/components/shared/ArticleBody';
import PageShell from '@/components/layout/PageShell';

import type { PageData } from '@/site/types';

export default function AboutPage({ data }: { data: Extract<PageData, { kind: 'about' }> }) {
  return (
    <PageShell>
      <article className="flex flex-col w-full">
        <div className="prose prose-blue dark:prose-invert max-w-none prose-pre:m-0 prose-pre:p-0 prose-pre:bg-transparent">
          <h1 className="text-4xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
            {data.title}
          </h1>

          {/* 渲染真实的 Markdown 内容 */}
          <ArticleBody html={data.html} />
        </div>
      </article>
    </PageShell>
  );
}
