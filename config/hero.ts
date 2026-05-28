// 首页 Hero 配置：文案、背景与主题差异集中维护
export const heroConfig = {
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
    title: "text-black dark:text-white",
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
};
