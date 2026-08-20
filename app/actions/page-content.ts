'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { pageSections, user } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

async function requireAdminOrModerator() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum açmanız gerekiyor')
  const [currentUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
    throw new Error('Yetkisiz erişim')
  }
  return { userId: session.user.id, userName: session.user.name ?? 'Admin' }
}

export type PageSection = {
  id: number
  page: string
  key: string
  label: string
  content: string
  sortOrder: number
  updatedAt: Date
}

const DEFAULT_SECTIONS: Record<string, Array<{ key: string; label: string; content: string }>> = {
  hakkinda: [
    { key: 'proje_hakkinda', label: 'Proje Hakkında', content: 'TÜDAP (Türkçe Dilbilim Platformu), dilbilim alanında dijital kaynak eksikliğini gidermek amacıyla geliştirilmiş akademik bir platformdur.' },
    { key: 'ozellikler', label: 'Özellikler', content: 'IPA fonetik transkripsiyon\nDilbilim terimleri sözlüğü\nAkademik blog\nEtkinlik ajandası' },
    { key: 'kullanim_alanlari', label: 'Kullanım Alanları', content: 'Dilbilim araştırmaları ve akademik çalışmalar\nTürkçe öğretimi ve telaffuz eğitimi\nKonuşma terapisi ve ses eğitimi' },
    { key: 'akademik_temel', label: 'Akademik Temel', content: 'IPA transkripsiyon sistemi, Türkçenin sesbilimsel özelliklerine dayalı akademik kurallara dayanmaktadır.' },
    { key: 'iletisim_notu', label: 'İletişim', content: 'Öneri, hata bildirimi ve iş birliği talepleriniz için iletisim@dilbilim.org.tr adresine yazabilirsiniz.' },
  ],
  iletisim: [
    { key: 'giris_metni', label: 'Giriş Metni', content: 'Sorularınız, önerileriniz ve akademik iş birliği talepleriniz için her zaman açığız.' },
    { key: 'eposta_adresi', label: 'E-posta Adresi', content: 'iletisim@dilbilim.org.tr' },
    { key: 'sss_1_soru', label: 'SSS 1 Soru', content: 'Bu platform ücretsiz mi?' },
    { key: 'sss_1_cevap', label: 'SSS 1 Cevap', content: 'Evet, TÜDAP tamamen ücretsizdir ve kar amacı gütmemektedir.' },
    { key: 'sss_2_soru', label: 'SSS 2 Soru', content: 'Verilerim saklanıyor mu?' },
    { key: 'sss_2_cevap', label: 'SSS 2 Cevap', content: 'Hayır. Girdiğiniz metinler yalnızca tarayıcınızda işlenir.' },
    { key: 'sss_3_soru', label: 'SSS 3 Soru', content: 'Hata bildirimi nasıl yapabilirim?' },
    { key: 'sss_3_cevap', label: 'SSS 3 Cevap', content: "Herhangi bir araç sayfasındaki 'Hata Bildir' butonu veya e-posta ile bildirimde bulunabilirsiniz." },
  ],
  takimimiz: [
    { key: 'kurucu', label: 'Kurucu bilgisi', content: '' },
    { key: 'kurucu_fotograf', label: 'Kurucu fotoğrafı (URL)', content: '' },
    { key: 'akademik_danisman', label: 'Akademik Danışman bilgisi', content: '' },
    { key: 'akademik_danisman_fotograf', label: 'Akademik Danışman fotoğrafı (URL)', content: '' },
  ],
}

let pageSectionsTableReady: Promise<void> | null = null

function ensurePageSectionsTable() {
  if (!pageSectionsTableReady) {
    pageSectionsTableReady = db.execute(sql`
      CREATE TABLE IF NOT EXISTS page_sections (
        id SERIAL PRIMARY KEY,
        page TEXT NOT NULL,
        key TEXT NOT NULL,
        label TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `).then(() => undefined)
  }
  return pageSectionsTableReady
}

export async function getPageSections(page: string): Promise<PageSection[]> {
  await ensurePageSectionsTable()
  const rows = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.page, page))
    .orderBy(pageSections.sortOrder)
  if (rows.length > 0) return rows
  return (DEFAULT_SECTIONS[page] ?? []).map((section, index) => ({
    id: 0,
    page,
    ...section,
    sortOrder: index,
    updatedAt: new Date(),
  }))
}

export async function upsertPageSection(
  page: string,
  key: string,
  content: string
): Promise<void> {
  await requireAdminOrModerator()
  await ensurePageSectionsTable()

  const updated = await db
    .update(pageSections)
    .set({ content: content.trim(), updatedAt: new Date() })
    .where(and(eq(pageSections.page, page), eq(pageSections.key, key)))

  if (updated.rowCount === 0) {
    await db.insert(pageSections).values({
      page,
      key,
      label: key,
      content: content.trim(),
      sortOrder: 0,
    })
  }

  revalidatePath(`/${page === 'hakkinda' ? 'hakkinda' : page === 'takimimiz' ? 'takimimiz' : 'iletisim'}`)
  revalidatePath('/en/about')
  revalidatePath('/en/contact')
}

export async function upsertAllPageSections(
  page: string,
  updates: { key: string; content: string }[]
): Promise<void> {
  await requireAdminOrModerator()
  await ensurePageSectionsTable()

  for (const [index, { key, content }] of updates.entries()) {
    const updated = await db
      .update(pageSections)
      .set({ content: content.trim(), updatedAt: new Date() })
      .where(and(eq(pageSections.page, page), eq(pageSections.key, key)))

    if (updated.rowCount === 0) {
      await db.insert(pageSections).values({
        page,
        key,
        label: key,
        content: content.trim(),
        sortOrder: index,
      })
    }
  }

  revalidatePath(`/${page === 'hakkinda' ? 'hakkinda' : page === 'takimimiz' ? 'takimimiz' : 'iletisim'}`)
  revalidatePath('/en/about')
  revalidatePath('/en/contact')
}
