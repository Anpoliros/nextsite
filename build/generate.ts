/** 静态生成入口：在临时目录完成构建，成功后替换 dist，失败保留旧产物。 */
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { createRoutes } from './routes';
import type { PageData } from '../src/site/types';

const staging = path.resolve('.build/site');
const output = path.resolve('dist');
const previous = path.resolve('.build/previous');

// ============================== 构建和输出 ==============================
await mkdir('.build', { recursive: true });
await build({ build: { outDir: staging, emptyOutDir: true } });
await build({ build: { ssr: 'build/render.tsx', outDir: '.build/render', emptyOutDir: true, manifest: false, rollupOptions: { output: { entryFileNames: 'render.mjs' } } } });
const modulePath = path.resolve('.build/render/render.mjs');
const { renderPage } = await import(modulePath) as { renderPage: (data: PageData, template: string) => string };
const template = await readFile(path.join(staging, 'index.html'), 'utf8');
// 直接复制文章图片；构建不会改写原始 Markdown 或更新子模块。
await cp('articles/images', path.join(staging, 'images'), { recursive: true });
const routes = createRoutes();
for (const route of routes) {
  const decoded = decodeURIComponent(route.path);
  const file = route.path === '/404/' ? path.join(staging, '404.html') : path.resolve(staging, `.${decoded}`, 'index.html');
  if (!file.startsWith(`${staging}${path.sep}`)) throw new Error(`页面路径越界：${route.path}`);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, renderPage(await route.load(), template));
}
await writeFile(path.join(staging, 'routes.json'), JSON.stringify(routes.map(route => route.path), null, 2));
await rm(path.join(staging, '.vite'), { recursive: true, force: true });

// ============================== 发布构建产物 ==============================
await rm(previous, { recursive: true, force: true });
let moved = false;
try { await rename(output, previous); moved = true; } catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}
try { await rename(staging, output); } catch (error) {
  if (moved) await rename(previous, output);
  throw error;
}
await rm(previous, { recursive: true, force: true });
console.log(`已生成 ${routes.length} 个静态页面 → dist/`);
