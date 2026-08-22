import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TreePine, FileText, BarChart3 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HomeTabs } from "@/components/home-tabs"
import { HomeBlogSlider } from "@/components/home-blog-slider"
import { HomeGlossarySearch } from "@/components/home-glossary-search"
import { HomeRoadmap } from "@/components/home-roadmap"
import { getBlogPosts } from "@/app/actions/blog"
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

export default async function Home() {
  const { posts: latestPosts } = await getBlogPosts(1, 6, true)

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

      <HomeRoadmap />

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
        <HomeTabs />
      </section>

      <HomeBlogSlider posts={latestPosts} />
      <HomeGlossarySearch />

      <SiteFooter />
    </div>
  )
}
