/** 页面组合入口：构建时输出 HTML，浏览器使用同一组件接管。 */
import type { PageData } from './types';
export default function Page({ data }: { data: PageData }) {
  return <main><h1>{data.title}</h1></main>;
}
