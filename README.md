# Weblog

React + TypeScript + Vite 静态博客。当前迁移版将贴纸手账主页与票据阅读页接入真实 Markdown，只保留主页和文章两种内容页面。

## 开发与验证

Node.js 22.12+、Python 3；部署还需要 Git、Git LFS、PM2。文章是独立仓库，构建只读内容，不修改 Markdown。

```sh
npm ci
npm run dev          # 默认 http://127.0.0.1:5173，可配置 HOST/PORT
npm run lint
npm run build        # 类型检查、walking 相册、SSG → dist/
npm test             # 产物、HTTP、选图与内容同步
npm run deploy       # 同步文章并部署正式 nextsite，127.0.0.1:12121
npm run test:browser # 默认测试本地 12121，TEST_BASE_URL 可覆盖
```

`articles/` 需要有效的内容检出；也可用 `ARTICLES_DIR` 指向其他内容目录。工作树预览使用独立文章检出，原作者工作区的未提交稿件不进入构建。

正式工作目录为 `~/sites/weblog`，使用 main 分支。`npm run deploy` 同步远端文章到 `.build/articles`，构建成功后重启 `ecosystem.config.cjs` 中的 nextsite（127.0.0.1:12121）。文章 webhook 由同一配置中的 nextsite-articles-hook 运行，监听 `10.192.51.25:12122/hooks/articles`；`ARTICLES_HOOK_HOST` 可覆盖监听地址。旧版 2324 服务已退役，`preview:new` 仅保留为 deploy 的兼容别名。

## 结构

```text
src/pages/                 主页、文章组合
src/components/journal/    手账组件、相册、纸边与读者偏好
src/components/reading/    票据、目录与阅读跟随
src/styles/journal/        深浅语义配色和各模块样式
src/lib/markdown/          Markdown 编译、代码、表格、目录
src/site/                  页面数据与静态/浏览器共用入口
build/                     文章读取、选图、路由、SSG、开发预览
articles/                  独立内容仓库
```

分类通过主页书签筛选；tag 作为元数据和卡片色覆盖依据，不生成独立页面。About 使用文章模板。旧 ASCII、Portals 与 Hero 保留源码，当前不挂载。产品代码完全独立于 sketchbook。

文档入口见 `docs/README.md`；迁移路由见 `docs/app/routing.md`，选图规则见 `docs/content/gallery.md`。
