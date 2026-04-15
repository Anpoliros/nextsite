import ArticleList, { Article } from "@/components/shared/ArticleList";
import { siteConfig } from "@/site.config";

// 示例数据
const CategoryArticles: Article[] = [
  {
    id: "getting-started",
    title: "如何开始构建您的博客",
    excerpt: "本文将为您深入介绍构建个人博客的最佳实践及技术选型，分享从零开始的心得体会。",
    date: "2026-04-12",
    category: "教程",
    tags: ["Next.js", "前端开发", "博客建设"]
  },
];

export default function CategoriesPage() {
  return (
    <div className="flex flex-col">
      {/* 长条形图片 Banner */}
      <div className={`w-full ${siteConfig.ui.categoryBannerAspectRatio} bg-blue-100 dark:bg-blue-900 rounded-lg overflow-hidden mb-8 relative flex items-center justify-center`}>
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 z-10 relative">
          📂 分类：教程
        </h1>
        <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-950/40"></div>
      </div>

      
      {/* Category 简介 */}
      <div className="mb-12 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-800">
        <p>这里收集了所有的教程文章，涵盖前端开发、构建工具等各类技术指南，帮助你从零基础到进阶。</p>
      </div>

      {/* 文章列表复用 */}
      <div className="pl-6 relative">
        <ArticleList articles={CategoryArticles} title="该分类下的内容" />
      </div>
    </div>
  );
}
