

# 1

很好，前端现在已经在工作了，细节我们之后再打磨，现在来实现md解析器吧！

我现在手里的md文章们在/content中，元数据是按照hugo的标准写的。引用图片放在了/images中，我有脚本可以动态修改md中的引用，但是md解析后的目标页面如何引用到图片是个问题。

仍然是先实现最小可用版本，只需要兼容现有的md们就可以了。

---

这个项目已经实现了一个简单的前端，现在我在考虑如何实现渲染md到页面的功能。现在手里的md文章们在/content中，按照category存放，有元数据。引用图片放在了/images中。跟我说说有哪些可能的技术选型

我注意到next-mdx-remote仓库最近archive了，而且有点黑盒，我还是希望能更可控。如果基于remark rehype graymatter手搓一个解析器工程量大概多大？而且我很犹豫应该采用SSG还是SSR，SSG应该会更快而且更直观，但是会让/app目录膨胀，SSR的话如果每次请求都要现场进行md->tsx的渲染又觉得太不优雅了。

# 0413


所以完整的工作流是：开始构建 -> [category]/[slug]/page.tsx调用mdconverter -> mdconverter从content中读取md并渲染 -> 静态页面，存储在.next中
是这样吗？如果是这样，我应该怎么安排目录结构，把mdconverter放在哪里？我想有一个md.config.json的配置文件来定义一些转换规则是可以的吗？



好，那我们就这么做，先实现一个最小可用版本吧。

/content中是md文件。site.config.json中已经给出了四个category，md文件中也已经标记了。md中的图片都引用正确，图片也放在了/public/images中



看起来并没有实现目标，我重新描述一下需求：
网站有四个category，路由是ip:port/walking等；文章只能有一个category，路由是ip:port/walking/hello。category页面
其实实现了...只是category页还没做，文章链接已经有了


看起来很棒！已经能正常访问到文章了。几件事：

1. category页
现在category页还没做，我们来实现一下category页（即/walking等）。
从上到下：
- 顶部栏
- category图（可配置开关以及图片位置）
- 文章列表，用components中的组件加筛选应该就可以了
- 底部栏

2. 丰富配置
我觉得现有的最简单版本看起来就不错，后续如果想要更精细地调整渲染格式，例如缩进、引用、代码高亮等应该怎么迭代与配置

3. 渲染结果
既然说是ssg，那我应该在哪里看结果页面？




目录功能，要传递目录给别的components

