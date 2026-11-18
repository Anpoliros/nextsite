# Build And Deploy

构建生成完整静态网站，成功后原子替换 dist，服务只发送文件。

## 构建流程

`npm run build`：TypeScript 检查 → Vite 浏览器与 SSR 入口 → 只读文章准备 → walking 相册与 WebP 缩略图 → 主页、文章和 404 HTML/JSON → routes.json → 替换 dist。失败保留旧产物。

内容默认来自本工作树的 articles。可用 `ARTICLES_DIR` 指定另一份只读内容检出。相册详见 `docs/content/gallery.md`。

## 正式部署

main 分支部署在 `~/sites/weblog`，手账版本已合入。运行 `npm run deploy` 同步文章到 `.build/articles`，构建成功后重启 `ecosystem.config.cjs` 中的 nextsite，监听 `127.0.0.1:12121`。构建失败保留已有静态产物。

文章 webhook 进程为 nextsite-articles-hook，监听 `10.192.51.25:12122/hooks/articles`，只接受签名有效的 master push。Gitea 仓库投递地址需与监听地址一致，监听地址可由 `ARTICLES_HOOK_HOST` 覆盖。修改后通过 `pm2 startOrRestart ecosystem.config.cjs --only nextsite-articles-hook --update-env` 应用，最后 `pm2 save`。

旧版 2324 进程与 weblog-new 工作树退役；`preview:new` 保留为 `npm run deploy` 的兼容别名。部署前可运行 `npm run lint`，部署后运行 `npm test`，检查 `/healthz` 和最新文章。

## HTTP 行为

页面 no-cache，哈希 assets 长期缓存；未知路径返回 404 HTML。HEAD 无正文，只接受 GET/HEAD，存在的目录补尾部斜线。`/healthz` 返回 JSON。分类/tag 路由明确返回 404。
