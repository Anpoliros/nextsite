# Layout Components

布局组件负责站点外框、导航、主题切换和页面主栏/侧栏结构。

## 模块视角

`components/layout/` 提供所有页面共享的框架能力。页面组件只负责传入正文和可选右侧内容，不直接重复全局 Header、Footer 或网格结构。

## 实现视角

关键文件：

- `app/layout.tsx`：根布局，接入字体、主题变量、`ThemeProvider` 和全局容器。
- `components/layout/Header.tsx`：顶部导航，读取 `siteConfig.logo` 和 `siteConfig.navLinks`。
- `components/layout/HeaderActions.tsx`：客户端操作区，处理主题切换和占位操作按钮。
- `components/layout/PageShell.tsx`：页面内容网格，左侧主内容、右侧可选 aside。
- `components/layout/Footer.tsx`：页脚文本。
- `components/theme-provider.tsx`：封装 `next-themes`。

## 数据模型

布局主要由 `config/layout.ts`、`config/site.ts` 控制：

- `layoutConfig.gridTemplateColumns`：`PageShell` 的桌面端左右列比例。
- `layoutConfig.headerContainer`：顶部栏容器宽度和内边距。
- `layoutConfig.mainContainer`：主内容容器宽度和页面内边距。
- `uiConfig.themeColors`：根布局注入的浅色/深色模式 CSS 变量。
- `uiConfig.fontSizes`：Header、Footer 等全局布局文字尺寸。
- `siteConfig.navLinks`：顶部导航链接。

## Server/Client 边界

`Header.tsx` 和 `PageShell.tsx` 保持 Server Component。`HeaderActions.tsx` 使用 `"use client"`，因为它依赖 `useTheme`、`useState` 和 `useEffect`。

不要为了一个小交互把整个布局提升为 Client Component。优先把浏览器状态封装到更小的组件中。

## 修改指南

- 修改全局容器尺寸时，优先改 `config/layout.ts`。
- 新增页面右栏内容时，通过 `PageShell` 的 `right` prop 注入。
- 修改主题颜色时，优先改 `config/layout.ts` 的 `uiConfig.themeColors`，再检查 `app/globals.css` 中是否有固定颜色覆盖。
- 新增 Header 操作按钮时，如果需要事件处理，放在 `HeaderActions.tsx`。

## 验证方式

- 检查桌面端首页右侧 Portal 是否仍位于 aside。
- 检查移动端导航是否换行到第二行并可横向滚动。
- 切换 system、dark、light 主题，确认没有 hydration 警告或图标错位。
