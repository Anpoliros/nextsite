# Build And Deploy

构建生成完整静态网站，成功后原子替换 dist，服务只发送文件。

## 构建流程

`npm run build`：TypeScript 检查 → Vite 浏览器与 SSR 入口 → 只读文章准备 → walking 相册与 WebP 缩略图 → 主页、文章和 404 HTML/JSON → routes.json → 替换 dist。失败保留旧产物。

内容默认来自本工作树的 articles。可用 `ARTICLES_DIR` 指定另一份只读内容检出。相册详见 `docs/content/gallery.md`。

## 手账正式版本

分支 `feat/sticker-weblog` 的工作树位于 `~/sites/weblog-new`，文章使用独立检出，作者原目录中的未提交修改不进入预览。

```sh
npm ci
npm run lint
npm run build
npm test
npm run preview:new
npm run test:browser
```

`preview.config.cjs` 启动独立 PM2 进程 weblog-new，监听 `0.0.0.0:12121`。检查 `/healthz`、主页和任意文章；默认测试地址为 `http://127.0.0.1:12121`，可通过 `TEST_BASE_URL` 覆盖。Playwright 首次使用可运行 `npx playwright install chromium`。

正式入口继续连接 12121，目前由 weblog-new 提供；旧 nextsite 移至 `0.0.0.0:2324`。两个进程的工作树保持独立，端口交换没有接管旧 webhook。新版更新执行 `npm run build && npm run preview:new`。

## 原正式部署入口

`npm run deploy` 继续由 `scripts/deploy_articles.sh` 使用目录锁、同步远端文章到 `.build/articles`、构建、重启 `ecosystem.config.cjs` 的 nextsite。该入口继续负责旧版 2324，当前不得用于发布手账新版；新版使用上文命令。

## HTTP 行为

页面 no-cache，哈希 assets 长期缓存；未知路径返回 404 HTML。HEAD 无正文，只接受 GET/HEAD，存在的目录补尾部斜线。`/healthz` 返回 JSON。分类/tag 路由明确返回 404。
