import fs from 'fs'
import matter from 'gray-matter'
import { renderMarkdownContent } from '@/lib/markdown'
import { getAllPosts, type PostMeta } from '@/lib/posts/getposts'

export async function getPostBySlug(
  category: string,
  slug: string
): Promise<{ meta: PostMeta; content: string } | null> {
  const { posts } = getAllPosts()
  const post = posts.find(
    p => p.post_category === category && p.post_path.endsWith(`/${slug}`)
  )

  if (!post) return null

  const { content } = matter(fs.readFileSync(post.post_filepath, 'utf-8'))
  const html = await renderMarkdownContent(content)

  return { meta: post, content: html }
}
