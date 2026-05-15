# Development Workflow

本文档记录本地开发、常用命令和修改前需要关注的项目约束。

## 触发场景

开始开发、调试文章内容、修改页面组件、调整 Markdown 渲染或更新构建配置时，应先阅读本文档。

## 技术栈

- Next.js `16.2.3`
- React `19.2.4`
- Tailwind CSS `4`
- TypeScript `5`
- ESLint `9`
- Markdown pipeline：`unified`、`remark-*`、`rehype-*`、`shiki`

Next.js 相关实现需要以 `node_modules/next/dist/docs/` 中的本地文档为准。

## 常用命令

| Command | Meaning |
| --- | --- |
| `npm run dev` | 同步文章和图片后启动 Next dev server |
| `npm run build` | 同步文章和图片后执行生产构建 |
| `npm run start` | 同步文章和图片后启动生产服务 |
| `npm run lint` | 运行 ESLint |
| `npm run sync-articles` | 拉取 articles 子模块、同步图片、重写 Markdown 图片路径 |
| `npm run deploy` | 构建后通过 PM2 启动 |
| `npm run stop` | 停止 PM2 进程 |
| `npm run log` | 查看 PM2 日志 |

## 开发前检查

- 修改 Next.js 路由、页面参数、Server/Client Component 边界前，先读相关 Next 本地文档。
- 修改文章或图片流程前，先确认 `articles/` 子模块状态。
- 修改 Markdown 渲染前，先准备包含代码块和表格的文章用于人工检查。
- 修改公共组件接口时，同步检查引用页面和 `docs/MAP.md`。

## 验证方式

最小验证：

```sh
npm run lint
```

涉及路由、内容、构建或部署时：

```sh
npm run build
```

涉及内容同步时：

```sh
npm run sync-articles
```

## 常见风险

- `npm run dev`、`build`、`start` 都会先运行 `sync-articles`，可能修改 `articles/content` 中的图片引用。
- `getAllPosts()` 会写 `.logs/postindex_*.json`，这是索引排查产物。
- 页面路由参数使用 Next.js 16 的 Promise 写法，修改时不要回退到旧式同步参数。

