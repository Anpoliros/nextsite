# Articles Content

文章内容来自 `articles/content/`，图片源来自 `articles/images/`，站点运行时使用同步后的 `public/images/`。

## 模块视角

内容目录是站点文章系统的数据源。分类由目录决定，文章 slug 由文件名决定，标题、日期、标签和目录展示开关由 frontmatter 决定。

## 内容结构

```txt
articles/
  content/
    about.md
    walking/
      example.md
    developer/
      example.md
  images/
    ...

public/
  images/
    ...
```

`articles/content/<category>/<slug>.md` 会进入文章索引。`articles/content/about.md` 这类根目录文件不进入文章列表，适合单页内容。

## Frontmatter

文章索引当前读取以下字段：

```md
---
title: 文章标题
date: 2026-05-12
tags:
  - tag-a
  - tag-b
showToc: true
---
```

字段约定：

- `title`：文章标题，会映射为 `PostMeta.post_title`。
- `date`：文章日期，用于列表排序和详情页展示。
- `tags`：字符串数组，用于标签页和详情页标签链接。
- `showToc`：可选布尔值，控制详情页是否展示正文目录。读取时兼容旧式 `ShowToc`，新文章推荐使用 `showToc`。

## 内容指令

Markdown 正文当前支持以下静态 notice 指令：

```md
<!--copyright-notice-->

<!--spoiler-alert-->
```

这些指令会在渲染时转换为 notice 样式块。它们应单独占一行，不要和普通段落混写。

`<!--more-->` 用于标记列表摘要的结束位置。摘要内容取 frontmatter 之后、`<!--more-->` 之前的 Markdown，并会转换为纯文本。例如：

```md
---
title: 示例
---

# 123

<!--more-->

正文内容
```

列表摘要为 `123`。

## 图片路径

构建在内存中将图片引用映射为 `/images/<path>`，将 `articles/images/` 复制到产物的 images 目录。开发预览直接提供原图片，原始 Markdown 保留。图片匹配规则复用 `scripts/md_pic_remap.py`，只读入口是 `scripts/prepare_content.py`。

显式 `npm run sync-articles` 只更新无本地修改的内容仓库。

## 修改指南

- 新增分类目录后，如果需要分类页展示名、描述或横幅，更新 `src/config/content.ts` 的 `categories`。
- 新增 frontmatter 字段后，如果页面要使用它，更新 `build/content.ts` 和 `docs/lib/posts.md`。
- 新增正文指令后，同步更新 `src/lib/markdown/notices.ts`、`docs/lib/markdown.md` 和本文档。
- 修改图片目录或 URL 规则时，同时检查 `package.json` 的 `sync-articles`、`scripts/md_pic_remap.py` 和本文档。

## 验证方式

- 构建前后检查 articles 状态一致，产物中的图片引用指向 `/images/...`。
- 运行 `npm run build`，确认文章列表、分类页和详情页均可生成。
