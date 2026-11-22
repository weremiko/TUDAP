"use client"

import { useEffect, useState } from "react"

export function HomeHeroCopy({ headlines }: { headlines: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const lines = headlines.split("\n").map((line) => line.trim()).filter(Boolean)

  useEffect(() => {
    if (lines.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const timer = window.setInterval(() => {
      setIsVisible(false)
      window.setTimeout(() => {
        setActiveIndex((index) => (index + 1) % lines.length)
        setIsVisible(true)
      }, 220)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [headlines])

  const line = lines[activeIndex] ?? ""
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
