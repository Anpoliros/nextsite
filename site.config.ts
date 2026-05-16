import type { PortalsConfig } from "@/components/portals/portal.types";

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
    categoryBannerAspectRatio: "aspect-[4/1]",
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
      footer: "text-sm",
    }
  },

  // 首页 Hero 配置：文案、背景与主题差异集中维护
  hero: {
    aspectRatio: "aspect-[4/3] md:aspect-[21/9]",
    bg: {
      light: "/bg-alice.jpeg",
      dark: "/bg-shizuko.jpeg",
    },
    align: {
      light: "left",
      dark: "right",
    },
    title: {
      light: "Hello from Shanghai",
      dark: "Hello from Shanghai",
    },
    subtitle: {
      light: {
        description: "About",
        link: "/about",
      },
      dark: {
        description: "About",
        link: "/about",
      },
    },
    colors: {
      title: "text-white dark:text-white",
      subtitle: "text-gray-500 dark:text-gray-300",
    },
    fontSizes: {
      title: "text-xl md:text-2xl",
      subtitle: "text-base md:text-base",
    },
  } satisfies {
    aspectRatio: string;
    bg: Record<"light" | "dark", string>;
    align: Record<"light" | "dark", "left" | "right">;
    title: Record<"light" | "dark", string>;
    subtitle: Record<"light" | "dark", { description: string; link: string }>;
    colors: { title: string; subtitle: string };
    fontSizes: { title: string; subtitle: string };
  },
  
  // 置顶文章
  pinnedArticles: [
    "speaking/freedom", // 可以加入你实际的文章slug，比如 'walking/hello' 等
  ],
  
  // 分页设置
  pagination: {
    articlesPerPage: 10,
    prefetch: true // 控制是否在视口中自动预取翻页的数据
  },

  // Portals 入口面板配置
  portals: {
    ui: {
      desktop: {
        aspectRatio: "4 / 5",
        background: { type: "image", value: "/images/portal-bg-desktop.webp", opacity: 0 },
      },
      mobile: {
        aspectRatio: "5 / 1",
        background: { type: "image", value: "/images/portal-bg-mobile.webp", opacity: 0 },
      },
    },
    grid: {
      desktop: { rows: 3, cols: 2 },
      mobile:  { rows: 1, cols: 5 },
    },
    portals: {
      git:    { href: "https://git.anpoliros.com",   logo: "/logos/gitea.svg",    label: "Git" },
      vsss:   { href: "https://vsss.anpoliros.com",         logo: "/logos/441.png",   label: "VSSS" },
      status: { href: "https://status.anpoliros.com",  logo: "/logos/285.png", label: "Status" },
    },
    placements: {
      desktop: [
        { portal: "git",    row: 2, col: 2 },
        { portal: "vsss",   row: 3, col: 1 },
        { portal: "status", row: 3, col: 2 },
      ],
      mobile: [
        { portal: "git",    row: 1, col: 2 },
        { portal: "vsss",   row: 1, col: 3 },
        { portal: "status", row: 1, col: 4 },
      ],
    },
    item: { touchScale: 0.8, logoScale: 0.6 },
  } satisfies PortalsConfig,
};
