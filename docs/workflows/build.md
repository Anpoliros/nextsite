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

`ecosystem.config.js` 当前配置：

- 应用名：`nextsite`
- 启动脚本：`node_modules/next/dist/bin/next`
- 参数：`start -p 12121`
- 工作目录：`/home/anpoliros/nextsite`
- 进程数：`1`
- 内存重启阈值：`1G`
- 环境：`NODE_ENV=production`

## 配置文件

- `next.config.ts`：当前没有额外 Next.js 配置。
- `postcss.config.mjs`：启用 `@tailwindcss/postcss`。
- `app/globals.css`：引入 Tailwind CSS 4 和 typography 插件。
- `ecosystem.config.js`：PM2 生产进程配置。

## 修改指南

- 修改端口时，同步更新 `ecosystem.config.js` 和外部反向代理配置。
- 修改构建前置流程时，同步检查 `dev`、`build`、`start`、`deploy` 四个 scripts。
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
