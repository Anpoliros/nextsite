#!/usr/bin/env node
/** 生产静态服务入口：由 Node 或 PM2 启动，生产环境不执行页面渲染。 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { serveFile, mime } from './static-files.mjs';

const root = path.resolve(process.env.SITE_DIR || 'dist');
await stat(path.join(root, 'index.html'));
const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
    }
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname !== '/404/' && pathname !== '/404.html' && await serveFile(req, res, root, pathname)) return;
    const body = await readFile(path.join(root, '404.html'));
    res.writeHead(404, { 'Content-Type': mime['.html'], 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500);
    res.end('Internal server error');
  }
});
server.listen(Number(process.env.PORT || 12121), process.env.HOST || '127.0.0.1', () => {
  console.log(`静态博客：http://${process.env.HOST || '127.0.0.1'}:${server.address().port}`);
});
