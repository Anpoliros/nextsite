/** 展示日期沿用设计稿英文月份；显式使用 UTC，避免 SSG 与客户端时区造成跨日。 */
export function formatDate(value: string, month: "short" | "long" = "short") {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month,
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
}
