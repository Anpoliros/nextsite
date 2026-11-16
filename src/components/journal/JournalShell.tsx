/** 主页和阅读页共用的纸张、页头和页脚。偏好状态由页面根统一提供。 */
import type { CSSProperties, ReactNode } from 'react';
import ReaderMenu from './ReaderMenu';
import { usePreferences } from './Preferences';
export default function JournalShell({ children, reading = false }: { children: ReactNode; reading?: boolean }) {
  const { preferences, reduced } = usePreferences();
  return <div className={`site ${reading ? 'article-site' : 'home-site'}`} data-pattern={preferences.pattern} data-reduced={reduced}
    style={{ '--reading-size': `${preferences.size}px`, '--reading-leading': preferences.leading } as CSSProperties}>
    <a className="skip-link" href="#main-content">跳至正文</a>
    <ReaderMenu reading={reading} />
    <div className="page-shell">
      <header className="masthead"><a className="wordmark" href="/">anpoliros<span>✳</span></a><a className="about" href="/about/">About ↗</a></header>
      {children}
      <div className="bottom-divider" aria-hidden="true" />
      <footer><span>© 2025–2026 Anpoliros</span></footer>
    </div>
  </div>;
}
