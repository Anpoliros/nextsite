# Shared Components

`src/components/shared/` 保留 Markdown 正文容器与客户端增强。贴纸列表位于 `journal/`，目录位于 `reading/`，分页由主页负责。

## 模块视角

构建端提供渲染好的 HTML 和目录数据，正文组件负责稳定挂载这些内容，增强组件通过事件委托处理代码块和表格。

## 实现视角

- `ArticleBody.tsx`：Markdown HTML 容器，挂载 `MarkdownEnhancer`，使用 `memo` 阻止目录高亮等父级更新重新写入正文 HTML。重新写入会使标题节点引用失效，并清空代码折行状态。
- `ArticleBody.module.css`：notice 局部样式。
- `MarkdownEnhancer.tsx`：复制代码/表格、切换折行的事件委托。
- `src/styles/globals.css`：代码块和表格基础样式。
- `src/styles/journal/reading.css`：阅读字号、颜色、纸面和响应式约束。

## 修改指南

修改增强组件的选择器时，同步检查 `src/lib/markdown/codeblock.ts`、`table.ts` 和基础样式。修改 notice 的类名时同步更新 CSS module。目录数据来自 Markdown 构建结果，正文滚动跟踪不得持有已移除的标题节点。

## 验证方式

运行 `npm run test:browser`，验证目录高亮、正文节点稳定、移动目录抽屉和代码折行。Markdown 语法及转换规则见 `docs/lib/markdown.md`。
