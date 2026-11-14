import Image from "next/image"
import Link from "next/link"

export function MaintenancePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between border-b border-border py-6">
          <Link href="/" className="flex items-center gap-3" aria-label="TÜDAP">
            <Image src="/tudap-symbol.png" alt="" width={36} height={36} className="size-9 object-contain" priority />
            <span className="text-xs font-medium uppercase tracking-[0.16em]">TÜDAP</span>
          </Link>
          <span className="text-xs text-muted-foreground">Türkçe Dilbilim Araştırma Platformu</span>
        </header>

        <div className="grid flex-1 content-center gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <section className="lg:col-span-8">
            <p className="mb-8 text-xs font-medium uppercase tracking-[0.18em] text-accent">Açılış duyurusu <span className="px-2 text-border">/</span> 2026</p>
            <h1 className="max-w-4xl font-serif text-6xl font-medium leading-[0.98] tracking-[-0.045em] text-balance sm:text-7xl lg:text-[6.5rem]">
              Aralık&apos;ta <span className="text-accent">açılıyoruz.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              TÜDAP; Türkçenin sesini, yapısını ve anlamını incelemek için hazırlanıyor. Platformu yayına almadan önce son düzenlemelerimizi tamamlıyoruz.
            </p>
            <p className="mt-5 text-sm text-muted-foreground">Yakında burada buluşmak üzere.</p>
          </section>

          <aside className="flex flex-col justify-end border-t border-border pt-6 lg:col-span-3 lg:col-start-10 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="font-mono text-xs tracking-[0.12em] text-muted-foreground">YAYIN TAKVİMİ</p>
            <p className="mt-3 font-serif text-4xl tracking-tight">12<span className="ml-2 text-2xl text-muted-foreground">/ 2026</span></p>
            <div className="mt-6 h-px w-full bg-border" />
            <p className="mt-5 text-sm leading-6 text-muted-foreground">Sesbilim, terimler ve Türkçe üzerine araştırmalar için açık bir çalışma alanı.</p>
          </aside>
        </div>

        <footer className="flex flex-col gap-3 border-t border-border py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 TÜDAP · Türkçe Dilbilim Araştırma Platformu</span>
          <Link href="/admin/bakim" className="w-fit underline decoration-border underline-offset-4 transition-colors hover:text-foreground">Yönetici girişi</Link>
        </footer>
      </div>
    </main>
  )
}
