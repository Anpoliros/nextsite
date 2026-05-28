import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { layoutConfig, uiConfig } from "@/config/layout";
import { siteConfig } from "@/config/site";

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
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --site-bg: ${uiConfig.themeColors.light.background};
              --site-text: ${uiConfig.themeColors.light.text};
            }
            :root.dark {
              --site-bg: ${uiConfig.themeColors.dark.background};
              --site-text: ${uiConfig.themeColors.dark.text};
            }
          `
        }} />
      </head>
      <body className={`min-h-full flex flex-col transition-colors duration-300 bg-[var(--site-bg)] text-[var(--site-text)]`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className={`${layoutConfig.mainContainer} flex-1 flex justify-start`}>
            {/* 70/30 grid 与右侧 aside 由各 page 自行通过 <PageShell> 决定 */}
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
