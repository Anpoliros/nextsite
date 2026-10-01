/** TagPage：显示构建端准备的数据，保留原有页面布局。 */
import ArticleList from "@/components/shared/ArticleList";
import Pagination from "@/components/shared/Pagination";
import PageShell from "@/components/layout/PageShell";

import type { PageData } from '@/site/types';
import { tagPath } from '@/site/paths';

export default function TagPage({ data }: { data: Extract<PageData, { kind: 'tag' }> }) {
  const { tag, articles, page, totalPages, count } = data;
  return (
    <PageShell>
      <div className="flex flex-col">
        <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-8 relative flex items-center justify-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 z-10 relative">
            🏷️ #{tag}
          </h1>
        </div>

        <div className="mb-12 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-800">
          <p>包含标签 <strong>{tag}</strong> 的所有文章</p>
        </div>

        <div className="pl-6 relative">
          <ArticleList articles={articles} title={`共 ${count} 篇文章`} />
          <Pagination totalPages={totalPages} currentPage={page} basePath={tagPath(tag)} />
        </div>
      </div>
    </PageShell>
  );
}
