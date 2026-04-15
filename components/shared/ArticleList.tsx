import Link from 'next/link';

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
  return (
    <div className="mb-12 w-full">
      {title && <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{title}</h2>}
      
      <div className="flex flex-col gap-6">
        {articles.map((article) => (
          <Link key={article.id} href={`/${article.id}`} className="group block focus:outline-none">
            <article className="relative bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm rounded-2xl p-5 md:p-6 transition-all duration-200">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                
                {/* Left section: Title & Excerpt */}
                <div className="flex-1 text-left min-w-0">
                  <time className="text-xs whitespace-nowrap text-gray-400">{formatDate(article.date)}</time>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words truncate">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 md:pr-6 whitespace-normal">
                    {article.excerpt}
                  </p>
                </div>

                {/* Right section: Info */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 flex-shrink-0 md:pl-6 md:border-l border-gray-100 dark:border-gray-800/60 md:min-w-[160px] pt-4 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0">
                  
                  {/* Category and Date */}
                  <div className="flex flex-col items-start md:items-end gap-1 text-sm text-gray-500 dark:text-gray-400 w-full">
                    <div className="flex items-center gap-2">
                       <span className="text-blue-600 dark:text-blue-400 font-medium text-xs tracking-wider uppercase">{article.category}</span>
                    </div>
                    
                  </div>
                  
                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap justify-start md:justify-end mt-1 md:mt-3 w-full">
                    {article.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800 px-2 py-0.5 rounded uppercase tracking-wider">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                </div>

              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
