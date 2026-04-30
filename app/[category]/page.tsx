import ArticleList, { Article } from "@/components/shared/ArticleList";
import Pagination from "@/components/shared/Pagination";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/posts/getposts";
import Image from "next/image";
import { siteConfig } from '@/site.config';

export async function generateStaticParams() {
  const { categories } = getAllPosts();
  return categories.map(category => ({ category }));
}

export default async function CategoryPage(props: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const category = params.category;

  const page = parseInt(searchParams?.page || "1", 10);

  const { posts } = getAllPosts();
  const categoryPosts = posts
    .filter(post => post.post_category === category)
    .sort((a, b) => b.post_timestamp - a.post_timestamp);

  if (categoryPosts.length === 0 && (!siteConfig.categories || !(category in siteConfig.categories))) {
    notFound();
  }

  const info = siteConfig.categories && category in siteConfig.categories
    ? siteConfig.categories[category as keyof typeof siteConfig.categories]
    : null;

  const fallbackInfo = {
    name: category.toUpperCase(),
    description: `分类 ${category} 下的所有文章`,
    showImage: false,
    image: ""
  };
  const displayInfo = info || fallbackInfo;

  const allArticles: Article[] = categoryPosts.map(post => ({
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
      {/* 长条形图片 Banner */}
      {displayInfo.showImage && displayInfo.image ? (
        <div className="w-full h-48 bg-blue-100 dark:bg-blue-900 rounded-lg overflow-hidden mb-8 relative flex items-center justify-center">
          <Image src={displayInfo.image} alt={displayInfo.name} fill className="object-cover" />
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
        {allArticles.length > 0 ? (
          <>
            <ArticleList articles={articles} title={`共 ${allArticles.length} 篇文章`} />
            <Pagination totalPages={totalPages} currentPage={page} basePath={`/${category}`} />
          </>
        ) : (
          <p className="text-gray-500">此分类下暂无内容。</p>
        )}
      </div>
    </div>
  );
}
