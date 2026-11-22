import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HomeTabs } from "@/components/home-tabs"
import { HomeBlogSlider } from "@/components/home-blog-slider"
import { HomeGlossarySearch } from "@/components/home-glossary-search"
import { HomeRoadmap } from "@/components/home-roadmap"
import { HomeHeroCopy } from "@/components/home-hero-copy"
import { getBlogPosts } from "@/app/actions/blog"
import { getActiveAnnouncement } from "@/app/actions/announcements"
import { getEvents } from "@/app/actions/events"
import { getPageSections } from "@/app/actions/page-content"
import { AnnouncementPopup } from "@/components/announcement-popup"
import type { Metadata } from "next"

const BASE = "https://dilbilim.org.tr"

const DEFAULT_HOME_TITLE = "TÜDAP — Türkçe Dilbilim Araştırma Platformu | IPA Çevirici & Terim Sözlüğü"
const DEFAULT_HOME_DESCRIPTION = "Türkçe Dilbilim Araştırma Platformu: ücretsiz IPA fonetik transkripsiyon aracı, 700+ madde başı, akademik içerikler ve etkinlik ajandası."

export async function generateMetadata(): Promise<Metadata> {
  const sections = await getPageSections("anasayfa")
  const content = Object.fromEntries(sections.map(({ key, content }) => [key, content]))
  const title = content.seo_title || DEFAULT_HOME_TITLE
  const description = content.seo_description || DEFAULT_HOME_DESCRIPTION

  return {
    title,
    description,
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
      title,
      description,
      url: BASE,
      siteName: "TÜDAP",
      locale: "tr_TR",
      type: "website",
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "TÜDAP — Türkçe Dilbilim Araştırma Platformu" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE}/og-image.png`],
    },
  }
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
  const [{ posts: latestPosts }, announcement, allEvents, homeSections] = await Promise.all([
    getBlogPosts(1, 6, true),
    getActiveAnnouncement(),
    getEvents(),
    getPageSections("anasayfa"),
  ])
  const home = Object.fromEntries(homeSections.map(({ key, content }) => [key, content]))
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

      {/* Hero */}
      <section className="border-y border-border/80 bg-muted/20">
        <div className="container mx-auto min-h-[570px] max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-4xl">
            <div className="mb-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">
              <span className="h-px w-8 bg-accent" />
              {home.hero_eyebrow}
            </div>
            <HomeHeroCopy headlines={home.hero_headlines} />
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {home.hero_description}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href={home.hero_primary_href}>
                <Button size="lg" className="h-12 rounded-full px-7 text-sm font-medium">
                  {home.hero_primary_label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={home.hero_secondary_href} className="text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                {home.hero_secondary_label}
              </Link>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
            {[1, 2, 3].map((index) => <span key={index}><strong className="font-semibold text-foreground">{home[`stat_${index}_value`]}</strong> {home[`stat_${index}_label`]}</span>)}
          </div>
        </div>
        <div className="container mx-auto max-w-6xl border-t border-border px-4 py-4 sm:px-6 lg:px-8">
          <form action="/terim-sozlugu" className="flex max-w-xl items-center gap-3">
            <label htmlFor="hero-term-search" className="sr-only">{home.term_search_label}</label>
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{home.term_search_label}</span>
            <input id="hero-term-search" name="q" type="search" placeholder={home.term_search_placeholder} className="min-w-0 flex-1 border-0 border-b border-border bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent" />
            <button type="submit" className="text-sm font-medium text-accent hover:underline">{home.term_search_button}</button>
          </form>
        </div>
      </section>

      <HomeRoadmap events={upcomingEvents} content={home} />

      {/* Tool cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16 sm:py-20">
        <div className="mb-10 space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{home.tools_eyebrow}</p>
          <h2 className="text-2xl font-serif font-bold text-foreground">{home.tools_title}</h2>
        </div>
        <HomeTabs content={home} />
      </section>

      <HomeBlogSlider posts={latestPosts} content={home} />
      <HomeGlossarySearch content={home} />

      <SiteFooter />
    </div>
  )
}
