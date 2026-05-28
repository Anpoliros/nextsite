# Config

`config/` 负责维护站点自定义配置。配置按功能域拆分，业务代码应直接导入对应文件，避免通过混合 barrel 间接把服务端配置带入客户端组件。

## 模块视角

配置目录只保存项目自定义配置，不承载组件逻辑、数据扫描逻辑或 Markdown AST 处理逻辑。

当前边界：

| File | Responsibility |
| --- | --- |
| `config/site.ts` | 站点标题、描述、Logo、导航和页脚文案 |
| `config/layout.ts` | 全局布局尺寸、主题基础色和布局字号 |
| `config/content.ts` | 内容根目录、分类展示、置顶文章和分页设置 |
| `config/markdown.ts` | Markdown 渲染功能开关和代码高亮主题 |
| `config/hero.ts` | 首页 Hero 背景、文案、对齐、颜色和字号 |
| `config/portals.ts` | Portals 面板数据、网格、入口和摆放位置 |

## 实现视角

页面、组件和库模块按需导入单个配置文件：

```ts
import { uiConfig } from "@/config/layout";
import { contentConfig } from "@/config/content";
```

不要新增 `config/index.ts` 作为统一导出入口。`contentConfig` 使用 `path` 和 `process.cwd()` 计算内容目录，混合导出容易让 Client Component 间接依赖 Node.js API。

## 修改指南

- 修改站点品牌、导航或页脚时，优先看 `config/site.ts`。
- 修改容器宽度、左右栏比例、主题基础色或全局字号时，优先看 `config/layout.ts`。
- 修改内容目录、分类页展示、置顶文章或分页规则时，优先看 `config/content.ts`。
- 修改 Markdown pipeline 开关、代码高亮主题或代码块配置时，优先看 `config/markdown.ts`。
- 修改首页 Hero 时，优先看 `config/hero.ts`。
- 修改 Portals 入口时，优先看 `config/portals.ts`，并保留 `PortalsConfig` 的静态校验。

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
