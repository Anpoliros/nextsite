# Content Sync

内容同步与开发、构建分开：显式更新文章仓库，构建只读本地文章。

## 执行流程

`npm run sync-articles` 调用 scripts/sync_articles.sh：

1. fetch 更新 articles 的远端引用，解析当前分支 upstream 的提交。
2. 在 `.build/articles` 创建或更新 detached Git worktree，仅检出远端已提交的内容。
3. 执行 Git LFS pull，取得图片本体。

作者的 articles 工作区、分支和未提交修改保持原样。已有生产 worktree 必须属于同一仓库且没有本地修改，否则同步退出。

`npm run deploy` 在同步成功后通过 `ARTICLES_DIR=.build/articles` 构建。`dev`、普通 `build` 和 `start` 不调用同步；未设置 ARTICLES_DIR 时构建读取本地 articles。

## 图片处理

`scripts/prepare_content.py` 调用现有 MarkdownImageProcessor，在内存中将本地图片引用映射为 `/images/...`，处理规则沿用最长路径匹配及分隔符兜底。构建复制所选文章目录的 images 到产物，开发直接提供原图片。原始 Markdown 不发生修改。

`scripts/md_pic_remap.py` 仍可手动用于文件处理；直接运行其写入模式会修改指定目录。

## 验证方式

`npm run build` 前后检查 articles 的 Git 状态；通过 `python3 -B -m unittest discover -s tests` 验证匹配规则。
