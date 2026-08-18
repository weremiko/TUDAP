'use server'

import { db } from '@/lib/db'
import { customTranscriptions, user } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath, revalidateTag } from 'next/cache'

async function checkAdminOrModerator() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!u || (u.role !== 'admin' && u.role !== 'moderator')) throw new Error('Forbidden')
}

export async function getCustomTranscriptions() {
  const rows = await db.select().from(customTranscriptions).orderBy(desc(customTranscriptions.createdAt))
  return rows
}

export async function addCustomTranscription(data: {
  input: string
  output: string
  category?: string
  notes?: string
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!u || (u.role !== 'admin' && u.role !== 'moderator')) throw new Error('Forbidden')

  if (!data.input.trim() || !data.output.trim()) {
    throw new Error('Giriş ve çıkış boş olamaz')
  }

  // Upsert: aynı input varsa güncelle, yoksa ekle
  const existing = await db.select({ id: customTranscriptions.id })
    .from(customTranscriptions)
    .where(eq(customTranscriptions.input, data.input.trim()))
    .limit(1)

  if (existing.length > 0) {
    await db.update(customTranscriptions)
      .set({
        output: data.output.trim(),
        category: data.category || 'error-fix',
        notes: data.notes || '',
      })
      .where(eq(customTranscriptions.id, existing[0].id))
  } else {
    await db.insert(customTranscriptions).values({
      input: data.input.trim(),
      output: data.output.trim(),
      category: data.category || 'exception',
      notes: data.notes || '',
    })
  }

  revalidatePath('/admin/sabit-ceviriler')
}

export async function updateCustomTranscription(
  id: number,
  data: {
    input: string
    output: string
    category?: string
    notes?: string
  }
) {
  await checkAdminOrModerator()
  
  if (!data.input.trim() || !data.output.trim()) {
    throw new Error('Giriş ve çıkış boş olamaz')
  }
  
  await db.update(customTranscriptions)
    .set({
      input: data.input.trim(),
      output: data.output.trim(),
      category: data.category || 'exception',
      notes: data.notes || '',
    })
    .where(eq(customTranscriptions.id, id))
  
  revalidatePath('/admin/sabit-ceviriler')
  revalidateTag('custom-transcriptions')
}

export async function deleteCustomTranscription(id: number) {
  await checkAdminOrModerator()
  await db.delete(customTranscriptions).where(eq(customTranscriptions.id, id))
  revalidatePath('/admin/sabit-ceviriler')
  revalidateTag('custom-transcriptions')
}
