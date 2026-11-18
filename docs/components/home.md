# Home Components

主页使用从 sketchbook 侧栏 Round 7 整理的手账设计，组件源码完全位于 weblog。

## 模块视角

Hero 独立于下方两栏；纸边默认收起，保留分类书签，展开后显示月历和真实文章摘要。桌面收展以右边缘为锚点，移动端改为日历/摘句并排、书签在下方。

## 实现视角

- `components/journal/PhotoStack.tsx`：最多三层照片，固定理想宽度 380px、窄屏缩小，断点为 725px。顶图侧抽结束立即解锁，下层 DOM 保持原位，补到底部的图片重新抽取姿态且不播放入场。
- `PhotoCaption.tsx`：独立来源标题链接和文章日期，标题省略，日期完整保留。
- `ArticleCard.tsx`：`article-icon`、`article-card`、`article-card-shadow` 三个兄弟元素，64px 图标；实色矩形底片，回落 640ms。
- `Sidebar.tsx`、`Calendar.tsx`：分类书签、按真实日期链接文章的月历、文章摘要摘句。
- `useResponsiveLayout.ts`：旧布局先退场，再切换断点并显示新布局，避免宽度与方向同时插值。

`HomePage` 筛选时记录 main-layout 相对视口的位置。若其顶部已离开视口上缘，筛选后滚动到 main-layout 顶部；否则保留当前位置。`overflow-anchor: none` 阻止浏览器自行另选锚点。

## 数据与颜色

相册由 `build/photos.ts` 生成，见 `docs/content/gallery.md`。分类与特殊 tag 映射在 `src/config/journal.ts`；深浅主题 token 在 `src/styles/journal/base.css`。`anime → cherry → dairy` 为固定覆盖优先级，普通 tag 不覆盖分类色。

frontmatter 的可选 `icon` 支持：compass、code、book、camera、keyboard、heart、flower、coffee、terminal、wrench。未知值回退到 tag/分类图标。

## 修改指南与验证

实验参数继续在 sketchbook 探索；产品仅暴露读者偏好。修改动效需要同时验证系统减少动态效果和用户关闭动画。检查书签筛选、收展右边缘、移动端两段式切换、照片连续切换及 caption 链接。

## 保留的旧组件

`components/home/Hero.tsx`、`AsciiSceneBackground.tsx` 与 `config/home.ts` 保留为旧实现参考，当前主页不导入。

## 与设计稿的布局对齐

卡片列表在可用主内容列居中：侧栏展开时列表上限 664px、卡片上限 600px；收起时分别为 704px、640px，保留随机缩进和 360ms 宽度过渡。深色卡片纸面独立使用 `--card-paper`，照片白边和 caption 始终白色。hashtag 浅色黑、深色白且加粗；标签使用独立 hashtag 列，标签在其右侧换行。

`src/lib/format-date.ts` 统一英文月份日期，卡片/照片使用短月份，阅读页使用完整月份；`datetime` 属性保留原始日期。格式化固定 UTC，避免服务端和客户端日期不一致。
