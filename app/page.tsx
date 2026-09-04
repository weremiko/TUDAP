import Link from "next/link"
import { ArrowRight, BookText, Compass, Languages, Radio, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getBlogPosts } from "@/app/actions/blog"
import { getActiveAnnouncement } from "@/app/actions/announcements"
import { AnnouncementPopup } from "@/components/announcement-popup"
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
    languages: { en: `${BASE}/en`, tr: BASE, "x-default": BASE },
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

const roadmapSteps = [
  { icon: Compass, title: "Keşfet", text: "700+ terim ve kavramla Türkçenin kuramsal yapısını tanıyın." },
  { icon: Languages, title: "Uygula", text: "Sesbilim ve transkripsiyon araçlarıyla metinleri akademik formata çevirin." },
  { icon: Radio, title: "Takip Et", text: "Türkiye genelindeki dilbilim seminer ve konferanslarından haberdar olun." },
]

const toolCards = [
  { href: "/cevirici", icon: "ʃ", title: "Sesbilimsel abece çeviricisi", description: "Türkçe metinleri saniyeler içinde Uluslararası Fonetik Alfabe (IPA) gösterimine dönüştürün." },
  { href: "/terim-sozlugu", icon: "§", title: "Dilbilim terimleri sözlüğü", description: "700'den fazla terimi Türkçe örnekler ve akademik açıklamalarla birlikte inceleyin." },
]

const blogCards = [
  { date: "30 Temmuz 2026", title: "Sosyodilbilim nedir?", text: "Dil kullanımının yaş, sınıf ve kültürle ilişkisini inceleyen alan." },
  { date: "24 Temmuz 2026", title: "Hesaplamalı dilbilim nedir?", text: "Doğal dili bilgisayarlarla işlemeyi hedefleyen disiplinler arası çalışma." },
  { date: "18 Temmuz 2026", title: "Anlambilim (semantik) nedir?", text: "Sözcük ve cümlelerde anlamın nasıl kurulduğunu araştıran alt dal." },
  { date: "15 Temmuz 2026", title: "Morfoloji nedir?", text: "Sözcüklerin iç yapısını ve anlam üretimini konu alan inceleme." },
]

export default async function Home() {
  const [{ posts: latestPosts }, announcement] = await Promise.all([
    getBlogPosts(1, 6, true),
    getActiveAnnouncement(),
  ])

  return (
    <div className="min-h-screen bg-background flex flex-col tudap-landing">
      {homepageJsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <SiteHeader />
      <AnnouncementPopup announcement={announcement} />

      <main className="flex-1">
        <section className="tudap-hero">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="tudap-hero-grid">
              <div className="space-y-8">
                <div className="space-y-3">
                  <p className="hero-kicker">Türkçe Dilbilim Platformu</p>
                  <h1 className="max-w-[620px] text-5xl md:text-6xl lg:text-[64px] font-serif font-bold leading-[1.05] tracking-[-0.03em] text-foreground">
                    Türkçenin sesini, yapısını ve anlamını bilimsel olarak keşfedin.
                  </h1>
                </div>

                <p className="max-w-[500px] text-lg leading-relaxed text-muted-foreground">
                  Türkiye Türkçesine özgü fonetik transkripsiyon, sözdizimsel analiz ve terminoloji araçları — akademik çalışmalar ve dilbilim eğitimi için tek platformda.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/cevirici">
                    <Button size="lg" className="h-12 px-7 text-sm font-medium">
                      Araçları keşfet
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/hakkinda">
                    <Button variant="outline" size="lg" className="h-12 border-border bg-transparent px-7 text-sm font-medium">
                      Platform hakkında
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="tudap-visual" aria-hidden="true">
                <div className="visual-orbit orbit-1" />
                <div className="visual-orbit orbit-2" />
                <div className="visual-core" />
                <div className="visual-pulse pulse-1" />
                <div className="visual-pulse pulse-2" />
                <div className="visual-badge">
                  <Sparkles className="h-4 w-4" />
                  Fonetik + terminoloji
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 sm:py-24">
          <div className="mb-12 max-w-[620px]">
            <h2 className="text-3xl font-serif font-bold tracking-[-0.02em] text-foreground sm:text-4xl">3 adımda platform döngüsü</h2>
            <p className="mt-4 text-lg text-muted-foreground">Terimden araca, araçtan takibe — dilbilimle ilgilenen herkes için düşünülmüş bir akış.</p>
          </div>

          <div className="tudap-steps">
            {roadmapSteps.map(({ icon: Icon, title, text }, idx) => (
              <div key={title} className="tudap-step">
                <div className="tudap-step-num">Adım {idx + 1}</div>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-background text-primary shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="araclar" className="bg-muted/30 py-20 sm:py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-[620px]">
              <h2 className="text-3xl font-serif font-bold tracking-[-0.02em] text-foreground sm:text-4xl">Neler yapabilirsiniz?</h2>
              <p className="mt-4 text-lg text-muted-foreground">Araştırmanızı hızlandıracak iki temel araç, tek arayüzde.</p>
            </div>

            <div className="tudap-tools">
              {toolCards.map(({ href, icon, title, description }) => (
                <div key={title} className="tudap-tool-card">
                  <div className="tool-icon">{icon}</div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <Link href={href} className="tool-link">
                    Açıkla <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 sm:py-24">
          <div className="mb-12 max-w-[620px]">
            <h2 className="text-3xl font-serif font-bold tracking-[-0.02em] text-foreground sm:text-4xl">Son blog yazıları</h2>
            <p className="mt-4 text-lg text-muted-foreground">Güncel okumalar: alt dallardan kısa ve öz girişler.</p>
          </div>

          <div className="tudap-blog-grid">
            {blogCards.map(({ date, title, text }) => (
              <article key={title} className="tudap-blog-card">
                <div className="tudap-blog-date">{date}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8 sm:pb-24">
          <div className="tudap-search-cta">
            <div className="tudap-search-text">
              <h2>Bir terim arayın, kavramı keşfedin.</h2>
              <p>Türkçe dilbilim terimleri arasında hızlıca arama yapın.</p>
            </div>
            <div className="tudap-search-box">
              <input type="text" placeholder="örn. biçimbirim, tonlama, artzamanlılık…" aria-label="Terim ara" />
              <Button size="sm" className="h-10 rounded-full bg-white text-foreground hover:bg-white/90">
                <Search className="mr-2 h-4 w-4" />
                Ara
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
