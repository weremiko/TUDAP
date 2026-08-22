"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const PROMPTS = [
  "örn. ünlü uyumu, morfem, ergatiflik...",
  "Dilbilgisi değil, dilbilim terimleri...",
  "TDK'de bulamadığınız o teorik terimi yazın...",
  "Chomsky amcanın sözdizimi ağacından bir yaprak seçin...",
  "Dil yetisi (I-language) burada devreye giriyor...",
]

export function HomeGlossarySearch() {
  const [value, setValue] = useState("")
  const [scrollOffset, setScrollOffset] = useState(0)
  const [promptIndex, setPromptIndex] = useState(0)
  const [prompt, setPrompt] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const target = PROMPTS[promptIndex]
    const delay = deleting ? 35 : 75
    const timer = window.setTimeout(() => {
      if (!deleting && prompt === target) {
        setDeleting(true)
      } else if (deleting && prompt === "") {
        setDeleting(false)
        setPromptIndex((index) => (index + 1) % PROMPTS.length)
      } else {
        setPrompt(target.slice(0, prompt.length + (deleting ? -1 : 1)))
      }
    }, prompt === target && !deleting ? 1600 : delay)
    return () => window.clearTimeout(timer)
  }, [deleting, prompt, promptIndex])

  useEffect(() => {
    const handleScroll = () => setScrollOffset(Math.min(70, window.scrollY * 0.08))
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const searchHref = value.trim() ? `/terim-sozlugu?search=${encodeURIComponent(value.trim())}` : "/terim-sozlugu"

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div style={{ transform: `perspective(500px) rotateX(35deg) rotateZ(18deg) translateY(${-scrollOffset}px)` }} className="pointer-events-none absolute -right-16 top-8 h-36 w-36 rounded-[2rem] border border-accent/25 bg-accent/5 transition-transform duration-300" />
      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Card className="border-primary/20 bg-primary/[0.04] p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Hızlı arama</p>
            <h2 className="mt-2 text-2xl font-serif font-bold text-foreground">Bir terim arayın, kavramı keşfedin.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Türkçe dilbilim terimleri arasında hızlıca arama yapın.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder={prompt || "Bir terim arayın..."} aria-label="Sözlükte terim ara" className="h-11 border-border bg-background pl-10" />
              </div>
              <Link href={searchHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Ara <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
