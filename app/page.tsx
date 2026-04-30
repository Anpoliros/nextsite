import Hero from "@/components/home/Hero";
import ArticleList, { Article } from "@/components/shared/ArticleList";
import Pagination from "@/components/shared/Pagination";
import { getAllPosts } from "@/lib/posts/getposts";
import { siteConfig } from "@/site.config";

export default async function Home(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams?.page || "1", 10);

  const { posts } = getAllPosts();

  const sortedPosts = [...posts].sort((a, b) => b.post_timestamp - a.post_timestamp);

  const mappedPosts: Article[] = sortedPosts.map(post => ({
    id: post.post_path.slice(1),
    title: post.post_title,
    excerpt: "暂无简介",
    date: post.post_datetime,
    category: post.post_category,
    tags: post.post_tag,
  }));

  const pinnedSlugs = siteConfig.pinnedArticles || [];
  const pinnedArticles = mappedPosts.filter(post => pinnedSlugs.includes(post.id));

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
