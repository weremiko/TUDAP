"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ChevronDown, LogIn, LogOut, LayoutDashboard, Globe, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

const TOOL_LINKS = [
  { href: "/cevirici",      label: "Sesbilimsel Abece Çeviricisi" },
  { href: "/terim-sozlugu", label: "Dilbilim Terimleri Sözlüğü" },
]

const NAV_LINKS = [
  { href: "/blog",     label: "Blog" },
  { href: "/ajanda",   label: "Ajanda" },
  { href: "/hakkinda", label: "Hakkında" },
  { href: "/takimimiz", label: "Takımımız" },
  { href: "/iletisim", label: "İletişim" },
]

// Maps TR paths to EN equivalents and vice versa
const LANG_MAP: Record<string, string> = {
  "/":           "/en",
  "/hakkinda":   "/en/about",
  "/iletisim":   "/en/contact",
  "/cevirici":   "/en/transcriber",
  "/en":         "/",
  "/en/about":   "/hakkinda",
  "/en/contact": "/iletisim",
  "/en/transcriber": "/cevirici",
  "/en/privacy-policy": "/gizlilik-politikasi",
  "/en/terms-of-use": "/kullanim-kosullari",
}

function LangSwitcher({ pathname }: { pathname: string }) {
  const isEn = pathname.startsWith("/en")
  const target = LANG_MAP[pathname] ?? (isEn ? "/" : "/en")
  return (
    <Link
      href={target}
      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2.5 py-1.5"
      title={isEn ? "Türkçeye geç" : "Switch to English"}
    >
      <Globe className="h-3.5 w-3.5" />
      {isEn ? "TR" : "EN"}
    </Link>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const isEnglish = pathname.startsWith("/en")
  const toolLinks = isEnglish
    ? [{ href: "/en/transcriber", label: "Phonetic Transcription" }]
    : TOOL_LINKS
  const navLinks = isEnglish
    ? [{ href: "/en/about", label: "About" }, { href: "/en/contact", label: "Contact" }]
    : NAV_LINKS
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false)
  const { data: session } = authClient.useSession()

  const role = (session?.user as any)?.role
  const isStaff = role === "admin" || role === "moderator"

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="h-1 bg-primary" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between gap-8 py-3.5">

          <Link href={isEnglish ? "/en" : "/"} className="group shrink-0">
            <span className="block font-serif text-xl font-bold leading-none tracking-tight text-foreground">TÜDAP</span>
            <span className="mt-1 block max-w-[240px] text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{isEnglish ? "Turkish Linguistics Research Platform" : "Türkçe Dilbilim Araştırma Platformu"}</span>
          </Link>

          <nav className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/35 p-1">
            {/* Araçlar dropdown */}
            <div className="relative">
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${toolsDropdownOpen || TOOL_LINKS.some(({ href }) => pathname === href) ? "bg-background text-primary shadow-sm" : "text-foreground hover:bg-background/80 hover:text-primary"}`}
              >
                  {isEnglish ? "Tools" : "Araçlar"}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${toolsDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {toolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-lg border border-border bg-background p-1.5 shadow-xl shadow-foreground/5 z-50">
                  {toolLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setToolsDropdownOpen(false)}
                      className={`block rounded-md px-3 py-2.5 text-sm transition-colors ${
                        pathname === href ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-muted/60 hover:text-primary"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === href ? "bg-background text-primary shadow-sm" : "text-foreground hover:bg-background/80 hover:text-primary"}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth area */}
          <div className="flex items-center gap-2 border-l border-border pl-5">
            <LangSwitcher pathname={pathname} />
            {session?.user ? (
              <>
                {isStaff && (
                  <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/admin"><LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />{isEnglish ? "Admin" : "Yönetim"}</Link>
                  </Button>
                )}
                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  <Link href="/profil"><UserCircle className="h-3.5 w-3.5 mr-1.5" />{isEnglish ? "Profile" : "Profil"}</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  {isEnglish ? "Sign out" : "Çıkış"}
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <Link href="/sign-in"><LogIn className="h-3.5 w-3.5 mr-1.5" />{isEnglish ? "Sign in" : "Giriş Yap"}</Link>
                </Button>
                <Button asChild size="sm" className="text-xs">
                  <Link href="/sign-up">{isEnglish ? "Create account" : "Kayıt Ol"}</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center justify-between py-3.5">
          <Link href={isEnglish ? "/en" : "/"} className="block">
            <span className="block font-serif text-base font-bold leading-none text-foreground">TÜDAP</span>
            <span className="mt-1 block max-w-[230px] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">{isEnglish ? "Turkish Linguistics Research Platform" : "Türkçe Dilbilim Araştırma Platformu"}</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 border border-border text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menüyü aç/kapat"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-border py-4 space-y-0.5">
            <p className="px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold text-accent">{isEnglish ? "Tools" : "Araçlar"}</p>
            {toolLinks.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2.5 text-sm transition-colors ${pathname === href ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:text-primary hover:bg-muted/50"}`}
              >{label}</Link>
            ))}
            <div className="my-2 border-t border-border" />
            <p className="px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold text-accent">{isEnglish ? "Platform" : "Platform"}</p>
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2.5 text-sm transition-colors ${pathname === href ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:text-primary hover:bg-muted/50"}`}
              >{label}</Link>
            ))}
            <div className="my-2 border-t border-border" />
            <div className="px-3 py-2">
              <LangSwitcher pathname={pathname} />
            </div>
            <div className="my-2 border-t border-border" />
            {session?.user ? (
              <>
                {isStaff && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded text-sm text-foreground hover:bg-muted/50">
                    <LayoutDashboard className="h-4 w-4" />{isEnglish ? "Admin" : "Yönetim Paneli"}
                  </Link>
                )}
                <Link href="/profil" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded text-sm text-foreground hover:bg-muted/50">
                  <UserCircle className="h-4 w-4" />{isEnglish ? "Profile" : "Profil"}
                </Link>
                <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4" />{isEnglish ? "Sign out" : "Çıkış Yap"}
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded text-sm text-foreground hover:bg-muted/50">{isEnglish ? "Sign in" : "Giriş Yap"}</Link>
                <Link href="/sign-up" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded text-sm text-primary font-medium hover:bg-primary/5">{isEnglish ? "Create account" : "Kayıt Ol"}</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
