# Build And Deploy

生产构建生成完整静态网站，成功后替换 dist，生产服务仅发送文件。

## 构建流程

`npm run build` 先检查 TypeScript，再执行 `build/generate.ts`：

1. Vite 将浏览器脚本、CSS 和 public 资源写入 `.build/site`。
2. 构建 React HTML 渲染入口到 `.build/render`。
3. 只读准备文章、复制图片、遍历路由，生成正文 HTML、元信息和当前页面 JSON。
4. 生成 routes.json 和 404.html；构建成功后替换 dist。

任何生成阶段失败都保留旧 dist。替换目录时通过 rename 切换，失败会恢复旧目录；普通 start 无需 Vite 或 Markdown 编译。

## 启动和部署

`npm start` 启动 `scripts/static-server.mjs`，默认 127.0.0.1:12121。可配置 HOST、PORT、SITE_DIR；同一产物也可交由 Nginx 等静态服务部署。

`npm run deploy` 使用目录锁，先显式同步 articles，再构建，最后调用 `pm2 startOrRestart ecosystem.config.cjs --only nextsite --update-env`。新配置保留 nextsite 名称和端口，替换原 Next 进程。旧 ecosystem.config.js 保留原有未提交修改，停用。

Webhook 仍由 scripts/articles_webhook.mjs 接收 Gitea push 并触发同一部署脚本，可用 `pm2 start ecosystem.config.cjs --only nextsite-articles-hook` 启动。

## HTTP 行为

页面使用 no-cache，带内容哈希的 assets 使用长期缓存。未知路径返回 404 HTML；HEAD 不返回正文；只接受 GET/HEAD。深层页面由实际目录提供，目录访问补齐尾部斜线。

## 验证方式

`npm run lint`、`npm run build`、`npm test`；启动后检查首页、分类、标签、文章、图片和未知路径。线上反向代理仍连接 12121 端口。

首次部署检测 nextsite 的实际脚本路径；仍指向 Next 时，在构建成功后删除旧进程并按静态配置重新注册，后续发布直接重启。

`scripts/static-files.mjs` 提供开发和生产共用的文件响应工具；static-server.mjs 是独立入口，由 Node 或 PM2 加载即启动服务。PM2 配置使用 ecosystem.config.cjs 文件名及 fork 模式。
