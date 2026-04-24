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
  
  // Category 配置（用于在分类页面展示横幅和说明）
  categories: {
    walking: {
      name: "行走",
      description: "",
      image: "/images/neko_over_un.jpeg", // 可自定义替换为你想展示的横幅图绝对路径
      showImage: true // 配置横幅开关
    },
    speaking: {
      name: "言论",
      description: "123",
      image: "/images/re/nisemono/nisemono-1.jpg",
      showImage: true
    },
    hardware: {
      name: "硬件",
      description: "",
      image: "/images/ThinkPad/x250-0.jpeg",
      showImage: true
    },
    developer: {
      name: "开发",
      description: "",
      image: "/images/lab/lab1/1-1-1.jpeg", // 测试调用一张存在的图片
      showImage: true
    }
  } as Record<string, { name: string; description: string; image: string; showImage: boolean }>,

  layout: {
    // 左右分界线的比例，支持CSS网格比例例如 '60% 1fr' or 'minmax(600px, 2fr) 1fr'
    gridTemplateColumns: "70% 1fr",
    // 顶部栏等宽屏容器的最大宽度，如 'max-w-7xl' 或 'w-full px-8'
    headerContainer: "w-full px-6 md:px-12",
    mainContainer: "w-full max-w-7xl mx-auto px-6 md:px-12 py-8",
  },
  
  ui: {
    // 锁定纵横比
    heroAspectRatio: "aspect-[4/3] md:aspect-[21/9]", // 增加了移动端比例
    categoryBannerAspectRatio: "aspect-[4/1]",
    // 深浅模式Hero图片
    heroImages: {
      light: "/bg-light.jpg", // 可换成你真实的图片链接或本地路径
      dark: "/bg-dark.jpg",
    },
    // Hero 文本颜色控制
    heroColors: {
      title: "text-lime-300 dark:text-white",
      subtitle: "text-gray-500 dark:text-gray-300",
    },
    // 网站主题基础颜色：在这里直接定义 Hex / RGB 颜色值
    themeColors: {
      light: {
        background: "#fffdfc",
        text: "#171717",
      },
      dark: {
        background: "#0a0a0a",
        text: "#ededed",
      }
    },
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
  ],
  
  // 分页设置
  pagination: {
    articlesPerPage: 10,
    prefetch: true // 控制是否在视口中自动预取翻页的数据
  }
};
