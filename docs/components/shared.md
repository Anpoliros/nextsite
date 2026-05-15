# Shared Components

`components/shared/` 放置跨页面复用的展示和增强组件。

## 模块视角

共享组件是页面层和底层数据之间的展示适配层。页面负责取数、筛选和 Markdown 渲染调用，共享组件负责稳定渲染列表、分页、正文容器、目录和 Markdown 交互。

## 实现视角

关键文件：

- `components/shared/ArticleList.tsx`：文章列表卡片，接收页面层映射后的 `Article[]`。
- `components/shared/ArticleBody.tsx`：Markdown HTML 容器，挂载 `MarkdownEnhancer` 并承载局部样式。
- `components/shared/ArticleBody.module.css`：notice 的局部样式。代码块和表格样式仍由 `app/globals.css` 承载。
- `components/shared/ArticleToc.tsx`：文章目录组件，接收 `MarkdownTocItem[]` 并渲染可折叠目录。
- `components/shared/Pagination.tsx`：基于 `basePath` 和 `page` query 的分页链接。
- `components/shared/MarkdownEnhancer.tsx`：客户端事件委托，为 Markdown 生成的代码块和表格绑定复制/折行行为。

## 数据模型

`ArticleList` 使用的 `Article` 类型：

| Field | Meaning |
| --- | --- |
| `id` | 不带开头斜杠的文章路径，例如 `developer/example` |
| `title` | 展示标题 |
| `excerpt` | 摘要文本，来自 `PostMeta.post_excerpt`，为空时页面层使用 `暂无简介` |
| `date` | 日期字符串 |
| `category` | 分类名 |
| `tags` | 标签数组 |

`Pagination` props：

| Prop | Meaning |
| --- | --- |
| `totalPages` | 总页数，小于等于 1 时不渲染 |
| `currentPage` | 当前页码 |
| `basePath` | 分页基础路径，例如 `/`、`/developer`、`/tags/react` |

`ArticleToc` props：

| Prop | Meaning |
| --- | --- |
| `items` | `MarkdownTocItem[]`，由 `lib/markdown` 在正文渲染时生成 |
| `defaultOpen` | 是否默认展开目录，默认为 `true` |

## 修改指南

- 修改 `Article` 字段时，同步检查首页、分类页和标签页的映射逻辑。
- 修改分页 URL 规则时，同步检查 `app/page.tsx`、`app/[category]/page.tsx` 和 `app/tags/[tag]/page.tsx`。
- 修改 `MarkdownEnhancer` 的选择器时，同步检查 `lib/markdown/codeblock.ts`、`lib/markdown/table.ts` 和 `app/globals.css`。
- 修改 notice 生成 HTML 的 className 时，同步更新 `ArticleBody.module.css`。
- 修改 TOC 展示时，不要在组件内解析 DOM；目录数据应来自 `lib/markdown`。
- 不要在 `ArticleList` 内直接读取文章数据；它应保持展示组件职责。

## 验证方式

- 检查首页、分类页、标签页的列表链接是否正确。
- 检查页码、上一页、下一页在第一页和最后一页的禁用状态。
- 检查文章详情页 TOC 锚点跳转、notice 样式、代码块和表格的复制/折行按钮。

## 相关文档

- `docs/app/overview.md`
- `docs/app/routing.md`
- `docs/lib/posts.md`
- `docs/lib/markdown.md`
