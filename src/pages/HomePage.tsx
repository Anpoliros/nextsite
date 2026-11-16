/** 主页组合：稳定 Hero、贴纸列表和纸边；筛选只在已经读到列表下方时回到列表顶部。 */
import { useLayoutEffect, useRef, useState } from 'react';
import type { PageData } from '@/site/types';
import PhotoStack from '@/components/journal/PhotoStack';
import ArticleCard from '@/components/journal/ArticleCard';
import Sidebar from '@/components/journal/Sidebar';
import { useResponsiveLayout } from '@/components/journal/useResponsiveLayout';
import { usePreferences } from '@/components/journal/Preferences';
import { categoryName } from '@/config/journal';
const pageSize = 12;
export default function HomePage({ data }: { data: Extract<PageData, { kind: 'home' }> }) {
  const { reduced } = usePreferences();
  const { compact, phase } = useResponsiveLayout(800, !reduced, 360);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const layout = useRef<HTMLDivElement>(null);
  const scroll = useRef<{ top: number; anchor: boolean } | null>(null);
  const selected = data.articles.filter(article => !category || article.category === category);
  const pages = Math.ceil(selected.length / pageSize);
  const capture = () => { scroll.current = { top: window.scrollY, anchor: (layout.current?.getBoundingClientRect().top ?? 0) < -1 }; };
  const filter = (next: string) => { capture(); setCategory(next); setPage(0); };
  useLayoutEffect(() => {
    if (!scroll.current) return;
    if (scroll.current.anchor) layout.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' });
    else window.scrollTo({ top: scroll.current.top, behavior: 'instant' });
    scroll.current = null;
  }, [category, page, reduced]);
  return <>
    <PhotoStack photos={data.photos} />
    <div className="top-divider" aria-hidden="true" />
    <div ref={layout} className="main-layout" data-open={open} data-compact={compact} data-sidebar-phase={phase}>
      <main id="main-content"><div className="section-heading"><h2>{category ? categoryName(category) : '最近写下的'}<small> / {selected.length} 篇</small></h2>{category && <button onClick={() => filter('')}>全部文章 ↗</button>}</div>
        <div className="article-list" key={`${category}-${page}`}>{selected.slice(page * pageSize, (page + 1) * pageSize).map((article, index) => <ArticleCard article={article} index={index} key={article.id} />)}</div>
        {selected.length === 0 && <p className="empty-state">这里还没有文章。</p>}
        {pages > 1 && <nav className="pagination" aria-label="文章分页"><button disabled={page === 0} onClick={() => { capture(); setPage(value => value - 1); }}>← 上一页</button><span>{page + 1} / {pages}</span><button disabled={page + 1 === pages} onClick={() => { capture(); setPage(value => value + 1); }}>下一页 →</button></nav>}
      </main>
      <Sidebar articles={data.articles} open={open} onToggle={() => setOpen(value => !value)} category={category} onCategory={filter} />
    </div>
  </>;
}
