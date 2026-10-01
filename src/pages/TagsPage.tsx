/** TagsPage：显示构建端准备的数据，保留原有页面布局。 */
import PageShell from "@/components/layout/PageShell";

import type { PageData } from '@/site/types';

export default function TagsPage({ data }: { data: Extract<PageData, { kind: 'tags' }> }) {
  const { groups: TagGroups } = data;
  return (
    <PageShell>
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
                  <a
                    href={`/tags/${encodeURIComponent(tag)}`}
                    key={tag}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium cursor-pointer transition-colors"
                  >
                    #{tag}
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
