"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Languages, HelpCircle } from "lucide-react";
import { siteConfig } from "@/site.config";

export default function HeaderActions() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // delay setState to avoid cascading renders
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  return (
    <div className={`flex items-center gap-4 ${siteConfig.ui.fontSizes.headerActions} text-gray-600 dark:text-gray-300 min-h-[28px]`}>
      <button 
        onClick={toggleTheme}
        className="hover:text-blue-500 hover:opacity-80 transition-colors p-1 flex items-center justify-center" 
        title={`切换主题`}
        suppressHydrationWarning
      >
        {(!mounted || theme === "system") && <Monitor size={20} />}
        {mounted && theme === "dark" && <Moon size={20} />}
        {mounted && theme === "light" && <Sun size={20} />}
        {mounted && !["system", "dark", "light"].includes(theme || "") && <Monitor size={20} />}
      </button>
      <button className="hover:text-blue-500 hover:opacity-80 transition-colors p-1 flex items-center justify-center" title="语言切换">
        <Languages size={20} />
      </button>
      <button className="hover:text-blue-500 hover:opacity-80 transition-colors p-1 flex items-center justify-center" title="帮助">
        <HelpCircle size={20} />
      </button>
    </div>
  );
}
