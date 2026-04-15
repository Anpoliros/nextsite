export const siteConfig = {
  title: "Anpoliros",
  description: "Hello from Shanghai",
  logo: "/favicon.ico",
  "navLinks": [
    { "title": "行走", "href": "/walking" },
    { "title": "言论", "href": "/speaking" },
    { "title": "硬件", "href": "/hardware" },
    { "title": "开发", "href": "/developer" },
    { "title": "Tags", "href": "/tags" }
  ],
  "footerText": "© 2025-2026 Anpoliros",  
  layout: {
    // 左右分界线的比例，支持CSS网格比例例如 '60% 1fr' or 'minmax(600px, 2fr) 1fr'
    gridTemplateColumns: "70% 1fr",
    // 顶部栏等宽屏容器的最大宽度，如 'max-w-7xl' 或 'w-full px-8'
    headerContainer: "w-full px-6 md:px-12",
    mainContainer: "w-full max-w-7xl mx-auto px-6 md:px-12 py-8",
  },
  
  ui: {
    // 锁定纵横比
    heroAspectRatio: "aspect-[21/9]", // 如 'aspect-[21/9]' 或 'aspect-video'
    categoryBannerAspectRatio: "aspect-[4/1]",
    // 字号控制
    fontSizes: {
      headerLogo: "text-2xl",
      headerNav: "text-base",
      headerActions: "text-base",
      heroTitle: "text-xl md:text-2xl",
      heroSubtitle: "text-base md:text-base",
      footer: "text-sm",
    }
  },
  
  // 置顶文章
  pinnedArticles: [
    "speaking/freedom", // 可以加入你实际的文章slug，比如 'walking/hello' 等
  ]
};
