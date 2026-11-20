import { createHmac, timingSafeEqual } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

export const KEYNOTE_CONSENT_VERSION = 'keynote-2026-11-v1'

let tableReady: Promise<void> | null = null

export function ensureKeynoteTable() {
  if (!tableReady) {
    tableReady = db.execute(sql`
      CREATE TABLE IF NOT EXISTS keynote_registrations (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        department TEXT NOT NULL,
        institution TEXT NOT NULL,
        role TEXT NOT NULL,
        consent BOOLEAN NOT NULL,
        consent_version TEXT NOT NULL,
        consented_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        checked_in_at TIMESTAMPTZ
      )
    `).then(() => undefined).catch((error) => {
      tableReady = null
      throw error
    })
  }
  return tableReady
}

function ticketSecret() {
  const secret = process.env.KEYNOTE_TICKET_SECRET || process.env.BETTER_AUTH_SECRET
  if (!secret) throw new Error('KEYNOTE_TICKET_SECRET or BETTER_AUTH_SECRET must be configured')
  return secret
}

export function signKeynoteTicket(id: string) {
  return createHmac('sha256', ticketSecret()).update(id).digest('hex').slice(0, 32)
}

export function verifyKeynoteTicket(id: string, signature: string) {
  if (!/^[a-f0-9]{32}$/.test(signature)) return false
  const expected = Buffer.from(signKeynoteTicket(id))
  const supplied = Buffer.from(signature)
  return expected.length === supplied.length && timingSafeEqual(expected, supplied)
}
