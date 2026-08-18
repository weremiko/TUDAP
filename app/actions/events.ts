'use server'

import { db } from '@/lib/db'
import { events, user } from '@/lib/db/schema'
import { desc, eq, gte } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function checkAdminOrModerator() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!u || (u.role !== 'admin' && u.role !== 'moderator')) throw new Error('Forbidden')
  return session.user.id
}

export async function getEvents() {
  return await db.select().from(events)
    .where(gte(events.date, new Date()))
    .orderBy(events.date)
}

export async function getAllEvents() {
  return await db.select().from(events).orderBy(desc(events.date))
}

export async function addEvent(data: {
  title: string
  description: string
  eventType: string
  date: Date
  endDate?: Date | null
  location: string
  organizer: string
  url: string
  tags: string
}) {
  const userId = await checkAdminOrModerator()

  if (!data.title.trim()) throw new Error('Başlık gereklidir')

  const [newEvent] = await db.insert(events).values({
    title: data.title.trim(),
    description: data.description.trim(),
    eventType: data.eventType || 'seminar',
    date: data.date,
    endDate: data.endDate ?? null,
    location: data.location.trim(),
    organizer: data.organizer.trim(),
    url: data.url.trim(),
    tags: data.tags.trim(),
    createdById: userId,
  }).returning()

  // Email notification — fire and forget
  try {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@dilbilim.org.tr',
      to: 'eren@dilbilim.org.tr',
      subject: `Yeni Etkinlik: ${data.title}`,
      html: `
        <h2>Yeni Dilbilim Etkinliği Eklendi</h2>
        <p><strong>Başlık:</strong> ${data.title}</p>
        <p><strong>Tür:</strong> ${data.eventType}</p>
        <p><strong>Tarih:</strong> ${data.date.toLocaleString('tr-TR')}</p>
        <p><strong>Yer:</strong> ${data.location || '—'}</p>
        <p><strong>Düzenleyen:</strong> ${data.organizer || '—'}</p>
        ${data.url ? `<p><strong>Bağlantı:</strong> <a href="${data.url}">${data.url}</a></p>` : ''}
        ${data.description ? `<p><strong>Açıklama:</strong><br>${data.description.replace(/\n/g, '<br>')}</p>` : ''}
      `,
    })
  } catch (err) {
    console.error('[v0] Email gönderilemedi:', err)
  }

  revalidatePath('/ajanda')
  return newEvent
}

export async function updateEvent(id: number, data: {
  title: string
  description: string
  eventType: string
  date: Date
  endDate?: Date | null
  location: string
  organizer: string
  url: string
  tags: string
}) {
  await checkAdminOrModerator()
  if (!data.title.trim()) throw new Error('Başlık gereklidir')

  const [updated] = await db.update(events).set({
    title: data.title.trim(),
    description: data.description.trim(),
    eventType: data.eventType,
    date: data.date,
    endDate: data.endDate ?? null,
    location: data.location.trim(),
    organizer: data.organizer.trim(),
    url: data.url.trim(),
    tags: data.tags.trim(),
    updatedAt: new Date(),
  }).where(eq(events.id, id)).returning()

  revalidatePath('/ajanda')
  return updated
}

export async function deleteEvent(id: number) {
  await checkAdminOrModerator()
  await db.delete(events).where(eq(events.id, id))
  revalidatePath('/ajanda')
}
