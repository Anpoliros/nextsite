# Pages

主页与文章由同一 React 树静态生成，再由浏览器接管。

## 模块视角

`src/site/Page.tsx` 组合主题、读者偏好和 `JournalShell`，根据 `PageData.kind` 显示主页、文章或错误提示。

## 实现视角

- `HomePage.tsx`：稳定 Hero、分类筛选、分页、贴纸列表、书签/日历/摘句纸边。
- `ArticlePage.tsx`：真实 Markdown 纸面、上下票据、篇间导航、跟随目录和移动端抽屉。
- `components/journal/`：共用纸张、浮动入口、读者偏好、相册和主页组件。
- `components/reading/`：票据与桌面/移动目录。
- `build/routes.ts`：展示数据与路径枚举；文件读取仅在构建端执行。

原有 ASCII、Portals、旧 Hero 的实现保留于 `components/home/` 和 `components/portals/`，当前页面不加载。

## 修改指南

浏览器初始树必须与静态 HTML 一致。随机相片顺序与姿态、当前月份、媒体查询和持久化偏好均在 effect 后初始化；文章图标倾角和缩进使用稳定哈希。浏览器组件不得导入 `build/` 或 sketchbook 文件。

## 验证方式

`npm run lint`、`npm run build`、`npm test`；启动静态预览后运行 `npm run test:browser`，检查没有 hydration 错误、窄屏横向溢出或失效导航。
