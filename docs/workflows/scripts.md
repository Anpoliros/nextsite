# Engineering Scripts

本文档记录 `scripts/` 下工程脚本的职责、入口和维护约束。

## 内容同步

`scripts/md_pic_remap.py` 负责扫描图片目录，并将 Markdown 中的本地图片引用重写为 Web 可访问路径。

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
2. 执行 `npm run build`，该命令会先运行 `sync-articles`，包含 articles 子模块更新、图片同步和 Markdown 图片路径重写。
3. 构建成功后 reload `nextsite` PM2 进程；如果进程不存在，则按 `ecosystem.config.js` 启动。

手动验证：

```sh
npm run hook:deploy-articles
```

## 维护规则

- 修改脚本入口时，同步更新 `package.json`。
- 修改自动部署流程时，同步更新 `docs/workflows/build.md`。
- 修改 webhook 校验规则时，同步检查 Gitea webhook 配置。
- 修改 articles 默认分支时，同步调整子模块 upstream、`sync-articles` 行为和 `EXPECTED_REF`。
