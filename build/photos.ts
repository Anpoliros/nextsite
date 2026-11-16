/** 构建端相册：从 walking 正文的 Markdown 图片节点生成有限、均衡的候选池。 */
import path from 'node:path';
import { mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import sharp from 'sharp';
import type { PostMeta } from './content';
import type { Photo } from '../src/site/types';

/** 图片只接受内容仓库内的本地光栅图；忽略代码块、外链和越界路径。 */
export function markdownImages(content: string): { src: string; alt: string }[] {
  const images: { src: string; alt: string }[] = [];
  const tree = unified().use(remarkParse).parse(content);
  const definitions = new Map<string, string>();
  visit(tree, 'definition', node => { definitions.set(node.identifier, node.url); });
  const add = (src: string | undefined, alt: string | null | undefined) => {
    if (src && /^\/images\/.+\.(jpe?g|png|webp|avif)$/i.test(src))
      images.push({ src, alt: alt || '' });
  };
  visit(tree, 'image', node => { add(node.url, node.alt); });
  visit(tree, 'imageReference', node => { add(definitions.get(node.identifier), node.alt); });
  return images;
}

export async function buildPhotoGallery(posts: PostMeta[], outputDirectory?: string): Promise<Photo[]> {
  const imageRoot = path.resolve(process.env.ARTICLES_DIR || 'articles', 'images');
  const groups: Photo[][] = [];
  const used = new Set<string>();
  // 一篇文章最多两张；按文章轮流取图，避免单篇长图集垄断首页。
  for (const post of posts.filter(post => post.post_category === 'walking')) {
    const group: Photo[] = [];
    for (const image of markdownImages(post.post_content)) {
      let file: string;
      try { file = path.resolve(imageRoot, decodeURIComponent(image.src.slice('/images/'.length))); }
      catch { continue; }
      if (!file.startsWith(imageRoot + path.sep) || used.has(file)) continue;
      try {
        const metadata = await sharp(file).metadata();
        if (!metadata.width || !metadata.height || metadata.width < 400 || metadata.height < 250) continue;
        used.add(file);
        group.push({
          id: image.src, src: image.src, alt: image.alt || post.post_title,
          title: post.post_title, href: post.post_path, date: post.post_datetime,
          width: metadata.width, height: metadata.height,
        });
      } catch { continue; } // 缺图不阻断正文发布，也不进入首页候选池。
      if (group.length === 2) break;
    }
    if (group.length) groups.push(group);
    if (groups.length === 12) break;
  }
  const photos = [0, 1].flatMap(index => groups.flatMap(group => group[index] ? [group[index]] : [])).slice(0, 12);
  if (outputDirectory) {
    await mkdir(path.join(outputDirectory, 'photos'), { recursive: true });
    for (const photo of photos) {
      const file = path.resolve(imageRoot, decodeURIComponent(photo.src.slice('/images/'.length)));
      const bytes = await readFile(file);
      const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
      const filename = `${hash}.webp`;
      const result = await sharp(bytes).rotate().resize({ width: 1000, withoutEnlargement: true })
        .webp({ quality: 82 }).toFile(path.join(outputDirectory, 'photos', filename));
      photo.src = `/photos/${filename}`;
      photo.width = result.width;
      photo.height = result.height;
    }
  }
  return photos;
}
