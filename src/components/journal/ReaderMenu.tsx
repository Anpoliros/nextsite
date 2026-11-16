/** 独立悬浮入口：桌面停在外侧轨道，移动端可拖动；tabs 靠近圆点。 */
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../theme-provider';
import { usePreferences } from './Preferences';
import { useFloatingControl } from './useFloatingControl';

export default function ReaderMenu({ reading }: { reading: boolean }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('page');
  const floating = useFloatingControl(850);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const { preferences, update } = usePreferences();
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !menu.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) { setOpen(false); trigger.current?.focus({ preventScroll: true }); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <>
    <button ref={trigger} className="menu-trigger floating-trigger" style={floating.buttonStyle}
      {...floating.dragProps} aria-label="阅读偏好" aria-expanded={open} aria-controls="reader-menu"
      onClick={() => { if (floating.allowClick()) setOpen(value => !value); }} />
    {open && <div ref={menu} id="reader-menu" className="floating-panel" data-direction={floating.direction} style={floating.panelStyle}>
      <div className="menu-tabs">
        <button aria-pressed={tab === 'page'} onClick={() => setTab('page')}>页面</button>
        {reading && <button aria-pressed={tab === 'reading'} onClick={() => setTab('reading')}>阅读</button>}
        <button className="menu-close" aria-label="关闭偏好" onClick={() => { setOpen(false); trigger.current?.focus(); }}>×</button>
      </div>
      <section className="menu-panel" aria-label={tab === 'reading' ? '阅读设置' : '页面设置'}>
        {tab === 'reading' && reading ? <>
          <label>正文字号 {preferences.size}px<input aria-label="正文字号" type="range" min="14" max="20" value={preferences.size} onChange={e => update({ size: +e.target.value })} /></label>
          <label>正文行距 {preferences.leading}<input aria-label="正文行距" type="range" min="1.6" max="2.2" step="0.05" value={preferences.leading} onChange={e => update({ leading: +e.target.value })} /></label>
        </> : <>
          <label>外观<select aria-label="外观" value={theme} onChange={e => setTheme(e.target.value as 'system' | 'light' | 'dark')}>
            <option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option>
          </select></label>
          <label>纸张底纹<select aria-label="纸张底纹" value={preferences.pattern} onChange={e => update({ pattern: e.target.value })}>
            <option value="dots">点阵</option><option value="grid">方格</option><option value="cross">十字</option><option value="ruled">横线</option><option value="plain">素纸</option>
          </select></label>
          <label>启用动效<input type="checkbox" checked={preferences.motion} onChange={e => update({ motion: e.target.checked })} /></label>
        </>}
      </section>
    </div>}
  </>;
}
