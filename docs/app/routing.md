# Routing

本文档记录站点路由、页面数据来源和动态路由生成规则。

## 模块视角

路由结构直接反映内容站点的访问模型：文章按分类目录组织，标签从文章 frontmatter 聚合，详情页由分类和 slug 唯一定位。

## 路由表

| Route | File | Data Source | Notes |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `getAllPosts()`、`siteConfig` | 首页时间线、置顶文章、Portals |
| `/about` | `app/about/page.tsx` | `getSinglePostContent()` | 单页内容，来自内容目录根文件 |
| `/tags` | `app/tags/page.tsx` | `getAllPosts()` | 按分类聚合标签 |
| `/tags/[tag]` | `app/tags/[tag]/page.tsx` | `getAllPosts()` | 标签文章列表，tag 需要 `decodeURIComponent` |
| `/[category]` | `app/[category]/page.tsx` | `getAllPosts()`、`siteConfig.categories` | 分类文章列表 |
| `/[category]/[slug]` | `app/[category]/[slug]/page.tsx` | `getPostBySlug()`、`renderMarkdownDocument()` | 文章详情页，可按 `showToc` 展示目录 |

## 静态参数

以下页面通过 `generateStaticParams()` 枚举动态路由：

- `app/[category]/page.tsx`：从 `getAllPosts().categories` 生成分类。
- `app/[category]/[slug]/page.tsx`：从 `getAllPosts().posts` 生成分类和 slug。
- `app/tags/[tag]/page.tsx`：从 `getAllPosts().tags` 生成标签。

如果新增可枚举的动态页面，应沿用这个模式。

## URL 规则

文章 URL 由 `lib/posts/getposts.ts` 生成：

```txt
articles/content/<category>/<slug>.md
  -> /<category>/<slug>
```

分类来自内容目录的第一层目录名，slug 来自 Markdown 文件名。放在 `articles/content` 根目录下的 Markdown 不进入文章索引，适合 `about.md` 这类单页内容。

文章详情页从 `getPostBySlug()` 取得原始 Markdown，再在页面层调用 `renderMarkdownDocument()` 得到 HTML 和 TOC。是否展示目录由 `PostMeta.post_show_toc` 决定。

## 修改指南

- 修改 URL 结构时，优先从 `PostMeta.post_path` 入手，并同步更新所有使用 `article.id` 或 `post_path` 的组件。
- 修改分类展示信息时，改 `site.config.ts` 的 `categories`，不要在页面里硬编码分类文案。
- 修改标签路由时，注意 URL 编码和 `decodeURIComponent` 的对应关系。
- 修改动态路由参数类型时，保留 Next.js 16 的 `params: Promise<...>` 和 `searchParams: Promise<...>` 写法。

## 验证方式

- `npm run build`
- 检查分类页不存在时是否进入 `notFound()`。
- 检查中文或特殊字符标签能从 `/tags` 正确跳转到 `/tags/[tag]`。
