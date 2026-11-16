# Layout Components

`components/journal/JournalShell.tsx` 提供共用纸张、页头、footer 和独立浮动入口。

## 实现视角

正文最大理想宽度 60rem；窄屏左右各留 20px。页头品牌与 About 使用原生链接。`ReaderMenu` 的圆点不参与容器布局：桌面停靠外侧轨道，850px 以下浮动到右下角，左右与底部初始留白均为 24px，可按住拖动。

`useFloatingControl` 使用 Pointer Events 捕获、按键状态与失焦清理区分点击/拖动。menu-tabs 总在圆点附近，面板向上或下延伸，只有面板内容滚动。Escape 或外部点击关闭菜单。

## 读者偏好

`theme-provider` 保留系统/浅色/深色与跨标签页同步。`Preferences` 持久化纸张底纹、动画开关、正文字号及行距。系统的减少动态效果拥有优先权。实验参数没有进入产品菜单。

样式分为 `styles/journal/base.css`、`menu.css`、`cards.css`、`photos.css`、`home.css`、`reading.css`；旧布局 Header/Footer/PageShell 已移除，ASCII 和 Portals 仍保留但不挂载。

## 修改指南与验证

共用布局修改需要检查主页、长文章、404、移动端和深浅主题。SSR 初始值保持确定；浏览器 API 只在 effect 或事件里使用。运行静态与浏览器测试，确认拖动释放后悬停不会继续移动、菜单不越界、偏好刷新和跨页后仍生效。

## 深色语义配色

分类和特殊 tag 共用 tone 名称，浅深主题分别定义 `--tone`（底片）、`--tone-tint`（色块）、`--tone-ink`（前景）。深色采用较深、饱和度较高的色块和较亮的前景，避免直接复用浅色粉彩。七组前景/色块的对比度，浅色最低 5.12:1，深色最低 7.70:1。

参考 [Material Color Utilities 的深浅色角色定义](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/scheme/scheme.ts)，其中深色 primaryContainer 与 onPrimaryContainer 分别使用 tone 30/90，浅色使用 90/10；本项目采用独立手工配色。
