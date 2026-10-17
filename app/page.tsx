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
import { getActiveAnnouncement } from "@/app/actions/announcements"
import { AnnouncementPopup } from "@/components/announcement-popup"
import type { Metadata } from "next"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "TÜDAP — Türkçe Dilbilim Araştırma Platformu | IPA Çevirici & Terim Sözlüğü",
   description:
    "Türkçe Dilbilim Araştırma Platformu: ücretsiz IPA fonetik transkripsiyon aracı, 700+ madde başı, akademik içerikler ve etkinlik ajandası.",
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
    title: "TÜDAP — Türkçe Dilbilim Araştırma Platformu | IPA Çevirici & Terim Sözlüğü",
    description: "Türkçe dilbilim araçları: IPA fonetik transkripsiyon, 700+ terim sözlüğü, akademik içerikler ve etkinlik ajandası.",
    url: BASE,
    siteName: "TÜDAP",
    locale: "tr_TR",
    type: "website",
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "TÜDAP — Türkçe Dilbilim Araştırma Platformu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TÜDAP — Türkçe Dilbilim Araştırma Platformu",
    description: "Ücretsiz IPA fonetik transkripsiyon, 700+ terim, akademik içerikler ve etkinlik ajandası.",
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
  const [{ posts: latestPosts }, announcement] = await Promise.all([
    getBlogPosts(1, 6, true),
    getActiveAnnouncement(),
  ])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {homepageJsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <SiteHeader />
      <AnnouncementPopup announcement={announcement} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="container mx-auto grid min-h-[570px] max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] lg:gap-16 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">
              <span className="h-px w-8 bg-accent" />
              Türkçe üzerine çalışanlar için
            </div>
            <h1 className="max-w-xl font-serif text-5xl font-bold leading-[1.02] tracking-tight text-foreground text-balance sm:text-6xl lg:text-7xl">
              Dili yalnızca okumayın, <span className="text-accent">inceleyin.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Türkçe metinleri seslerine, yapılarına ve anlamlarına ayıran açık bir çalışma alanı. IPA çevirici, terim sözlüğü ve akademik içerikler tek yerde.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/cevirici">
                <Button size="lg" className="h-12 rounded-full px-7 text-sm font-medium">
                  Metinle başla
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/terim-sozlugu" className="text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                Terim sözlüğüne git
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
              <span><strong className="font-semibold text-foreground">700+</strong> dilbilim terimi</span>
              <span><strong className="font-semibold text-foreground">Ücretsiz</strong> araçlar</span>
              <span><strong className="font-semibold text-foreground">Türkçe</strong> odaklı</span>
            </div>
          </div>

          <div className="relative lg:justify-self-end">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/10">
              <div className="border-b border-border px-5 py-4 sm:px-7">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">TÜDAP çalışma masası</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <h2 className="font-serif text-2xl font-semibold text-foreground">Bir sorudan<br />bir araştırmaya</h2>
                  <span className="mb-1 text-3xl font-serif text-accent/70">01</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                <Link href="/cevirici" className="group flex items-center justify-between px-5 py-5 transition-colors hover:bg-muted/50 sm:px-7">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sesi dinle</p>
                    <p className="mt-1 text-xs text-muted-foreground">Türkçe metnin söyleyişini incele</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
                <Link href="/terim-sozlugu" className="group flex items-center justify-between px-5 py-5 transition-colors hover:bg-muted/50 sm:px-7">
                  <div>
                    <p className="text-sm font-medium text-foreground">Kavramı bul</p>
                    <p className="mt-1 text-xs text-muted-foreground">700&apos;den fazla terim ve açıklama</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
                <Link href="/blog" className="group flex items-center justify-between px-5 py-5 transition-colors hover:bg-muted/50 sm:px-7">
                  <div>
                    <p className="text-sm font-medium text-foreground">Bağlamı oku</p>
                    <p className="mt-1 text-xs text-muted-foreground">Akademik yazılar ve güncel çalışmalar</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </div>
              <div className="flex items-center justify-between bg-muted/40 px-5 py-4 text-xs text-muted-foreground sm:px-7">
                <span>Açık ve ücretsiz</span>
                <span className="font-medium text-foreground">Türkçe dilbilim</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeRoadmap />

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
