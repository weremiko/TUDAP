import nodemailer from 'nodemailer'
import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { ensureKeynoteTable, signKeynoteTicket } from '@/lib/keynote'

const attempts = new Map<string, { startedAt: number; count: number }>()

function rateLimited(ip: string) {
  const now = Date.now()
  const current = attempts.get(ip)
  if (!current || now - current.startedAt > 60 * 60 * 1000) {
    attempts.set(ip, { startedAt: now, count: 1 })
    return false
  }
  current.count += 1
  return current.count > 10
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ success: true, message: 'E-posta adresi kayıtlıysa kurtarma bağlantısı gönderilir.' })
  }

  try {
    const raw = await request.text()
    if (raw.length > 2_000) return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
    const data = JSON.parse(raw) as { email?: unknown }
    if (typeof data.email !== 'string') return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 })

    const email = data.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 })
    }

    await ensureKeynoteTable()
    const result = await db.execute(sql`
      SELECT id, first_name, last_name
      FROM keynote_registrations
      WHERE lower(email) = ${email}
      LIMIT 1
    `)
    const registration = result.rows[0] as { id?: string; first_name?: string; last_name?: string } | undefined

    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
    let ticketUrl: string | undefined
    if (registration?.id) {
      const signature = signKeynoteTicket(registration.id)
      ticketUrl = new URL(
        `/keynote/verify/${encodeURIComponent(registration.id)}?sig=${signature}`,
        request.nextUrl.origin,
      ).toString()

      if (!smtpConfigured) {
        return NextResponse.json({
          success: true,
          message: 'E-posta adresi kayıtlıysa kurtarma bağlantısı gönderilir.',
        })
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })

      const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
      })[character]!)
      const attendeeName = escapeHtml(`${registration.first_name ?? ''} ${registration.last_name ?? ''}`.trim())
      const safeTicketUrl = escapeHtml(ticketUrl)

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@dilbilim.org.tr',
        to: email,
        subject: 'KEYNOTE’26 - Bilet kurtarma bağlantınız',
        text: `Merhaba ${registration.first_name ?? ''} ${registration.last_name ?? ''},\n\nKEYNOTE’26 biletinizin doğrulama bağlantısı:\n${ticketUrl}\n\nBu bağlantıyı yalnızca siz saklayın.`,
        html: `<p>Merhaba ${attendeeName},</p><p>KEYNOTE’26 biletinizi görüntülemek için aşağıdaki bağlantıyı kullanın:</p><p><a href="${safeTicketUrl}">Biletimi görüntüle</a></p><p>Bu bağlantıyı yalnızca siz saklayın.</p>`,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'E-posta adresi kayıtlıysa kurtarma bağlantısı gönderilir.',
    })
  } catch (error) {
    console.error('[keynote-recovery]', error)
    return NextResponse.json({
      success: true,
      message: 'E-posta adresi kayıtlıysa kurtarma bağlantısı gönderilir.',
    })
  }
}
