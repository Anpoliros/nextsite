# TODO


# !important

[x] 文章页面的tag应该可点击
[x] category和tag放到一处，而且顶部和底部都有

[] 随机一篇的逻辑有问题，而且应该同时放在头部。可以随机到锚点
[] 锚点



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
