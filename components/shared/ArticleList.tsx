import Link from 'next/link';
import { uiConfig } from '@/config/layout';

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[];
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ArticleList({ articles, title }: { articles: Article[], title?: string }) {
  const maxTags = uiConfig.articleList.maxTags;

  return (
    <div className="mb-12 w-full">
      {title && <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{title}</h2>}
      
      <div className="flex flex-col gap-6">
        {articles.map((article) => (
          <article key={article.id} className="relative bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm rounded-2xl p-5 md:p-6 transition-all duration-200">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              
              {/* 文章主区域：移动端占上方，桌面端占左侧 */}
              <Link href={`/${article.id}`} className="group block flex-1 text-left min-w-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900">
                <time className="text-xs whitespace-nowrap text-gray-400">{formatDate(article.date)}</time>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words truncate">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 md:pr-6 whitespace-normal">
                  {article.excerpt}
                </p>
              </Link>

              {/* 标签区域：只展示标签，不再混入分类信息 */}
              <div className="flex gap-2 flex-wrap justify-start md:justify-end flex-shrink-0 md:min-w-[160px] pt-4 md:pt-0 border-t border-gray-300 dark:border-gray-700 md:border-t-0">
                {article.tags?.slice(0, maxTags).map(tag => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800 px-2 py-0.5 rounded tracking-wider transition-colors hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
