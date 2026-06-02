import { layoutConfig, uiConfig } from "@/config/layout";
import { siteConfig } from "@/config/site";

// 全局底部栏组件
export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-8">
      <div className={`${layoutConfig.headerContainer} mx-auto text-center ${uiConfig.fontSizes.footer} text-gray-500`}>
        <p>{siteConfig.footerText}</p>
      </div>
    </footer>
  );
}
