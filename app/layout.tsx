import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/site.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-gray-900 bg-white dark:bg-gray-950 dark:text-gray-100">
        <Header />
        <main className={`${siteConfig.layout.mainContainer} flex-1 flex justify-start`}>
          {/* 这里放弃 tailwind 默认的 auto grid，而是动态读取 style 设置 */}
          <div 
            className="md:grid gap-8 h-full w-full"
            style={{ gridTemplateColumns: siteConfig.layout.gridTemplateColumns }}
          >
            {/* 左侧主要内容 */}
            <section className="w-full flex-grow">
              {children}
            </section>
            
            {/* 右侧侧边栏（宽屏显示，窄屏隐藏） */}
            <aside className="hidden md:block border-l border-gray-100 dark:border-gray-800 pl-8 h-full min-h-[500px]">
              {/* 右侧暂时不设计，以此占位 */}
            </aside>
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
