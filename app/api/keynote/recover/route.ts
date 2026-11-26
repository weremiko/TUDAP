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
    return NextResponse.json({ success: true, message: 'Bu e-posta için eşleşen bir kayıt varsa bilet açılacaktır.' })
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
      SELECT id, first_name, last_name, email, department, institution
      FROM keynote_registrations
      WHERE lower(email) = ${email}
      LIMIT 1
    `)
    const registration = result.rows[0] as {
      id?: string
      first_name?: string
      last_name?: string
      email?: string
      department?: string
      institution?: string
    } | undefined

    if (registration?.id) {
      const signature = signKeynoteTicket(registration.id)
      const verifyUrl = new URL(
        `/keynote/verify/${encodeURIComponent(registration.id)}?sig=${signature}`,
        request.nextUrl.origin,
      ).toString()

      return NextResponse.json({
        success: true,
        message: 'Kayıt bulundu. Biletiniz açılıyor.',
        ticket: {
          id: registration.id,
          firstName: registration.first_name ?? '',
          lastName: registration.last_name ?? '',
          email: registration.email ?? email,
          department: registration.department ?? '',
          institution: registration.institution ?? '',
          verifyUrl,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Bu e-posta için eşleşen bir kayıt bulunamadı.',
    })
  } catch (error) {
    console.error('[keynote-recovery]', error)
    return NextResponse.json({
      success: true,
      message: 'Bu e-posta için eşleşen bir kayıt bulunamadı.',
    })
  }
}
