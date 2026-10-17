"use client"

import { useEffect, useState } from "react"

const forms = [
  { root: "ev", suffixes: [["-ler", "çoğul"], ["-imiz", "iyelik"], ["-de", "bulunma"], ["-ki", "ilgi"], ["-ler", "çoğul"]] },
  { root: "göz", suffixes: [["-ler", "çoğul"], ["-imiz", "iyelik"], ["-de", "bulunma"]] },
  { root: "yol", suffixes: [["-lar", "çoğul"], ["-ımız", "iyelik"], ["-da", "bulunma"]] },
]

export function HomeSuffixDisplay() {
  const [formIndex, setFormIndex] = useState(0)
  const [visible, setVisible] = useState(forms[0].suffixes.length)
  const current = forms[formIndex]

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = window.setInterval(() => {
      setVisible((value) => {
        if (value < current.suffixes.length) return value + 1
        setFormIndex((index) => (index + 1) % forms.length)
        return 0
      })
    }, 1050)
    return () => window.clearInterval(timer)
  }, [formIndex, current.suffixes.length])

  return (
    <div className="relative min-h-[260px] border-y border-border py-8 sm:min-h-[300px] sm:py-10" aria-label={`${current.root}${current.suffixes.slice(0, visible).map(([suffix]) => suffix).join("")}`}>
      <div className="absolute left-0 top-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Sondan eklemeli yapı</div>
      <div className="flex min-h-[180px] flex-col justify-center">
        <div className="flex flex-wrap items-baseline font-serif text-5xl leading-none tracking-tight text-foreground sm:text-7xl">
          <span className="font-semibold">{current.root}</span>
          {current.suffixes.slice(0, visible).map(([suffix], index) => (
            <span key={`${formIndex}-${index}`} className="animate-in fade-in slide-in-from-left-2 duration-500 text-accent">
              {suffix}
            </span>
          ))}
        </div>
        <div className="mt-7 flex min-h-5 flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {current.suffixes.slice(0, visible).map(([suffix, name], index) => (
            <span key={`${formIndex}-${suffix}-${index}`} className="animate-in fade-in duration-500">
              {suffix} <span className="text-foreground/80">{name}</span>
            </span>
          ))}
        </div>
      </div>
      <span className="absolute bottom-3 right-0 font-mono text-[10px] text-muted-foreground">morfoloji / 0{formIndex + 1}</span>
      <span className="sr-only">Kök: {current.root}. Ekler sırayla ekleniyor: {current.suffixes.map(([suffix, name]) => `${suffix} ${name}`).join(", ")}.</span>
    </div>
  )
}
