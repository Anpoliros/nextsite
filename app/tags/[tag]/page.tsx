import ArticleList, { Article } from "@/components/shared/ArticleList";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/markdown";

// 1. 获取所有的 Tag，生成静态页面
export async function generateStaticParams() {
  const posts = getAllPosts();
  const tags = new Set<string>();
  
  posts.forEach(post => {
    const postTags = post.meta.tags || [];
    postTags.forEach(tag => tags.add(tag));
  });

  return Array.from(tags).map((tag) => ({
    tag,
  }));
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  // 查找包含该标签的全部文章，并按时间降序
  const allPosts = getAllPosts();
  const taggedPosts = allPosts
    .filter((post) => post.meta.tags && post.meta.tags.includes(decodedTag))
    .sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());

  if (taggedPosts.length === 0) {
    notFound();
  }

  // 映射为 ArticleList 入参类型
  const articles: Article[] = taggedPosts.map((post) => ({
    id: `${post.category}/${post.slug}`,
    title: post.meta.title || post.slug,
    excerpt: post.excerpt || "暂无简介",
    date: post.meta.date ? new Date(post.meta.date).toLocaleDateString() : "",
    category: post.category,
    tags: post.meta.tags,
  }));

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
        <ArticleList articles={articles} title={`共 ${articles.length} 篇文章`} />
      </div>
    </div>
  );
}
