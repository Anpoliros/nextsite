我感觉现在每个组件都要重复获取全部文章，梳理一下工作流，看看都有谁进行了扫描所有文章的行为。

能不能设计一个组件获取所有文章元数据，然后把这些元数据打包成公用的数据结构比如json，不管要category还是tags，甚至是文章时序，都直接请求这个公用数据结构。这样就不用重复扫描了。还可以把这个数据结构打印出来方便debug。

我们先讨论下可行性和重构后的可能收益
---

我们采用这样的方案：
1. 把lib/markdown/index.ts中的getAllPosts解耦到新文件getposts.ts
2. 让getAllPosts进行一些计算，返回更加丰富的内容，并且把它的返回内容dump出来
3. 给getAllPost加react.cache，结合module cache，实现了其他组件反复调用它但并不会重复计算

设想的getAllPosts返回的中间数据结构
```json
{
    "categories":["c1", "c2"],
    "tags": ["t1", "t2", "t3"],
    "category-tags": {
        "c1": ["t1", "t2"],
        "c2": ["t1", "t3"]
    },
    "posts": [
        {
            "post_id": 1,
            "post_title": "codeblock",
            "post_path": "/developer/codeblock",
            "post_category": "developer",
            "post_tag": ["dev", "typescript"],
            "post_datetime": "2025-05-11 16:38",
            "post_timestamp": "17469...."
        },
        {
            "post_id": 2,
            "post_title": "table",
            "post_path": "/developer/table",
            ...
        }
    ],
    "post_map": {
        "1": "/developer/codeblock",
        "2": "/developer/table"
    }
}
```
其中：
- category-tags是给/tags页面用的
- post_map是给随机一页功能用的
- datetime只需要忠实反应原貌。如果只写了date，time就不补齐了，边界条件交给使用者自己处理


- getAllPosts要模块化设计，例如scanPosts，normalize，buildIndex等私有函数
- cache需要是进程级缓存，实现扫描一次全局复用


---

下面是一份可以直接交给 code agent 的提示词，目标是让它在 Next.js（App Router）项目中实现一个单次扫描 + 可复用索引 + 可选 dump 的内容索引层，严格使用 TypeScript，不引入额外语言或构建链。

⸻

:::writing{variant=“standard” id=“84219”}




我们来重构网站的lib/markdown，实现一个“内容索引层”（content index layer），用于一次性扫描所有 posts（通常是 markdown / mdx 文件），构建统一的数据结构，并提供给全局复用。

### 目标
	1.	避免多个组件重复扫描文件系统
	2.	提供稳定、可复用的 posts 索引
	3.	支持在开发或构建阶段 dump 索引为 JSON（仅用于调试/可视化）
	4.	不引入 Python 或其他语言，完全基于 TypeScript / Node.js 实现
	5.	兼容 React Server Components（RSC）

### 目录结构要求

实现文件lib/posts/getposts.ts

### 数据结构定义
```ts
type PostMeta = {
  post_id: number
  post_title: string
  post_path: string
  post_category: string
  post_tag: string[]
  post_datetime: string   // 原始字符串，不做补全
  post_timestamp: number  // 用于排序，根据原始字符串转换得到毫秒时间戳
}

type PostIndex = {
  categories: string[]
  tags: string[]
  posts: PostMeta[]
}
```
说明：
- categories 和 tags 是去重后的集合
- 所有派生逻辑应由调用方或 helper 函数完成

⸻

### 核心函数设计

实现：
```ts
export const getAllPosts: () => PostIndex
```
要求：

#### 1）分层实现
拆分为三个内部函数：
```ts
function scanPosts(): RawPost[]
function normalizePosts(raw: RawPost[]): PostMeta[]
function buildIndex(posts: PostMeta[]): PostIndex
```
职责：
- scanPosts：
    - 扫描 posts 目录（如 /posts）
    - 读取文件内容（fs）
    - 提取 frontmatter（可以用 gray-matter 或自写解析）
- normalizePosts：
    - 转换为 PostMeta
    - 生成：
    - post_id（稳定递增或基于文件）
    - post_timestamp（从 datetime 解析，无法解析则为 NaN 或 0）
- buildIndex：
    - 收集：
    - categories（Set → array）
    - tags（Set → array）

⸻

#### 2）缓存策略（必须）

必须同时实现：

A. module-level cache（全局缓存）
```ts
let globalCache: PostIndex | null = null
```
B. React cache（请求内去重）
使用：
```ts
import { cache } from 'react'
```
最终结构必须类似：
```ts
export const getAllPosts = cache(() => {
  if (globalCache) return globalCache

  const raw = scanPosts()
  const normalized = normalizePosts(raw)
  const index = buildIndex(normalized)

  globalCache = index
  return index
})
```

⸻

### dump 功能

在 getAllPosts 内：
```ts
if (process.env.NODE_ENV === 'development') {
  // 写入
}
```
要求：
- 使用 fs.writeFileSync
- 输出格式示例 .logs/postindex_260430_164301.json
- 确保目录存在











dump 功能（可选但推荐）

实现一个“非侵入式”的 dump：

方案 A（推荐）：仅开发环境

在 getAllPosts 内：

if (process.env.NODE_ENV === 'development') {
  // 写入 .generated/post-index.json
}

要求：
	    - 使用 fs.writeFileSync
	    - 输出路径为 .generated/post-index.json
	    - 确保目录存在

或 方案 B（更工程化）：

创建：

scripts/dump-post-index.ts

内容：
	    - 调用 getAllPosts()
	    - 写入 JSON

并在 package.json 中建议（但不要强制）：

"postbuild": "tsx scripts/dump-post-index.ts"


⸻

约束（必须遵守）
	1.	不允许在客户端组件中调用该函数（必须 server-only）
	2.	不允许使用 Python 或其他语言
	3.	不允许在运行时（生产环境请求期间）写文件（dump 只能发生在 dev 或 build）
	4.	不要引入数据库
	5.	不要实现 UI 相关逻辑
	6.	保持函数纯净（除了可控 dump）

⸻

额外优化（如果你认为合理可以实现）
	    - 对 posts 按 post_timestamp 排序（降序）
	    - 对无法解析的 datetime 做容错处理
	    - 为扫描路径做配置（例如 process.cwd() + '/posts'）

⸻

输出要求

返回完整的 getPosts.ts 实现代码，包含：
	    - 类型定义
	    - 所有函数实现
	    - 必要的 import

如果实现了 dump script，也请一并给出。

不要输出解释，只输出代码。
:::

⸻

这份提示词的约束是刻意收紧的，目的是避免 code agent 做出你之前担心的几类问题：
	    - 把缓存只写成 react.cache（不够稳定）
	    - 过度设计索引结构（耦合 UI）
	    - 在运行时乱写文件（serverless 下会炸）

如果你后续打算扩展（比如全文搜索或 tag 统计），可以在这个基础上再加一层 query helpers，而不是修改 PostIndex 本身。
