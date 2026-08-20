'use server'

import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum açmanız gerekiyor')
  return session.user.id
}

export async function updateProfile(data: { name: string; image: string }) {
  const userId = await requireUser()
  const name = data.name.trim()
  const image = data.image.trim()

  if (name.length < 2 || name.length > 80) {
    throw new Error('Ad Soyad 2 ile 80 karakter arasında olmalıdır')
  }
  if (image.length > 500) {
    throw new Error('Profil görseli adresi çok uzun')
  }

  await db
    .update(user)
    .set({ name, image: image || null, updatedAt: new Date() })
    .where(eq(user.id, userId))

  revalidatePath('/profil')
  revalidatePath('/profil/ayarlar')
}
