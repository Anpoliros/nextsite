---
title: "nexsite devlog 1"
date: 2026-04-30
categories: ["developer"]
tags: ["dev", "typescript"]
---

# nextsite devlog 1

<!--more-->

到目前，nextsite的两个核心需求1）经典的带有自适应的博客前端以及2）通过md构建网站的能力都已经实现。



## 总体架构

```sh
.
├── app/                       
│   ├── page.tsx               # homepage
│   ├── [category]   
│   │   └── [slug]             # 文章页面
│   └── tags
│       └── [tag]
├── components/                # 公共组件
├── lib/     
│   └── markdown/              # md渲染器
│       ├── codeblock.ts
│       └── index.ts
├── scripts/
│   ├── clean_ds_store.py      
│   ├── md_pic_remap.py        # md图片引用匹配工具
│   └── png2jpg.py
├── ecosystem.config.js        # pm2配置
├── md.config.ts               # md渲染配置
├── site.config.ts             # 网站配置
├── package.json
├── tsconfig.json
└── ZDEVLOG                    # 提示词日志
```

页面
- 在app中实现，目录即路由
- 调用components，加载各个组件
- 调用lib/posts，扫描content目录中的文章，构造元数据
- 调用lib/markdown，渲染文章为html

配置
- site.config.ts控制大多数行为，例如主页、导航栏、底栏等
- md.config.ts控制md渲染的行为

基础设施
- cloudflare连接器暴露到公网，后续打算加nginx



## app & components




## lib/markdown




## lib/posts




## config




## work with LLM



