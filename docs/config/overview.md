# Config

当前手账页面使用 `config/journal.ts` 的分类/特殊 tag 规则、`config/site.ts` 的站点信息和 `config/markdown.ts` 的渲染配置。颜色 token 在 `styles/journal/base.css`。其余展示配置服务于保留的旧组件，当前不挂载。

`src/config/` 负责维护站点自定义配置。配置按功能域拆分，业务代码应直接导入对应文件，避免通过混合 barrel 间接把服务端配置带入客户端组件。

## 模块视角

配置目录只保存项目自定义配置，不承载组件逻辑、数据扫描逻辑或 Markdown AST 处理逻辑。

当前边界：

| File | Responsibility |
| --- | --- |
| `src/config/site.ts` | 站点标题、描述、Logo、导航和页脚文案 |
| `src/config/layout.ts` | 全局布局尺寸、主题基础色、布局字号和展示型组件 UI 参数 |
| `src/config/content.ts` | 内容根目录、分类展示、置顶文章和分页设置 |
| `src/config/markdown.ts` | Markdown 渲染功能开关和代码高亮主题 |
| `src/config/home.ts` | 首页 Hero、字符背景、文案、对齐、颜色和字号 |
| `src/config/portals.ts` | Portals 面板数据、网格、入口和摆放位置 |

## 实现视角

页面、组件和库模块按需导入单个配置文件：

```ts
import { uiConfig } from "@/config/layout";
import { contentConfig } from "@/config/content";
```

配置直接按模块导入。`contentConfig` 只包含展示数据，内容目录定位在 `build/content.ts` 中；浏览器配置不使用 Node.js API。

## 修改指南

- 修改站点品牌、导航或页脚时，优先看 `src/config/site.ts`。
- 修改容器宽度、左右栏比例、主题基础色、全局字号或列表展示参数时，优先看 `src/config/layout.ts`。
- 修改内容目录、分类页展示、置顶文章或分页规则时，优先看 `src/config/content.ts`。
- 修改 Markdown pipeline 开关、代码高亮主题或代码块配置时，优先看 `src/config/markdown.ts`。
- 修改首页 Hero 或字符背景时，优先看 `src/config/home.ts`。
- 修改 Portals 入口时，优先看 `src/config/portals.ts`，并保留 `PortalsConfig` 的静态校验。

## 验证方式

- 运行 `npm run lint`。
- 运行 `npm run build`。
- 检查首页、分类页、标签页和文章详情页是否仍能读取对应配置。

## 相关文档

- `docs/app/overview.md`
- `docs/app/routing.md`
- `docs/components/home.md`
- `docs/components/layout.md`
- `docs/lib/markdown.md`
- `docs/lib/posts.md`
