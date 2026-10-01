# Posts

`build/content.ts` 读取文章并解析 frontmatter，`build/routes.ts` 准备当前页面的展示数据。

## 模块视角

每轮读取创建新索引；内容根目录的 about.md 用于单页，其余 Markdown 按第一层目录归入分类。原有标题、日期、tags、showToc/ShowToc 和 `<!--more-->` 摘要规则保留。

## 实现视角

`scripts/prepare_content.py` 复用图片匹配器，返回在内存中处理过的文章 JSON。TypeScript 解析 frontmatter，聚合分类和标签，按时间排序、分页并调用 Markdown 渲染。正文与本地文件路径不会进入全站浏览器索引，页面只嵌入自身的数据。

## 修改指南

`PostMeta` 属于构建端；浏览器数据类型位于 `src/site/types.ts`。列表日期统一按 Asia/Shanghai 展示，避免构建机器与读者时区不同引起接管差异。post_id 仍为构建内序号，未来评论需另设持久 ID。

## 验证方式

`npm run build`、`npm test`，并确认文章仓库状态没有被构建改变。
