import { notFound } from 'next/navigation';
import { getSinglePostContent } from '@/lib/markdown';
import MarkdownEnhancer from '@/components/shared/MarkdownEnhancer';

export default async function AboutPage() {
  // 读取 content/about.md
  const postInfo = await getSinglePostContent('about.md');

  if (!postInfo) {
    notFound();
  }

  const { meta, content } = postInfo;

  return (
    <article className="flex flex-col w-full">
      <div className="prose prose-blue dark:prose-invert max-w-none prose-pre:m-0 prose-pre:p-0 prose-pre:bg-transparent">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
          {meta.title || 'About'}
        </h1>
        
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