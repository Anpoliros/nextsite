/** 公共页面布局：构建时与浏览器接管时使用相同组件树。 */
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/theme-provider';
import { layoutConfig } from '@/config/layout';
import HomePage from '@/pages/HomePage';
import CategoryPage from '@/pages/CategoryPage';
import TagPage from '@/pages/TagPage';
import TagsPage from '@/pages/TagsPage';
import ArticlePage from '@/pages/ArticlePage';
import AboutPage from '@/pages/AboutPage';
import NotFoundPage from '@/pages/NotFoundPage';
import type { PageData } from './types';

function Content({ data }: { data: PageData }) {
  switch (data.kind) {
    case 'home': return <HomePage data={data} />;
    case 'category': return <CategoryPage data={data} />;
    case 'tag': return <TagPage data={data} />;
    case 'tags': return <TagsPage data={data} />;
    case 'article': return <ArticlePage data={data} />;
    case 'about': return <AboutPage data={data} />;
    case 'not-found': return <NotFoundPage />;
  }
}
export default function Page({ data }: { data: PageData }) {
  return <ThemeProvider><Header /><main className={`${layoutConfig.mainContainer} flex-1 flex justify-start`}><Content data={data} /></main><Footer /></ThemeProvider>;
}
