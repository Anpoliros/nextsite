import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/markdown';
import MarkdownEnhancer from '@/components/shared/MarkdownEnhancer';

import { mdConfig } from '@/md.config';

// 1. 构建时生成所有可能的路由路径
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ category: string, slug: string }>;
}) {
  const { category, slug } = await params;

  // 2. 获取 Markdown 解析结果
  const postInfo = await getPostBySlug(category, slug);

  if (!postInfo) {
    notFound();
  }

  const { meta, content } = postInfo;

  return (
    <article className="flex flex-col">
      {/* 顶部位置提示栏（面包屑） */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-500 hover:underline">Home</Link>
        <span>/</span>
        <Link href={`/${category}`} className="hover:text-blue-500 hover:underline">{category}</Link>
        <span>/</span>
        <span className="text-gray-800 dark:text-gray-200 line-clamp-1">{meta.title}</span>
      </nav>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {meta.tags?.map((tag: string) => (
          <span 
            key={tag}
            className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-xs rounded-md"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="prose prose-blue dark:prose-invert max-w-none prose-pre:m-0 prose-pre:p-0 prose-pre:bg-transparent">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
          {meta.title}
        </h1>
        <div className="text-sm text-gray-500 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
          {meta.date && <time>{new Date(meta.date).toLocaleDateString()}</time>}
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded text-xs">
            {category}
          </span>
        </div>
        
        <MarkdownEnhancer />

        {/* 渲染真实的 Markdown 内容 */}
        <div 
          className="text-gray-800 dark:text-gray-200 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>
    </article>
  );
}
