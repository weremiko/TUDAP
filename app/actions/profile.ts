'use server'

import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm'

let profileColumnsReady: Promise<void> | null = null

export function ensureProfileColumns() {
  if (!profileColumnsReady) {
    profileColumnsReady = db.execute(sql`
      ALTER TABLE "user"
        ADD COLUMN IF NOT EXISTS institution TEXT,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS profile_visibility BOOLEAN NOT NULL DEFAULT FALSE
    `).then(() => undefined)
  }
  return profileColumnsReady
}

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum açmanız gerekiyor')
  return session.user.id
}

export async function updateProfile(data: { name: string; image: string; institution: string; bio: string; profileVisibility: boolean }) {
  const userId = await requireUser()
  await ensureProfileColumns()
  const name = data.name.trim()
  const image = data.image.trim()
  const institution = data.institution.trim()
  const bio = data.bio.trim()

  if (name.length < 2 || name.length > 80) {
    throw new Error('Ad Soyad 2 ile 80 karakter arasında olmalıdır')
  }
  if (image.length > 500) {
    throw new Error('Profil görseli adresi çok uzun')
  }
  if (institution.length > 120 || bio.length > 500) {
    throw new Error('Kurum veya biyografi alanı çok uzun')
  }

  await db
    .update(user)
    .set({ name, image: image || null, institution: institution || null, bio: bio || null, profileVisibility: data.profileVisibility, updatedAt: new Date() })
    .where(eq(user.id, userId))

  revalidatePath('/profil')
  revalidatePath('/profil/ayarlar')
}

export async function getOwnProfile() {
  const userId = await requireUser()
  await ensureProfileColumns()
  const [profile] = await db
    .select({ name: user.name, email: user.email, image: user.image, institution: user.institution, bio: user.bio, profileVisibility: user.profileVisibility })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  return profile ?? null
}
