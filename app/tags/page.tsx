// 模拟数据：标签组
const TagGroups = [
  {
    name: "前端开发",
    tags: ["React", "Vue", "Next.js", "TailwindCSS"]
  },
  {
    name: "后端与架构",
    tags: ["Node.js", "Go", "数据库", "Docker"]
  },
  {
    name: "生活随心",
    tags: ["随笔", "读书心得", "旅行"]
  }
];

export default function TagsPage() {
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 pb-4 border-b border-gray-200 dark:border-gray-800">
        🏷️ 标签集
      </h1>

      <div className="flex flex-col gap-10">
        {TagGroups.map((group) => (
          <section key={group.name}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
              {group.name}
            </h2>
            <div className="flex flex-wrap gap-3 pl-4">
              {group.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
