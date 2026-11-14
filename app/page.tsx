import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HomeTabs } from "@/components/home-tabs"
import { HomeBlogSlider } from "@/components/home-blog-slider"
import { HomeGlossarySearch } from "@/components/home-glossary-search"
import { HomeRoadmap } from "@/components/home-roadmap"
import { getBlogPosts } from "@/app/actions/blog"
import { getActiveAnnouncement } from "@/app/actions/announcements"
import { getEvents } from "@/app/actions/events"
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
  const [{ posts: latestPosts }, announcement, allEvents] = await Promise.all([
    getBlogPosts(1, 6, true),
    getActiveAnnouncement(),
    getEvents(),
  ])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingEvents = allEvents.filter((event) => new Date(event.endDate ?? event.date) >= today)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {homepageJsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <SiteHeader />
      <AnnouncementPopup announcement={announcement} />

      <section className="border-b border-border bg-background">
        <div className="container mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16 lg:px-10 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-end lg:gap-20">
            <div>
              <p className="mb-7 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Türkçe Dilbilim Araştırma Platformu</p>
              <h1 className="max-w-3xl font-serif text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-foreground text-balance sm:text-6xl lg:text-[4.5rem]">
                Türkçeyi sesinden yapısına kadar <span className="italic text-accent">inceleyin.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Dilbilim merakı için açık bir çalışma alanı: metni çözümleyin, kavramları araştırın, yeni okumalar keşfedin.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <Link href="/cevirici" className="font-semibold text-foreground underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent">Metin çözümleyici</Link>
                <Link href="/terim-sozlugu" className="text-muted-foreground underline decoration-border underline-offset-8 transition-colors hover:text-foreground">Terim sözlüğü</Link>
              </div>
            </div>

            <div className="lg:pb-1">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Platformda</p>
              <div className="border-t border-border">
                <Link href="/cevirici" className="group grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border py-4 transition-colors hover:text-accent">
                  <span className="pt-1 font-mono text-xs text-muted-foreground">01</span>
                  <span><strong className="block text-sm font-semibold">Sesbilim</strong><span className="mt-1 block text-sm text-muted-foreground">Türkçe metinler için IPA transkripsiyonu</span></span>
                </Link>
                <Link href="/terim-sozlugu" className="group grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border py-4 transition-colors hover:text-accent">
                  <span className="pt-1 font-mono text-xs text-muted-foreground">02</span>
                  <span><strong className="block text-sm font-semibold">Dilbilim terimleri</strong><span className="mt-1 block text-sm text-muted-foreground">700’den fazla madde ve açıklama</span></span>
                </Link>
                <Link href="/blog" className="group grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border py-4 transition-colors hover:text-accent">
                  <span className="pt-1 font-mono text-xs text-muted-foreground">03</span>
                  <span><strong className="block text-sm font-semibold">Yazılar</strong><span className="mt-1 block text-sm text-muted-foreground">Dil üzerine okumalar ve araştırmalar</span></span>
                </Link>
              </div>
              <form action="/terim-sozlugu" className="mt-6 flex items-center gap-3 border-b border-foreground/50 pb-2 focus-within:border-accent">
                <label htmlFor="hero-term-search" className="sr-only">Terim ara</label>
                <input id="hero-term-search" name="q" type="search" placeholder="Sözlükte terim ara" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <button type="submit" className="text-sm font-medium text-accent hover:underline">Ara</button>
              </form>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground sm:mt-16">
            <span>700+ dilbilim terimi</span><span>Açık erişim</span><span>Türkçe odağı</span>
          </div>
        </div>
      </section>

      <HomeRoadmap events={upcomingEvents} />

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
