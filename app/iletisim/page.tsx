import type { Metadata } from "next"
import { Mail } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getPageSections } from "@/app/actions/page-content"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "İletişim — TÜDAP | Dilbilim Platformu",
  description:
    "TÜDAP ile iletişime geçin. Hata bildirimi, öneri ve akademik iş birliği talepleri için iletisim@dilbilim.org.tr adresini kullanabilirsiniz.",
  keywords: ["TÜDAP iletişim", "dilbilim platformu iletişim", "akademik iş birliği"],
  alternates: {
    canonical: `${BASE}/iletisim`,
    languages: { "en": `${BASE}/en/contact`, "tr": `${BASE}/iletisim` },
  },
  openGraph: {
    title: "İletişim | TÜDAP",
    description: "TÜDAP ile iletişime geçin. Hata bildirimi, öneri ve akademik iş birliği talepleri için.",
    url: `${BASE}/iletisim`,
    siteName: "TÜDAP",
  },
}

const FALLBACKS: Record<string, string> = {
  giris_metni: "Sorularınız, önerileriniz ve akademik iş birliği talepleriniz için her zaman açığız.",
  eposta_adresi: "iletisim@dilbilim.org.tr",
  sss_1_soru: "Bu platform ücretsiz mi?",
  sss_1_cevap: "Evet, TÜDAP tamamen ücretsizdir ve kar amacı gütmemektedir.",
  sss_3_soru: "Hata bildirimi nasıl yapabilirim?",
  sss_3_cevap: "Herhangi bir araç sayfasındaki 'Hata Bildir' butonu veya e-posta ile bildirimde bulunabilirsiniz.",
}

function get(s: Record<string, string>, key: string) {
  return s[key] ?? FALLBACKS[key] ?? ""
}

export default async function IletisimPage() {
  const rows = await getPageSections("iletisim")
  const s: Record<string, string> = {}
  rows.forEach((r) => (s[r.key] = r.content))

  const email = get(s, "eposta_adresi")

  const faqKeys = [
    { soru: "sss_1_soru", cevap: "sss_1_cevap" },
    { soru: "sss_3_soru", cevap: "sss_3_cevap" },
  ]

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "TÜDAP İletişim",
    url: `${BASE}/iletisim`,
    inLanguage: "tr",
    description: "TÜDAP iletişim sayfası. Hata bildirimi, öneri ve akademik iş birliği talepleri.",
    mainEntity: {
      "@type": "Organization",
      name: "TÜDAP",
      email: email,
      url: BASE,
      contactPoint: {
        "@type": "ContactPoint",
        email: email,
        contactType: "customer support",
        availableLanguage: ["Turkish", "English"],
      },
    },
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 flex-1">
        <div className="space-y-2 mb-10">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Platform</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">İletişim</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {get(s, "giris_metni")}
          </p>
        </div>

        <div className="space-y-10">
          {/* Email card */}
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">E-posta</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </a>

          {/* FAQ */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-5">Sık Sorulan Sorular</h2>
            <div className="space-y-4">
              {faqKeys.map(({ soru, cevap }) => (
                <div key={soru} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground mb-1">{get(s, soru)}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{get(s, cevap)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
