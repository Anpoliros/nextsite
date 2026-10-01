/** 开发预览：按请求生成页面，共用生产路由和模板，接入 Vite 热更新。 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { serveFile } from '../scripts/static-server.mjs';
import type { Route } from './routes';

const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'custom' });
vite.watcher.add(path.resolve('articles/content'));
vite.watcher.add(path.resolve('articles/images'));
let cached: Route[] | undefined;
let previousFactory: unknown;
vite.watcher.on('all', () => { cached = undefined; });

const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    if (pathname.startsWith('/images/') && await serveFile(req, res, 'articles/images', pathname.slice(7))) return;
    if (pathname === '/favicon.ico' && await serveFile(req, res, 'public', pathname)) return;
    vite.middlewares(req, res, async () => {
      try {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
        }
        const { createRoutes, notFoundPage } = await vite.ssrLoadModule('/build/routes.ts');
        if (!cached || previousFactory !== createRoutes) {
          cached = createRoutes(); previousFactory = createRoutes;
        }
        const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
        const route = cached!.find(item => decodeURIComponent(item.path) === decodeURIComponent(normalized));
        const data = route ? await route.load() : notFoundPage;
        const { renderPage } = await vite.ssrLoadModule('/build/render.tsx');
        const template = await vite.transformIndexHtml(pathname, await readFile('index.html', 'utf8'));
        res.writeHead(route && data.kind !== 'not-found' ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(req.method === 'HEAD' ? undefined : renderPage(data, template));
      } catch (error) {
        if (error instanceof Error) vite.ssrFixStacktrace(error);
        console.error(error);
        res.writeHead(500); res.end('开发预览失败，详情见终端');
      }
    });
  } catch (error) {
    console.error(error); res.writeHead(500); res.end('开发预览失败');
  }
});
const port = Number(process.env.PORT || 5173);
server.listen(port, '127.0.0.1', () => console.log(`开发预览：http://127.0.0.1:${port}`));
