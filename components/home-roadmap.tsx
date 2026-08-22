import { Compass, Languages, Radio } from "lucide-react"

const STEPS = [
  { icon: Compass, number: "01", title: "Keşfet", text: "700+ terim ve kavramla Türkçenin kuramsal yapısını tanı." },
  { icon: Languages, number: "02", title: "Uygula", text: "Sesbilim ve transkripsiyon araçlarıyla metinleri akademik formata çevir." },
  { icon: Radio, number: "03", title: "Takip Et", text: "Türkiye genelindeki dilbilim seminer ve konferanslarından haberdar ol." },
]

export function HomeRoadmap() {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 sm:py-16">
      <div className="mb-9 max-w-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Platform döngüsü</p>
        <h2 className="mt-2 text-2xl font-serif font-bold text-foreground">3 Adımda Platform Döngüsü</h2>
      </div>
      <div className="relative grid gap-8 md:grid-cols-3 md:gap-10">
        <div className="pointer-events-none absolute left-[16%] right-[16%] top-6 hidden border-t border-dashed border-primary/30 md:block" />
        {STEPS.map(({ icon: Icon, number, title, text }) => (
          <div key={number} className="relative flex gap-4 md:block">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background text-primary shadow-sm">
              <Icon className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 text-[9px] font-bold text-accent">{number}</span>
            </div>
            <div className="pt-1 md:pt-5">
              <h3 className="text-lg font-serif font-semibold text-foreground">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
