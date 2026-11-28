import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

let tableReady: Promise<void> | null = null

export function ensurePageViewStatsTable() {
  if (!tableReady) {
    tableReady = db.execute(sql`
      CREATE TABLE IF NOT EXISTS page_view_stats (
        id SERIAL PRIMARY KEY,
        view_date DATE NOT NULL,
        page_path TEXT NOT NULL,
        referrer TEXT NOT NULL,
        viewport TEXT NOT NULL,
        views INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (view_date, page_path, referrer, viewport)
      )
    `).then(() => undefined)
  }
  return tableReady
}
