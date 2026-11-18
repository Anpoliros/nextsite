# Homepage Gallery

构建端从 walking 分类文章自动整理首页照片，浏览器只消费展示数据。

## 数据流

`prepare_content.py` 在内存中统一正文图片路径 → `readPostIndex` 获取文章元信息 → `buildPhotoGallery` 解析 Markdown AST → `PageData.photos` → `PhotoStack`。

## 选择规则

- 接受 walking 正文的本地 JPEG/PNG/WebP/AVIF 图片及引用式图片；忽略代码块、外链、HTML img 和 SVG。
- 拒绝越界路径、缺图和小于 400×250 的图片，全局去重。
- 按文章新到旧，最多考虑 12 篇，每篇最多两张，按文章轮流取图，最终候选池最多 12 张。
- 正式构建生成最长宽度 1000px 的 WebP（质量 82），存入 `dist/photos/<内容hash>.webp`。原图和 Markdown 保持不变。
- 浏览器每次访问随机排列候选池，同时只显示最多三张，预取下一张。切换补图独立重抽角度与位移。

## 修改指南

`build/photos.ts` 负责资格过滤、抽样和缩略图生成；组件不扫描正文，不调用内容后端。手动推荐/排除目前没有 frontmatter 约定，后续可在此层增加。原始图片仍复制到 dist/images 供文章使用。

## 验证方式

`tests/gallery.test.mjs` 检查 AST 提取、代码块排除、引用式图片、小图/缺图/越界/重复过滤、跨文章抽样和 WebP 产物。浏览器确认图片 caption 对应文章标题、日期和站内链接。
