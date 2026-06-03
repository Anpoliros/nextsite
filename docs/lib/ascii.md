# ASCII

`lib/ascii/` 提供图片和灰度矩阵到字符画的实验能力，当前主要用于终端预览原型。

## 模块视角

该模块负责把已经采样好的亮度数据映射为字符画，并提供基于 `sharp` 的图片文件输入适配。后续可以扩展为站内图片占位、构建期产物生成和首页程序化 ASCII 场景复用。

## 实现视角

| File | Responsibility |
| --- | --- |
| `lib/ascii/core.ts` | 亮度矩阵到字符画的纯函数、行数推导、反色、对比度曲线、自动亮度拉伸、gamma 和抖动 |
| `lib/ascii/image.ts` | 使用 `sharp` 读取图片、缩放为目标字符尺寸、转换为灰度矩阵 |
| `lib/ascii/types.ts` | 公共类型 |
| `config/ascii.ts` | 默认列数、最大行数、字符集和终端预览参数 |
| `scripts/ascii-preview.mjs` | 终端预览入口 |

## 修改指南

- 调整默认视觉效果时，优先改 `config/ascii.ts`。字符集按由浅到深排列，`visible` 适合观察边界。
- 修改灰度到字符的映射算法时，优先改 `lib/ascii/core.ts`。
- 增加新的输入格式或构建期产物时，优先改 `lib/ascii/image.ts` 和对应脚本。
- 站内组件使用该能力前，应先定义产物格式，避免客户端重复下载原图后再转换。

## 验证方式

```sh
npm run ascii:preview -- public/bg-alice.jpeg
npm run ascii:preview -- public/file.svg --columns 72
npm run ascii:preview -- --charsets
npm run lint
```

## 相关文档

- `docs/config/overview.md`
- `docs/workflows/scripts.md`
