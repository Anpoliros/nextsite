# Development

开发环境使用 Vite 处理资源，按请求渲染与生产相同的 React 页面。

## 执行步骤

1. 安装 Node.js 22.12+ 和 Python 3，执行 `npm install`。
2. 在 articles 子模块准备内容，执行 `npm run dev`。
3. 浏览 http://127.0.0.1:5173；可通过 PORT 更改开发端口，HOST 更改监听地址。
4. 执行 `npm run lint`、`npm run build`、`npm test`。
5. 工作树生产预览：`npm run preview:new`，监听 `0.0.0.0:2324`；之后运行 `npm run test:browser`（首次需 `npx playwright install chromium`）。独立预览部署见 `docs/workflows/build.md`。

## 实现视角

`build/dev.ts` 使用 Node HTTP 和 Vite 中间件，加载 `build/routes.ts`、`render.tsx`。文章、图片和源码变化使索引缓存失效，Vite 更新客户端代码或刷新页面。正文增强样式来自组件 CSS module 和 `src/styles/globals.css`。

## 验证方式

检查新文章预览、源码热更新和深层页面刷新；检查代码复制、表格操作、主题/阅读偏好持久化、照片切换和目录跟随。ASCII 源码保留，当前页面未挂载。
