"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { saveErrorReport } from "@/app/actions/errors"
import { Search, ArrowLeft, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getGlossaryPage, getGlossaryCategories } from "@/app/actions/glossary"

type Term = { id: number; term: string; definition: string; category: string; englishEquivalent: string; phonetic: string }

export default function GlossaryPage() {
  const [isPending, startTransition] = useTransition()

  const [terms, setTerms]               = useState<Term[]>([])
  const [totalCount, setTotalCount]     = useState(0)
  const [totalPages, setTotalPages]     = useState(1)
  const [categories, setCategories]     = useState<string[]>(["Tümü"])
  const [currentPage, setCurrentPage]   = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("Tümü")
  const [searchTerm, setSearchTerm]     = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [suggestionOpen, setSuggestionOpen] = useState(false)
  const [suggestionTerm, setSuggestionTerm] = useState("")
  const [suggestionDefinition, setSuggestionDefinition] = useState("")
  const [suggestionIPA, setSuggestionIPA] = useState("")
  const [suggestionEnglish, setSuggestionEnglish] = useState("")
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null)
  const [suggestionSaving, setSuggestionSaving] = useState(false)

  const load = (page: number, category: string, search: string) => {
    startTransition(async () => {
      const [data, cats] = await Promise.all([
        getGlossaryPage(page, category, search),
        categories.length <= 1 ? getGlossaryCategories() : Promise.resolve(null),
      ])
      setTerms(data.rows as Term[])
      setTotalCount(data.total)
      setTotalPages(data.pages)
      if (cats) setCategories(cats)
    })
  }

  useEffect(() => {
    const initialSearch = new URLSearchParams(window.location.search).get("search") ?? ""
    setSearchTerm(initialSearch)
    setActiveSearch(initialSearch)
    load(1, "Tümü", initialSearch)
  }, [])

  const handleSearch = () => {
    setActiveSearch(searchTerm)
    setCurrentPage(1)
    load(1, selectedCategory, searchTerm)
  }

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
    load(1, cat, activeSearch)
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    load(page, selectedCategory, activeSearch)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSuggestionSubmit = async () => {
    if (!suggestionTerm.trim() || !suggestionDefinition.trim()) return
    setSuggestionSaving(true)
    setSuggestionMessage(null)
    try {
      await saveErrorReport({
        reportType: "term-suggestion",
        errorWord: suggestionTerm.trim(),
        message: `Madde başı önerisi\nTanım: ${suggestionDefinition.trim()}\nIPA: ${suggestionIPA.trim() || "Belirtilmedi"}\nİngilizce karşılık: ${suggestionEnglish.trim() || "Belirtilmedi"}`,
      })
      setSuggestionMessage("Öneriniz alındı. İncelendikten sonra sözlüğe eklenebilir.")
      setSuggestionTerm("")
      setSuggestionDefinition("")
      setSuggestionIPA("")
      setSuggestionEnglish("")
    } catch {
      setSuggestionMessage("Öneri gönderilemedi. Lütfen tekrar deneyin.")
    } finally {
      setSuggestionSaving(false)
    }
  }

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | "...")[] = [1]
    if (currentPage > 3) pages.push("...")
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) pages.push(p)
    if (currentPage < totalPages - 2) pages.push("...")
    pages.push(totalPages)
    return pages
  }, [currentPage, totalPages])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 lg:py-12">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

          <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Akademik Açık Erişim Sürümü:</span> Bu araç aktif geliştirme aşamasındadır ve %100 doğruluk garanti etmez. Akademik çalışmalar için sonuçları uzman denetiminden geçirerek kullanınız.
            </p>
          </div>

          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>

          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Dilbilim Terimleri Sözlüğü</h1>
              <Button variant="outline" size="sm" onClick={() => setSuggestionOpen(true)} className="gap-2 shrink-0">
                <Lightbulb className="h-4 w-4" />Madde Başı Öner
              </Button>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              {totalCount > 0 ? `${totalCount} terim` : "Terimler yükleniyor…"} — Türkçe ve İngilizce karşılıklarıyla.
            </p>
          </div>

          <Card className="p-4 border-border">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Terim veya tanım ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isPending}>Ara</Button>
            </div>
          </Card>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{totalCount} terim{activeSearch ? ` — "${activeSearch}" için` : ""}</span>
            <span>Sayfa {currentPage} / {totalPages}</span>
          </div>

          <div className="space-y-4">
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-6 border-border animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </Card>
              ))
            ) : terms.length > 0 ? (
              terms.map((item) => (
                <Card key={item.id} className="p-4 sm:p-6 border-border hover:shadow-lg transition-shadow">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground">{item.term}</h3>
                        {item.phonetic && <span className="text-sm font-mono text-primary">{item.phonetic}</span>}
                        {item.englishEquivalent && <span className="text-xs text-muted-foreground italic">{item.englishEquivalent}</span>}
                      </div>
                      {item.category && (
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground whitespace-nowrap self-start">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-foreground leading-relaxed">{item.definition}</p>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center border-border">
                <p className="text-muted-foreground">Arama kriterinize uygun terim bulunamadı.</p>
              </Card>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-4">
              <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isPending} aria-label="Önceki sayfa">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="px-2 text-muted-foreground">...</span>
                ) : (
                  <Button key={p} variant={p === currentPage ? "default" : "outline"} size="icon" onClick={() => handlePageChange(p as number)}>
                    {p}
                  </Button>
                )
              )}
              <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isPending} aria-label="Sonraki sayfa">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={suggestionOpen} onOpenChange={setSuggestionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Madde Başı Öner</DialogTitle>
            <DialogDescription>Sözlükte yer almasını istediğiniz terimi ve temel açıklamasını gönderin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="suggestion-term">Terim</Label><Input id="suggestion-term" value={suggestionTerm} onChange={(event) => setSuggestionTerm(event.target.value)} placeholder="Örn. artdamaksıl" /></div>
            <div className="space-y-2"><Label htmlFor="suggestion-definition">Tanım</Label><Textarea id="suggestion-definition" value={suggestionDefinition} onChange={(event) => setSuggestionDefinition(event.target.value)} rows={4} placeholder="Terimin kısa tanımı…" /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="suggestion-ipa">Fonetik gösterim</Label><Input id="suggestion-ipa" value={suggestionIPA} onChange={(event) => setSuggestionIPA(event.target.value)} placeholder="/…/" /></div><div className="space-y-2"><Label htmlFor="suggestion-english">İngilizce karşılık</Label><Input id="suggestion-english" value={suggestionEnglish} onChange={(event) => setSuggestionEnglish(event.target.value)} /></div></div>
            {suggestionMessage && <p className="text-sm text-muted-foreground" role="status">{suggestionMessage}</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setSuggestionOpen(false)}>Kapat</Button><Button onClick={handleSuggestionSubmit} disabled={suggestionSaving || !suggestionTerm.trim() || !suggestionDefinition.trim()}>{suggestionSaving ? "Gönderiliyor…" : "Öneriyi Gönder"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <SiteFooter />
    </div>
  )
}
