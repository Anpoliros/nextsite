import path from "path";

export const contentConfig = {
  // Markdown 原片存放的绝对路径
  contentDir: path.join(process.cwd(), "articles/content"),

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

  // 置顶文章
  pinnedArticles: [
    "speaking/freedom", // 可以加入你实际的文章 slug，比如 'walking/hello' 等
  ],

  // 分页设置
  pagination: {
    articlesPerPage: 10,
    prefetch: true // 控制是否在视口中自动预取翻页的数据
  },
};
