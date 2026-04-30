import ArticleList, { Article } from "@/components/shared/ArticleList";
import Pagination from "@/components/shared/Pagination";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/posts/getposts";
import { siteConfig } from "@/site.config";

export async function generateStaticParams() {
  const { tags } = getAllPosts();
  return tags.map(tag => ({ tag }));
}

export default async function TagPage(props: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const tag = params.tag;
  const page = parseInt(searchParams?.page || "1", 10);
  const decodedTag = decodeURIComponent(tag);

  const { posts } = getAllPosts();
  const taggedPosts = posts
    .filter(post => post.post_tag.includes(decodedTag))
    .sort((a, b) => b.post_timestamp - a.post_timestamp);

  if (taggedPosts.length === 0) {
    notFound();
  }

  const allArticles: Article[] = taggedPosts.map(post => ({
    id: post.post_path.slice(1),
    title: post.post_title,
    excerpt: "暂无简介",
    date: post.post_datetime,
    category: post.post_category,
    tags: post.post_tag,
  }));

  const limit = siteConfig.pagination?.articlesPerPage || 10;
  const totalPages = Math.ceil(allArticles.length / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const articles = allArticles.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col">
      <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-8 relative flex items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 z-10 relative">
          🏷️ #{decodedTag}
        </h1>
      </div>

      <div className="mb-12 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-800">
        <p>包含标签 <strong>{decodedTag}</strong> 的所有文章</p>
      </div>

      <div className="pl-6 relative">
        <ArticleList articles={articles} title={`共 ${allArticles.length} 篇文章`} />
        <Pagination totalPages={totalPages} currentPage={page} basePath={`/tags/${tag}`} />
      </div>
    </div>
  );
}
