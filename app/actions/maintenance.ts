'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { desc, eq, inArray, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { maintenanceAuditLogs, siteSettings, user } from '@/lib/db/schema'

const KEYS = {
  enabled: 'maintenance_mode',
  titleTr: 'maintenance_title_tr',
  descriptionTr: 'maintenance_description_tr',
  titleEn: 'maintenance_title_en',
  descriptionEn: 'maintenance_description_en',
  launchMonth: 'maintenance_launch_month',
  showTeam: 'maintenance_show_team',
} as const

export type MaintenanceSettings = {
  enabled: boolean
  titleTr: string
  descriptionTr: string
  titleEn: string
  descriptionEn: string
  launchMonth: string
  showTeam: boolean
}

const DEFAULTS: MaintenanceSettings = {
  enabled: false,
  titleTr: 'TÜDAP hazırlanıyor',
  descriptionTr: 'Türkçenin ses yapısı, terimleri ve araştırmaları için açık bir çalışma alanı hazırlıyoruz. Aralık ayında resmî açılışımızı yapacağız.',
  titleEn: 'TÜDAP is getting ready',
  descriptionEn: 'We are preparing an open workspace for Turkish sounds, terminology and research. The platform will officially launch in December.',
  launchMonth: '2026-12',
  showTeam: true,
}

export async function getMaintenanceSettings(): Promise<MaintenanceSettings> {
  try {
    const rows = await db.select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings)
      .where(inArray(siteSettings.key, Object.values(KEYS)))
    const values = new Map(rows.map(({ key, value }) => [key, value]))
    return {
      enabled: values.get(KEYS.enabled) === 'true',
      titleTr: values.get(KEYS.titleTr) ?? DEFAULTS.titleTr,
      descriptionTr: values.get(KEYS.descriptionTr) ?? DEFAULTS.descriptionTr,
      titleEn: values.get(KEYS.titleEn) ?? DEFAULTS.titleEn,
      descriptionEn: values.get(KEYS.descriptionEn) ?? DEFAULTS.descriptionEn,
      launchMonth: values.get(KEYS.launchMonth) ?? DEFAULTS.launchMonth,
      showTeam: values.get(KEYS.showTeam) !== 'false',
    }
  } catch (error) {
    console.error('[maintenance] Could not read settings:', error)
    return DEFAULTS
  }
}

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum açmanız gerekiyor.')

  const [currentUser] = await db.select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  if (currentUser?.role !== 'admin') throw new Error('Bu işlem için yönetici yetkisi gerekiyor.')
  return session.user
}

export async function saveMaintenanceSettings(input: MaintenanceSettings) {
  const actor = await requireAdmin()
  if (!input || typeof input.enabled !== 'boolean' || typeof input.showTeam !== 'boolean') {
    throw new Error('Bakım modu ayarları geçersiz.')
  }

  const titleTr = String(input.titleTr ?? '').trim().slice(0, 140)
  const descriptionTr = String(input.descriptionTr ?? '').trim().slice(0, 1200)
  const titleEn = String(input.titleEn ?? '').trim().slice(0, 140)
  const descriptionEn = String(input.descriptionEn ?? '').trim().slice(0, 1200)
  const launchMonth = String(input.launchMonth ?? '').trim()
  if (!titleTr || !descriptionTr || !titleEn || !descriptionEn) {
    throw new Error('Türkçe ve İngilizce başlık ile açıklamaları doldurun.')
  }
  if (launchMonth && !/^\d{4}-(0[1-9]|1[0-2])$/.test(launchMonth)) {
    throw new Error('Lansman tarihi ay/yıl biçiminde olmalıdır.')
  }

  await db.transaction(async (tx) => {
    const [current] = await tx.select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, KEYS.enabled))
      .limit(1)
    const wasEnabled = current?.value === 'true'
    const now = new Date()
    const values: { key: string; value: string; updatedAt: Date }[] = [
      { key: KEYS.enabled, value: String(input.enabled), updatedAt: now },
      { key: KEYS.titleTr, value: titleTr, updatedAt: now },
      { key: KEYS.descriptionTr, value: descriptionTr, updatedAt: now },
      { key: KEYS.titleEn, value: titleEn, updatedAt: now },
      { key: KEYS.descriptionEn, value: descriptionEn, updatedAt: now },
      { key: KEYS.launchMonth, value: launchMonth, updatedAt: now },
      { key: KEYS.showTeam, value: String(input.showTeam), updatedAt: now },
    ]

    await tx.insert(siteSettings).values(values).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: sql`excluded.value`, updatedAt: now },
    })

    if (wasEnabled !== input.enabled) {
      await tx.insert(maintenanceAuditLogs).values({
        actorId: actor.id,
        actorName: actor.name,
        enabled: input.enabled,
        changedAt: now,
      })
    }
  })

  revalidatePath('/', 'layout')
  revalidatePath('/admin/bakim')
  return { ok: true }
}

export async function getMaintenanceAuditLog() {
  await requireAdmin()
  return db.select({ actorName: maintenanceAuditLogs.actorName, enabled: maintenanceAuditLogs.enabled, changedAt: maintenanceAuditLogs.changedAt })
    .from(maintenanceAuditLogs)
    .orderBy(desc(maintenanceAuditLogs.changedAt))
    .limit(8)
}
