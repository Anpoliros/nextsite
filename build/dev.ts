/** 开发预览：按请求生成页面，共用生产路由和模板，接入 Vite 热更新。 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { serveFile } from '../scripts/static-files.mjs';
import type { Route } from './routes';

const server = createServer();
const vite = await createViteServer({
  server: { middlewareMode: true, hmr: { server } }, appType: 'custom',
});
const articlesRoot = path.resolve(process.env.ARTICLES_DIR || 'articles');
vite.watcher.add(path.join(articlesRoot, 'content'));
vite.watcher.add(path.join(articlesRoot, 'images'));
let cached: Route[] | undefined;
let previousFactory: unknown;
vite.watcher.on('all', (_event, filename) => {
  cached = undefined;
  const relative = path.relative(process.cwd(), filename).replaceAll(path.sep, '/');
  // 内容与构建模块不在客户端依赖图中，需要主动刷新预生成的数据。
  if (['articles/content/', 'articles/images/', 'build/', 'src/config/'].some(prefix => relative.startsWith(prefix))) {
    vite.ws.send({ type: 'full-reload' });
  }
});

server.on('request', async (req, res) => {
  try {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    if (pathname.startsWith('/images/') && await serveFile(req, res, path.join(articlesRoot, 'images'), pathname.slice(7))) return;
    if (pathname === '/favicon.ico' && await serveFile(req, res, 'public', pathname)) return;
    vite.middlewares(req, res, async () => {
      try {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
        }
        const { createRoutes, notFoundPage } = await vite.ssrLoadModule('/build/routes.ts');
        if (!cached || previousFactory !== createRoutes) {
          cached = await createRoutes(); previousFactory = createRoutes;
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
const host = process.env.HOST || '127.0.0.1';
server.listen(port, host, () => console.log(`开发预览：http://${host}:${port}`));
