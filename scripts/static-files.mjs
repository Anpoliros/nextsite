/** 静态文件响应工具：开发预览与生产服务共用路径检查、MIME 和缓存规则。 */
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

export const mime = {
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
