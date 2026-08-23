import Link from "next/link"
import { ArrowLeft, BookOpen, Search } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-20">
        <div className="pointer-events-none absolute left-[12%] top-[18%] h-24 w-24 rounded-full border border-primary/20 bg-primary/[0.04]" />
        <div className="pointer-events-none absolute bottom-[16%] right-[12%] h-32 w-32 rotate-12 rounded-[2rem] border border-accent/20 bg-accent/[0.04]" />
        <section className="relative w-full max-w-2xl text-center">
          <p className="font-serif text-7xl font-bold tracking-tight text-primary/80 sm:text-8xl">404</p>
          <p className="mt-5 font-mono text-sm tracking-wide text-accent">/dœɼtjYzdœɼt/</p>
          <h1 className="mt-4 text-3xl font-serif font-bold text-foreground sm:text-4xl">Bu Sayfa Ses Düşmesine Uğramış.</h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Gösteren var, gösterilen yok.<br />
            Tıkladığınız bağlantı anlamını yitirmiş bir göstergeden ibaret.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Gösterilene Git (Ana Sayfa)
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/terim-sozlugu">
                <Search className="h-4 w-4" />
                Sözlükte Ara
              </Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-accent" />
            <span>TÜDAP · Türkçe Dilbilim Araştırma Platformu</span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
