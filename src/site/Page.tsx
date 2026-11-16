/** 页面组合入口：主页与文章共用偏好、纸张、页头及 footer。 */
import { ThemeProvider } from '@/components/theme-provider';
import { PreferencesProvider } from '@/components/journal/Preferences';
import JournalShell from '@/components/journal/JournalShell';
import HomePage from '@/pages/HomePage';
import ArticlePage from '@/pages/ArticlePage';
import type { PageData } from './types';
export default function Page({ data }: { data: PageData }) {
  return <ThemeProvider><PreferencesProvider><JournalShell reading={data.kind === 'article'}>
    {data.kind === 'home' ? <HomePage data={data} /> : data.kind === 'article' ? <ArticlePage data={data} /> :
      <main id="main-content" className="not-found"><h1>404 · 页面不存在</h1><a href="/">返回首页 ↗</a></main>}
  </JournalShell></PreferencesProvider></ThemeProvider>;
}
