/** 日期展示：构建端和浏览器使用 Asia/Shanghai，避免时区差异造成接管失败。 */
export function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai' });
}
