# ASCII

`lib/ascii/` 提供图片和灰度矩阵到字符画的实验能力，当前主要用于终端预览原型。

## 模块视角

该模块负责把已经采样好的亮度数据映射为字符画，并提供基于 `sharp` 的图片文件输入适配。后续可以扩展为站内图片占位、构建期产物生成和首页程序化 ASCII 场景复用。

## 实现视角

| File | Responsibility |
| --- | --- |
| `lib/ascii/core.ts` | 亮度矩阵到字符画的纯函数、行数推导、反色、对比度曲线、自动亮度拉伸、alpha 空白、背景空白、gamma 和抖动 |
| `lib/ascii/image.ts` | 使用 `sharp` 读取 JPG、JPEG、PNG、WebP、SVG，缩放为目标字符尺寸，保留 RGBA 并生成亮度矩阵 |
| `lib/ascii/types.ts` | 公共类型 |
| `lib/ascii/configs/type.ts` | 配置数据模型，区分完整配置和 profile 输入 |
| `lib/ascii/configs/default.ts` | 默认配置，未指定 `--config` 时使用 |
| `lib/ascii/configs/example.ts` | 带完整中文说明的配置示例 |
| `lib/ascii/configs/shell.ts` | 终端预览常用 profile，可通过 `--config shell` 加载 |
| `scripts/ascii-preview.mjs` | 终端预览入口 |

## 修改指南

- 调整默认视觉效果时，优先改 `lib/ascii/configs/default.ts`。字符集按由浅到深排列，`visible` 适合观察边界。
- 增加常用调参组合时，在 `lib/ascii/configs/` 增加命名 profile，并通过 `--config $name` 使用。
- `scripts/ascii-preview.mjs` 的配置优先级是 `default.ts < --config profile < CLI flags`。
- 修改灰度到字符的映射算法时，优先改 `lib/ascii/core.ts`。
- 修改输入格式、alpha 处理或背景抠图时，优先改 `lib/ascii/image.ts`、`lib/ascii/types.ts` 和对应脚本。
- alpha 和背景抠图是独立规则，分别有自己的 `emptyChar`。同一位置同时命中时，alpha 优先。
- 白底 JPG/PNG 建议用 `--background "#fff"` 和 `--background-variance` 调整抠图范围。
- 站内组件需要保持矩形字符网格时，关闭 `trimTrailingWhitespace`。
- 站内组件使用该能力前，应先定义产物格式，避免客户端重复下载原图后再转换。

## 验证方式

```sh
npm run ascii:preview -- public/bg-alice.jpeg
npm run ascii:preview -- public/temp/IMG_7324.jpeg --config shell
npm run ascii:preview -- public/temp/IMG_7324.jpeg --config shell --contrast 5
npm run ascii:preview -- public/temp/IMG_7324.jpeg --config shell --print-config
npm run ascii:preview -- public/file.svg --columns 72
npm run ascii:preview -- public/images/cloud.jpg --background "#fff" --background-variance 160
npm run ascii:preview -- public/logo.png --alpha-mode density --alpha-threshold 16 --no-trim
npm run ascii:preview -- --charsets
npm run ascii:preview -- --configs
npm run lint
```

## 相关文档

- `docs/workflows/scripts.md`
