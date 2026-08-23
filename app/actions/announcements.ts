'use server'

import { db } from '@/lib/db'
import { announcements, user } from '@/lib/db/schema'
import { and, desc, eq, gt, isNull, lte, or } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm'

let announcementsTableReady: Promise<void> | null = null

function ensureAnnouncementsTable() {
  if (!announcementsTableReady) {
    announcementsTableReady = db.execute(sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        link_label TEXT,
        link_url TEXT,
        starts_at TIMESTAMP NOT NULL,
        ends_at TIMESTAMP,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by_id TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `).then(() => undefined)
  }
  return announcementsTableReady
}

async function requireAdminOrModerator() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Yetkisiz erişim')
  const [currentUser] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) throw new Error('Yetkisiz erişim')
  return session.user.id
}

function validateLink(url: string) {
  if (!url) return
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Duyuru bağlantısı yalnızca http veya https olabilir')
}

export async function getActiveAnnouncement() {
  await ensureAnnouncementsTable()
  const now = new Date()
  const [announcement] = await db.select().from(announcements).where(and(
    eq(announcements.active, true),
    lte(announcements.startsAt, now),
    or(isNull(announcements.endsAt), gt(announcements.endsAt, now)),
  )).orderBy(desc(announcements.startsAt), desc(announcements.id)).limit(1)
  return announcement ?? null
}

export async function getAnnouncements() {
  await requireAdminOrModerator()
  await ensureAnnouncementsTable()
  return db.select().from(announcements).orderBy(desc(announcements.startsAt), desc(announcements.id))
}

export async function createAnnouncement(data: {
  title: string
  content: string
  linkLabel?: string
  linkUrl?: string
  startsAt: string
  endsAt?: string
  active: boolean
}) {
  const userId = await requireAdminOrModerator()
  await ensureAnnouncementsTable()
  const title = data.title.trim()
  const content = data.content.trim()
  const linkLabel = data.linkLabel?.trim() || null
  const linkUrl = data.linkUrl?.trim() || ''
  if (!title || !content) throw new Error('Başlık ve içerik zorunludur')
  if (title.length > 160 || content.length > 2000 || linkLabel && linkLabel.length > 80 || linkUrl.length > 500) throw new Error('Duyuru alanlarından biri çok uzun')
  validateLink(linkUrl)
  const startsAt = new Date(data.startsAt)
  const endsAt = data.endsAt ? new Date(data.endsAt) : null
  if (Number.isNaN(startsAt.getTime()) || endsAt && Number.isNaN(endsAt.getTime()) || endsAt && endsAt <= startsAt) throw new Error('Duyuru tarihleri geçersiz')
  const [announcement] = await db.insert(announcements).values({ title, content, linkLabel, linkUrl: linkUrl || null, startsAt, endsAt, active: data.active, createdById: userId }).returning()
  revalidatePath('/')
  revalidatePath('/admin/duyurular')
  return announcement
}

export async function toggleAnnouncement(id: number, active: boolean) {
  await requireAdminOrModerator()
  await ensureAnnouncementsTable()
  await db.update(announcements).set({ active, updatedAt: new Date() }).where(eq(announcements.id, id))
  revalidatePath('/')
  revalidatePath('/admin/duyurular')
}

export async function deleteAnnouncement(id: number) {
  await requireAdminOrModerator()
  await ensureAnnouncementsTable()
  await db.delete(announcements).where(eq(announcements.id, id))
  revalidatePath('/')
  revalidatePath('/admin/duyurular')
}