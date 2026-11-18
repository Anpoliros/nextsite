/** 静态站点集成验证：实际构建产物、页面数据安全和生产 HTTP 行为。 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { before, after, test } from 'node:test';
import { renderPage } from '../.build/render/render.mjs';

const routes = JSON.parse(await readFile('dist/routes.json', 'utf8'));
const routeSet = new Set(routes);
let server;
let base;
before(async () => {
  // 模拟 PM2 的模块加载方式，确保入口不依赖 process.argv[1]。
  server = spawn(process.execPath, ['--input-type=module', '-e', "await import('./scripts/static-server.mjs')"], {
    env: { ...process.env, PORT: '0', HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('静态服务启动超时')), 10000);
    server.once('error', error => { clearTimeout(timeout); reject(error); });
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`静态服务意外退出：${code}`)); });
    server.stdout.on('data', chunk => {
      const match = chunk.toString().match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) { base = match[0]; clearTimeout(timeout); resolve(); }
    });
  });
});
after(() => server?.kill());

function assertRoute(url) {
  assert(routeSet.has(`${url.replace(/\/$/, '')}/`), `界面链接缺少对应页面：${url}`);
}

test('只有主页和文章内容页，HTML、相册与篇间导航指向已生成路由', async () => {
  for (const route of routes) {
    const filename = route === '/404/' ? 'dist/404.html' : path.join('dist', decodeURIComponent(route), 'index.html');
    const html = await readFile(filename, 'utf8');
    assert(!html.includes('<!--site-'), route);
    assert.match(html, /<h1[ >]/);
    const json = html.match(/<script id="page-data" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
    assert(json, route);
    const data = JSON.parse(json);
    assert.equal(data.path, route);
    assert(!json.includes('post_filepath'));
    assert(!json.includes('post_content'));
    for (const item of [...(data.articles || []), ...(data.pinnedArticles || [])]) assertRoute(`/${item.id}`);
    for (const item of [data.prevPost, data.nextPost, data.randomPost].filter(Boolean)) assertRoute(item.post_path);
    assert(['home', 'article', 'not-found'].includes(data.kind));
    if (data.kind === 'home') for (const photo of data.photos) {
      assertRoute(photo.href);
      assert.match(photo.src, /^\/photos\/[a-f0-9]+\.webp$/);
      assert.equal((await fetch(base + photo.src)).status, 200);
    }
    const response = await fetch(base + route);
    assert.equal(response.status, route === '/404/' ? 404 : 200, route);
  }
});

test('页面数据不会闭合 script，模板保留美元符号原文', () => {
  const title = '标题 </script><script>bad()</script> $&';
  const data = { kind: 'not-found', title, description: '"<>&', path: '/404/' };
  const template = '<head><!--site-head--></head><div><!--site-html--></div><script id="page-data" type="application/json"><!--site-data--></script>';
  const html = renderPage(data, template);
  assert(!html.includes('<script>bad()</script>'));
  assert(html.includes('$&'));
  const json = html.match(/<script id="page-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(json).title, title);
});

test('静态 HTTP 提供正确状态码、HEAD、类型和缓存策略', async () => {
  const missing = await fetch(base + '/unknown/page/');
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /页面不存在/);
  const head = await fetch(base + '/', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.match(head.headers.get('content-type'), /text\/html/);
  assert.equal(head.headers.get('cache-control'), 'no-cache');
  const redirect = await fetch(base + '/developer/auto-deploy', { redirect: 'manual' });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get('location'), '/developer/auto-deploy/');
  assert.equal((await fetch(base + '/', { method: 'POST' })).status, 405);
  assert.equal((await fetch(base + '/%2e%2e%2fpackage.json')).status, 404);
  const html = await readFile('dist/index.html', 'utf8');
  const script = html.match(/src="(\/assets\/[^"]+\.js)"/)[1];
  const asset = await fetch(base + script);
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get('cache-control'), /immutable/);
  const code = await asset.text();
  for (const serverImport of ['node:fs', 'node:child_process', 'sharp/lib', 'remark-parse']) assert(!code.includes(serverImport), serverImport);
});

// 分类/tag 路由在本轮迁移中明确移除，避免残留导航造成半迁移状态。
test('分类和 tag 页面均返回 404', async () => {
  for (const url of ['/walking/', '/speaking/', '/hardware/', '/developer/', '/tags/', '/tags/anime/']) {
    assert.equal((await fetch(base + url)).status, 404, url);
    assert(!routeSet.has(url));
  }
});
