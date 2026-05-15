# Markdown

`lib/markdown/` 负责把 Markdown 内容转换为文章页可直接插入的 HTML，并从标题中提取目录数据。

## 模块视角

Markdown 模块的输入是去掉 frontmatter 后的 Markdown 字符串，输出是 `MarkdownRenderResult`：包含 HTML 字符串和可选目录数据。文章详情页通过 `ArticleBody` 渲染 HTML，再由 `MarkdownEnhancer` 为代码块和表格绑定客户端交互。

本模块只理解 Markdown 语义，不读取文章索引、不决定页面是否展示目录。页面层通过 `renderMarkdownDocument(content, { includeToc })` 决定是否收集 TOC。

## 实现视角

关键文件：

- `lib/markdown/index.ts`：组装 unified pipeline。
- `lib/markdown/toc.ts`：为 heading 生成稳定 `id`，并在需要时收集 `h2` 到 `h4` 的目录项。
- `lib/markdown/notices.ts`：把受支持的 HTML 注释指令转换为静态 notice HTML。
- `lib/markdown/excerpt.ts`：从正文开头到 `<!--more-->` 之间提取纯文本摘要。
- `lib/markdown/types.ts`：导出 `MarkdownRenderResult`、`MarkdownTocItem` 等公共类型。
- `lib/markdown/codeblock.ts`：接入 `rehype-pretty-code`，生成代码块外框、语言标签、复制按钮和折行按钮。
- `lib/markdown/table.ts`：把表格包装为带 header、复制按钮和横向滚动容器的结构。
- `components/shared/ArticleBody.tsx`：Markdown HTML 的页面容器，挂载 `MarkdownEnhancer` 并引入局部样式。
- `components/shared/MarkdownEnhancer.tsx`：客户端事件委托，处理复制和折行。
- `app/globals.css`：定义代码块和表格增强结构的全局样式，保证 HTML 字符串里的全局 class 稳定命中。
- `components/shared/ArticleBody.module.css`：定义 notice 的局部样式。
- `md.config.ts`：控制 GFM、代码高亮主题等配置。

## 数据模型

`renderMarkdownDocument()` 返回：

| Field | Meaning |
| --- | --- |
| `html` | 可交给 `dangerouslySetInnerHTML` 的 HTML 字符串 |
| `toc` | `MarkdownTocItem[]`，只有 `includeToc: true` 时收集目录项 |

`MarkdownTocItem`：

| Field | Meaning |
| --- | --- |
| `id` | heading 的锚点 ID，同时写入正文 heading |
| `text` | heading 的纯文本内容 |
| `depth` | heading 等级，目前目录收集 `h2` 到 `h4` |

`extractMarkdownExcerpt(content)` 返回纯文本摘要：

- 摘要来源是 frontmatter 之后、`<!--more-->` 之前的 Markdown。
- 没有 `<!--more-->` 时返回空字符串，页面层可继续使用兜底文案。
- 摘要会解析 Markdown AST 后提取文本，因此不会显示 `#`、链接语法等 Markdown 标记。

## 渲染流程

```txt
Markdown
  -> remark-parse
  -> remark-gfm
  -> remark-rehype
  -> applyHeadingAnchors()
  -> applyNotices()
  -> applyHighlight()
  -> applyTable()
  -> rehype-stringify
  -> { html, toc }
```

`mdConfig.features.enableHighlight` 关闭时，不会应用代码高亮增强，但表格增强仍会执行。

`mdConfig.features.enableHeadingId` 关闭时，不会生成 heading id，也不会收集 TOC。

## 自定义指令

当前支持以下静态 notice 指令：

```md
<!--copyright-notice-->

<!--spoiler-alert-->
```

这些指令会被转换为 `.markdown-notice` 结构，由 `ArticleBody.module.css` 控制样式。它们没有客户端交互，因此不需要 `MarkdownEnhancer` 参与。

## 客户端增强

`MarkdownEnhancer` 是 Client Component，但它不直接渲染 UI。它通过 document 级事件委托识别以下按钮：

- `.code-wrap-btn`
- `.code-copy-btn`
- `.table-wrap-btn`
- `.table-copy-btn`

因此，如果修改 `codeblock.ts` 或 `table.ts` 中生成的 className，必须同步修改 `MarkdownEnhancer.tsx` 和 `app/globals.css`。

## 修改指南

- 新增 Markdown 语法支持时，优先在 `lib/markdown/index.ts` 中扩展 pipeline。
- 修改摘要规则时，优先更新 `lib/markdown/excerpt.ts`，不要在页面层手写 Markdown 文本清洗。
- 修改代码块 DOM 结构时，同时检查复制、折行和 `app/globals.css` 中的 Shiki 样式变量。
- 修改表格 DOM 结构时，同时检查 `app/globals.css` 中的 `.table-block-*` 样式和客户端事件选择器。
- 修改 notice 指令时，同步检查 `lib/markdown/notices.ts`、`ArticleBody.module.css` 和内容文档。
- 如果引入会输出 HTML 的插件，必须确认 `allowDangerousHtml` 的风险和来源可信度。

## 验证方式

- 准备一篇包含 `<!--more-->`、标题、列表、表格、代码块、notice 指令和 `showToc: true` frontmatter 的文章。
- 运行 `npm run build`。
- 打开列表页检查摘要，打开文章详情页检查 TOC 锚点跳转、notice 样式、代码复制/折行、表格复制和表格 nowrap 切换。

## 相关文档

- `docs/lib/posts.md`
- `docs/components/shared.md`
- `docs/content/articles.md`
