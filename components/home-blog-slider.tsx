"use client"

import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, Newspaper } from "lucide-react"
import { useRef } from "react"
import { Card } from "@/components/ui/card"

type BlogPost = { id: number; slug: string; title: string; excerpt: string | null; createdAt: Date; authorName: string }

export function HomeBlogSlider({ posts }: { posts: BlogPost[] }) {
  const railRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    railRef.current?.scrollBy({ left: direction === "right" ? 360 : -360, behavior: "smooth" })
  }

  if (!posts.length) return null

  return (
    <section className="relative overflow-hidden border-y border-border bg-muted/25 py-14 sm:py-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Güncel okumalar</p>
            <h2 className="mt-2 text-2xl font-serif font-bold text-foreground">Son blog yazıları</h2>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => scroll("left")} aria-label="Önceki yazılar" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => scroll("right")} aria-label="Sonraki yazılar" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div ref={railRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group w-[min(82vw,360px)] shrink-0 snap-start">
              <Card className="h-full border-border bg-background p-5 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-md">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Newspaper className="h-3.5 w-3.5 text-accent" />
                  <time>{new Date(post.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</time>
                </div>
                <h3 className="mt-4 line-clamp-2 text-lg font-serif font-semibold leading-snug text-foreground group-hover:text-primary">{post.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt || "Türkçe dilbilim araştırmaları üzerine yeni bir yazı."}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary">Devamını oku <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
