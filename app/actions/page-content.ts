'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { pageSections } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

async function requireAdminOrModerator() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum açmanız gerekiyor')
  const role = (session.user as any).role
  if (role !== 'admin' && role !== 'moderator') throw new Error('Yetkisiz erişim')
  return { userId: session.user.id, userName: session.user.name ?? 'Admin' }
}

export type PageSection = {
  id: number
  page: string
  key: string
  label: string
  content: string
  sortOrder: number
  updatedAt: Date
}

export async function getPageSections(page: string): Promise<PageSection[]> {
  const rows = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.page, page))
    .orderBy(pageSections.sortOrder)
  return rows
}

export async function upsertPageSection(
  page: string,
  key: string,
  content: string
): Promise<void> {
  await requireAdminOrModerator()

  await db
    .update(pageSections)
    .set({ content: content.trim(), updatedAt: new Date() })
    .where(and(eq(pageSections.page, page), eq(pageSections.key, key)))

  revalidatePath(`/${page === 'hakkinda' ? 'hakkinda' : 'iletisim'}`)
  revalidatePath('/en/about')
  revalidatePath('/en/contact')
}

export async function upsertAllPageSections(
  page: string,
  updates: { key: string; content: string }[]
): Promise<void> {
  await requireAdminOrModerator()

  for (const { key, content } of updates) {
    await db
      .update(pageSections)
      .set({ content: content.trim(), updatedAt: new Date() })
      .where(and(eq(pageSections.page, page), eq(pageSections.key, key)))
  }

  revalidatePath(`/${page === 'hakkinda' ? 'hakkinda' : 'iletisim'}`)
  revalidatePath('/en/about')
  revalidatePath('/en/contact')
}
