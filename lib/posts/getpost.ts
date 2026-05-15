import { getAllPosts, type PostMeta } from '@/lib/posts/getposts'

export function getPostBySlug(
  category: string,
  slug: string
): { meta: PostMeta; rawContent: string } | null {
  const { posts } = getAllPosts()
  const post = posts.find(
    p => p.post_category === category && p.post_path.endsWith(`/${slug}`)
  )

  if (!post) return null

  return { meta: post, rawContent: post.post_content }
}
