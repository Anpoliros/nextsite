import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/site.config';
import HeaderActions from './HeaderActions';

// 全局顶部导航栏组件
export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800">
      <div className={`${siteConfig.layout.headerContainer} mx-auto py-4`}>
        {/* 宽屏布局与窄屏第一行 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="hover:opacity-80 transition-opacity flex items-center">
              {siteConfig.logo.startsWith('/') ? (
                <Image src={siteConfig.logo} alt={siteConfig.title} width={32} height={32} className="rounded-sm" />
              ) : (
                <span className={`${siteConfig.ui.fontSizes.headerLogo} font-bold`}>{siteConfig.logo}</span>
              )}
            </Link>
            {/* 宽屏：导航链接放在Logo旁边 */}
            <nav className={`hidden md:flex items-center gap-6 ${siteConfig.ui.fontSizes.headerNav} font-medium`}>
              {siteConfig.navLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="hover:text-blue-500 transition-colors"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex-grow"></div>

          {/* 右侧操作区：深色模式、语言切换、帮助等客户端逻辑提取 */}
          <HeaderActions />
        </div>

        {/* 窄屏第二行：导航链接放在下方并左对齐，增加间距 mt-6 */}
        <nav className={`flex md:hidden items-center gap-6 ${siteConfig.ui.fontSizes.headerNav} mt-6 overflow-x-auto pb-2`}>
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="hover:text-blue-500 transition-colors whitespace-nowrap"
            >
              {link.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
