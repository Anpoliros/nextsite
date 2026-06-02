// 首页配置：Hero、背景场景与主题差异集中维护
export type HomeTheme = "light" | "dark";

type HeroAlign = "left" | "right";

type CloudDepth = "far" | "middle" | "near";

export const homeConfig = {
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
      title: "text-black dark:text-white",
      subtitle: "text-gray-500 dark:text-gray-300",
    },
    fontSizes: {
      title: "text-xl md:text-2xl",
      subtitle: "text-base md:text-base",
    },
  },
  asciiScene: {
    enabled: true,
    seed: "home-ascii-scene",
    clouds: {
      enabled: true,
      motionScale: 1,
      // 底部云底边向 footer 方向溢出的距离，正值表示低于 main/footer 交界线
      footerBleedPx: 30,
      // 云朵轮廓参数：数值越大，整体越鼓、顶部凸起越明显
      shape: {
        heightScale: 0.8,
        bumpLift: 1.0,
      },
      middleCount: {
        light: 3,
        dark: 1,
      },
      bottomCount: {
        light: 5,
        dark: 2,
      },
      classNames: {
        light: {
          far: "text-sky-400/10",
          middle: "text-sky-400/15",
          near: "text-sky-500/20",
          footer: "text-sky-400/20",
        },
        dark: {
          far: "text-slate-200/10",
          middle: "text-slate-200/15",
          near: "text-slate-100/20",
          footer: "text-slate-100/20",
        },
      },
    },
    stars: {
      enabled: true,
      count: 130,
      className: "text-slate-100/25",
    },
    meteors: {
      enabled: true,
      count: 2,
      className: "text-slate-100/30",
    },
  },
} satisfies {
  hero: {
    aspectRatio: string;
    bg: Record<HomeTheme, string>;
    align: Record<HomeTheme, HeroAlign>;
    title: Record<HomeTheme, string>;
    subtitle: Record<HomeTheme, { description: string; link: string }>;
    colors: { title: string; subtitle: string };
    fontSizes: { title: string; subtitle: string };
  };
  asciiScene: {
    enabled: boolean;
    seed: string;
    clouds: {
      enabled: boolean;
      motionScale: number;
      footerBleedPx: number;
      shape: {
        heightScale: number;
        bumpLift: number;
      };
      middleCount: Record<HomeTheme, number>;
      bottomCount: Record<HomeTheme, number>;
      classNames: Record<HomeTheme, Record<CloudDepth | "footer", string>>;
    };
    stars: {
      enabled: boolean;
      count: number;
      className: string;
    };
    meteors: {
      enabled: boolean;
      count: number;
      className: string;
    };
  };
};
