export const layoutConfig = {
  // 左右分界线的比例，支持 CSS 网格比例，例如 '60% 1fr' 或 'minmax(600px, 2fr) 1fr'
  gridTemplateColumns: "70% 1fr",
  // 顶部栏等宽屏容器的最大宽度，如 'max-w-7xl' 或 'w-full px-8'
  headerContainer: "w-full px-6 md:px-12",
  mainContainer: "w-full max-w-7xl mx-auto px-6 md:px-12 py-8",
};

export const uiConfig = {
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
};
