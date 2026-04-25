# nextsite

这是一个基于next.js的静态内容网站实现，主要设计逻辑暂时延续了hugo/PaperMod。

虽然我没写过一行typescript，但我们可以科学地vibe coding。同时这也是个快速学习前端开发的契机。后续会添加越来越多的功能，锐意迭代中！

## 启动

```sh
npm run depoly
```

## 项目结构

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

## 关键逻辑






