# 0510

我们来开发一个portals组件。这个组件的核心目的是提供快速到若干个可配置的网站的入口。

这个组件在components中实现。

这个组件在横屏和竖屏下的行为不同。且/home会将其安放在不同的位置。

配置：
位于site.config.ts:portals，形如：
```ts
portals:{
    ui:{ // 定义整个组件的行为
        desktop:{
            aspectratio: 0.5,         // width/height
            background: "/images/..." // 图片如果满足aspectratio要求，进行居中裁剪。也可以选择颜色，例如#ffffff
            background_opacity: 0.8   // 可选，默认1
        },
        mobile:{
            aspectratio: 3,
            background: "/images/..."
        }
    },
    layout:{// 定义如何划分区域，允许划分出长方形
        desktop:{
            row: 2
            col: 2
        },
        mobile:{
            row: 3
            col: 1
        }
    },
    links:{ //定义links和logo
        git: {
            link: git.anpoliros.com,
            logo: "/images/..."
        },
        vsss:{
            ...
        },
        status:{
            ...
        }
    }
    allignment:{ // 指定哪个位置对应哪个链接，如果坐标错误，则留空
        desktop:{
            (1, 2): git,
            (2, 1): vsss,
            (2, 2): status,
        },
        mobile:{
            (1, 1): git,
            (1, 2): vsss,
            (1, 3): status,
        }
    },
    button:{// 设置单个按钮的行为。按钮在layout划分的方格中。
        touchsize: 0.8 // 指可触发点击事件的范围。touchregion一定是正方形，若方格是长方形，则取较短边计算边长
        logosize: 0.8 // 这里的0.8*touchregion，logo将居中
    }
}
```

示例html
```html
<div classname=portals>
    <div classname=portals-bg image或color>
```


明确一下我说的横屏竖屏就是viewport的比例，是想用响应式的。关于span应该是文件里具体实现考虑的事，配置里不管。其他的建议有道理。现在结合我们的讨论做一版提示词，要求：

1. 有且仅有以下section：需求，配置model，预计html，文件组织和集成。

2. 技术细节可以穿插其中，重点的选型例如grid需要说，但是不用过于细节，关键在于让coder完成需求。

---


实现一个 `Portals` 组件，用于提供若干个可配置网站的快速入口。组件位于/components/portals/。


该组件是一个：

* 数据驱动
* 响应式
* 可配置
* Grid-based

的 portal launcher panel。

组件需要支持：

* 不同 viewport ratio 下（宽屏/窄屏）的不同布局
* 固定整体 aspect ratio
* 自定义背景
* 可配置 portal 入口
* Grid 布局定位
* logo 居中
* 独立点击热区（touch region）

组件将在 `/home` 页面被放置到不同区域，因此组件本身必须：

* 宽高自适应父容器
* 不依赖固定页面结构
* 不假设 viewport 尺寸
* 不直接控制外部 margin/padding

布局核心使用 CSS Grid，不使用 flex 做整体布局。

整体组件建议结构：

* 外层负责：

  * aspect ratio
  * background
  * clipping
* 中层负责：

  * grid rows/cols
  * item placement
* item 负责：

  * touch region
  * logo 居中
  * hover/click

背景图片需要：

* cover
* centered
* overflow hidden
* 自动裁剪

如果 background 为颜色值，则直接作为背景色。

组件默认应为 Server Component。

portal item 可以按需要拆分为 Client Component。

建议使用：

* `next/image`
* CSS Grid
* Tailwind utility classes
* inline style 处理动态 grid 与 aspect-ratio

---

# 配置 model

配置位于：

```ts
site.config.ts
```

结构：

```ts
portals: {
  ui: {
    desktop: {
      aspectRatio: "1 / 2",

      background: {
        type: "image",
        value: "/images/portal-bg-desktop.webp",
        opacity: 0.8
      }
    },

    mobile: {
      aspectRatio: "3 / 1",

      background: {
        type: "image",
        value: "/images/portal-bg-mobile.webp"
      }
    }
  },

  grid: {
    desktop: {
      rows: 2,
      cols: 2
    },

    mobile: {
      rows: 3,
      cols: 1
    }
  },

  portals: {
    git: {
      href: "https://git.anpoliros.com",
      logo: "/images/git.svg",
      label: "Git"
    },

    vsss: {
      href: "https://example.com",
      logo: "/images/vsss.svg",
      label: "VSSS"
    },

    status: {
      href: "https://status.example.com",
      logo: "/images/status.svg",
      label: "Status"
    }
  },

  placements: {
    desktop: [
      {
        portal: "git",
        row: 1,
        col: 2
      },

      {
        portal: "vsss",
        row: 2,
        col: 1
      },

      {
        portal: "status",
        row: 2,
        col: 2
      }
    ],

    mobile: [
      {
        portal: "git",
        row: 1,
        col: 1
      },

      {
        portal: "vsss",
        row: 2,
        col: 1
      },

      {
        portal: "status",
        row: 3,
        col: 1
      }
    ]
  },

  item: {
    touchScale: 0.8,
    logoScale: 0.8
  }
}
```

说明：

* `desktop/mobile` 是响应式 variant
* `placements` 为 portal 与 grid 的映射关系
* 若 placement 超出 grid 范围，则忽略
* grid cell 允许为空
* `touchScale`

  * 表示点击区域相对 cell 的缩放比例
  * touch region 始终为正方形
  * 若 cell 为长方形，则按较短边计算
* `logoScale`

  * 相对于 touch region 缩放
  * logo 必须水平垂直居中

---

# 预计 html

预计结构：

```html
<section class="portal-panel">

  <div class="portal-background"></div>

  <div class="portal-grid">

    <a class="portal-item">

      <div class="portal-touch-region">

        <img class="portal-logo" />

      </div>

    </a>

  </div>

</section>
```

实现要求：

* 最外层：

  * relative
  * overflow-hidden
  * aspect-ratio
* background：

  * absolute inset-0
  * cover
  * centered
* grid：

  * CSS Grid
  * 动态 rows/cols
* item：

  * 使用 absolute/flex/grid 均可
  * 必须实现 logo 居中
  * 必须实现独立 touch region
* 所有 portal item：

  * 必须可点击
  * 必须支持 hover
  * 必须支持 keyboard focus
  * 必须具有可访问性 label

grid 位置建议使用：

```ts
gridRowStart
gridColumnStart
```

动态生成。

---

# 文件组织和集成

建议结构：

```txt
/components/portals/
    Portals.tsx
    PortalGrid.tsx
    PortalItem.tsx
    portal.types.ts
    portal.utils.ts
```

职责：

* `Portals.tsx`

  * 主入口
  * 响应式 variant 选择
  * background
  * aspect ratio

* `PortalGrid.tsx`

  * grid rows/cols
  * placement 渲染

* `PortalItem.tsx`

  * 单个 portal
  * logo
  * touch region
  * hover/click

* `portal.types.ts`

  * 所有 TS 类型定义

* `portal.utils.ts`

  * placement 校验
  * responsive config 获取
  * grid helper

集成方式：

```tsx
<Portals config={siteConfig.portals} />
```

组件不直接依赖 `/home`。

由 `/home` 控制：

* 放置位置
* 外部宽高
* surrounding layout

组件内部只负责：

* portal 渲染
* responsive variant
* grid layout
* interaction behavior。

---

宽屏状态下，位于尚未开发过的右侧区域的顶部。此时组件与hero对齐。
窄屏状态下，位于hero下pinned上，全宽

---

# Portals 组件实现方案

## Context

为 `/home` 提供一个数据驱动、响应式、Grid-based 的 portal launcher。需要支持宽屏（右侧栏顶部，与 Hero 对齐）与窄屏（Hero 与 Pinned 之间，全宽）两套布局；支持图片或纯色背景、可配置 portal 入口、独立点击热区与居中 logo。

项目约定：Server Components 默认；不使用 useMediaQuery；响应式靠 Tailwind `md:` 断点。Tailwind v4（`@import "tailwindcss"`）。Logo 用原生 `<img>`（SVG），背景图用 `next/Image`。组件不污染 globals.css。调用方显式传 `variant`，渲染单个 variant；外部用 `hidden md:block` / `block md:hidden` 切换。

## 文件清单

新建：
- [components/portals/portal.types.ts](components/portals/portal.types.ts) — 全部类型
- [components/portals/portal.utils.ts](components/portals/portal.utils.ts) — 解析 / 校验 / 触控尺寸 helper
- [components/portals/PortalItem.tsx](components/portals/PortalItem.tsx) — 单个 anchor + touch region + logo
- [components/portals/PortalGrid.tsx](components/portals/PortalGrid.tsx) — 内层 grid，渲染 placement
- [components/portals/Portals.tsx](components/portals/Portals.tsx) — 主入口，aspect-ratio 外壳 + 背景层

修改：
- [site.config.ts](site.config.ts) — 追加 `portals` 配置块，使用 `satisfies PortalsConfig` 静态校验
- [app/layout.tsx](app/layout.tsx) — 70/30 grid 移出 layout
- [app/page.tsx](app/page.tsx)、[app/about/page.tsx](app/about/page.tsx)、[app/tags/page.tsx](app/tags/page.tsx)、[app/[category]/page.tsx](app/[category]/page.tsx) 等所有现有页面 — 改用 `<PageShell>` 包裹

新建（layout）：
- [components/layout/PageShell.tsx](components/layout/PageShell.tsx) — 70/30 grid + 右栏 aside 容器，接受 `right` prop

## 关键实现要点

### 类型定义（portal.types.ts）

```ts
export type PortalVariant = "desktop" | "mobile";

export type BackgroundConfig =
  | { type: "image"; value: string; opacity?: number }
  | { type: "color"; value: string; opacity?: number };

export interface PortalDef { href: string; logo: string; label: string; }
export interface Placement { portal: string; row: number; col: number; }
export interface VariantUI { aspectRatio: string; background: BackgroundConfig; }
export interface VariantGrid { rows: number; cols: number; }

export interface PortalsConfig {
  ui: Record<PortalVariant, VariantUI>;
  grid: Record<PortalVariant, VariantGrid>;
  portals: Record<string, PortalDef>;
  placements: Record<PortalVariant, Placement[]>;
  item: { touchScale: number; logoScale: number };
}
```

### 工具函数（portal.utils.ts）

- `parseAspectRatio("1 / 2")` → 数值（width/height）
- `computeCellAspect(panelAspect, rows, cols)` = `panelAspect * rows / cols`
- `touchWidthCss(scale, cellAspect)` 用 **闭式 `min()`** 同时覆盖竖/横 cell（cellAspect=1 时连续，无分支）：
  ```ts
  return `min(${scale*100}%, ${(scale/cellAspect)*100}%)`;
  ```
- `filterPlacements` 同时处理三类无效项：越界、未知 portal key、重复 cell（首个胜出）
- `isExternalHref(h)` = `/^https?:\/\//i.test(h)`

### PortalItem

- `<a>` 设 `gridRowStart` / `gridColumnStart` 内联
- 外链（`isExternalHref`）才设 `target="_blank" rel="noopener noreferrer"`
- 必有 `aria-label={portal.label}`
- focus-ring 用 `focus-visible:` 而非 `focus:`，避免破坏键盘可达性：
  ```tsx
  className="... focus-visible:outline-none rounded-sm group"
  // touch region:
  className="... transition-opacity group-hover:opacity-80
             group-focus-visible:ring-2 group-focus-visible:ring-blue-500"
  style={{ width: touchWidth, aspectRatio: 1 }}
  ```
- Logo `<img>`：`width / height = ${logoScale*100}%`、`objectFit: contain`、`loading="lazy"`、`alt=""`（描述已在 anchor 的 aria-label）
- 全部 Server Component，无 `"use client"`

### PortalGrid

```tsx
<div
  className="relative grid h-full w-full"
  style={{
    gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
    gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
  }}
>
  {valid.map(p => <PortalItem ... cellAspect={cellAspect} />)}
</div>
```

### Portals（外壳）

```tsx
<section className={`relative overflow-hidden ${className}`}
         style={{ aspectRatio: ui.aspectRatio }}>
  <div className="absolute inset-0" style={{ opacity: bg.opacity ?? 1 }}>
    {bg.type === "image"
      ? <Image src={bg.value} alt="" fill
               sizes="(max-width: 768px) 100vw, 30vw"
               className="object-cover" />
      : <div className="w-full h-full" style={{ backgroundColor: bg.value }} />}
  </div>
  <div className="relative h-full w-full">
    <PortalGrid config={config} variant={variant} />
  </div>
</section>
```

opacity 落在背景包装层，不波及 grid / item。`sizes` 防止 Next 默认按 100vw 下载过大资源。

### 调用约定

```tsx
<Portals config={siteConfig.portals} variant="desktop" className="hidden md:block" />
<Portals config={siteConfig.portals} variant="mobile"  className="block md:hidden mb-12" />
```

## 集成（PageShell — 共享 server component）

> **为什么不直接在 layout 里注入？** Next.js App Router 的 layout 只能拿到 `children` 和动态段的 `params`，没法接收 page 自定义 prop。要让 layout 自己根据当前路由决定右栏内容，只剩 parallel routes（命名 slot + 多个 default.tsx）或 client-side `createPortal`。两者都过重。**正确做法是把 grid 搬出 layout**——layout 退化为薄壳，每个 page 自己用共享的 `<PageShell>` 决定右栏内容。

### 新建 [components/layout/PageShell.tsx](components/layout/PageShell.tsx)（Server Component）

```tsx
import { siteConfig } from "@/site.config";

export default function PageShell({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="md:grid gap-8 h-full w-full"
      style={{ gridTemplateColumns: siteConfig.layout.gridTemplateColumns }}
    >
      <section className="w-full flex-grow">{children}</section>
      <aside className="hidden md:block border-l border-gray-100 dark:border-gray-800 pl-8 h-full min-h-[500px]">
        {right}
      </aside>
    </div>
  );
}
```

`right` 可选，未传则右栏渲染空占位（与现状一致）。每个 page 自由决定是否填充。

### 修改 [app/layout.tsx](app/layout.tsx)

移除内层 `<div className="md:grid">…<aside/>` 包裹——layout 不再持有 grid：
```tsx
<main className={`${siteConfig.layout.mainContainer} flex-1 flex justify-start`}>
  {children}
</main>
```

### 修改 [app/page.tsx](app/page.tsx)

```tsx
import PageShell from "@/components/layout/PageShell";
import Portals from "@/components/portals/Portals";

return (
  <PageShell
    right={<Portals config={siteConfig.portals} variant="desktop" />}
  >
    <Hero />
    <Portals config={siteConfig.portals} variant="mobile"
             className="block md:hidden mb-12" />
    {/* pinned + timeline + pagination 原样 */}
  </PageShell>
);
```

### 修改其他现有页面

把每个 page 的根级 JSX 用 `<PageShell>` 包起来；不传 `right` 即保留现状的空右栏占位：
- [app/about/page.tsx](app/about/page.tsx)
- [app/tags/page.tsx](app/tags/page.tsx)
- [app/[category]/page.tsx](app/[category]/page.tsx) 与子路由
- 其他通过 `app/` 注册的 page 一并处理

后续任何页面想填充右栏，直接传 `right={...}`，无需改动 layout 或 PageShell。

## site.config.ts 配置块

在 `siteConfig` 顶部加 `import type { PortalsConfig } from "@/components/portals/portal.types";`，并在 `siteConfig` 结尾追加：

```ts
portals: {
  ui: {
    desktop: {
      aspectRatio: "1 / 2",
      background: { type: "image", value: "/images/portal-bg-desktop.webp", opacity: 0.8 },
    },
    mobile: {
      aspectRatio: "3 / 1",
      background: { type: "image", value: "/images/portal-bg-mobile.webp" },
    },
  },
  grid: {
    desktop: { rows: 2, cols: 2 },
    mobile:  { rows: 3, cols: 1 },
  },
  portals: {
    git:    { href: "https://git.anpoliros.com",    logo: "/images/git.svg",    label: "Git" },
    vsss:   { href: "https://example.com",          logo: "/images/vsss.svg",   label: "VSSS" },
    status: { href: "https://status.example.com",   logo: "/images/status.svg", label: "Status" },
  },
  placements: {
    desktop: [
      { portal: "git",    row: 1, col: 2 },
      { portal: "vsss",   row: 2, col: 1 },
      { portal: "status", row: 2, col: 2 },
    ],
    mobile: [
      { portal: "git",    row: 1, col: 1 },
      { portal: "vsss",   row: 2, col: 1 },
      { portal: "status", row: 3, col: 1 },
    ],
  },
  item: { touchScale: 0.8, logoScale: 0.8 },
} satisfies PortalsConfig,
```

## 资源准备

需要存在的资源（任一缺失则将该项 `background.type` 暂改为 `"color"`、value 改为 hex 即可正常布局测试）：
- `/public/images/portal-bg-desktop.webp`
- `/public/images/portal-bg-mobile.webp`
- `/public/images/git.svg`
- `/public/images/vsss.svg`
- `/public/images/status.svg`

## 验证

1. `npm run dev`，访问 `/`：
   - 宽屏（≥768px）：右侧栏顶部见 1:2 竖版 portal 面板，与 Hero 顶部对齐；3 个 portal 居于 (1,2) (2,1) (2,2) 三格，正方形热区，logo 居中。
   - 窄屏（<768px）：Hero 下方、Pinned 上方见 3:1 横版面板，1 列 3 行；右侧栏不渲染。
2. 鼠标 hover：touch region 透明度降至 0.8。Tab 键切到 portal：蓝色 focus ring 可见；鼠标点击：无 ring（focus-visible 行为）。
3. 点击 portal：外链新标签打开，正确 `rel`。读屏器朗读 `aria-label`。
4. 故意把 placement 改成 `row: 99`：该项被忽略不报错；改成不存在的 portal key：同样忽略；两条 placement 指向同一格：第一条胜出。
5. 把背景换成 `{ type: "color", value: "#1f2937", opacity: 0.5 }`：背景变半透明深灰，logo / 前景仍 100% 不透明。
6. `npm run build` 通过、TS 严格通过、`satisfies PortalsConfig` 触发任何形状错误。
7. 访问 `/walking`、`/about`、`/tags`、`/[category]/[slug]` 等：右侧仍渲染空 aside 占位（border-l + 500px min-h），与现状一致——通过 PageShell 默认 `right={undefined}` 实现。
