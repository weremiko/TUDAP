"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TOOL_LINKS = [
  { href: "/cevirici",      label: "Sesbilimsel Abece Çeviricisi" },
  { href: "/terim-sozlugu", label: "Dilbilim Terimleri Sözlüğü" },
]

const PLATFORM_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/ajanda", label: "Ajanda" },
  { href: "/hakkinda", label: "Platform Hakkında" },
  { href: "/takimimiz", label: "Takımımız" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/sikca-sorulan-sorular", label: "Sık Sorulan Sorular" },
]

const LEGAL_LINKS = [
  { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
  { href: "/kullanim-kosullari",  label: "Kullanım Koşulları" },
  { href: "/cerez-politikasi",    label: "Çerez Politikası" },
]

const TOOL_LINKS_EN = [{ href: "/en/transcriber", label: "Phonetic transcription" }]
const PLATFORM_LINKS_EN = [
  { href: "/en/about", label: "About TÜDAP" },
  { href: "/en/contact", label: "Contact" },
]
const LEGAL_LINKS_EN = [
  { href: "/en/privacy-policy", label: "Privacy policy" },
  { href: "/en/terms-of-use", label: "Terms of use" },
]

export function SiteFooter() {
  const isEnglish = usePathname().startsWith("/en")
  const toolLinks = isEnglish ? TOOL_LINKS_EN : TOOL_LINKS
  const platformLinks = isEnglish ? PLATFORM_LINKS_EN : PLATFORM_LINKS
  const legalLinks = isEnglish ? LEGAL_LINKS_EN : LEGAL_LINKS
  return (
    <footer className="border-t border-border bg-muted/20 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-12 md:py-16">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="block">
              <span className="font-serif text-lg font-bold text-foreground">TÜDAP</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isEnglish
                ? "Turkish Linguistics Research Platform. Open tools and resources for research on Turkish."
                : "Türkçe Dilbilim Araştırma Platformu. Fonetik transkripsiyon, içerikler, etkinlik ajandası ve terminoloji araçları."}
            </p>
            <p className="text-xs text-muted-foreground">
              <a href="mailto:iletisim@dilbilim.org.tr" className="hover:text-foreground transition-colors">
                iletisim@dilbilim.org.tr
              </a>
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-foreground font-semibold mb-4">{isEnglish ? "Tools" : "Araçlar"}</h4>
            <ul className="space-y-2.5">
              {toolLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-foreground font-semibold mb-4">{isEnglish ? "Platform" : "Platform"}</h4>
            <ul className="space-y-2.5">
              {platformLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-foreground font-semibold mb-4">{isEnglish ? "Legal" : "Yasal"}</h4>
            <ul className="space-y-2.5">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 TÜDAP — {isEnglish ? "Turkish Linguistics Research Platform" : "Türkçe Dilbilim Araştırma Platformu"}
          </p>
          <p className="text-xs text-muted-foreground">
            dilbilim.org.tr
          </p>
        </div>
      </div>
    </footer>
  )
}
