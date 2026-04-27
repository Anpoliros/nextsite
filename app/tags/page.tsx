import Link from "next/link";
import { getAllPosts } from "@/lib/markdown";
import { siteConfig } from "@/site.config";

export default function TagsPage() {
  const posts = getAllPosts();
  
  // 聚合各个分类下的 tags
  const tagsByCategory: Record<string, Set<string>> = {};

  posts.forEach((post) => {
    const categoryName = post.category || "未分类";
    if (!tagsByCategory[categoryName]) {
      tagsByCategory[categoryName] = new Set();
    }
    const postTags = post.meta.tags || [];
    postTags.forEach(tag => tagsByCategory[categoryName].add(tag));
  });

  // 转换为展示需要的结构，按 category 分组
  const TagGroups = Object.keys(tagsByCategory).map((categoryKey) => {
    const categoryInfo = siteConfig.categories && siteConfig.categories[categoryKey];
    const displayName = categoryInfo ? categoryInfo.name : categoryKey.toUpperCase();
    return {
      name: displayName,
      tags: Array.from(tagsByCategory[categoryKey]).sort(),
    };
  }).filter(group => group.tags.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 pb-4 border-b border-gray-200 dark:border-gray-800">
        Tags
      </h1>

      <div className="flex flex-col gap-10">
        {TagGroups.map((group) => (
          <section key={group.name}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-black-500 rounded-full inline-block"></span>
              {group.name}
            </h2>
            <div className="flex flex-wrap gap-3 pl-4">
              {group.tags.map(tag => (
                <Link 
                  href={`/tags/${encodeURIComponent(tag)}`}
                  key={tag} 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium cursor-pointer transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
