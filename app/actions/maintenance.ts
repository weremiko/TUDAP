'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { siteSettings, user } from '@/lib/db/schema'

const MAINTENANCE_KEY = 'maintenance_mode'

export async function getMaintenanceMode() {
  try {
    const [setting] = await db.select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, MAINTENANCE_KEY))
      .limit(1)
    return setting?.value === 'true'
  } catch (error) {
    console.error('[maintenance] Could not read maintenance setting:', error)
    return false
  }
}

export async function setMaintenanceMode(enabled: boolean) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum açmanız gerekiyor.')

  const [currentUser] = await db.select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  if (currentUser?.role !== 'admin') throw new Error('Bu işlem için yönetici yetkisi gerekiyor.')

  await db.insert(siteSettings)
    .values({ key: MAINTENANCE_KEY, value: String(enabled), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: String(enabled), updatedAt: new Date() },
    })

  revalidatePath('/', 'layout')
  revalidatePath('/admin/bakim')
  return { enabled }
}
