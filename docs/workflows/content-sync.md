# Content Sync

内容同步流程负责更新文章子模块、同步图片到公开目录，并重写 Markdown 中的图片引用。

## 触发场景

以下命令会触发内容同步：

- `npm run sync-articles`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run deploy`

## 执行流程

`package.json` 中的 `sync-articles` 调用 `scripts/sync_articles.sh`。脚本依次执行：

```sh
git -C articles fetch --prune
git -C articles reset --hard @{u}
git -C articles clean -fd
rsync -a --delete articles/images/ public/images/
python scripts/md_pic_remap.py --image-dir public/images --md-dir articles/content --web
```

流程含义：

1. 拉取 `articles` 子模块远端引用。
2. 将子模块强制重置到当前分支的 upstream，并清理未跟踪文件。
3. 将 `articles/images/` 镜像同步到 `public/images/`。
4. 扫描 `public/images/`，把 Markdown 中的本地图片引用改写成 `/images/...`。

## 脚本行为

`scripts/md_pic_remap.py` 支持：

- Markdown 图片语法：`![alt](path)`。
- HTML 图片标签：`<img src="path">`。
- 文件名、后缀、省略扩展名和部分路径匹配。
- 文件名中的 `-` 与 `_` 等价匹配；存在多个候选时保留原引用并报告未匹配。
- `--dry-run` 预览模式。
- `--verbose` 详细匹配日志。
- `--pattern` 自定义输出路径模式。

Web 模式下，输出路径基于图片目录名生成。例如 `--image-dir public/images --web` 会输出 `/images/<path>`。

## 修改指南

- 修改同步步骤时，从 `scripts/sync_articles.sh` 开始，并同步检查 `package.json` 和本文档。
- 修改图片目录时，同时更新 `scripts/sync_articles.sh`、`docs/content/articles.md` 和 `docs/MAP.md`。
- 修改路径匹配策略时，优先用 `--dry-run` 在真实内容上验证。
- 修改输出路径模式时，确认 Next.js `public/` 路径仍能被浏览器访问。
- `sync-articles` 会丢弃 `articles/` 内的本地临时改动；需要保留的文章改动应先提交到内容仓库。
- 如果不希望开发命令修改内容文件，需要重新设计 `sync-articles` 的触发时机。

## 验证方式

预览：

```sh
python scripts/md_pic_remap.py --image-dir public/images --md-dir articles/content --web --dry-run
```

完整同步：

```sh
npm run sync-articles
```

同步后检查：

- `public/images/` 是否与 `articles/images/` 一致。
- Markdown 图片引用是否输出为 `/images/...`。
- 文章详情页图片是否能正常加载。
