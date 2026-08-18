'use server'

import { db } from '@/lib/db'
import { glossaryEntries, user } from '@/lib/db/schema'
import { eq, ilike, or, desc, count, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

async function requireAdminOrModerator() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!u || (u.role !== 'admin' && u.role !== 'moderator')) throw new Error('Forbidden')
  return session.user
}

export async function getGlossaryPage(page: number, category: string, search: string) {
  const PER_PAGE = 20
  const offset = (page - 1) * PER_PAGE

  const catClause  = category && category !== 'Tümü' ? eq(glossaryEntries.category, category) : undefined
  const srchClause = search
    ? or(ilike(glossaryEntries.term, `%${search}%`), ilike(glossaryEntries.definition, `%${search}%`))
    : undefined
  const where = catClause && srchClause ? and(catClause, srchClause) : (catClause ?? srchClause)

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(glossaryEntries)
      .where(where)
      .orderBy(glossaryEntries.term)
      .limit(PER_PAGE)
      .offset(offset),
    db.select({ total: count() }).from(glossaryEntries).where(where),
  ])

  return { rows, total: Number(total), pages: Math.max(1, Math.ceil(Number(total) / PER_PAGE)) }
}

export async function getGlossaryCategories() {
  const rows = await db
    .selectDistinct({ category: glossaryEntries.category })
    .from(glossaryEntries)
    .orderBy(glossaryEntries.category)
  return ['Tümü', ...rows.map((r) => r.category)]
}

// Admin-only mutations
export async function addGlossaryEntry(data: {
  term: string
  phonetic: string
  category: string
  definition: string
  englishEquivalent: string
}) {
  await requireAdminOrModerator()
  await db.insert(glossaryEntries).values(data)
  revalidatePath('/terim-sozlugu')
  revalidatePath('/admin/sozluk')
}

export async function updateGlossaryEntry(id: number, data: {
  term?: string
  phonetic?: string
  category?: string
  definition?: string
  englishEquivalent?: string
}) {
  await requireAdminOrModerator()
  await db.update(glossaryEntries).set({ ...data, updatedAt: new Date() }).where(eq(glossaryEntries.id, id))
  revalidatePath('/terim-sozlugu')
  revalidatePath('/admin/sozluk')
}

export async function deleteGlossaryEntry(id: number) {
  await requireAdminOrModerator()
  await db.delete(glossaryEntries).where(eq(glossaryEntries.id, id))
  revalidatePath('/terim-sozlugu')
  revalidatePath('/admin/sozluk')
}

export async function bulkImportGlossary(entries: {
  term: string
  phonetic?: string
  category: string
  definition: string
  englishEquivalent?: string
}[]) {
  await requireAdminOrModerator()
  if (!entries.length) return { inserted: 0 }
  const rows = entries.map((e) => ({
    term: e.term.trim(),
    phonetic: e.phonetic?.trim() ?? '',
    category: e.category.trim(),
    definition: e.definition.trim(),
    englishEquivalent: e.englishEquivalent?.trim() ?? '',
  }))
  await db.insert(glossaryEntries).values(rows)
  revalidatePath('/terim-sozlugu')
  revalidatePath('/admin/sozluk')
  return { inserted: rows.length }
}

export async function getAllGlossaryAdmin(page: number, search: string) {
  await requireAdminOrModerator()
  const PER_PAGE = 20
  const offset = (page - 1) * PER_PAGE

  const where = search
    ? or(ilike(glossaryEntries.term, `%${search}%`), ilike(glossaryEntries.definition, `%${search}%`))
    : undefined

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(glossaryEntries)
      .where(where)
      .orderBy(desc(glossaryEntries.createdAt))
      .limit(PER_PAGE)
      .offset(offset),
    db.select({ total: count() }).from(glossaryEntries).where(where),
  ])

  return { rows, total: Number(total), pages: Math.max(1, Math.ceil(Number(total) / PER_PAGE)) }
}
