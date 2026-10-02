# Weblog

React + TypeScript + Vite 博客。构建时将 Markdown 转成完整 HTML，生产访问由静态文件服务处理。浏览器接管主题、ASCII 场景、代码块和表格交互。

## 开发与构建

需要 Node.js 22.12+、Python 3；部署脚本还需要 Git、PM2。

```sh
npm install
npm run dev          # http://127.0.0.1:5173
npm run lint
npm run build        # 类型检查 + SSG，输出 dist/
npm start            # http://127.0.0.1:12121
npm test             # 检查已生成页面及静态 HTTP 行为
```

`dev`、`build`、`start` 使用本地内容，不拉取或改写 articles。图片匹配复用现有 Python 工具，只转换内存中的内容。文章变化后需重新 build，开发预览会自动刷新。

```sh
npm run sync-articles # 显式更新子模块；存在本地修改时退出
npm run deploy        # 同步、构建，再以新 PM2 配置启动或重启静态服务
```

`PORT`、`HOST`、`SITE_DIR` 可配置静态服务的端口、地址和文件目录。默认保持 12121 端口及 PM2 名称 nextsite。部署使用 `ecosystem.config.cjs`；旧 `ecosystem.config.js` 保留了迁移前的未提交修改，不再作为启动入口。文章 webhook 使用新配置中的 nextsite-articles-hook。

## 目录

```text
src/pages/           React 页面，只接收展示数据
src/components/      布局、Hero、Portals、ASCII 和文章交互
src/config/          站点与展示配置
src/lib/markdown/    构建端 Markdown 渲染
src/lib/ascii/       字符画算法与构建端图片转换
src/site/            页面数据协议、公共布局、URL 和日期规则
src/styles/          全局样式
build/               内容读取、路由枚举、HTML 渲染、SSG 与开发预览
articles/            独立文章仓库子模块
scripts/             内容工具、静态服务与发布入口
dist/                可独立部署的静态产物（不提交 Git）
```

分页 URL 使用 `/page/2/`、`/<category>/page/2/`、`/tags/<tag>/page/2/`，按钮由统一路径工具生成。页面之间使用浏览器正常跳转。未来 Shizunet 登录和评论后端独立接入，当前阶段保留既有显示效果。

文档入口见 `docs/README.md`。

首次部署检测 nextsite 的实际脚本路径；仍指向 Next 时，在构建成功后删除旧进程并按静态配置重新注册，后续发布直接重启。
