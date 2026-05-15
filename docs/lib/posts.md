# Posts

`lib/posts/` 负责从 Markdown 内容目录构建文章索引，并按分类和 slug 读取单篇文章。

## 模块视角

文章系统的输入是 `articles/content/` 下的 Markdown/MDX 文件，输出是页面层可使用的 `PostIndex` 和单篇文章 HTML。

它不负责页面展示、不负责内容同步，也不负责 Markdown AST 细节。展示由 `app/` 和 `components/` 完成，Markdown 渲染由 `lib/markdown/` 完成，图片路径同步由 `scripts/md_pic_remap.py` 完成。

## 实现视角

关键文件：

- `lib/posts/getposts.ts`：扫描内容目录、读取 frontmatter、生成文章索引。
- `lib/posts/getpost.ts`：通过 `category` 和 `slug` 找到文章文件并渲染正文。
- `md.config.ts`：定义 `contentDir` 和 Markdown 功能开关。

`getAllPosts()` 使用 React `cache()` 和模块级 `globalCache` 缓存结果。首次生成索引时会把 JSON 快照写入 `.logs/postindex_<timestamp>.json`，用于排查内容索引问题。

## 数据模型

核心类型是 `PostMeta`：

| Field | Meaning |
| --- | --- |
| `post_id` | 按扫描排序生成的稳定数字 ID |
| `post_title` | frontmatter 的 `title` |
| `post_path` | 站点访问路径，格式为 `/<category>/<slug>` |
| `post_filepath` | Markdown 文件绝对路径 |
| `post_category` | 内容目录第一层目录名 |
| `post_tag` | frontmatter 的 `tags` 数组 |
| `post_datetime` | frontmatter 的 `date` 字符串 |
| `post_timestamp` | date 转换后的毫秒时间戳，无法解析时为 `0` |

内容目录规则：

```txt
articles/content/<category>/<slug>.md
```

直接放在 `articles/content/` 根目录下的文件会被排除在文章索引外。

## 修改指南

- 修改 frontmatter 字段时，同步更新 `PostMeta`、列表页映射逻辑和本文档。
- 修改排序规则时，检查首页、分类页、标签页和文章详情页的上一篇/下一篇逻辑。
- 修改内容目录位置时，先改 `md.config.ts`，再检查同步脚本和部署命令。
- 修改 `post_path` 规则时，必须同步检查路由、`ArticleList` 链接和 `generateStaticParams()`。

## 验证方式

- 运行 `npm run build`，确认所有文章路由可以生成。
- 检查 `.logs/postindex_*.json` 中分类、标签和路径是否符合预期。
- 随机打开一篇文章详情页，检查标题、日期、标签和上下篇导航。

## 相关文档

- `docs/app/routing.md`
- `docs/lib/markdown.md`
- `docs/content/articles.md`
- `docs/workflows/content-sync.md`

