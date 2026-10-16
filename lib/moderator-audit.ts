import { db } from '@/lib/db'
import { moderatorActionLogs, user } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

let auditTableReady: Promise<void> | null = null

export function ensureModeratorAuditTable() {
  if (!auditTableReady) {
    auditTableReady = db.execute(sql`
      CREATE TABLE IF NOT EXISTS moderator_action_logs (
        id SERIAL PRIMARY KEY,
        actor_id TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT,
        summary TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `).then(() => undefined)
  }
  return auditTableReady
}

export async function recordModeratorAction(
  actorId: string,
  action: string,
  entity: string,
  entityId?: string | number,
  summary = '',
) {
  await ensureModeratorAuditTable()
  const [actor] = await db.select({ role: user.role, name: user.name })
    .from(user).where(eq(user.id, actorId)).limit(1)
  if (actor?.role !== 'moderator') return

  await db.insert(moderatorActionLogs).values({
    actorId,
    actorName: actor.name,
    action,
    entity,
    entityId: entityId === undefined ? null : String(entityId),
    summary: summary.slice(0, 500),
  })
}