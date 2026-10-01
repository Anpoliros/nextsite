/** 构建端渲染入口：输出可被 React 接管的 HTML。 */
import { renderToString } from 'react-dom/server';
import Page from '../src/site/Page';
import type { PageData } from '../src/site/types';
export function renderPage(data: PageData) {
  return renderToString(<Page data={data} />);
}
