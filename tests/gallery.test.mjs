/** 相册构建的内容边界：AST 提取、均衡抽样、图片过滤与缩略图产物。 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { tsImport } from 'tsx/esm/api';
const { markdownImages, buildPhotoGallery } = await tsImport('../build/photos.ts', import.meta.url);

test('只从 Markdown 图片节点读取候选，包括引用式图片，排除代码块和外链', () => {
  const source = '![图](/images/a.jpeg)\n![引用][pic]\n\n[pic]: /images/b.png\n```md\n![](/images/code.jpeg)\n```\n![](https://example.com/x.jpg)';
  assert.deepEqual(markdownImages(source).map(image => image.src), ['/images/a.jpeg', '/images/b.png']);
});

test('排除小图、缺图、越界和重复图，按文章轮流选图，并生成有限宽度 webp', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'weblog-gallery-'));
  const old = process.env.ARTICLES_DIR;
  process.env.ARTICLES_DIR = root;
  try {
    await mkdir(path.join(root, 'images'));
    for (const name of ['a', 'b', 'c', 'd']) await sharp({ create: { width: 1400, height: 900, channels: 3, background: '#aabbcc' } }).jpeg().toFile(path.join(root, 'images', `${name}.jpeg`));
    await sharp({ create: { width: 32, height: 32, channels: 3, background: '#aaa' } }).png().toFile(path.join(root, 'images', 'tiny.png'));
    const post = (id, category, content) => ({ post_title: id, post_path: `/walking/${id}/`, post_category: category, post_content: content, post_datetime: '2026-01-01' });
    const posts = [
      post('one', 'walking', '![](/images/tiny.png)\n![](/images/missing.jpeg)\n![](/images/%2e%2e/private.jpeg)\n![](/images/a.jpeg)\n![](/images/b.jpeg)\n![](/images/c.jpeg)'),
      post('two', 'walking', '![](/images/a.jpeg)\n![](/images/d.jpeg)'),
      post('three', 'developer', '![](/images/c.jpeg)'),
    ];
    const gallery = await buildPhotoGallery(posts);
    assert.deepEqual(gallery.map(photo => photo.id), ['/images/a.jpeg', '/images/d.jpeg', '/images/b.jpeg']);
    assert.equal(gallery[1].title, 'two');
    assert.equal(gallery[1].date, '2026-01-01');
    const output = path.join(root, 'output');
    const optimized = await buildPhotoGallery(posts, output);
    for (const photo of optimized) {
      assert(photo.width <= 1000);
      assert.match(photo.src, /^\/photos\/[a-f0-9]{16}\.webp$/);
      assert((await stat(path.join(output, photo.src))).size > 0);
    }
    assert.deepEqual(await buildPhotoGallery([]), []);
  } finally {
    if (old === undefined) delete process.env.ARTICLES_DIR; else process.env.ARTICLES_DIR = old;
    await rm(root, { recursive: true, force: true });
  }
});
