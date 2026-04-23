

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


# 0422

我们来优化markdown解析器。

1. 代码块
- 加入代码高亮
- 代码块右上角有两个按钮，都是icon，从左到右：折行显示，复制
- 代码块左上角显示代码类型

2. 配置
md.config.ts里包含了categories信息，其中一些看起来更适合放在site.config.ts中，保证功能不变的前提下解耦一下

---

功能完美实现了！我们来调整一下UI：
1. 代码块和header圆角不一致
2. header颜色和代码块一致吧，可以直接让header透明，而且高度调低点
3. 深色模式下，代码块的宽度似乎变小了，这应该是某层div导致的
4. header左上角不放东西了，代码类型的显示改到右上角折行按钮一边，而且不强制大写
核心设计目标是让header不那么显眼

---

这回好多了，但是没有解决宽度问题。我发现本质是显示代码的div似乎是在一个更大的div上面，而显示代码的部分和它的parent的颜色不一样。我希望整个代码显示组件都保持一个颜色，这个颜色和代码高亮主题可以在md.config.ts中配置

---

边框问题似乎暂时解决了，然而只要背景色换成383838之外的颜色，就又变成原来大框套小框的样子而且按钮都没了。

我觉得这种“加载时注入css和新的控件”的方法本身就容易出bug，不如让markdown渲染器渲染的时候就完成所有工作。

按钮
1. 点击复制按钮后，复制成功了，按钮会变成对钩icon，指针移动走之后变回复制icon
2. 当代码很长向右划动时，按钮也跟着划动了，预期效果是按钮不会动
3. 按钮所在的header还是太高了，导致代码块控件很大，代码到边框的宽度过长

高亮
1. 深色模式和浅色模式可以选择不同的css主题
2. 如果不依赖cdn，我把这些css全都放到某处，在mdconfig中指定位置，如果找不到才用cdn
3. 这些css对shell的高亮非常差，我看仓库里它们都是几年前更新的了，有没有更现代的选择。

---

我通过网页检查器注意到，代码块的margin和border之间在上下方向上出现了一个空隙。而且我希望按钮不要有自己的背景，也不要hover。整个代码块组件描述如下：
从上到下：
- 右对齐：代码类型，按钮。高度大约为1.5行文字
- 代码内容
- 划动时会出现的条
整个组件看起来应该是一体的。

另外，shiki没有生效。我觉得为了便于分析，不如在lib/markdown中分出来一个ts文件负责代码块渲染。

---

现在代码高亮的实现有问题，预想中应该是
- 渲染markdown时，lib/markdown/index调用highlight来渲染代码块组件
- 使用shiki处理高亮，主题在md.config.ts中配置

但有以下问题：
- 代码块的背景色现在就是网站背景色，且浅色模式下代码是浅灰白色
- shiki未生效，现在没有任何高亮

---

这回效果真不错！我们做一些UI上的小调整
1. 保护区
代码现在几乎填满代码块组件，应该有一些保护区域，包括左右的空隙以及下边的划动条预留区域

2. 按钮所在的header行
- 应该单独有高度，而非和代码重叠
- 按钮左边的label现在只显示TEXT，应该显示代码类型，且不强制大写

---

按钮部分不应该是个单独的div，它应该在pre中，也不应该有自己的背景色。而且底部的滚动条现在好像有两套实现。


我们来优化下代码块渲染。逻辑是lib/markdown中实现markdown解析器，其中的index.ts负责渲染，调用highlight.ts。采用shiki做代码高亮。代码块右上角有折行和复制按钮。
现在已经实现了基本功能，然而现在：
- 代码内容和代码块边框之间没有缓冲区，文字过于贴近边框
- header和代码块不是在一个div中
- 无法正确加载代码类型（例如shell、py）

如下是我想要实现的html效果的示例
```html
<div class="pre">
    <div header，可在md.config.ts中分别定义深色浅色模式下的颜色，默认透明>
        <div class="button" 右对齐>
            <label>代码类型，需要动态获取</label>
            <button>折行按钮</button>
            <button>复制按钮</button>
        </div>
    </div>
    <div 代码container>
        <div 代码区，和container间有空隙>
            <span>...</span>
        </div>
    </div>
</div>
```

首先你需要把highlight.ts改名为codeblock.ts，更加直观，然后做上述改动。如果要做测试看效果，访问localhost:3000/developer/codeblock



如下是飞书文档的代码块实现，我们不需要这么精细的实现，但可以参考
```html
<div class="docx-code-block-container">
    <div class="docx-code-block-inner-container">
        <div class="code-block-resize">
            <div class="resizable-wrapper" contenteditable="false">
                <div class="editor-kit-code-block code-block code-fold-block is-safari" spellcheck="false">
                    <div contenteditable="false" class="ignore-dom">
                        <div contenteditable="false" class="code-block-header uneditable">
                            <div class="code-block-caption">
                                <div class="caption-editor-area extra_edit_element" data-autoselect="false" style="">
                                    <div class="zone-container editor-kit-container caption-editor code-block-caption-editor notranslate safari"
                                        data-zone-id="0" data-zone-container="*" data-slate-editor="true"
                                        contenteditable="false" style="text-align: left;">
                                        <div class="ace-line" data-node="true" dir="auto"><span data-string="true"
                                                data-leaf="true">代码块</span><span data-string="true" data-enter="true"
                                                data-leaf="true">​</span></div>
                                    </div>
                                </div>
                            </div>
                            <div class="code-block-header-toolbar"><span class="code-block-header-btn-con"><button
                                        class="code-block-header-btn code-block-header-btn-disable" type="button"><span
                                            style="max-width: 53em;">Plain Text</span></button></span><button
                                    type="button"
                                    class="ud__button ud__button--link ud__button--link-default ud__button--size-md code-copy ghost-btn"><svg
                                        width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M6.188 8.25v8.25h6.875V8.25H6.186zm8.25-.688v9.702c0 .337-.288.611-.642.611H5.454c-.354 0-.641-.274-.641-.611V7.486c0-.337.287-.611.641-.611h8.296c.38 0 .688.308.688.688zm2.548-3.236a.685.685 0 01.201.487v8.593c0 .19-.153.344-.343.344h-.688a.344.344 0 01-.343-.344V5.5H9.28a.344.344 0 01-.344-.344V4.47c0-.19.154-.344.344-.344H16.5c.19 0 .362.077.486.201z"
                                            fill="#646A73"></path>
                                    </svg><span>复制</span></button></div>
                        </div>
                    </div>
                    <div class="code-block-content code-wrap-content">
                        <div class="code-block-line" contenteditable="false"></div>
                        <div class="zone-container text-editor hide-placeholder code-block-zone-container"
                            data-zone-id="135" data-zone-container="*" data-slate-editor="true" contenteditable="false">
                            <div class="ace-line" data-node="true" dir="auto">
                                <div class="code-line-wrapper" data-line-num="1"><span data-string="true"
                                        data-enter="true" data-leaf="true">​</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

---

效果还不错！有两个小问题
1. 代码类型不要强制大写
2. shiki主题的背景颜色不生效了，现在代码块的背景直接继承了网页背景色

---

我们来优化下代码块渲染。逻辑是lib/markdown中实现markdown解析器，其中的index.ts负责渲染，调用codeblock.ts。采用shiki做代码高亮。代码块右上角有折行和复制按钮。现在已经实现了基本功能，然而：
1. 代码块的背景颜色是网页背景色，预期应该用shiki主题的背景色
2. 如果代码块没有指定语言，例如
```
hello 
```
则会报错。预期没有指定时代码类型label将什么都不显示
3. 按钮不要“折行”“复制”的文字

测试页面localhost:3000/developer/codeblock

---

1. 代码块UI
现在出现了代码块套着代码块的奇怪景象

2. 背景色
有语种代码的背景色正常了，但无语种代码的背景色仍然不能正常显示


