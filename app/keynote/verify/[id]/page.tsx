import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { ensureKeynoteTable, verifyKeynoteTicket } from '@/lib/keynote'

type VerifyPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sig?: string }>
}

export default async function KeynoteTicketVerification({ params, searchParams }: VerifyPageProps) {
  const [{ id }, { sig }] = await Promise.all([params, searchParams])
  const validSignature = typeof sig === 'string' && verifyKeynoteTicket(id, sig)
  let ticket: Record<string, unknown> | null = null

  if (validSignature) {
    await ensureKeynoteTable()
    const result = await db.execute(sql`
      SELECT id, checked_in_at
      FROM keynote_registrations WHERE id = ${id} LIMIT 1
    `)
    ticket = (result.rows[0] as Record<string, unknown> | undefined) ?? null
  }

  const valid = validSignature && ticket !== null
  const checkedIn = Boolean(ticket?.checked_in_at)

  return (
    <main className="grid min-h-svh place-items-center bg-[#09090b] px-5 py-10 text-[#f3f3f0]">
      <section className="w-full max-w-xl border border-white/15 bg-[#111114] p-7 sm:p-11">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#d7fa63]">KEYNOTE’26 / TÜDAP</p>
        <h1 className="mt-8 font-serif text-4xl font-semibold sm:text-5xl">
          {!valid ? 'Geçersiz bilet' : checkedIn ? 'Giriş yapılmış' : 'Bilet geçerli'}
        </h1>
        {valid && ticket ? (
          <>
            <p className="mt-7 text-sm text-white/65">Bilet numarası: <span className="font-mono">{String(ticket.id)}</span></p>
            <p className="mt-5 text-sm text-white/65">15 Aralık 2026 · Köyceğiz, Merkez Kütüphane</p>
          </>
        ) : (
          <p className="mt-5 text-sm leading-6 text-white/65">Bilet bağlantısı geçersiz veya kayıt bulunamadı.</p>
        )}
        <p className="mt-8 border-t border-white/15 pt-5 text-xs leading-5 text-white/50">
          Giriş işaretleme yalnızca yetkili görevli tarafından yapılabilir.
        </p>
      </section>
    </main>
  )
}
