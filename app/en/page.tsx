import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, BookOpenText, CalendarDays, FileStack, Languages } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HomeParticleField } from "@/components/home-particle-field"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "TÜDAP — Turkish Linguistics Research Platform",
  description: "Open research tools and resources for Turkish linguistics: IPA transcription, terminology, scholarly content and academic events.",
  keywords: ["Turkish linguistics", "IPA transcription", "Turkish phonetics", "linguistics terminology", "TÜDAP", "Turkish phonology"],
  alternates: { canonical: `${BASE}/en`, languages: { tr: BASE } },
  openGraph: {
    title: "TÜDAP — Turkish Linguistics Research Platform",
    description: "Open tools and shared resources for research on Turkish.",
    url: `${BASE}/en`,
    siteName: "TÜDAP",
    locale: "en_US",
    type: "website",
  },
}

const RESOURCES = [
  { href: "/en/transcriber", icon: Languages, index: "01", title: "Phonetic transcription", detail: "Turn Turkish text into IPA, with broad and narrow transcription options.", access: "English interface" },
  { href: "/terim-sozlugu", icon: BookOpenText, index: "02", title: "Terminology dictionary", detail: "Browse a growing collection of linguistics terms, definitions and English equivalents.", access: "Turkish interface" },
  { href: "/blog", icon: FileStack, index: "03", title: "Research contents", detail: "Articles and media shared by the Turkish linguistics community.", access: "Mostly Turkish" },
  { href: "/ajanda", icon: CalendarDays, index: "04", title: "Events agenda", detail: "Seminars, conferences and workshops taking place across Türkiye.", access: "Turkish interface" },
]

export default function EnHomePage() {
  return (
    <div lang="en" className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden border-b border-[#d5d9ce] bg-[#edf0e8]">
          <HomeParticleField className="opacity-45" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(237,240,232,0.98)_0%,rgba(237,240,232,0.9)_43%,rgba(237,240,232,0.24)_100%)]" />
          <div className="relative mx-auto flex min-h-[510px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#526a55]">TÜDAP · Turkish Linguistics Research Platform</p>
              <h1 className="max-w-2xl font-serif text-5xl font-bold leading-[1.04] text-[#20271f] sm:text-6xl">
                Turkish Linguistics<br />Research Platform
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#566157]">
                A shared workspace for exploring Turkish sounds, terminology, research and the people building linguistic knowledge.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="/en/transcriber" className="inline-flex h-11 items-center gap-2 rounded-md bg-[#263b2b] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#385640]">
                  Open the transcriber <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/en/about" className="inline-flex items-center gap-1 text-sm font-medium text-[#33483a] hover:underline">
                  About TÜDAP <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-8 text-xs text-[#687367]">The transcription tool has an English interface; several community resources are currently Turkish-first.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 sm:py-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Explore TÜDAP</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Tools &amp; community resources</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">Start with the transcriber, then explore resources contributed to Turkish linguistics.</p>
          </div>
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:gap-x-10 sm:divide-y-0 lg:grid-cols-4">
            {RESOURCES.map(({ href, icon: Icon, index, title, detail, access }) => (
              <Link key={href} href={href} className="group flex min-h-52 flex-col border-b border-border py-5 sm:border-b-0 sm:py-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{index}</span>
                  <Icon className="h-5 w-5 text-[#52705a] transition-transform group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-6 font-serif text-lg font-semibold text-foreground group-hover:text-primary">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{detail}</p>
                <span className="mt-4 text-[11px] font-medium uppercase text-[#667765]">{access}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
