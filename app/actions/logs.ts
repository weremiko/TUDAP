'use server'

import { db } from '@/lib/db'
import { queryLogs, user } from '@/lib/db/schema'
import { desc, count, ilike, or, and, gte, eq, lte } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function saveQueryLog(data: {
  inputText: string
  ipaOutput: string
  transcriptionType: 'broad' | 'narrow'
  charCount: number
}) {
  // No auth required — any visitor's transcription is logged
  try {
    await db.insert(queryLogs).values(data)
  } catch {
    // Silently fail — logging should never break the main UX
  }
}

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!u || u.role !== 'admin') throw new Error('Forbidden')
}

export async function getQueryLogsAdmin(page: number, search: string) {
  await requireAdmin()
  const PER_PAGE = 20
  const offset = (page - 1) * PER_PAGE

  const where = search
    ? or(ilike(queryLogs.inputText, `%${search}%`), ilike(queryLogs.ipaOutput, `%${search}%`))
    : undefined

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(queryLogs)
      .where(where)
      .orderBy(desc(queryLogs.createdAt))
      .limit(PER_PAGE)
      .offset(offset),
    db.select({ total: count() }).from(queryLogs).where(where),
  ])

  return { rows, total: Number(total), pages: Math.max(1, Math.ceil(Number(total) / PER_PAGE)) }
}

export async function clearAllQueryLogs() {
  await requireAdmin()
  await db.delete(queryLogs)
}

export async function getLogStats() {
  await requireAdmin()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [[{ total }], [{ todayCount }]] = await Promise.all([
    db.select({ total: count() }).from(queryLogs),
    db.select({ todayCount: count() }).from(queryLogs).where(gte(queryLogs.createdAt, today)),
  ])
  return { total: Number(total), today: Number(todayCount) }
}

// Check if user reached daily query limit (5 for anonymous, unlimited for authenticated)
export async function checkQueryLimit(): Promise<{ allowed: boolean; remaining: number }> {
  const session = await auth.api.getSession({ headers: await headers() })
  
  // Authenticated users have no limit
  if (session?.user) {
    return { allowed: true, remaining: -1 }
  }
  
  // Anonymous: 5 queries per day limit
  // Note: This is client-side verified via sessionStorage key count
  // Server-side enforcement happens here but client tracks actual usage
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const [{ count: queriestoday }] = await db
    .select({ count: count() })
    .from(queryLogs)
    .where(
      and(
        gte(queryLogs.createdAt, today),
        lte(queryLogs.createdAt, tomorrow)
      )
    )
  
  const used = Number(queriestoday)
  const limit = 5
  const remaining = Math.max(0, limit - used)
  
  return { allowed: used < limit, remaining }
}

export async function exportQueryLogs(format: 'csv' | 'json') {
  await requireAdmin()
  const rows = await db.select().from(queryLogs).orderBy(desc(queryLogs.createdAt))
  
  if (format === 'json') {
    return JSON.stringify(rows, null, 2)
  }
  
  // CSV format
  const headers = ['ID', 'Giriş', 'IPA Çıktısı', 'Tür', 'Karakter', 'Tarih']
  const csvRows = rows.map(r => [
    r.id,
    `"${(r.inputText || '').replace(/"/g, '""')}"`,
    `"${(r.ipaOutput || '').replace(/"/g, '""')}"`,
    r.transcriptionType,
    r.charCount,
    r.createdAt.toISOString(),
  ])
  
  const csv = [headers, ...csvRows].map(row => row.join(',')).join('\n')
  return csv
}
