/** HTML 渲染：输出正文、元信息和当前页面数据，供浏览器一致接管。 */
import { renderToString } from 'react-dom/server';
import Page from '../src/site/Page';
import { uiConfig } from '../src/config/layout';
import { siteConfig } from '../src/config/site';
import type { PageData } from '../src/site/types';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
export function renderPage(data: PageData, template: string) {
  // JSON 放入 script 原文区域，转义 < 避免文章内容提前闭合标签。
  const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const head = `<title>${escapeHtml(data.title === siteConfig.title ? data.title : `${data.title} · ${siteConfig.title}`)}</title>
<meta name="description" content="${escapeHtml(data.description)}">
<link rel="icon" href="/favicon.ico">
<style>:root{--site-bg:${uiConfig.themeColors.light.background};--site-text:${uiConfig.themeColors.light.text}}:root.dark{--site-bg:${uiConfig.themeColors.dark.background};--site-text:${uiConfig.themeColors.dark.text}}</style>
<script>try{var t=localStorage.getItem('theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){document.documentElement.classList.toggle('dark',matchMedia('(prefers-color-scheme: dark)').matches)}</script>`;
  return template.replace('<!--site-head-->', () => head)
    .replace('<!--site-html-->', () => renderToString(<Page data={data} />))
    .replace('<!--site-data-->', () => json);
}
