import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getPageSections } from "@/app/actions/page-content"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "Hakkında — Türkçe Dilbilim Platformu | TÜDAP",
  description:
    "TÜDAP, Türkçe dilbilim araştırmaları için IPA fonetik transkripsiyon, terim sözlüğü, akademik blog ve etkinlik ajandası sunan ücretsiz dijital platformdur. Proje amacı ve özellikleri.",
  keywords: [
    "TÜDAP hakkında", "türkçe dilbilim platformu", "dilbilim araştırma platformu",
    "IPA transkripsiyon projesi", "türkçe sesbilim araçları",
  ],
  alternates: {
    canonical: `${BASE}/hakkinda`,
    languages: { "en": `${BASE}/en/about`, "tr": `${BASE}/hakkinda` },
  },
  openGraph: {
    title: "Hakkında — Türkçe Dilbilim Platformu | TÜDAP",
    description: "TÜDAP, Türkçe dilbilim araştırmaları için ücretsiz araçlar sunan akademik dijital platformdur.",
    url: `${BASE}/hakkinda`,
    siteName: "TÜDAP",
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "TÜDAP Hakkında" }],
  },
}

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "TÜDAP Hakkında",
  url: `${BASE}/hakkinda`,
  inLanguage: "tr",
  description:
    "TÜDAP (Türkçe Dilbilim Platformu), Türkiye Türkçesine özgü IPA fonetik transkripsiyon, dilbilim terimleri sözlüğü, akademik blog ve etkinlik ajandası sunan ücretsiz platformdur.",
  publisher: {
    "@type": "Organization",
    name: "TÜDAP",
    url: BASE,
    email: "iletisim@dilbilim.org.tr",
    logo: { "@type": "ImageObject", url: `${BASE}/icon.svg` },
    sameAs: [`${BASE}/hakkinda`, `${BASE}/en/about`],
  },
}

// Fallback values in case a section is missing from the DB
const FALLBACKS: Record<string, string> = {
  proje_hakkinda: "TÜDAP (Türkçe Dilbilim Platformu), dilbilim alanında dijital kaynak eksikliğini gidermek amacıyla geliştirilmiş akademik bir platformdur.",
  ozellikler: "IPA fonetik transkripsiyon\nDilbilim terimleri sözlüğü\nAkademik blog\nEtkinlik ajandası",
  kullanim_alanlari: "Dilbilim araştırmaları ve akademik çalışmalar\nTürkçe öğretimi ve telaffuz eğitimi\nKonuşma terapisi ve ses eğitimi",
  akademik_temel: "IPA transkripsiyon sistemi, Türkçenin sesbilimsel özelliklerine dayalı akademik kurallara dayanmaktadır.",
  iletisim_notu: "Öneri, hata bildirimi ve iş birliği talepleriniz için iletisim@dilbilim.org.tr adresine yazabilirsiniz.",
}

function get(sections: Record<string, string>, key: string) {
  return sections[key] ?? FALLBACKS[key] ?? ""
}

// Multi-line content rendered as list items (one per line)
function ContentBlock({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  if (lines.length <= 1) {
    return <p>{text}</p>
  }
  return (
    <ul className="space-y-2 list-none">
      {lines.map((line) => (
        <li key={line} className="flex items-start gap-2">
          <span className="text-primary mt-0.5 shrink-0">–</span>
          {line}
        </li>
      ))}
    </ul>
  )
}

export default async function HakkindaPage() {
  const rows = await getPageSections("hakkinda")
  const s: Record<string, string> = {}
  rows.forEach((r) => (s[r.key] = r.content))

  const sections = [
    { key: "proje_hakkinda",  title: "Proje Hakkında" },
    { key: "ozellikler",      title: "Özellikler" },
    { key: "kullanim_alanlari", title: "Kullanım Alanları" },
    { key: "akademik_temel",  title: "Akademik Temel" },
    { key: "iletisim_notu",   title: "İletişim" },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 flex-1">
        <div className="space-y-2 mb-10">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Platform</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Hakkında</h1>
        </div>

        <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
          {sections.map(({ key, title }) => (
            <div key={key}>
              <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
              <ContentBlock text={get(s, key)} />
              {key === "proje_hakkinda" && (
                <p className="mt-3 italic text-right text-xs">— TÜDAP Ekibi</p>
              )}
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
