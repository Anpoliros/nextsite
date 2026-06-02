import { homeConfig } from "@/config/home";
import Link from 'next/link';

type HeroTheme = "light" | "dark";
type HeroAlign = "left" | "right";

const heroConfig = homeConfig.hero;

const alignClasses: Record<HeroAlign, { frame: string; content: string }> = {
  left: {
    frame: "items-start pl-8 pr-4 md:pl-16 md:pr-8",
    content: "text-left",
  },
  right: {
    frame: "items-end pl-4 pr-8 md:pl-8 md:pr-16",
    content: "text-right",
  },
};

const darkAlignClasses: Record<HeroAlign, string> = {
  left: "dark:items-start dark:pl-8 dark:pr-4 dark:md:pl-16 dark:md:pr-8",
  right: "dark:items-end dark:pl-4 dark:pr-8 dark:md:pl-8 dark:md:pr-16",
};

const themeVisibility: Record<HeroTheme, string> = {
  light: "block dark:hidden",
  dark: "hidden dark:block",
};

function renderSubtitle(theme: HeroTheme) {
  const subtitle = heroConfig.subtitle[theme];
  const className = `${heroConfig.fontSizes.subtitle} ${heroConfig.colors.subtitle} transition-colors underline underline-offset-4 decoration-gray-400 hover:decoration-white font-medium block`;

  if (!subtitle.link) {
    return <span className={className}>{subtitle.description}</span>;
  }

  return (
    <Link href={subtitle.link} className={className}>
      {subtitle.description}
    </Link>
  );
}

function renderContent(theme: HeroTheme) {
  const alignment = alignClasses[heroConfig.align[theme]];

  return (
    <div className={`${themeVisibility[theme]} relative z-10 px-4 ${alignment.content}`}>
      <h1 className={`${heroConfig.fontSizes.title} ${heroConfig.colors.title} font-bold mb-4 tracking-tight`}>
        {heroConfig.title[theme]}
      </h1>
      {renderSubtitle(theme)}
    </div>
  );
}

// 首页顶部Hero图组件
export default function Hero() {
  const lightAlign = alignClasses[heroConfig.align.light].frame;
  const darkAlign = darkAlignClasses[heroConfig.align.dark];

  return (
    <div className={`relative w-full ${heroConfig.aspectRatio} bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-12 flex flex-col justify-center ${lightAlign} ${darkAlign}`}>
      {/* 背景图：通过内联样式支持明暗模式分离图片设置 */}
      <div 
        className="absolute inset-0 bg-cover bg-center hidden dark:block"
        style={{ backgroundImage: `url('${heroConfig.bg.dark}')` }}
      ></div>
      <div 
        className="absolute inset-0 bg-cover bg-center block dark:hidden"
        style={{ backgroundImage: `url('${heroConfig.bg.light}')` }}
      ></div>
      
      {renderContent("light")}
      {renderContent("dark")}
    </div>
  );
}
