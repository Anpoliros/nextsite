/** HomePage：显示构建端准备的数据，保留原有页面布局。 */
import AsciiSceneBackground from "@/components/home/AsciiSceneBackground";
import Hero from "@/components/home/Hero";
import PageShell from "@/components/layout/PageShell";
import Portals from "@/components/portals/Portals";
import ArticleList from "@/components/shared/ArticleList";
import Pagination from "@/components/shared/Pagination";
import { portalsConfig } from "@/config/portals";

import type { PageData } from '@/site/types';

export default function HomePage({ data }: { data: Extract<PageData, { kind: 'home' }> }) {
  const { articles: timelineArticles, pinnedArticles, page, totalPages } = data;
  return (
    <div className="relative isolate w-full">
      <AsciiSceneBackground />
      <div className="relative z-10">
        <PageShell right={<Portals config={portalsConfig} variant="desktop" />}>
          <div className="flex flex-col w-full">
            <Hero />

            {/* 窄屏 Portals：Hero 下、Pinned 上，全宽 */}
            <Portals
              config={portalsConfig}
              variant="mobile"
              className="block md:hidden mb-12"
            />

            {/* 置顶文章 */}
            {pinnedArticles.length > 0 && (
              <div className="mb-12 w-full">
                <h2 className="mb-6 border-b pb-2 text-2xl font-bold text-gray-800 dark:border-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-xl">📌</span> Pinned
                </h2>
                <div className="w-full">
                  <ArticleList articles={pinnedArticles} />
                </div>
              </div>
            )}

            {/* 所有的文章时间线 */}
            <div className="mb-12 w-full">
              <h2 className="mb-6 border-b pb-2 text-2xl font-bold text-gray-800 dark:border-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span className="text-xl">📅</span> Timeline
              </h2>
              <div className="w-full">
                <ArticleList articles={timelineArticles} />
              </div>

              {/* 翻页按钮 */}
              <Pagination totalPages={totalPages} currentPage={page} basePath="/" />
            </div>
          </div>
        </PageShell>
      </div>
    </div>
  );
}
