import path from 'path';

/**
 * Markdown 解析器全局配置
 */
export const mdConfig = {
  // Markdown 原片存放的绝对路径
  contentDir: path.join(process.cwd(), 'content'),
  
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
  
  // 转换规则设置（通过在此处控制开关和行为）
  features: {
    // 启用 GitHub 风格的 Markdown（表格、删除线、任务列表等）
    enableGfm: true,
    // 自动为 Heading 生成 ID（方便锚点跳转）
    enableHeadingId: true,
    // 代码高亮
    enableHighlight: true,
  }
};
