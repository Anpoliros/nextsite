# Engineering Scripts

本文档记录 `scripts/` 下工程脚本的职责、入口和维护约束。

## 内容同步

`scripts/sync_articles.sh` 是内容同步入口，fetch 后将 upstream 提交检出到独立的 `.build/articles` worktree，保留作者的本地修改。构建端通过 `scripts/prepare_content.py` 在内存中准备图片引用。

图片匹配优先使用完整路径和文件名，也支持省略扩展名以及 `-`、`_` 分隔符混用。分隔符归一化后出现多个候选时，脚本会跳过该引用，避免写入错误路径。

常用入口：

```sh
npm run sync-articles
```

## Articles Webhook

`scripts/articles_webhook.mjs` 是 Gitea articles 仓库的 webhook daemon。它当前监听：

```txt
http://10.177.87.87:12122/hooks/articles
```

头部配置集中写在文件开头：

- `HOST`
- `PORT`
- `HOOK_PATH`
- `EXPECTED_REF`
- `WEBHOOK_SECRET`

其中 `WEBHOOK_SECRET` 必须改成与 Gitea webhook Secret 一致。daemon 会使用原始请求体校验 `X-Gitea-Signature`，并只响应 `push` 事件。

`EXPECTED_REF` 必须与 `articles` 子模块实际同步的分支一致。当前 `sync-articles` 会按子模块 upstream 更新内容；如果 Gitea 测试返回 `ignored ref: refs/heads/main`，说明测试事件来自 `main`，而 daemon 当前只允许配置中的分支。

查看事件历史：

```sh
pm2 logs nextsite-articles-hook --lines 200 --nostream
pm2 describe nextsite-articles-hook
```

前台调试：

```sh
npm run hook:articles
```

## Articles 自动部署

`scripts/deploy_articles.sh` 是 webhook 触发后的实际部署脚本。它会：

1. 使用 `.logs/deploy_articles.lock` 防止并发部署。
2. 显式执行 `npm run sync-articles`，再执行 `npm run build`；生产构建读取独立 worktree 中远端已提交的内容。
3. 构建成功后使用 `ecosystem.config.cjs` 启动或重启静态服务，沿用 nextsite 名称。

手动验证：

```sh
npm run hook:deploy-articles
```

## ASCII 图片预览

`scripts/ascii-preview.mjs` 用于在终端中预览图片转字符画效果。它读取 `src/lib/ascii/configs/default.ts` 的默认列数、最大行数、字符集、反色和抖动参数，并通过 `sharp` 解码 JPG、PNG、SVG、WebP 等常见图片格式。

常用入口：

```sh
npm run ascii:preview -- public/bg-alice.jpeg
npm run ascii:preview -- public/temp/IMG_7324.jpeg --config shell
npm run ascii:preview -- public/temp/IMG_7324.jpeg --config shell --contrast 5 --print-config
npm run ascii:preview -- public/file.svg --columns 72 --invert
npm run ascii:preview -- public/bg-alice.jpeg --contrast 5 --dither
npm run ascii:preview -- public/images/cloud.jpg --background "#fff" --background-variance 160
npm run ascii:preview -- --charsets
```

## 维护规则

- 修改脚本入口时，同步更新 `package.json`。
- 修改自动部署流程时，同步更新 `docs/workflows/build.md`。
- 修改 webhook 校验规则时，同步检查 Gitea webhook 配置。
- 修改 articles 默认分支时，同步调整子模块 upstream、`sync-articles` 行为和 `EXPECTED_REF`。

首次部署检测 nextsite 的实际脚本路径；仍指向 Next 时，在构建成功后删除旧进程并按静态配置重新注册，后续发布直接重启。
