# Docs Map

本文档维护源码路径和文档路径的映射。它是给维护者和 coding agent 使用的项目索引：修改源码前，先通过本文件找到应该阅读或更新的文档。

## 使用规则

- `Source Path` 指源码、内容、配置或工程脚本路径。
- `Documentation` 指对应文档路径；如果暂未创建，使用建议路径。
- `Update When` 说明什么变化需要同步更新文档。
- 新增核心目录、公共模块、重要脚本或构建产物时，应同步更新本文件。

## 当前映射

| Source Path | Documentation | Update When |
| --- | --- | --- |
| `AGENTS.md` | `docs/README.md`, `docs/SPEC.md`, `docs/init.md` | 修改 coding agent 工作规则、文档接入方式或项目约束时 |
| `README.md` | `docs/README.md` | 修改项目入口说明、启动方式或文档入口时 |
| `package.json` | `docs/workflows/development.md` | 修改 npm scripts、依赖、开发命令或运行流程时 |
| `app/` | `docs/app/overview.md` | 修改页面结构、布局、路由约定或渲染策略时 |
| `app/[category]/` | `docs/app/routing.md` | 修改分类路由、动态路由参数或页面生成逻辑时 |
| `app/about/` | `docs/app/routing.md` | 修改关于页路由、页面数据来源或展示结构时 |
| `app/tags/` | `docs/app/routing.md` | 修改标签页路由、标签数据来源或筛选逻辑时 |
| `components/` | `docs/components/overview.md` | 修改组件分层、公共组件约定或跨页面复用方式时 |
| `components/home/` | `docs/components/home.md` | 修改首页组件职责、数据输入或布局结构时 |
| `components/layout/` | `docs/components/layout.md` | 修改全局布局、导航、主题切换或页面框架时 |
| `components/portals/` | `docs/components/portals.md` | 修改弹层、传送门或跨层级渲染行为时 |
| `components/shared/` | `docs/components/shared.md` | 修改共享组件接口、样式约定或复用边界时 |
| `lib/` | `docs/lib/overview.md` | 修改核心工具、数据流、模块边界或共享类型时 |
| `lib/markdown/` | `docs/lib/markdown.md` | 修改 Markdown 解析、渲染、代码高亮或扩展语法时 |
| `lib/posts/` | `docs/lib/posts.md` | 修改文章读取、frontmatter、排序、分类或标签模型时 |
| `articles/content/` | `docs/content/articles.md` | 修改文章内容结构、frontmatter 约定或内容组织方式时 |
| `articles/images/` | `docs/content/assets.md` | 修改原始图片目录、图片命名或同步规则时 |
| `public/images/` | `docs/content/assets.md` | 修改站点图片产物、静态资源路径或图片引用规则时 |
| `public/logos/` | `docs/content/assets.md` | 修改品牌资源、图标资源或静态资源约定时 |
| `scripts/` | `docs/workflows/scripts.md` | 修改工程脚本、内容同步脚本或自动化流程时 |
| `scripts/md_pic_remap.py` | `docs/workflows/content-sync.md` | 修改 Markdown 图片重写、图片路径规则或内容同步产物时 |
| `next.config.*` | `docs/workflows/build.md` | 修改 Next.js 配置、构建行为或运行时配置时 |
| `postcss.config.*` | `docs/workflows/styling.md` | 修改 Tailwind CSS、PostCSS 或样式编译流程时 |
| `tsconfig.json` | `docs/workflows/development.md` | 修改 TypeScript 配置、路径别名或编译约束时 |
| `eslint.config.*` | `docs/workflows/development.md` | 修改 lint 规则、代码质量约束或检查流程时 |
| `ecosystem.config.js` | `docs/workflows/build.md` | 修改 PM2 部署、进程名、启动参数或日志策略时 |

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
