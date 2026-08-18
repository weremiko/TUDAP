import type { Metadata } from "next"
import Link from "next/link"
import { Languages, BookText, ArrowRight, Calendar, Newspaper } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "TÜDAP — Turkish Linguistics Platform",
  description:
    "IPA phonetic transcription for Turkish, linguistics terminology dictionary, academic blog and events agenda. A free digital platform for linguists and researchers.",
  keywords: [
    "Turkish linguistics", "IPA transcription", "Turkish phonetics", "phonemic transcription",
    "linguistics terminology", "TÜDAP", "dilbilim.org.tr", "Turkish phonology",
  ],
  alternates: {
    canonical: "https://dilbilim.org.tr/en",
    languages: { "tr": "https://dilbilim.org.tr" },
  },
  openGraph: {
    title: "TÜDAP — Turkish Linguistics Platform",
    description: "IPA phonetic transcription, linguistics dictionary, blog and events for Turkish.",
    url: "https://dilbilim.org.tr/en",
    siteName: "TÜDAP",
    locale: "en_US",
    type: "website",
  },
}

const TOOLS = [
  {
    href: "/cevirici",
    icon: Languages,
    color: "text-chart-1",
    bg: "bg-chart-1/10 group-hover:bg-chart-1/20",
    title: "Phonetic Transcription Tool",
    desc: "Convert Turkish text into IPA notation. Academic broad transcription based on Turkish phonological properties.",
    badge: "Active",
  },
  {
    href: "/terim-sozlugu",
    icon: BookText,
    color: "text-chart-2",
    bg: "bg-chart-2/10 group-hover:bg-chart-2/20",
    title: "Linguistics Terminology Dictionary",
    desc: "700+ terms with Turkish examples and academic explanations. Phonology, syntax, semantics and more.",
    badge: "Active",
  },
  {
    href: "/blog",
    icon: Newspaper,
    color: "text-chart-3",
    bg: "bg-chart-3/10 group-hover:bg-chart-3/20",
    title: "Blog",
    desc: "Linguistics research, academic articles and platform updates. Expert writing on current developments.",
    badge: "Active",
  },
  {
    href: "/ajanda",
    icon: Calendar,
    color: "text-chart-4",
    bg: "bg-chart-4/10 group-hover:bg-chart-4/20",
    title: "Turkish Linguistics Agenda",
    desc: "Follow seminars, conferences, workshops and other linguistics events held in Turkey.",
    badge: "Active",
  },
]

export default function EnHomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1">

        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-20 pb-16">
          <div className="max-w-3xl">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-accent font-medium">Turkish Linguistics Platform</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground tracking-tight leading-[1.08] text-balance">
                Turkish Linguistics
                <br />
                Platform
              </h1>
            </div>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              Free academic tools for Turkish linguistics research. IPA phonetic transcription, terminology dictionary, blog and events agenda — all in one place.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/cevirici"
                className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Open Transcriber
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/en/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About the platform
              </Link>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-accent font-medium mb-1">Modules</p>
              <h2 className="text-2xl font-serif font-bold text-foreground">Tools & Resources</h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOOLS.map(({ href, icon: Icon, color, bg, title, desc, badge }) => (
              <Link
                key={href}
                href={href}
                className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center transition-colors`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground border border-border rounded-full px-2 py-0.5">
                    {badge}
                  </span>
                </div>
                <div className="flex-1 space-y-1.5">
                  <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary font-medium">
                  Explore <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
