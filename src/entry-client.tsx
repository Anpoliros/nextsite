/** 浏览器入口：读取构建时嵌入的数据，接管预生成页面。 */
import { hydrateRoot } from 'react-dom/client';
import './styles/globals.css';
import Page from './site/Page';
import type { PageData } from './site/types';

const dataElement = document.getElementById('page-data');
const root = document.getElementById('root');
if (root && dataElement?.textContent && !dataElement.textContent.includes('<!--')) {
  const data: PageData = JSON.parse(dataElement.textContent);
  hydrateRoot(root, <Page data={data} />);
}
