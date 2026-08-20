import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Languages, BookText, TreePine, FileText, BarChart3, ArrowRight, Lock, Newspaper, Calendar } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { Metadata } from "next"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "TÜDAP — Türkçe Dilbilim Platformu | IPA Çevirici & Terim Sözlüğü",
   description:
     "Türkçe dilbilim platformu: ücretsiz IPA fonetik transkripsiyon aracı, 700+ madde başı, akademik blog ve etkinlik ajandası. Sesbilim, sözdizimi ve morfoloji araçları.",
  keywords: [
    "türkçe dilbilim", "IPA çevirici", "fonetik transkripsiyon", "türkçe IPA",
    "sesbilimsel transkripsiyon", "dilbilim terimleri sözlüğü", "dilbilim araçları",
    "sesbilim", "sözdizimi", "morfoloji", "anlambilim", "türkçe ses bilgisi",
    "dilbilim semineri", "dilbilim konferansı", "TÜDAP", "dilbilim.org.tr",
    "uluslararası fonetik alfabe", "türkçe dilbilgisi akademik",
  ],
  alternates: {
    canonical: BASE,
    languages: { "en": `${BASE}/en`, "tr": BASE, "x-default": BASE },
  },
  openGraph: {
    title: "TÜDAP — Türkçe Dilbilim Platformu | IPA Çevirici & Terim Sözlüğü",
    description: "Türkçe dilbilim araçları: IPA fonetik transkripsiyon, 700+ terim sözlüğü, akademik blog ve etkinlik ajandası.",
    url: BASE,
    siteName: "TÜDAP",
    locale: "tr_TR",
    type: "website",
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "TÜDAP — Türkçe Dilbilim Platformu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TÜDAP — Türkçe Dilbilim Platformu",
    description: "Ücretsiz IPA fonetik transkripsiyon, 700+ madde başı, blog ve etkinlik ajandası.",
    images: [`${BASE}/og-image.png`],
  },
}

const homepageJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Sesbilimsel Abece Çeviricisi",
    url: `${BASE}/cevirici`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "tr",
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
    description: "Türkçe metinleri IPA (Uluslararası Fonetik Alfabe) formatına dönüştüren ücretsiz akademik transkripsiyon aracı.",
    publisher: { "@type": "Organization", name: "TÜDAP", url: BASE },
    featureList: ["Geniş transkripsiyon", "Dar transkripsiyon", "700+ sözcük desteği", "Ücretsiz kullanım"],
  },
  {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Türkçe Dilbilim Terimleri Sözlüğü",
    url: `${BASE}/terim-sozlugu`,
    description: "700'den fazla dilbilim terimi, Türkçe örnekler ve akademik açıklamalar içeren ücretsiz veritabanı.",
    inLanguage: "tr",
    license: "https://creativecommons.org/licenses/by-nc/4.0/",
    creator: { "@type": "Organization", name: "TÜDAP", url: BASE },
    keywords: ["dilbilim", "sesbilim", "sözdizimi", "morfoloji", "anlambilim", "terminoloji"],
  },
]

const TOOLS = [
  {
    href: "/cevirici",
    icon: Languages,
    color: "text-primary",
    bg: "bg-primary/10 group-hover:bg-primary/20",
    title: "Sesbilimsel Abece Çeviricisi",
    desc: "Türkçe metinleri IPA formatına çevirin. Geniş ve dar transkripsiyon seçenekleri ile akademik düzeyde çıktı.",
    badge: "Aktif",
    disabled: false,
  },
  {
    href: "/terim-sozlugu",
    icon: BookText,
    color: "text-chart-2",
    bg: "bg-chart-2/10 group-hover:bg-chart-2/20",
    title: "Dilbilim Terimleri Sözlüğü",
    desc: "700+ terim, Türkçe örnekler ve akademik açıklamalar. Sesbilim, sözdizimi, anlambilim ve daha fazlası. Yönetici panelinden dinamik ekleme.",
    badge: "Aktif",
    disabled: false,
  },
  {
    href: "/blog",
    icon: Newspaper,
    color: "text-chart-3",
    bg: "bg-chart-3/10 group-hover:bg-chart-3/20",
    title: "Blog",
    desc: "Dilbilim araştırmaları, akademik yazılar ve platform güncellemeleri. Uzman yazılar ve son gelişmeler hakkında bilgi.",
    badge: "Aktif",
    disabled: false,
  },
  {
    href: "/ajanda",
    icon: Calendar,
    color: "text-chart-4",
    bg: "bg-chart-4/10 group-hover:bg-chart-4/20",
    title: "Türkiye Dilbilim Ajandası",
    desc: "Dilbilim alanında düzenlenen seminerler, konferanslar, çalıştaylar ve diğer etkinlikleri takip edin.",
    badge: "Aktif",
    disabled: false,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {homepageJsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <SiteHeader />

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pt-20 sm:pt-28 pb-16 sm:pb-20">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-accent font-medium">Türkçe Dilbilim Platformu</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground tracking-tight leading-[1.08] text-balance">
              Türkçe Dilbilim
              <br />
              Platformu
            </h1>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Türkiye Türkçesine özgü fonetik transkripsiyon, sözdizimsel analiz ve terminoloji araçları.
            Akademik çalışmalar ve dilbilim eğitimi için geliştirilmiş dijital platform.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/cevirici">
              <Button size="lg" className="h-11 px-7 text-sm font-medium">
                Araçları Keşfet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/hakkinda">
              <Button variant="outline" size="lg" className="h-11 px-7 text-sm font-medium bg-transparent">
                Platform Hakkında
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {[
              ["3", "Aktif Araç"],
              ["700+", "Dilbilim Terimi"],
              ["%100", "Ücretsiz"],
            ].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl md:text-3xl font-serif font-bold text-foreground">{val}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16 sm:py-20">
        <div className="mb-10 space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Araçlar</p>
          <h2 className="text-2xl font-serif font-bold text-foreground">Neler yapabilirsiniz?</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOLS.map(({ href, icon: Icon, color, bg, title, desc, badge, disabled }) =>
            disabled ? (
              <div key={href} className="opacity-50 cursor-not-allowed">
                <Card className="p-6 h-full border-dashed border-border">
                  <div className="space-y-4">
                    <div className={`w-11 h-11 rounded-xl ${bg.split(" ")[0]} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-foreground">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      Yakında kullanılabilir
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Link key={href} href={href} className="group">
                <Card className="p-6 h-full border-border hover:border-primary/40 hover:shadow-md transition-all duration-200">
                  <div className="space-y-4">
                    <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center transition-colors`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">{title}</h3>
                        {badge && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/20">
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Aracı aç <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
