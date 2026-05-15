# Build And Deploy

本文档记录生产构建、启动和 PM2 部署流程。

## 触发场景

修改 Next.js 配置、npm scripts、PM2 配置、内容同步流程或生产端口时，应更新本文档。

## 构建流程

生产构建命令：

```sh
npm run build
```

该命令会先执行 `npm run sync-articles`，再执行 `next build`。因此构建依赖：

- `articles` 子模块可拉取。
- `articles/images/` 可同步到 `public/images/`。
- `scripts/md_pic_remap.py` 可正常处理 Markdown。
- 所有动态路由参数可以从 `getAllPosts()` 枚举。

## 运行流程

生产启动命令：

```sh
npm run start
```

该命令同样先同步内容，再执行 `next start`。

PM2 部署命令：

```sh
npm run deploy
```

`npm run deploy` 会执行 `scripts/deploy_articles.sh`。该脚本先运行 `npm run build`，因此会包含 `sync-articles` 的完整流程：更新并强制对齐 `articles` 子模块、同步图片、运行 `scripts/md_pic_remap.py` 重写 Markdown 图片路径。构建成功后，脚本会 reload `nextsite` PM2 进程；如果进程不存在，则按 `ecosystem.config.js` 启动。

`ecosystem.config.js` 当前配置：

- 应用名：`nextsite`
- 启动脚本：`node_modules/next/dist/bin/next`
- 参数：`start -p 12121`
- 工作目录：`/home/anpoliros/nextsite`
- 进程数：`1`
- 内存重启阈值：`1G`
- 环境：`NODE_ENV=production`

`ecosystem.config.js` 同时配置了 `nextsite-articles-hook`，用于接收 Gitea articles 仓库的 push webhook。该进程默认监听：

```txt
http://127.0.0.1:12122/hooks/articles
```

Webhook 的监听地址、端口、路径、分支和 Secret 都集中写在 `scripts/articles_webhook.mjs` 文件头部。Secret 应与 Gitea webhook 的 Secret 一致。Webhook daemon 会校验 `X-Gitea-Signature`、事件类型和分支，只处理 `push` 到 `refs/heads/master` 的请求。

自动部署脚本也可手动执行：

```sh
npm run hook:deploy-articles
```

`npm run deploy` 与 `npm run hook:deploy-articles` 使用同一个脚本。

## 配置文件

- `next.config.ts`：当前没有额外 Next.js 配置。
- `postcss.config.mjs`：启用 `@tailwindcss/postcss`。
- `app/globals.css`：引入 Tailwind CSS 4 和 typography 插件。
- `ecosystem.config.js`：PM2 生产进程配置。

## 修改指南

- 修改端口时，同步更新 `ecosystem.config.js` 和外部反向代理配置。
- 修改构建前置流程时，同步检查 `dev`、`build`、`start`、`deploy` 四个 scripts。
- 修改 webhook 监听端口、路径、分支或 Secret 规则时，同步检查 `scripts/articles_webhook.mjs` 和 Gitea webhook 配置。
- 修改 Next.js 运行模式或输出模式前，先阅读 `node_modules/next/dist/docs/` 中对应版本文档。

## 验证方式

```sh
npm run lint
npm run build
```

部署后：

```sh
npm run log
```

人工检查首页、分类页、文章详情页和静态图片资源。
