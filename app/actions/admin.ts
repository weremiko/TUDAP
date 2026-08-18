'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, session } from '@/lib/db/schema'
import { desc, eq, count, gt } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
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
