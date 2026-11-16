# Docs Map

本文档维护源码路径和文档路径的映射。它是给维护者和 coding agent 使用的项目索引：修改源码前，先通过本文件找到应该阅读或更新的文档。

## 使用规则

- `Source Path` 指源码、内容、配置或工程脚本路径。
- `Documentation` 指对应文档路径；如果暂未创建，使用建议路径。
- `Update When` 说明什么变化需要同步更新文档。
- 新增核心目录、公共模块、重要脚本或构建产物时，应同步更新本文件。

## 当前映射

| Source Path               | Documentation                                    | Update When                                          |
| ------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `AGENTS.md`               | `docs/README.md`, `docs/SPEC.md`, `docs/init.md` | 修改 coding agent 工作规则、文档接入方式或项目约束时 |
| `README.md`               | `docs/README.md`                                 | 修改项目入口说明、启动方式或文档入口时               |
| `src/config/`                 | `docs/config/overview.md`                        | 修改自定义配置边界、配置入口或配置依赖关系时         |
| `package.json`            | `docs/workflows/development.md`                  | 修改 npm scripts、依赖、开发命令或运行流程时         |
| `src/pages/`, `src/site/`                    | `docs/app/overview.md`                           | 修改页面结构、布局、路由约定或渲染策略时             |
| `build/routes.ts`         | `docs/app/routing.md`                            | 修改分类路由、动态路由参数或页面生成逻辑时           |
| `src/components/`             | `docs/components/overview.md`                    | 修改组件分层、公共组件约定或跨页面复用方式时         |
| `src/components/home/`        | `docs/components/home.md`                        | 修改首页组件职责、数据输入或布局结构时               |
| `src/components/layout/`      | `docs/components/layout.md`                      | 修改全局布局、导航、主题切换或页面框架时             |
| `src/components/portals/`     | `docs/components/portals.md`                     | 修改弹层、传送门或跨层级渲染行为时                   |
| `src/components/shared/`      | `docs/components/shared.md`                      | 修改共享组件接口、样式约定或复用边界时               |
| `src/lib/`                    | `docs/lib/overview.md`                           | 修改核心工具、数据流、模块边界或共享类型时           |
| `src/lib/ascii/`              | `docs/lib/ascii.md`                              | 修改字符画转换接口、输入适配或产物格式时             |
| `src/lib/ascii/configs/`      | `docs/lib/ascii.md`                              | 修改字符画配置模型、默认配置或命名 profile 时        |
| `src/lib/markdown/`           | `docs/lib/markdown.md`                           | 修改 Markdown 解析、渲染、代码高亮或扩展语法时       |
| `build/content.ts`, `build/routes.ts`              | `docs/lib/posts.md`                              | 修改文章读取、frontmatter、排序、分类或标签模型时    |
| `articles/content/`       | `docs/content/articles.md`                       | 修改文章内容结构、frontmatter 约定或内容组织方式时   |
| `articles/images/`        | `docs/content/assets.md`                         | 修改原始图片目录、图片命名或同步规则时               |
| `dist/images/`          | `docs/content/assets.md`                         | 修改站点图片产物、静态资源路径或图片引用规则时       |
| `public/logos/`           | `docs/content/assets.md`                         | 修改品牌资源、图标资源或静态资源约定时               |
| `scripts/`                | `docs/workflows/scripts.md`                      | 修改工程脚本、内容同步脚本或自动化流程时             |
| `scripts/sync_articles.sh` | `docs/workflows/content-sync.md`                | 修改显式内容更新、只读图片引用准备流程时      |
| `scripts/ascii-preview.mjs` | `docs/lib/ascii.md`, `docs/workflows/scripts.md` | 修改字符画终端预览入口或参数解析时                   |
| `scripts/md_pic_remap.py` | `docs/workflows/content-sync.md`                 | 修改 Markdown 图片重写、图片路径规则或内容同步产物时 |
| `vite.config.ts`, `build/generate.ts`           | `docs/workflows/build.md`                        | 修改 Vite 配置、静态生成或开发预览时            |
| `postcss.config.*`        | `docs/workflows/styling.md`                      | 修改 Tailwind CSS、PostCSS 或样式编译流程时          |
| `tsconfig.json`           | `docs/workflows/development.md`                  | 修改 TypeScript 配置、路径别名或编译约束时           |
| `eslint.config.*`         | `docs/workflows/development.md`                  | 修改 lint 规则、代码质量约束或检查流程时             |
| `ecosystem.config.cjs`, `scripts/static-server.mjs`     | `docs/workflows/build.md`                        | 修改 PM2 部署、进程名、启动参数或日志策略时          |

## 建议新增文档

以下文档可按项目演进逐步补齐，不需要一次性全部完成：

```txt
docs/app/overview.md
docs/app/routing.md
docs/components/overview.md
docs/components/layout.md
docs/components/shared.md
docs/lib/overview.md
docs/lib/markdown.md
docs/lib/posts.md
docs/content/articles.md
docs/content/assets.md
docs/workflows/development.md
docs/workflows/build.md
docs/workflows/content-sync.md
docs/workflows/styling.md
docs/decisions/0001-docs-structure.md
```

## 静态生成入口

- `src/entry-client.tsx`、`build/render.tsx`：页面接管与 HTML 模板，见 `docs/app/overview.md`。
- `build/dev.ts`：开发预览，见 `docs/workflows/development.md`。
- `scripts/prepare_content.py`：只读内容处理，见 `docs/workflows/content-sync.md`。
- `tests/static-site.test.mjs`：产物和 HTTP 集成验证，见 `docs/workflows/build.md`。

`scripts/static-files.mjs` 提供开发和生产共用的文件响应工具；static-server.mjs 是独立入口，由 Node 或 PM2 加载即启动服务。PM2 配置使用 ecosystem.config.cjs 文件名及 fork 模式。

- `tests/content-sync.test.mjs`：生产 worktree 同步与本地修改保护，见 `docs/workflows/content-sync.md`。

## 手账迁移版

| Source Path | Documentation | Update When |
| --- | --- | --- |
| `src/components/journal/`, `src/styles/journal/` | `docs/components/home.md`, `docs/components/layout.md` | 主页、纸张、读者偏好和配色变更 |
| `src/components/reading/` | `docs/app/overview.md`, `docs/components/layout.md` | 票据、目录、移动阅读交互变更 |
| `build/photos.ts` | `docs/content/gallery.md` | 图片资格、均衡选图、缩略图生成变更 |
| `preview.config.cjs`, `tests/browser.mjs` | `docs/workflows/build.md` | 独立工作树预览、浏览器验证变更 |

- `src/lib/format-date.ts`：统一设计稿日期与 UTC 格式化，见 `docs/components/home.md`。
