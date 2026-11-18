"use client"

import { useEffect, useState } from "react"

const HERO_LINES = [
  "Dili yalnızca okumayın, inceleyin.",
  "Türkçeyi sesinden yapısına, anlamına kadar çözümleyin.",
  "Her terimin bir kökeni, her kavramın bir yeri var.",
  "Türkçe dilbilimin açık çalışma alanı.",
  "Sormaya, ölçmeye, karşılaştırmaya buradan başlayın.",
]

export function HomeHeroCopy() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const timer = window.setInterval(() => {
      setIsVisible(false)
      window.setTimeout(() => {
        setActiveIndex((index) => (index + 1) % HERO_LINES.length)
        setIsVisible(true)
      }, 220)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [])

  const line = HERO_LINES[activeIndex]
  const [lead, ...rest] = line.split(", ")
  const ending = rest.length > 0 ? `, ${rest.join(", ")}` : ""

  return (
    <h1
      aria-live="polite"
      className={`min-h-[2.1em] max-w-4xl font-serif text-5xl font-bold leading-[1.02] tracking-tight text-foreground text-balance transition-opacity duration-200 sm:text-6xl lg:text-7xl ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {lead}
      {ending && <span className="font-normal italic text-accent">{ending}</span>}
    </h1>
  )
}
