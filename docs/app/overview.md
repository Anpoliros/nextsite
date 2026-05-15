# App Overview

`app/` 是 Next.js App Router 的页面入口，负责把文章索引、分类、标签、详情页和全局布局组织成可访问路由。

## 模块视角

本模块负责页面级编排：读取 `lib/posts` 提供的文章索引，把数据映射为组件需要的展示模型，并通过 `PageShell` 接入全局布局。

它不负责 Markdown AST 细节、文章文件扫描、内容同步和 Portal 配置模型。这些能力分别由 `lib/markdown/`、`lib/posts/`、`scripts/` 和 `site.config.ts` 提供。文章详情页负责调用 `renderMarkdownDocument()`，并把结果交给正文和目录组件展示。

## 实现视角

关键入口：

- `app/layout.tsx`：根布局，注入字体、主题 CSS 变量、`ThemeProvider`、`Header`、`Footer` 和主内容容器。
- `app/page.tsx`：首页，展示 Hero、移动端 Portals、置顶文章和分页时间线。
- `app/[category]/page.tsx`：分类页，按文章目录分类筛选，并使用 `siteConfig.categories` 展示分类信息。
- `app/[category]/[slug]/page.tsx`：文章详情页，读取单篇 Markdown，渲染正文和上一篇/随机/下一篇导航。
- `app/tags/page.tsx`：标签总览页，按分类聚合所有标签。
- `app/tags/[tag]/page.tsx`：标签详情页，按标签筛选文章列表。

Next.js 16 中页面默认是 Server Component；本项目只把需要浏览器事件或主题状态的组件标记为 Client Component，例如 `HeaderActions` 和 `MarkdownEnhancer`。

## 数据流

```txt
articles/content/
  -> lib/posts/getposts.ts
  -> app/page.tsx、app/[category]/page.tsx、app/tags/*
  -> components/shared/ArticleList.tsx

articles/content/<category>/<slug>.md
  -> lib/posts/getposts.ts / getpost.ts
  -> app/[category]/[slug]/page.tsx
  -> lib/markdown/index.ts（renderMarkdownDocument）
  -> components/shared/ArticleBody.tsx、ArticleToc.tsx
```

首页、分类页和标签页都会把 `PostMeta` 映射为 `Article`。如果修改文章列表字段，应同步检查 `components/shared/ArticleList.tsx` 和 `docs/lib/posts.md`。

## 修改指南

- 新增页面时，优先保持页面组件为 Server Component，只把交互逻辑下沉到小型 Client Component。
- 新增动态路由时，如果数据可枚举，应补 `generateStaticParams()`，避免不必要的请求时动态渲染。
- 修改分页规则时，同时检查首页、分类页、标签页和 `siteConfig.pagination`。
- 修改文章 URL 规则时，同时检查 `lib/posts/getposts.ts`、文章详情页、`ArticleList` 和 `Pagination`。

## 验证方式

- 运行 `npm run lint` 检查类型和代码规范。
- 运行 `npm run build` 检查静态参数、Markdown 渲染和生产构建。
- 人工检查 `/`、`/<category>`、`/<category>/<slug>`、`/tags`、`/tags/<tag>`。

## 相关文档

- `docs/app/routing.md`
- `docs/components/layout.md`
- `docs/lib/posts.md`
- `docs/lib/markdown.md`
