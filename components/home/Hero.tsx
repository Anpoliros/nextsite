import { siteConfig } from '@/site.config';
import Link from 'next/link';

// 首页顶部Hero图组件
export default function Hero() {
  return (
    <div className={`relative w-full ${siteConfig.ui.heroAspectRatio} bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-12 flex flex-col justify-center items-start pl-8 md:pl-16 text-left`}>
      {/* 背景图 */}
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/images/bg.jpg')]"></div>
      
      {/* 半透明遮罩确保文字可读 */}
      <div className=""></div>

      <div className="relative z-10 px-4">
        <h1 className={`${siteConfig.ui.fontSizes.heroTitle} font-bold text-white mb-4 tracking-tight`}>
          {siteConfig.description}
        </h1>
        <Link href="/walking/about" className={`${siteConfig.ui.fontSizes.heroSubtitle} text-gray-200 hover:text-white transition-colors underline underline-offset-4 decoration-gray-400 hover:decoration-white font-medium block`}>
          About
        </Link>
      </div>
    </div>
  );
}
