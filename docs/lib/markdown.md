# Markdown

`lib/markdown/` 负责把 Markdown 内容转换为文章页可直接插入的 HTML，并为代码块和表格生成增强结构。

## 模块视角

Markdown 模块的输入是去掉 frontmatter 后的 Markdown 字符串，输出是 HTML 字符串。文章详情页通过 `dangerouslySetInnerHTML` 渲染这段 HTML，再由 `MarkdownEnhancer` 为代码块和表格绑定客户端交互。

## 实现视角

关键文件：

- `lib/markdown/index.ts`：组装 unified pipeline。
- `lib/markdown/codeblock.ts`：接入 `rehype-pretty-code`，生成代码块外框、语言标签、复制按钮和折行按钮。
- `lib/markdown/table.ts`：把表格包装为带 header、复制按钮和横向滚动容器的结构。
- `components/shared/MarkdownEnhancer.tsx`：客户端事件委托，处理复制和折行。
- `app/globals.css`：定义代码块和表格增强结构的样式。
- `md.config.ts`：控制 GFM、代码高亮主题等配置。

## 渲染流程

```txt
Markdown
  -> remark-parse
  -> remark-gfm
  -> remark-rehype
  -> applyHighlight()
  -> applyTable()
  -> rehype-stringify
  -> HTML
```

`mdConfig.features.enableHighlight` 关闭时，不会应用代码高亮增强，但表格增强仍会执行。

## 客户端增强

`MarkdownEnhancer` 是 Client Component，但它不直接渲染 UI。它通过 document 级事件委托识别以下按钮：

- `.code-wrap-btn`
- `.code-copy-btn`
- `.table-wrap-btn`
- `.table-copy-btn`

因此，如果修改 `codeblock.ts` 或 `table.ts` 中生成的 className，必须同步修改 `MarkdownEnhancer.tsx` 和 `app/globals.css`。

## 修改指南

- 新增 Markdown 语法支持时，优先在 `lib/markdown/index.ts` 中扩展 pipeline。
- 修改代码块 DOM 结构时，同时检查复制、折行和 Shiki 样式变量。
- 修改表格 DOM 结构时，同时检查 `.table-block-*` 样式和客户端事件选择器。
- 如果引入会输出 HTML 的插件，必须确认 `allowDangerousHtml` 的风险和来源可信度。

## 验证方式

- 准备一篇包含标题、列表、表格、代码块、空行代码块和多标签 frontmatter 的文章。
- 运行 `npm run build`。
- 打开文章详情页，检查代码高亮、代码复制、代码折行、表格复制和表格 nowrap 切换。

## 相关文档

- `docs/lib/posts.md`
- `docs/components/shared.md`
- `docs/content/articles.md`

