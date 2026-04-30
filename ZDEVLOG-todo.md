# TODO


# !important

[x] 文章页面的tag应该可点击
[x] category和tag放到一处，而且顶部和底部都有

[] 随机一篇的逻辑有问题，而且应该同时放在头部。可以随机到锚点
[] 锚点

[] email protect
[] 图标会随cmd+而变粗


我们来深入开发一下“随机一篇”的功能，现在它作为[category]/[slug]/page.tsx的一部分实现。

1. 我希望将随机功能作为单独组件RandomPage.tsx，[c]/[slug]中保留上一篇下一篇的实现，引用RandomPage。

2. 现在的随机方法似乎是构造一个随机序列，这就导致特定的文章的随机目标是固定的。我希望随机能够真随机，即每次都到一个随机的页面。
    
    1. 如果要真随机，那大概需要在客户端用js实现，看起来和现有的ssg工作流不太兼容

    2. 如果要真随机，需要有一个目标文章池，

1. RandomPage组件读取getAllPosts的缓存，构建路径池
postPaths: string[]

2. 客户端js这么写
const random = postPaths[Math.floor(Math.random() * postPaths.length)]

必须在 client component + useEffect 或 render 时选




# 架构

[] about和[slug]采用的仍然是两个函数getSinglePostContent、getPostBySlug，应该统一

## mdx支持
我们的渲染引擎现在支持mdx吗？我想让一个页面具有以下以下功能：

有一个能够折叠的选择列表，表项是shiki主题。选择其中的一个主题后，就将这个页面的codeblock的shiki主题修改过去。

为了支持这个页面，我们需要做哪些工作
---

那如果支持mdx了，mdx能轻松实现目标需求吗？引入mdx需要如何重构，能在现有的lib/markdown中扩展以实现吗
---







# 长期

[] 目录

[] 错误页面

[] status页面


# footer

上次构建时间 服务请求次数



# 兼容性问题

我们来研究一下兼容性相关的问题。

1. 按钮失效
在dev服务器和部分旧版本设备上，包括header和codeblock中的按钮会不生效

2. css失效
在微信webview和

postcss？



# Z-index

也许可以通过zindex来实现更有阻尼感的滑动，https://ashorthike.com










# Role: 高级前端架构师 & DESIGN.md 维护者

## Objective
你需要作为一个 Orchestrator，调度多个并发 Sub-agent 和并发 Function (Tools) calls，全面以 READ ONLY 模式区审查当前 codebase 中的前端代码库的结构与样式配置，理解并提炼出全局设计哲学，并输出 DESIGN_SPEC 规范文档。

## Execution Strategy (并发与检索)

1. **并发读取**: 使用并发的函数调用（Concurrent Function Calls）或生成多个 Sub-agent，并行读取和分析代码库。
2. **目标范围**:
   - INCLUDE: 根目录下 *.md 文件, 特别是 AGENTS.md / CLAUDE.md / GEMINI.md / DESIGN.md
   - INCLUDE: `src` 目录下的所有业务线 `tsx/ts` 组件、Layout 布局文件。
   - INCLUDE: 全局样式配置（如 `tailwind.config.*`、`index.css` 或相关的 Tailwind CSS/CSS Module 配置文件）。
   - MUST BE: 排除：第三方基础 UI 库的源码（如 `shadcn/ui` ui 组件库）、`node_modules`、任何构建产物。任务执行期间只允许查询和搜索，严禁增加、修改、删除当前的代码库。

## Task 1: 提炼全局设计哲学并生成 `DESIGN.md`

在完成并发分析后，归纳前端 App 的视觉与架构共性，在根目录创建或更新 `DESIGN.md`。该文档必须包含以下维度：

- **视觉层 (Visual Identity)**: 核心色彩系统、排版规范、间距与阴影的工程化实现方式。
- **布局层 (Layout Strategy)**: 全局容器、响应式断点策略、以及复杂交互/高密度数据 UI 的常见排布范式。
- **组件范式 (Component Paradigm)**: 业务组件的拆分逻辑、状态下发模式、以及复用标准。
- **样式实践 (Styling Rules)**: Tailwind CSS 的组合习惯，如何处理动态类名，以及覆盖默认样式的最佳实践。

## Task 2: 更新 `README AGENTS.md` (或类似 Agent 引导文档)

在 `AGENTS.md` (抑或是 CLAUDE.md) 中增加或更新相应的引导章节，使用其文件中的语言，向未来的 AI 编码助手说明：
- "在执行「前端开发任务 (开发新组件或页面...)」前，MUST 先阅读 `DESIGN.md` 以对齐全局设计哲学与 Tailwind 规范，确保生成的 UI 代码在视觉与交互上与现有工程保持高度一致。"

## Constraints
- 执行过程中，请保持思考的透明度，报告并发任务的分配与完成情况。
- 提炼的内容必须基于代码库中 **实际存在** 的代码规律，严禁凭空捏造设计规范。
- 任务执行时保持 [READ_ONLY_MODE] [EXPLORE_MODE], 只有当用户确认写入 DESIGN.md 后才能写入/覆盖 DESIGN.md。