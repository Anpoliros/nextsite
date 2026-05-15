# Shared Components

`components/shared/` 放置跨页面复用的展示和增强组件。

## 模块视角

共享组件是页面层和底层数据之间的展示适配层。页面负责取数和筛选，共享组件负责稳定渲染列表、分页和 Markdown 交互。

## 实现视角

关键文件：

- `components/shared/ArticleList.tsx`：文章列表卡片，接收页面层映射后的 `Article[]`。
- `components/shared/Pagination.tsx`：基于 `basePath` 和 `page` query 的分页链接。
- `components/shared/MarkdownEnhancer.tsx`：客户端事件委托，为 Markdown 生成的代码块和表格绑定复制/折行行为。

## 数据模型

`ArticleList` 使用的 `Article` 类型：

| Field | Meaning |
| --- | --- |
| `id` | 不带开头斜杠的文章路径，例如 `developer/example` |
| `title` | 展示标题 |
| `excerpt` | 摘要文本，目前页面层传入 `暂无简介` |
| `date` | 日期字符串 |
| `category` | 分类名 |
| `tags` | 标签数组 |

`Pagination` props：

| Prop | Meaning |
| --- | --- |
| `totalPages` | 总页数，小于等于 1 时不渲染 |
| `currentPage` | 当前页码 |
| `basePath` | 分页基础路径，例如 `/`、`/developer`、`/tags/react` |

## 修改指南

- 修改 `Article` 字段时，同步检查首页、分类页和标签页的映射逻辑。
- 修改分页 URL 规则时，同步检查 `app/page.tsx`、`app/[category]/page.tsx` 和 `app/tags/[tag]/page.tsx`。
- 修改 `MarkdownEnhancer` 的选择器时，同步检查 `lib/markdown/codeblock.ts`、`lib/markdown/table.ts` 和 `app/globals.css`。
- 不要在 `ArticleList` 内直接读取文章数据；它应保持展示组件职责。

## 验证方式

- 检查首页、分类页、标签页的列表链接是否正确。
- 检查页码、上一页、下一页在第一页和最后一页的禁用状态。
- 检查文章详情页代码块和表格的复制/折行按钮。

## 相关文档

- `docs/app/overview.md`
- `docs/app/routing.md`
- `docs/lib/posts.md`
- `docs/lib/markdown.md`

