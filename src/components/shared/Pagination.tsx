/** 分页导航：根据当前页和页数生成静态页面链接。 */
import { paginationPath } from "@/site/paths";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  basePath?: string; // e.g. "/", "/hardware"
}

export default function Pagination({ totalPages, currentPage, basePath = "/" }: PaginationProps) {
  if (totalPages <= 1) return null;


  // Calculate the page numbers to show
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const createURL = (pageNumber: number) => {
    return paginationPath(basePath, pageNumber);
  };

  return (
    <div className="mt-8 flex justify-center items-center gap-2">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <a
          href={createURL(currentPage - 1)}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          上
        </a>
      ) : (
        <button disabled className="rounded-md px-4 py-2 text-sm font-medium text-gray-300 dark:text-gray-600 cursor-not-allowed">
          上
        </button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <a
              key={p}
              href={createURL(p)}
              className={`relative rounded-md w-10 h-10 flex items-center justify-center text-sm font-medium transition ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {p}
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              )}
            </a>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <a
          href={createURL(currentPage + 1)}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          下
        </a>
      ) : (
        <button disabled className="rounded-md px-4 py-2 text-sm font-medium text-gray-300 dark:text-gray-600 cursor-not-allowed">
          下
        </button>
      )}
    </div>
  );
}
