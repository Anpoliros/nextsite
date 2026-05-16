# Home Components

首页组件负责首屏 Hero、入口面板和文章时间线的展示编排。

## 模块视角

`components/home/` 放置首页专用组件。当前核心组件是 `Hero`，它读取 `siteConfig.hero` 渲染首页顶部横幅，不负责文章数据、分页或右侧 Portal 布局。

## 实现视角

- `components/home/Hero.tsx`：Server Component，使用 `next/link` 渲染可选的副标题链接。
- `site.config.ts`：`hero` 字段集中维护 Hero 的背景图、标题、副标题、对齐、颜色和字号。

Hero 通过 Tailwind `dark:` 分支区分深浅主题内容，不引入客户端主题状态。

## 数据模型

`siteConfig.hero` 的关键字段：

- `aspectRatio`：Hero 容器纵横比。
- `bg.light` / `bg.dark`：深浅主题背景图。
- `align.light` / `align.dark`：标题和副标题在不同主题下的水平对齐，可选 `left` 或 `right`。
- `title.light` / `title.dark`：不同主题下的标题文本。
- `subtitle.light` / `subtitle.dark`：不同主题下的副标题配置，包含 `description` 和 `link`。`link` 为空字符串时渲染普通文本。
- `colors`、`fontSizes`：Hero 文本样式。

## 修改指南

- 修改 Hero 展示内容时，优先改 `siteConfig.hero`。
- 新增 Hero 交互时，尽量下沉到小型 Client Component，避免把整个首页提升为客户端组件。
- 调整主题差异时，保持 `light` 和 `dark` 字段完整，避免某个主题回退到隐式默认值。

## 验证方式

- 运行 `npm run lint`。
- 人工检查 `/`，切换浅色和深色主题，确认背景、标题、副标题和对齐方式符合配置。

## 相关文档

- `docs/MAP.md`
- `docs/app/overview.md`
