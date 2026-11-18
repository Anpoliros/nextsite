/** 手账展示规则：分类色与特殊标签的优先级在这里集中维护。 */
export const categories = [
  { id: "walking", name: "行走", tone: "blue" },
  { id: "speaking", name: "言论", tone: "red" },
  { id: "hardware", name: "硬件", tone: "yellow" },
  { id: "developer", name: "开发", tone: "green" },
] as const;

// 多个特殊 tag 同时出现时，按此顺序匹配；普通 tag 不覆盖分类颜色。
const specialTags = [
  { tag: "anime", tone: "orange" },
  { tag: "cherry", tone: "pink" },
  { tag: "dairy", tone: "white" },
];
export function articleTone(category: string, tags: string[]) {
  return (
    specialTags.find((item) => tags.includes(item.tag))?.tone ??
    categories.find((item) => item.id === category)?.tone ??
    "green"
  );
}
export function categoryName(category: string) {
  return categories.find((item) => item.id === category)?.name ?? category;
}

/** 稳定的非零倾角和缩进：SSG 与 hydration 必须得到同样的初始布局。 */
export function hashText(value: string) {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}
export function articleTilt(id: string) {
  const hash = hashText(id);
  return (hash % 2 ? -1 : 1) * (2 + (hash % 5));
}
