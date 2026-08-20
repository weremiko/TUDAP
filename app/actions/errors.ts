'use server'

import { db } from '@/lib/db'
import { errorReports, user } from '@/lib/db/schema'
import { desc, count, eq, gte, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import PDFDocument from 'pdfkit'

let errorColumnsReady: Promise<void> | null = null

function ensureErrorColumns() {
  if (!errorColumnsReady) {
    errorColumnsReady = db.execute(sql`
      ALTER TABLE error_reports
        ADD COLUMN IF NOT EXISTS user_id TEXT,
        ADD COLUMN IF NOT EXISTS report_type TEXT NOT NULL DEFAULT 'error',
        ADD COLUMN IF NOT EXISTS points_awarded BOOLEAN NOT NULL DEFAULT FALSE
    `).then(() => undefined)
  }
  return errorColumnsReady
}

async function requireAdminOrModerator() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  
  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!u || (u.role !== 'admin' && u.role !== 'moderator')) throw new Error('Forbidden')
}

export async function saveErrorReport(data: {
  message: string
  userEmail?: string
  url?: string
  errorWord?: string
  reportType?: 'error' | 'term-suggestion'
}) {
  try {
    await ensureErrorColumns()
    const session = await auth.api.getSession({ headers: await headers() })
    await db.insert(errorReports).values({
      message: data.message || '',
      userEmail: data.userEmail || 'anonymous',
      url: data.url || '',
      errorWord: data.errorWord || '',
      userId: session?.user?.id ?? null,
      reportType: data.reportType || 'error',
    })
  } catch (error) {
    console.error('[v0] Error saving error report:', error)
  }
}

export async function getErrorReports(page: number = 1, search: string = '') {
  await requireAdminOrModerator()
  await ensureErrorColumns()
  
  const PER_PAGE = 20
  const offset = (page - 1) * PER_PAGE
  
  const where = search
    ? { message: search }
    : undefined

  const [reports, [{ total }]] = await Promise.all([
    db.select()
      .from(errorReports)
      .orderBy(desc(errorReports.createdAt))
      .limit(PER_PAGE)
      .offset(offset),
    db.select({ total: count() }).from(errorReports),
  ])

  return {
    reports,
    page,
    total: Number(total),
    pages: Math.ceil(Number(total) / PER_PAGE),
  }
}

export async function getErrorStats() {
  await requireAdminOrModerator()
  await ensureErrorColumns()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [[{ total }], [{ todayCount }]] = await Promise.all([
    db.select({ total: count() }).from(errorReports),
    db.select({ todayCount: count() })
      .from(errorReports)
      .where(gte(errorReports.createdAt, today)),
  ])
  return { total: Number(total), today: Number(todayCount) }
}

export async function markErrorAsResolved(id: number) {
  await requireAdminOrModerator()
  await ensureErrorColumns()
  const [report] = await db.select({ userId: errorReports.userId, pointsAwarded: errorReports.pointsAwarded, resolved: errorReports.resolved })
    .from(errorReports).where(eq(errorReports.id, id)).limit(1)
  if (!report || report.resolved) return
  await db.transaction(async (tx) => {
    await tx.update(errorReports).set({ resolved: true, pointsAwarded: Boolean(report.userId) }).where(eq(errorReports.id, id))
    if (report.userId && !report.pointsAwarded) {
      await tx.update(user).set({ points: sql`${user.points} + 10` }).where(eq(user.id, report.userId))
    }
  })
}

export async function exportErrorsToPDF() {
  await requireAdminOrModerator()
  await ensureErrorColumns()
  const reports = await db.select().from(errorReports).orderBy(desc(errorReports.createdAt))
  
  const doc = new PDFDocument()
  const chunks: Buffer[] = []
  
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))
  
  // Title
  doc.fontSize(20).font('Helvetica-Bold').text('TÜDAP Hata Raporları', 50, 50)
  doc.fontSize(10).font('Helvetica').text(`İçe Aktarım Tarihi: ${new Date().toLocaleString('tr-TR')}`, 50, 80)
  
  // Summary
  doc.fontSize(12).font('Helvetica-Bold').text('Özet', 50, 110)
  doc.fontSize(10).font('Helvetica')
  doc.text(`Toplam Raporlar: ${reports.length}`, 70, 130)
  doc.text(`Çözülenler: ${reports.filter(r => r.resolved).length}`, 70, 150)
  doc.text(`Çözülmeyenler: ${reports.filter(r => !r.resolved).length}`, 70, 170)
  
  // Reports
  let y = 210
  doc.fontSize(12).font('Helvetica-Bold').text('Raporlar', 50, y)
  y += 25
  
  reports.forEach((report, idx) => {
    if (y > 750) {
      doc.addPage()
      y = 50
    }
    
    const status = report.resolved ? '✓ Çözüldü' : '✗ Açık'
    doc.fontSize(10).font('Helvetica-Bold').text(`#${idx + 1} ${status}`, 50, y)
    y += 18
    
    doc.fontSize(9).font('Helvetica')
    doc.text(`Email: ${report.userEmail}`, 60, y)
    y += 15
    
    if (report.errorWord) {
      doc.text(`Hatalı Sözcük: ${report.errorWord}`, 60, y)
      y += 15
    }
    
    doc.text(`Açıklama: ${report.message}`, 60, y, { width: 450, align: 'left' })
    y += Math.min(60, report.message.length / 10)
    
    if (report.url) {
      doc.text(`URL: ${report.url}`, 60, y, { width: 450 })
      y += 20
    }
    
    doc.text(`Tarih: ${report.createdAt.toLocaleString('tr-TR')}`, 60, y)
    y += 25
    
    doc.moveTo(50, y).lineTo(550, y).stroke()
    y += 15
  })
  
  doc.end()
  
  return new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    doc.on('error', reject)
  })
}
