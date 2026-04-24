import Hero from "@/components/home/Hero";
import ArticleList, { Article } from "@/components/shared/ArticleList";
import Pagination from "@/components/shared/Pagination";
import { getAllPosts } from "@/lib/markdown";
import { siteConfig } from "@/site.config";

export default async function Home(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams?.page || "1", 10);
  
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

  // 置顶文章
  const pinnedSlugs = siteConfig.pinnedArticles || [];
  const pinnedArticles = mappedPosts.filter(post => 
    pinnedSlugs.includes(post.id)
  );

  // 文章时间线，目前是保留了pinned的文章，也可以考虑不保留以避免重复
  const limit = siteConfig.pagination?.articlesPerPage || 10;
  const totalPages = Math.ceil(mappedPosts.length / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const timelineArticles = mappedPosts.slice(startIndex, endIndex);

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

        {/* 翻页按钮 */}
        <Pagination totalPages={totalPages} currentPage={page} basePath="/" />
      </div>
    </div>
  );
}
