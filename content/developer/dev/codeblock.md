---
title: "dev: codeblock"
date: 2026-04-23
categories: ["developer"]
tags: ["dev", "typescript"]
---

# 代码块功能

<!--more-->

## test

单行代码
```shell
sudo /Applications/Install\ macOS\ Mojave.app/Contents/Resources/createinstallmedia --volume /Volumes/p1
```

无语种代码
```
hello
```

长代码
```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setTitle("Secret Location App");
    setContentView(R.layout.activity_main); // 加载布局

    // 权限处理
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(this,
                                          new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                                          REQUEST_LOCATION_PERMISSION);
    } else {
        startLocationService();
    }
}
```

## 设计

代码块组件包含header和container，大意如下。

```html
<div class="pre">
    <div class="code-block-header"，可在md.config.ts中分别定义深色浅色模式下的颜色，默认透明>
        <div class="button" 右对齐>
            <label>代码类型，需要动态获取</label>
            <button>折行按钮</button>
            <button>复制按钮</button>
        </div>
    </div>
    <div class="code-block-container"，代码container>
        <div 代码区，和container间有空隙>
            <span>...</span>
        </div>
    </div>
</div>
```

高亮采用shiki。shiki会将代码原文划分成一堆`<span>`，给它们应用颜色。

代码区底部有一个安全区，用于容纳左右划动时底部出现的滑动条。

主题在mdconfig中配置。

## 问题

遇到的比较大的问题包括：

1. shiki背景色

shiki背景色不显示，代码块内显示网页背景色。这是由于`rehype-pretty-code`提供的主题变量原来由于`Tailwind V4 API`以及内联类名的冲突未能正常绑定。

解决方案是把`globals.css`层面原来的`pre`选择器背景色接管改为了作用于父节点`<figure>`（外层容器）。顺便给内部的 `<pre>` 使用 bg-transparent! / background-color: transparent !important，这样圆角、Padding 都会继承 Shiki 提供的 Monokai 及 Github-dark 的主题背景色。

2. UI混乱

一定要给llm你希望的html，要不它们根本理解不了你想表达什么。不是按钮到处飞就是header单独成一个组件。



