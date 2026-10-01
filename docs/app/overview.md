# Pages

`src/pages/` 的 React 组件显示构建端提供的 `PageData`，构建端与浏览器共用组件树。

## 模块视角

`src/site/Page.tsx` 组合主题上下文、Header、main 和 Footer，并按页面 kind 选择组件。`build/routes.ts` 准备页面数据，`build/render.tsx` 生成 HTML 和元信息。

## 实现视角

- `HomePage.tsx`：Hero、ASCII 场景、Portals、置顶和时间线。
- `CategoryPage.tsx`、`TagPage.tsx`：筛选列表、说明及分页。
- `TagsPage.tsx`：按分类聚合标签。
- `ArticlePage.tsx`：正文、目录、上一篇/随机/下一篇。
- `AboutPage.tsx`、`NotFoundPage.tsx`：关于页和错误页面。

## 修改指南

页面组件接收可序列化的展示数据；文件读取和 Markdown 编译在 build 中完成。新增页面时同步扩展 `src/site/types.ts`、`Page.tsx` 和 `build/routes.ts`。

## 验证方式

运行 `npm run lint`、`npm run build`、`npm test`，检查桌面和移动端；确认浏览器没有 hydration 错误。
