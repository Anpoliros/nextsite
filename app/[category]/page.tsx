import ArticleList, { Article } from "@/components/shared/ArticleList";
import Pagination from "@/components/shared/Pagination";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/markdown";
import { mdConfig } from "@/md.config";
import Image from "next/image";
import { siteConfig } from '@/site.config';

// 1. 获取所有的 Category，生成静态页面
export async function generateStaticParams() {
  const posts = getAllPosts();
  const categories = Array.from(new Set(posts.map((post) => post.category)));
  return categories.map((category) => ({
    category,
  }));
}

export default async function CategoryPage(props: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const category = params.category;
  
  const page = parseInt(searchParams?.page || "1", 10);
  
  // 查找对应分类的全部文章，并按时间降序
  const allPosts = getAllPosts();
  const categoryPosts = allPosts
    .filter((post) => post.category === category)
    .sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());

  if (categoryPosts.length === 0 && (!siteConfig.categories || !(category in siteConfig.categories))) {
    notFound();
  }

  // 获取分类信息（如果在配置中存在）
  const info = siteConfig.categories && category in siteConfig.categories
    ? siteConfig.categories[category as keyof typeof siteConfig.categories]
    : null;

  // 获取配置中的信息（无配置兜底为默认显示）
  const fallbackInfo = {
    name: category.toUpperCase(),
    description: `分类 ${category} 下的所有文章`,
    showImage: false,
    image: ""
  };
  const displayInfo = info || fallbackInfo;

  // 映射为 ArticleList 入参类型
  const allArticles: Article[] = categoryPosts.map((post) => ({
    id: `${post.category}/${post.slug}`,
    title: post.meta.title || post.slug,
    excerpt: post.excerpt || "暂无简介",
    date: post.meta.date ? new Date(post.meta.date).toLocaleDateString() : "",
    category: post.category,
    tags: post.meta.tags,
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