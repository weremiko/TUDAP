'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { pageSections, user } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { recordModeratorAction } from '@/lib/moderator-audit'

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
    { key: 'proje_hakkinda', label: 'Proje Hakkında', content: 'TÜDAP (Türkçe Dilbilim Araştırma Platformu), dilbilim alanında dijital kaynak eksikliğini gidermek amacıyla geliştirilmiş akademik bir platformdur.' },
    { key: 'ozellikler', label: 'Özellikler', content: 'IPA fonetik transkripsiyon\nDilbilim terimleri sözlüğü\nAkademik içerikler\nEtkinlik ajandası' },
    { key: 'kullanim_alanlari', label: 'Kullanım Alanları', content: 'Dilbilim araştırmaları ve akademik çalışmalar\nTürkçe öğretimi ve telaffuz eğitimi\nKonuşma terapisi ve ses eğitimi' },
    { key: 'akademik_temel', label: 'Akademik Temel', content: 'IPA transkripsiyon sistemi, Türkçenin sesbilimsel özelliklerine dayalı akademik kurallara dayanmaktadır.' },
    { key: 'iletisim_notu', label: 'İletişim', content: 'Öneri, hata bildirimi ve iş birliği talepleriniz için iletisim@dilbilim.org.tr adresine yazabilirsiniz.' },
  ],
  iletisim: [
    { key: 'giris_metni', label: 'Giriş Metni', content: 'Sorularınız, önerileriniz ve akademik iş birliği talepleriniz için her zaman açığız.' },
    { key: 'eposta_adresi', label: 'E-posta Adresi', content: 'iletisim@dilbilim.org.tr' },
    { key: 'sss_1_soru', label: 'SSS 1 Soru', content: 'Bu platform ücretsiz mi?' },
    { key: 'sss_1_cevap', label: 'SSS 1 Cevap', content: 'Evet, TÜDAP tamamen ücretsizdir ve kar amacı gütmemektedir.' },
    { key: 'sss_3_soru', label: 'SSS 3 Soru', content: 'Hata bildirimi nasıl yapabilirim?' },
    { key: 'sss_3_cevap', label: 'SSS 3 Cevap', content: "Herhangi bir araç sayfasındaki 'Hata Bildir' butonu veya e-posta ile bildirimde bulunabilirsiniz." },
  ],
  takimimiz: [
    { key: 'kurucu', label: 'Kurucu bilgisi', content: '' },
    { key: 'kurucu_fotograf', label: 'Kurucu fotoğrafı (URL)', content: '' },
    { key: 'akademik_danisman', label: 'Akademik Danışman bilgisi', content: '' },
    { key: 'akademik_danisman_fotograf', label: 'Akademik Danışman fotoğrafı (URL)', content: '' },
  ],
  keynote: [
    { key: 'hero_eyebrow', label: 'Hero üst etiketi', content: 'TÜDAP LANSMANI · 15 ARALIK 2026' },
    { key: 'hero_title', label: 'Hero başlığı', content: 'Dilbilimde\ndijital gelecek\nkuruluyor.' },
    { key: 'hero_description', label: 'Hero açıklaması', content: 'Türkçe Dilbilim Araştırma Platformu’nun lansman buluşması.' },
    { key: 'hero_date', label: 'Etkinlik tarihi', content: '15 Aralık 2026' },
    { key: 'hero_location', label: 'Etkinlik yeri', content: 'Köyceğiz Merkez Kütüphane' },
    { key: 'hero_poster_url', label: 'Hero afiş URL’si', content: '' },
  ],
  anasayfa: [
    { key: 'seo_title', label: 'SEO başlığı', content: 'TÜDAP — Türkçe Dilbilim Araştırma Platformu | IPA Çevirici & Terim Sözlüğü' },
    { key: 'seo_description', label: 'SEO açıklaması', content: 'Türkçe Dilbilim Araştırma Platformu: ücretsiz IPA fonetik transkripsiyon aracı, 700+ madde başı, akademik içerikler ve etkinlik ajandası.' },
    { key: 'hero_eyebrow', label: 'Hero üst etiketi', content: 'Türkçe Dilbilim Araştırma Platformu' },
    { key: 'hero_headlines', label: 'Dönen hero başlıkları', content: 'Dili yalnızca okumayın, inceleyin.\nTürkçeyi sesinden yapısına, anlamına kadar çözümleyin.\nHer terimin bir kökeni, her kavramın bir yeri var.\nTürkçe dilbilimin açık çalışma alanı.\nSormaya, ölçmeye, karşılaştırmaya buradan başlayın.' },
    { key: 'hero_description', label: 'Hero açıklaması', content: 'Türkçe metinleri seslerine, yapılarına ve anlamlarına ayıran açık bir çalışma alanı. IPA çevirici, terim sözlüğü ve akademik içerikler tek yerde.' },
    { key: 'hero_primary_label', label: 'Birincil buton metni', content: 'Metinle başla' },
    { key: 'hero_primary_href', label: 'Birincil buton bağlantısı', content: '/cevirici' },
    { key: 'hero_secondary_label', label: 'İkincil bağlantı metni', content: 'Terim sözlüğüne git' },
    { key: 'hero_secondary_href', label: 'İkincil bağlantı adresi', content: '/terim-sozlugu' },
    { key: 'stat_1_value', label: 'İstatistik 1 değeri', content: '700+' },
    { key: 'stat_1_label', label: 'İstatistik 1 açıklaması', content: 'dilbilim terimi' },
    { key: 'stat_2_value', label: 'İstatistik 2 değeri', content: 'Ücretsiz' },
    { key: 'stat_2_label', label: 'İstatistik 2 açıklaması', content: 'araçlar' },
    { key: 'stat_3_value', label: 'İstatistik 3 değeri', content: 'Türkçe' },
    { key: 'stat_3_label', label: 'İstatistik 3 açıklaması', content: 'odaklı' },
    { key: 'term_search_label', label: 'Hero terim arama etiketi', content: 'Terim ara' },
    { key: 'term_search_placeholder', label: 'Hero terim arama örneği', content: 'ör. biçimbirim' },
    { key: 'term_search_button', label: 'Hero terim arama butonu', content: 'Ara' },
    { key: 'roadmap_eyebrow', label: 'Ajanda üst etiketi', content: 'Ajanda' },
    { key: 'roadmap_title', label: 'Ajanda başlığı', content: 'Yaklaşan etkinlikler' },
    { key: 'roadmap_link_label', label: 'Ajanda bağlantı metni', content: 'Tüm ajanda' },
    { key: 'events_empty_title', label: 'Etkinlik yok başlığı', content: 'Yaklaşan dilbilim etkinlikleri' },
    { key: 'events_empty_description', label: 'Etkinlik yok açıklaması', content: 'Ajandadaki güncel seminer, konferans ve çağrılar burada listelenecek.' },
    { key: 'tools_eyebrow', label: 'Araçlar üst etiketi', content: 'Araçlar' },
    { key: 'tools_title', label: 'Araçlar başlığı', content: 'Neler yapabilirsiniz?' },
    { key: 'tab_tools', label: 'Araçlar sekmesi', content: 'Araçlar' },
    { key: 'tab_resources', label: 'Kaynaklar sekmesi', content: 'Kaynaklar' },
    { key: 'tab_platform', label: 'Platform sekmesi', content: 'Platform' },
    { key: 'tool_transcriber_title', label: 'IPA aracı kartı başlığı', content: 'Sesbilimsel Abece Çeviricisi' },
    { key: 'tool_transcriber_desc', label: 'IPA aracı kartı açıklaması', content: 'Türkçe metinleri IPA formatına çevirin.' },
    { key: 'tool_transcriber_href', label: 'IPA aracı kartı bağlantısı', content: '/cevirici' },
    { key: 'tool_glossary_title', label: 'Sözlük kartı başlığı', content: 'Dilbilim Terimleri Sözlüğü' },
    { key: 'tool_glossary_desc', label: 'Sözlük kartı açıklaması', content: '700+ terim, Türkçe örnekler ve akademik açıklamalar.' },
    { key: 'tool_glossary_href', label: 'Sözlük kartı bağlantısı', content: '/terim-sozlugu' },
    { key: 'resource_blog_title', label: 'İçerikler kartı başlığı', content: 'İçerikler' },
    { key: 'resource_blog_desc', label: 'İçerikler kartı açıklaması', content: 'Dilbilim araştırmaları, yazılar ve platform güncellemeleri.' },
    { key: 'resource_blog_href', label: 'İçerikler kartı bağlantısı', content: '/blog' },
    { key: 'resource_agenda_title', label: 'Ajanda kartı başlığı', content: 'Etkinlik Ajandası' },
    { key: 'resource_agenda_desc', label: 'Ajanda kartı açıklaması', content: 'Seminer, konferans ve çalıştayları takip edin.' },
    { key: 'resource_agenda_href', label: 'Ajanda kartı bağlantısı', content: '/ajanda' },
    { key: 'platform_about_title', label: 'Hakkında kartı başlığı', content: 'Hakkında' },
    { key: 'platform_about_desc', label: 'Hakkında kartı açıklaması', content: 'TÜDAP’ın amacı, yaklaşımı ve geliştirme süreci.' },
    { key: 'platform_about_href', label: 'Hakkında kartı bağlantısı', content: '/hakkinda' },
    { key: 'platform_team_title', label: 'Takım kartı başlığı', content: 'Takımımız' },
    { key: 'platform_team_desc', label: 'Takım kartı açıklaması', content: 'Platformun akademik ve teknik gelişimine katkı sunan ekip.' },
    { key: 'platform_team_href', label: 'Takım kartı bağlantısı', content: '/takimimiz' },
    { key: 'blog_eyebrow', label: 'Blog üst etiketi', content: 'Güncel okumalar' },
    { key: 'blog_title', label: 'Blog bölümü başlığı', content: 'Son içerikler' },
    { key: 'glossary_eyebrow', label: 'Hızlı arama üst etiketi', content: 'Hızlı arama' },
    { key: 'glossary_title', label: 'Hızlı arama başlığı', content: 'Bir terim arayın, kavramı keşfedin.' },
    { key: 'glossary_description', label: 'Hızlı arama açıklaması', content: 'Türkçe dilbilim terimleri arasında hızlıca arama yapın.' },
    { key: 'glossary_prompts', label: 'Sözlük arama örnekleri', content: 'örn. ünlü uyumu, morfem, ergatiflik...\nDilbilgisi değil, dilbilim terimleri...\nTDK’de bulamadığınız o teorik terimi yazın...\nChomsky’nin sözdizimi ağacından bir yaprak seçin...\nDil yetisi (I-language) burada devreye giriyor...' },
    { key: 'glossary_input_label', label: 'Sözlük arama alanı etiketi', content: 'Sözlükte terim ara' },
    { key: 'glossary_search_button', label: 'Sözlük arama butonu', content: 'Ara' },
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
      ;
      UPDATE page_sections
      SET content = replace(replace(content, 'Türkçe Dilbilim Platformu', 'Türkçe Dilbilim Araştırma Platformu'), 'Akademik blog', 'Akademik içerikler')
      WHERE content LIKE '%Türkçe Dilbilim Platformu%' OR content LIKE '%Akademik blog%'
    `).then(() => undefined)
  }
  return pageSectionsTableReady
}

export async function getPageSections(page: string): Promise<PageSection[]> {
  const defaults = DEFAULT_SECTIONS[page] ?? []
  const fallback = () => defaults.map((section, index) => ({
    id: 0,
    page,
    ...section,
    sortOrder: index,
    updatedAt: new Date(),
  }))

  try {
    await ensurePageSectionsTable()
    const rows = await db
      .select()
      .from(pageSections)
      .where(eq(pageSections.page, page))
      .orderBy(pageSections.sortOrder)
    if (rows.length === 0) {
      return fallback()
    }

    const existingKeys = new Set(rows.map((row) => row.key))
    const missingDefaults = defaults
      .filter((section) => !existingKeys.has(section.key))
      .map((section, index) => ({
        id: 0,
        page,
        ...section,
        sortOrder: rows.length + index,
        updatedAt: new Date(),
      }))

    return [...rows, ...missingDefaults]
  } catch (error) {
    console.error('[page-content] Falling back to default sections:', error)
    pageSectionsTableReady = null
    return fallback()
  }

}

export async function upsertPageSection(
  page: string,
  key: string,
  content: string
): Promise<void> {
  const actor = await requireAdminOrModerator()
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
  await recordModeratorAction(actor.userId, 'update-section', 'page-content', key, page)

  revalidatePath(`/${page === 'hakkinda' ? 'hakkinda' : page === 'takimimiz' ? 'takimimiz' : 'iletisim'}`)
  revalidatePath('/en/about')
  revalidatePath('/en/contact')
}

export async function upsertAllPageSections(
  page: string,
  updates: { key: string; content: string }[]
): Promise<void> {
  const actor = await requireAdminOrModerator()
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
  await recordModeratorAction(actor.userId, 'update-sections', 'page-content', undefined, `${page}: ${updates.length} bölüm`)

  revalidatePath(`/${page === 'hakkinda' ? 'hakkinda' : page === 'takimimiz' ? 'takimimiz' : 'iletisim'}`)
  revalidatePath('/en/about')
  revalidatePath('/en/contact')
}

export async function upsertKeynoteHero(
  updates: { key: string; content: string }[]
): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum açmanız gerekiyor')
  const [currentUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  if (currentUser?.role !== 'admin') throw new Error('Yetkisiz erişim')

  const allowedSections = DEFAULT_SECTIONS.keynote
  const allowedKeys = new Set(allowedSections.map((section) => section.key))
  if (updates.length !== allowedSections.length || new Set(updates.map(({ key }) => key)).size !== allowedSections.length || updates.some(({ key, content }) =>
    !allowedKeys.has(key) || typeof content !== 'string' || content.length > 2000
  )) {
    throw new Error('Geçersiz hero içeriği')
  }
  const posterUrl = updates.find(({ key }) => key === 'hero_poster_url')?.content.trim()
  if (posterUrl) {
    try {
      const parsedUrl = new URL(posterUrl)
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') throw new Error()
    } catch {
      throw new Error('Afiş görseli için geçerli bir http veya https URL’si girin')
    }
  }

  await ensurePageSectionsTable()
  for (const [index, { key, content }] of updates.entries()) {
    const section = allowedSections.find((item) => item.key === key)!
    const value = content.trim()
    const updated = await db
      .update(pageSections)
      .set({ content: value, label: section.label, sortOrder: index, updatedAt: new Date() })
      .where(and(eq(pageSections.page, 'keynote'), eq(pageSections.key, key)))

    if (updated.rowCount === 0) {
      await db.insert(pageSections).values({
        page: 'keynote',
        key,
        label: section.label,
        content: value,
        sortOrder: index,
      })
    }
  }

  await recordModeratorAction(session.user.id, 'update-keynote-hero', 'page-content', undefined, 'KEYNOTE hero')
  revalidatePath('/keynote')
  revalidatePath('/admin/keynote')
}

export async function upsertHomepageContent(
  updates: { key: string; content: string }[]
): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum açmanız gerekiyor')
  const [currentUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  if (currentUser?.role !== 'admin') throw new Error('Yetkisiz erişim')

  const allowedSections = DEFAULT_SECTIONS.anasayfa
  const allowedKeys = new Set(allowedSections.map((section) => section.key))
  if (updates.length !== allowedSections.length || new Set(updates.map(({ key }) => key)).size !== allowedSections.length || updates.some(({ key, content }) =>
    !allowedKeys.has(key) || typeof content !== 'string' || content.length > 2000
  )) {
    throw new Error('Geçersiz ana sayfa içeriği')
  }

  const linkUpdates = updates.filter(({ key }) => key.endsWith('_href'))
  for (const { content } of linkUpdates) {
    const href = content.trim()
    if (!href) continue
    if (href.startsWith('/') && !href.startsWith('//')) continue
    try {
      const parsedUrl = new URL(href)
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') throw new Error()
    } catch {
      throw new Error('Bağlantılar site içi yol veya http/https adresi olmalıdır')
    }
  }

  await ensurePageSectionsTable()
  for (const [index, { key, content }] of updates.entries()) {
    const section = allowedSections.find((item) => item.key === key)!
    const value = content.trim()
    const updated = await db
      .update(pageSections)
      .set({ content: value, label: section.label, sortOrder: index, updatedAt: new Date() })
      .where(and(eq(pageSections.page, 'anasayfa'), eq(pageSections.key, key)))

    if (updated.rowCount === 0) {
      await db.insert(pageSections).values({
        page: 'anasayfa',
        key,
        label: section.label,
        content: value,
        sortOrder: index,
      })
    }
  }

  await recordModeratorAction(session.user.id, 'update-homepage', 'page-content', undefined, 'Ana sayfa içerikleri')
  revalidatePath('/')
  revalidatePath('/admin/anasayfa')
}
