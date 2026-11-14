import Image from "next/image"
import { BookOpen, CalendarDays, FlaskConical, Languages } from "lucide-react"

const details = [
  { icon: Languages, label: "Türkçenin ses ve yapı dünyası" },
  { icon: BookOpen, label: "Dilbilim için açık kaynaklar" },
  { icon: FlaskConical, label: "Araştırma ve keşif araçları" },
]

export function MaintenancePage() {
  return (
    <main className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#f5f3ee] px-5 py-14 text-[#172f43] dark:bg-[#101b23] dark:text-[#edf1ef] sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.24] [background-image:linear-gradient(rgba(23,47,67,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(23,47,67,.08)_1px,transparent_1px)] [background-size:52px_52px] dark:opacity-[0.16]" />
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 size-[28rem] rounded-full bg-[#e34e35]/10 blur-3xl" />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1fr_.85fr] lg:gap-20">
        <section className="max-w-2xl">
          <div className="mb-12 flex items-center gap-3">
            <Image src="/tudap-symbol.png" alt="" width={44} height={44} className="size-11 object-contain" priority />
            <div>
              <p className="font-serif text-lg font-bold tracking-tight">TÜDAP</p>
              <p className="text-[10px] uppercase tracking-[0.17em] opacity-65">Türkçe Dilbilim Araştırma Platformu</p>
            </div>
          </div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e34e35]/25 bg-[#e34e35]/[0.07] px-3 py-1.5 text-xs font-semibold tracking-wide text-[#b63c2a] dark:text-[#ff907b]">
            <CalendarDays className="size-3.5" />
            <span>ARALIK 2026&apos;DA AÇILIYOR</span>
          </div>
          <h1 className="max-w-xl font-serif text-5xl font-medium leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
            Türkçeyi birlikte <span className="italic text-[#e34e35]">keşfedeceğiz.</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 opacity-75 sm:text-lg sm:leading-8">
            TÜDAP, Türkçenin sesini, yapısını ve anlamını inceleyen araştırmacılar için hazırlanıyor. Açılış öncesi son düzenlemeleri yapıyoruz.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-current/10 pt-6 text-xs font-medium opacity-70 sm:text-sm">
            <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#e34e35]" />Düşünmek için alan</span>
            <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#e34e35]" />Paylaşmak için topluluk</span>
          </div>
        </section>
        <aside className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-5 rounded-[2rem] border border-[#172f43]/10 dark:border-white/10" />
          <div className="relative overflow-hidden rounded-[1.5rem] border border-[#172f43]/10 bg-white/70 p-7 shadow-[0_24px_80px_-38px_rgba(23,47,67,.35)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] sm:p-9">
            <div className="mb-10 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-55">Bir çalışma alanı</p>
              <span className="rounded-full border border-[#e34e35]/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#b63c2a] dark:text-[#ff907b]">Yakında</span>
            </div>
            <div className="relative mb-9 flex aspect-[1.15] items-center justify-center overflow-hidden rounded-2xl bg-[#172f43] text-white">
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px]" />
              <div className="relative flex flex-col items-center">
                <span className="font-serif text-7xl italic tracking-tight sm:text-8xl">ü</span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.35em] opacity-65">ses · biçim · anlam</span>
              </div>
              <span className="absolute -right-6 -top-8 size-36 rounded-full border border-white/15" />
              <span className="absolute -bottom-12 -left-8 size-40 rounded-full border border-[#e34e35]/60" />
            </div>
            <ul className="flex flex-col gap-4">
              {details.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm font-medium">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#172f43]/[0.06] text-[#e34e35] dark:bg-white/[0.07]"><Icon className="size-4" /></span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-7 text-center text-xs opacity-55">Merakınız, açılış gününe kadar bizimle kalsın.</p>
          <p className="mt-3 text-center text-xs"><a href="/admin/bakim" className="underline decoration-current/30 underline-offset-4 opacity-50 transition-opacity hover:opacity-100">Yönetici girişi</a></p>
        </aside>
      </div>
    </main>
  )
}
