'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, session } from '@/lib/db/schema'
import { asc, desc, eq, count, gt } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm'
import { ensureProfileColumns } from '@/app/actions/profile'

let verificationColumnsReady: Promise<void> | null = null
function ensureVerificationColumn() {
  if (!verificationColumnsReady) {
    verificationColumnsReady = db.execute(sql`
      ALTER TABLE "user"
        ADD COLUMN IF NOT EXISTS blue_verified BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS team_role TEXT,
        ADD COLUMN IF NOT EXISTS team_order INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS team_visible BOOLEAN NOT NULL DEFAULT FALSE
    `).then(() => undefined)
  }
  return verificationColumnsReady
}

async function requireAdmin() {
  const s = await auth.api.getSession({ headers: await headers() })
  if (!s?.user) throw new Error('Unauthorized')
  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, s.user.id)).limit(1)
  if (!u || u.role !== 'admin') throw new Error('Forbidden')
  return s.user
}

// Allow both admin and moderator
async function requireAdminOrModerator() {
  const s = await auth.api.getSession({ headers: await headers() })
  if (!s?.user) throw new Error('Unauthorized')
  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, s.user.id)).limit(1)
  if (!u || (u.role !== 'admin' && u.role !== 'moderator')) throw new Error('Forbidden')
  return s.user
}

export async function getAdminStats() {
  await requireAdmin()

  const [totalUsers] = await db.select({ count: count() }).from(user)
  const [adminCount] = await db
    .select({ count: count() })
    .from(user)
    .where(eq(user.role, 'admin'))
  const [activeSessions] = await db
    .select({ count: count() })
    .from(session)
    .where(gt(session.expiresAt, new Date()))

  // Users registered in last 7 days
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const [newUsers] = await db
    .select({ count: count() })
    .from(user)
    .where(gt(user.createdAt, weekAgo))

  return {
    totalUsers: totalUsers.count,
    adminCount: adminCount.count,
    activeSessions: activeSessions.count,
    newUsersThisWeek: newUsers.count,
  }
}

export async function getAllUsers() {
  await requireAdmin()
  await ensureVerificationColumn()
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      blueVerified: user.blueVerified,
      teamRole: user.teamRole,
      teamOrder: user.teamOrder,
      teamVisible: user.teamVisible,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
}

export async function setUserTeamMember(userId: string, data: { role: 'founder' | 'advisor' | 'member' | null; order: number; visible: boolean }) {
  await requireAdmin()
  await ensureVerificationColumn()
  await db.update(user).set({ teamRole: data.role, teamOrder: Math.max(0, data.order || 0), teamVisible: data.visible, updatedAt: new Date() }).where(eq(user.id, userId))
  revalidatePath('/admin/kullanicilar')
  revalidatePath('/takimimiz')
}

export async function getPublicTeamMembers() {
  await Promise.all([ensureVerificationColumn(), ensureProfileColumns()])
  return db.select({ id: user.id, name: user.name, profileSlug: user.profileSlug, image: user.image, institution: user.institution, bio: user.bio, blueVerified: user.blueVerified, teamRole: user.teamRole, teamOrder: user.teamOrder })
    .from(user)
    .where(eq(user.teamVisible, true))
    .orderBy(asc(user.name))
}

export async function setUserBlueVerification(userId: string, verified: boolean) {
  await requireAdmin()
  await ensureVerificationColumn()
  await db.update(user).set({ blueVerified: verified, updatedAt: new Date() }).where(eq(user.id, userId))
  revalidatePath('/admin/kullanicilar')
  revalidatePath('/profil')
}

export async function setUserRole(userId: string, role: 'admin' | 'moderator' | 'user') {
  await requireAdmin()
  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId))
  revalidatePath('/admin')
}

export async function deleteUser(userId: string) {
  const current = await requireAdmin()
  if (current.id === userId) throw new Error('Kendinizi silemezsiniz.')
  await db.delete(user).where(eq(user.id, userId))
  revalidatePath('/admin')
}
