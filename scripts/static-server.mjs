#!/usr/bin/env node
/** 静态文件服务：用于现有反向代理和 PM2，生产环境不执行页面渲染。 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

// ============================== 静态资源 ==============================
export async function serveFile(req, res, root, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch {
    res.writeHead(400); res.end('Invalid URL'); return true;
  }
  if (decoded.includes('\0') || decoded.split('/').some(part => part.startsWith('.'))) return false;
  const base = path.resolve(root);
  let file = path.resolve(base, `.${decoded}`);
  if (file !== base && !file.startsWith(`${base}${path.sep}`)) return false;
  try {
    const info = await stat(file);
    if (info.isDirectory()) {
      file = path.join(file, 'index.html');
      await stat(file);
      if (!pathname.endsWith('/')) {
        res.writeHead(308, { location: `${pathname}/${new URL(req.url, 'http://localhost').search}` });
        res.end(); return true;
      }
    }
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR' || error.code === 'EISDIR') return false;
    throw error;
  }
}

// ============================== 服务入口 ==============================
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
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
    console.log(`静态博客：http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 12121}`);
  });
}
