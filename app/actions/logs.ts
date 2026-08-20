'use server'

import { db } from '@/lib/db'
import { queryLogs, user } from '@/lib/db/schema'
import { desc, count, ilike, or, and, gte, eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const ANONYMOUS_MINUTE_LIMIT = 10
const MEMBER_MINUTE_LIMIT = 60

let queryRateColumnsReady: Promise<void> | null = null

export function ensureQueryRateColumns() {
  if (!queryRateColumnsReady) {
    queryRateColumnsReady = db.execute(sql`
      ALTER TABLE query_logs
        ADD COLUMN IF NOT EXISTS ip_address TEXT,
        ADD COLUMN IF NOT EXISTS user_id TEXT
    `).then(() => undefined)
  }
  return queryRateColumnsReady
}

function getClientIp(requestHeaders: Headers): string {
  return requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
    || requestHeaders.get('x-real-ip')
    || 'unknown'
}

async function getUserRole(userId: string): Promise<string | null> {
  const [account] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  return account?.role ?? null
}

export async function saveQueryLog(data: {
  inputText: string
  ipaOutput: string
  transcriptionType: 'broad' | 'narrow'
  charCount: number
}) {
  try {
    await ensureQueryRateColumns()
    const requestHeaders = await headers()
    const session = await auth.api.getSession({ headers: requestHeaders })
    await db.insert(queryLogs).values({
      ...data,
      ipAddress: getClientIp(requestHeaders),
      userId: session?.user?.id ?? null,
    })
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

// Anonymous: 10/minute by IP. Members: 60/minute.
// Admins and moderators are intentionally unlimited.
export async function checkQueryLimit(): Promise<{ allowed: boolean; remaining: number }> {
  await ensureQueryRateColumns()
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  let subject: ReturnType<typeof eq>
  let minuteLimit: number

  if (session?.user) {
    const role = await getUserRole(session.user.id)
    if (role === 'admin' || role === 'moderator') {
      return { allowed: true, remaining: -1 }
    }
    subject = eq(queryLogs.userId, session.user.id)
    minuteLimit = MEMBER_MINUTE_LIMIT
  } else {
    subject = eq(queryLogs.ipAddress, getClientIp(requestHeaders))
    minuteLimit = ANONYMOUS_MINUTE_LIMIT
  }

  const now = new Date()
  const minuteStart = new Date(now.getTime() - 60_000)
  const [{ minuteCount }] = await db
    .select({ minuteCount: count() })
    .from(queryLogs)
    .where(and(subject, gte(queryLogs.createdAt, minuteStart)))

  const minuteRemaining = Math.max(0, minuteLimit - Number(minuteCount))
  return {
    allowed: minuteRemaining > 0,
    remaining: minuteRemaining,
  }
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
