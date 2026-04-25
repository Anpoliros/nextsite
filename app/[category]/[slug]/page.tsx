import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/markdown';
import MarkdownEnhancer from '@/components/shared/MarkdownEnhancer';
import { Dices, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // 获取所有文章排序，用于上一篇/下一篇
  const allPosts = getAllPosts().sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
  const currentIndex = allPosts.findIndex(p => p.category === category && p.slug === slug);
  
  // 上一篇（较旧）、下一篇（较新）
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  
  // 随机一篇
  const otherPosts = allPosts.filter((_, i) => i !== currentIndex);
  const randomPost = otherPosts.length > 0 ? otherPosts[Math.floor(Math.random() * otherPosts.length)] : null;

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
          <Link
            key={tag}
            href={`/tags/${tag}`}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 text-xs rounded-md transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>

      <div className="prose prose-blue dark:prose-invert max-w-none prose-pre:m-0 prose-pre:p-0 prose-pre:bg-transparent">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
          {meta.title}
        </h1>
        <div className="text-sm text-gray-500 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
          {meta.date && <time>{new Date(meta.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>}
        </div>
        
        <MarkdownEnhancer />

        {/* 渲染真实的 Markdown 内容 */}
        <div 
          className="text-gray-800 dark:text-gray-200 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>

      {/* 底部信息区 */}
      <hr className="my-12 border-t border-gray-100 dark:border-gray-800" />
      
      <div className="flex flex-col gap-6 mb-8">
        {/* 左对齐：位置提示栏 */}
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-500 hover:underline">Home</Link>
          <span>/</span>
          <Link href={`/${category}`} className="hover:text-blue-500 hover:underline">{category}</Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 line-clamp-1">{meta.title}</span>
        </nav>

        {/* 左对齐：文章category和tags */}
        <div className="flex items-center gap-3">
          <Link href={`/${category}`} className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded text-xs hover:opacity-80 transition-opacity">
            {category}
          </Link>
          <div className="flex flex-wrap gap-2">
            {meta.tags?.map((tag: string) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 text-xs rounded transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 居中对齐：上一篇、随机、下一篇 */}
      <div className="flex justify-center items-center gap-6 mt-4">
        {prevPost ? (
          <Link 
            href={`/${prevPost.category}/${prevPost.slug}`}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition-colors"
            title={prevPost.meta.title}
          >
            <ChevronLeft size={18} />
            <span>上一篇</span>
          </Link>
        ) : (
          <span className="flex items-center gap-1 text-sm text-gray-400 cursor-not-allowed">
            <ChevronLeft size={18} />
            <span>上一篇</span>
          </span>
        )}

        {randomPost && (
          <Link
            href={`/${randomPost.category}/${randomPost.slug}`}
            className="text-gray-600 hover:text-blue-500 transition-colors"
            title="随机一篇"
          >
            <Dices size={24} />
          </Link>
        )}

        {nextPost ? (
          <Link 
            href={`/${nextPost.category}/${nextPost.slug}`}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition-colors"
            title={nextPost.meta.title}
          >
            <span>下一篇</span>
            <ChevronRight size={18} />
          </Link>
        ) : (
          <span className="flex items-center gap-1 text-sm text-gray-400 cursor-not-allowed">
            <span>下一篇</span>
            <ChevronRight size={18} />
          </span>
        )}
      </div>
    </article>
  );
}
