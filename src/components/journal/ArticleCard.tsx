/** 三层贴纸：图标、纸面和实色底片分别运动；真实链接支持新标签页和无 JS 阅读。 */
import type { CSSProperties } from 'react';
import { CodeXml, Compass, BookOpen, Camera, Keyboard, Heart, Flower2, Coffee, Terminal, Wrench } from 'lucide-react';
import { articleTilt, articleTone, hashText } from '@/config/journal';
import type { Article } from '@/site/types';
const icons = { compass: Compass, code: CodeXml, book: BookOpen, camera: Camera, keyboard: Keyboard, heart: Heart, flower: Flower2, coffee: Coffee, terminal: Terminal, wrench: Wrench };
function iconName(article: Article): keyof typeof icons {
  if (article.icon && article.icon in icons) return article.icon as keyof typeof icons;
  if (article.tags.includes('cherry')) return 'flower';
  if (article.tags.includes('dairy')) return 'coffee';
  if (article.tags.includes('anime')) return 'heart';
  return ({ developer: 'code', hardware: 'keyboard', walking: 'compass', speaking: 'book' } as const)[article.category] ?? 'book';
}
export default function ArticleCard({ article, index }: { article: Article; index: number }) {
  const Icon = icons[iconName(article)];
  const tilt = articleTilt(article.id);
  return <div className="card-slot" style={{ '--indent': `${hashText(article.id) % 30}px` } as CSSProperties}>
    <article className="sticker-item" data-tone={articleTone(article.category, article.tags)}
      style={{ '--tilt': `${tilt}deg`, '--sign': tilt < 0 ? -1 : 1, '--index': Math.min(index, 8) } as CSSProperties}>
      <div className="article-card-shadow" aria-hidden="true" />
      <div className="article-card"><div className="article-content">
        <time dateTime={article.date}>{article.date.slice(0, 10)}</time>
        <h3><a href={`/${article.id}/`}>{article.title}</a></h3>
        {article.excerpt && <p>{article.excerpt}</p>}
      </div><div className="tags" aria-label="标签"><span aria-hidden="true">#</span>{article.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
      <a href={`/${article.id}/`} className="article-icon" aria-label={`阅读 ${article.title}`}><Icon size={30} strokeWidth={1.5} aria-hidden="true" /></a>
    </article>
  </div>;
}
