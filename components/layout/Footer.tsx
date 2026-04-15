import { siteConfig } from '@/site.config';

// 全局底部栏组件
export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 mt-16 py-8">
      <div className={`${siteConfig.layout.headerContainer} mx-auto text-center ${siteConfig.ui.fontSizes.footer} text-gray-500`}>
        <p>{siteConfig.footerText}</p>
      </div>
    </footer>
  );
}
