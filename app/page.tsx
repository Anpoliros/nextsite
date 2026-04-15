import Hero from "@/components/home/Hero";
import ArticleList, { Article } from "@/components/shared/ArticleList";
import { getAllPosts } from "@/lib/markdown";
import { siteConfig } from "@/site.config";

export default async function Home() {
  const allPosts = getAllPosts();
  
  // Sort by date descending
  allPosts.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());

  // Map to Article format
  const mappedPosts: Article[] = allPosts.map(post => ({
    id: `${post.category}/${post.slug}`,
    title: post.meta.title || post.slug,
    excerpt: post.excerpt || "暂无简介",
    date: post.meta.date,
    category: post.category,
    tags: post.meta.tags || [],
  }));

  // Identify Pinned Articles
  const pinnedSlugs = siteConfig.pinnedArticles || [];
  const pinnedArticles = mappedPosts.filter(post => 
    pinnedSlugs.includes(post.id)
  );

  // Timeline Articles (all others, or just all depending on preference, we'll exclude pinned ones from timeline to avoid duplication, or keep them if better, let's keep them in timeline too for completeness)
  const timelineArticles = mappedPosts;

  return (
    <div className="flex flex-col w-full">
      <Hero />

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

        {/* 翻页按钮 (后续可以做真实的分页组件) */}
        <div className="mt-8 flex justify-center gap-4">
          <button className="rounded-md bg-gray-100 px-6 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            上一页
          </button>
          <button className="rounded-md bg-gray-900 dark:bg-gray-100 px-6 py-2 text-sm font-medium text-white dark:text-gray-900 transition hover:bg-gray-800 dark:hover:bg-white">
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
