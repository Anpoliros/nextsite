# Content Sync

内容同步与开发、构建分开：显式更新文章仓库，构建只读本地文章。

## 执行流程

`npm run sync-articles` 调用 scripts/sync_articles.sh：

1. 检查 articles 是否包含本地修改，有修改时退出。
2. fetch 更新远端引用。
3. 使用 `merge --ff-only @{u}` 更新当前分支，出现分叉时退出。

`npm run deploy` 显式调用同步后构建。`dev`、`build` 和 `start` 不调用同步。

## 图片处理

`scripts/prepare_content.py` 调用现有 MarkdownImageProcessor，在内存中将本地图片引用映射为 `/images/...`，处理规则沿用最长路径匹配及分隔符兜底。构建复制 articles/images 到产物，开发直接提供原图片。原始 Markdown 不发生修改。

`scripts/md_pic_remap.py` 仍可手动用于文件处理；直接运行其写入模式会修改指定目录。

## 验证方式

`npm run build` 前后检查 articles 的 Git 状态；通过 `python3 -B -m unittest discover -s tests` 验证匹配规则。
