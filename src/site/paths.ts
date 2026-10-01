/** URL 工具：分页按钮与构建路由共用规则，路径片段按原文编码。 */
export function paginationPath(basePath: string, page: number) {
  const base = basePath.replace(/\/$/, '');
  return page === 1 ? `${base}/` : `${base}/page/${page}/`;
}
export function tagPath(tag: string) {
  return `/tags/${encodeURIComponent(tag)}/`;
}
