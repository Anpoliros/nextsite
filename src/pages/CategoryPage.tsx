/** CategoryPage：显示构建端准备的数据，保留原有页面布局。 */
import ArticleList from "@/components/shared/ArticleList";
import Pagination from "@/components/shared/Pagination";
import PageShell from "@/components/layout/PageShell";

import type { PageData } from '@/site/types';

export default function CategoryPage({ data }: { data: Extract<PageData, { kind: 'category' }> }) {
  const { category, displayInfo, articles, page, totalPages, count } = data;
  return (
    <PageShell>
      <div className="flex flex-col">
        {/* 长条形图片 Banner */}
        {displayInfo.showImage && displayInfo.image ? (
          <div className="w-full h-48 bg-blue-100 dark:bg-blue-900 rounded-lg overflow-hidden mb-8 relative flex items-center justify-center">
            <img src={displayInfo.image} alt={displayInfo.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-blue-900/40 dark:bg-blue-950/60 z-10 "></div>
            <h1 className="text-3xl font-bold text-white z-20 relative">
              📂 {displayInfo.name}
            </h1>
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-8 relative flex items-center justify-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 z-10 relative">
              📂 {displayInfo.name}
            </h1>
          </div>
        )}

        {/* Category 简介 */}
        <div className="mb-12 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-800">
          <p>{displayInfo.description}</p>
        </div>

        {/* 文章列表 */}
        <div className="pl-6 relative">
          {count > 0 ? (
            <>
              <ArticleList articles={articles} title={`共 ${count} 篇文章`} />
              <Pagination totalPages={totalPages} currentPage={page} basePath={`/${category}`} />
            </>
          ) : (
            <p className="text-gray-500">此分类下暂无内容。</p>
          )}
        </div>
      </div>
    </PageShell>
  );
}
