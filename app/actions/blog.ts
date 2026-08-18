'use server'

import { db } from '@/lib/db'
import { blogPosts, user } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function requireAdminOrModerator() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [u] = await db.select({ role: user.role, name: user.name })
    .from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!u || (u.role !== 'admin' && u.role !== 'moderator')) throw new Error('Forbidden')
  return { userId: session.user.id, userName: u.name }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function getBlogPosts(page = 1, limit = 10, publishedOnly = true) {
  const offset = (page - 1) * limit
  const where = publishedOnly ? eq(blogPosts.published, true) : undefined

  const [posts, [{ total }]] = await Promise.all([
    db.select().from(blogPosts)
      .where(where)
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit).offset(offset),
    db.select({ total: count() }).from(blogPosts).where(where),
  ])

  return { posts, total: Number(total), pages: Math.ceil(Number(total) / limit) }
}

export async function getBlogPostBySlug(slug: string) {
  const [post] = await db.select().from(blogPosts)
    .where(eq(blogPosts.slug, slug)).limit(1)
  return post ?? null
}

export async function getAdminBlogPosts(page = 1, limit = 20) {
  await requireAdminOrModerator()
  const offset = (page - 1) * limit
  const [posts, [{ total }]] = await Promise.all([
    db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(blogPosts),
  ])
  return { posts, total: Number(total), pages: Math.ceil(Number(total) / limit) }
}

export async function createBlogPost(data: {
  title: string
  content: string
  excerpt: string
  published: boolean
  authorName?: string
  tags?: string
}) {
  const { userId, userName } = await requireAdminOrModerator()

  if (!data.title.trim()) throw new Error('Başlık boş olamaz')
  if (!data.content.trim()) throw new Error('İçerik boş olamaz')

  let slug = generateSlug(data.title)
  const existing = await db.select({ id: blogPosts.id })
    .from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1)
  if (existing.length > 0) slug = `${slug}-${Date.now()}`

  const [post] = await db.insert(blogPosts).values({
    title: data.title.trim(),
    slug,
    content: data.content.trim(),
    excerpt: data.excerpt.trim(),
    authorId: userId,
    authorName: data.authorName?.trim() || userName,
    tags: data.tags?.trim() || '',
    published: data.published,
  }).returning()

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  return post
}

export async function updateBlogPost(id: number, data: {
  title: string
  content: string
  excerpt: string
  published: boolean
  authorName?: string
  tags?: string
}) {
  const { userName } = await requireAdminOrModerator()

  if (!data.title.trim()) throw new Error('Başlık boş olamaz')

  await db.update(blogPosts).set({
    title: data.title.trim(),
    content: data.content.trim(),
    excerpt: data.excerpt.trim(),
    authorName: data.authorName?.trim() || userName,
    tags: data.tags?.trim() || '',
    published: data.published,
    updatedAt: new Date(),
  }).where(eq(blogPosts.id, id))

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}

export async function toggleBlogPostPublished(id: number, published: boolean) {
  await requireAdminOrModerator()
  await db.update(blogPosts).set({ published, updatedAt: new Date() })
    .where(eq(blogPosts.id, id))
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}

export async function deleteBlogPost(id: number) {
  await requireAdminOrModerator()
  await db.delete(blogPosts).where(eq(blogPosts.id, id))
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}
