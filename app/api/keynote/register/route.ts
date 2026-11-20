import { randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { ensureKeynoteTable, KEYNOTE_CONSENT_VERSION, signKeynoteTicket } from '@/lib/keynote'

const ALLOWED_ROLES = new Set(['Öğrenci', 'Akademisyen', 'Araştırmacı', 'Diğer'])
const attempts = new Map<string, { startedAt: number; count: number }>()

function validText(value: unknown, min: number, max: number): value is string {
  return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max && !/[<>]/.test(value)
}

function rateLimited(ip: string) {
  const now = Date.now()
  const current = attempts.get(ip)
  if (!current || now - current.startedAt > 60 * 60 * 1000) {
    attempts.set(ip, { startedAt: now, count: 1 })
    return false
  }
  current.count += 1
  return current.count > 25
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.' }, { status: 429 })
  }

  try {
    const raw = await request.text()
    if (raw.length > 12_000) return NextResponse.json({ error: 'İstek çok büyük.' }, { status: 413 })
    const data = JSON.parse(raw) as Record<string, unknown>
    if (data.website) return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })

    const fields = [
      ['firstName', 2, 120],
      ['lastName', 2, 120],
      ['email', 5, 254],
      ['institution', 2, 100],
      ['department', 2, 100],
    ] as const
    for (const [field, min, max] of fields) {
      if (!validText(data[field], min, max)) {
        return NextResponse.json({ error: 'Lütfen tüm alanları geçerli şekilde doldurun.' }, { status: 400 })
      }
    }

    const email = (data.email as string).trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 })
    }
    if (typeof data.role !== 'string' || !ALLOWED_ROLES.has(data.role)) {
      return NextResponse.json({ error: 'Katılımcı türünü seçin.' }, { status: 400 })
    }
    if (data.consent !== true) {
      return NextResponse.json({ error: 'Kişisel verilerin işlenmesine ilişkin bilgilendirme onayı gereklidir.' }, { status: 400 })
    }

    await ensureKeynoteTable()
    const id = `KN26-${randomBytes(5).toString('hex').toUpperCase()}`
    const firstName = (data.firstName as string).trim()
    const lastName = (data.lastName as string).trim()
    const institution = (data.institution as string).trim()
    const department = (data.department as string).trim()
    const now = new Date()

    await db.execute(sql`
      INSERT INTO keynote_registrations (
        id, first_name, last_name, email, department, institution, role,
        consent, consent_version, consented_at, created_at
      ) VALUES (
        ${id}, ${firstName}, ${lastName}, ${email}, ${department}, ${institution}, ${data.role},
        TRUE, ${KEYNOTE_CONSENT_VERSION}, ${now}, ${now}
      )
    `)

    const signature = signKeynoteTicket(id)
    const verifyUrl = new URL(`/keynote/verify/${encodeURIComponent(id)}?sig=${signature}`, request.nextUrl.origin).toString()
    return NextResponse.json({
      success: true,
      ticket: { id, firstName, lastName, email, department, institution, verifyUrl },
    }, { status: 201 })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return NextResponse.json({ error: 'Bu e-posta adresiyle zaten kayıt oluşturulmuş. Biletinizi yeniden almak için organizasyonla iletişime geçin.' }, { status: 409 })
    }
    console.error('[keynote-registration]', error)
    return NextResponse.json({ error: 'Kayıt işlenemedi. Lütfen tekrar deneyin.' }, { status: 500 })
  }
}
