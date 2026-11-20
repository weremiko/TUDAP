import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ensureKeynoteTable, verifyKeynoteTicket } from '@/lib/keynote'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const operatorResult = await db.execute(sql`SELECT role FROM "user" WHERE id = ${session.user.id} LIMIT 1`)
  const role = (operatorResult.rows[0] as { role?: string } | undefined)?.role
  if (role !== 'admin' && role !== 'moderator') {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: 403 })
  }

  try {
    const data = await request.json() as { id?: unknown; sig?: unknown }
    if (typeof data.id !== 'string' || typeof data.sig !== 'string' || !verifyKeynoteTicket(data.id, data.sig)) {
      return NextResponse.json({ error: 'Geçersiz bilet.' }, { status: 400 })
    }

    await ensureKeynoteTable()
    const result = await db.execute(sql`
      UPDATE keynote_registrations
      SET checked_in_at = NOW()
      WHERE id = ${data.id} AND checked_in_at IS NULL
      RETURNING id, first_name, last_name, email, department, institution, role, created_at, checked_in_at
    `)
    const ticket = result.rows[0] as Record<string, unknown> | undefined
    if (!ticket) {
      const existing = await db.execute(sql`SELECT id, checked_in_at FROM keynote_registrations WHERE id = ${data.id} LIMIT 1`)
      if (!existing.rows[0]) return NextResponse.json({ error: 'Bilet bulunamadı.' }, { status: 404 })
      return NextResponse.json({ error: 'Bu biletle giriş daha önce yapılmış.' }, { status: 409 })
    }
    return NextResponse.json({ success: true, ticket })
  } catch {
    return NextResponse.json({ error: 'QR doğrulama isteği geçersiz.' }, { status: 400 })
  }
}
