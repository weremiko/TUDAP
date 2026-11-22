import type { Metadata } from "next"
import { KeynoteSite } from "@/components/keynote-site"
import { getPageSections } from "@/app/actions/page-content"
import "@/styles/keynote.css"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "KEYNOTE’26 — Dilbilimde yeni bir frekans",
  description: "TÜDAP lansman etkinliği KEYNOTE’26 için etkinlik bilgileri ve dijital bilet kaydı.",
  alternates: { canonical: `${BASE}/keynote` },
  openGraph: {
    title: "KEYNOTE’26 — Dilbilimde yeni bir frekans",
    description: "15 Aralık 2026 · Köyceğiz, Merkez Kütüphane · TÜDAP lansmanı",
    url: `${BASE}/keynote`,
    siteName: "TÜDAP",
    locale: "tr_TR",
    type: "website",
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "KEYNOTE’26 TÜDAP lansman etkinliği" }],
  },
}

export default async function KeynotePage() {
  const sections = await getPageSections("keynote")
  const values = Object.fromEntries(sections.map(({ key, content }) => [key, content]))

  return (
    <KeynoteSite
      hero={{
        eyebrow: values.hero_eyebrow ?? "TÜDAP LANSMANI",
        title: values.hero_title ?? "Dilbilimde\ndijital gelecek\nkuruluyor.",
        description: values.hero_description ?? "Türkçe Dilbilim Araştırma Platformu’nun lansman buluşması.",
        date: values.hero_date ?? "15 Aralık 2026",
        location: values.hero_location ?? "Köyceğiz Merkez Kütüphane",
        posterUrl: values.hero_poster_url ?? "",
      }}
    />
  )
}
