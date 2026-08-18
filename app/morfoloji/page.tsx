"use client"

import { useState, Suspense } from "react"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

// Simple morphological analysis for Turkish
const analyzeMorphology = (word: string) => {
  const lowerWord = word.toLowerCase()
  const results: { root: string; suffixes: { suffix: string; type: string; meaning: string }[] } = {
    root: "",
    suffixes: [],
  }

  // Common Turkish suffixes (simplified)
  const suffixes = [
    { pattern: /lar$/, suffix: "-lar", type: "Çekim Eki", meaning: "Çoğul eki" },
    { pattern: /ler$/, suffix: "-ler", type: "Çekim Eki", meaning: "Çoğul eki" },
    { pattern: /ım$/, suffix: "-ım", type: "Çekim Eki", meaning: "1. tekil iyelik eki" },
    { pattern: /im$/, suffix: "-im", type: "Çekim Eki", meaning: "1. tekil iyelik eki" },
    { pattern: /um$/, suffix: "-um", type: "Çekim Eki", meaning: "1. tekil iyelik eki" },
    { pattern: /üm$/, suffix: "-üm", type: "Çekim Eki", meaning: "1. tekil iyelik eki" },
    { pattern: /ın$/, suffix: "-ın", type: "Çekim Eki", meaning: "2. tekil iyelik eki" },
    { pattern: /in$/, suffix: "-in", type: "Çekim Eki", meaning: "2. tekil iyelik eki" },
    { pattern: /ı$/, suffix: "-ı", type: "Çekim Eki", meaning: "Belirtme hal eki" },
    { pattern: /i$/, suffix: "-i", type: "Çekim Eki", meaning: "Belirtme hal eki" },
    { pattern: /u$/, suffix: "-u", type: "Çekim Eki", meaning: "Belirtme hal eki" },
    { pattern: /ü$/, suffix: "-ü", type: "Çekim Eki", meaning: "Belirtme hal eki" },
    { pattern: /da$/, suffix: "-da", type: "Çekim Eki", meaning: "Bulunma hal eki" },
    { pattern: /de$/, suffix: "-de", type: "Çekim Eki", meaning: "Bulunma hal eki" },
    { pattern: /ta$/, suffix: "-ta", type: "Çekim Eki", meaning: "Bulunma hal eki" },
    { pattern: /te$/, suffix: "-te", type: "Çekim Eki", meaning: "Bulunma hal eki" },
    { pattern: /dan$/, suffix: "-dan", type: "Çekim Eki", meaning: "Ayrılma hal eki" },
    { pattern: /den$/, suffix: "-den", type: "Çekim Eki", meaning: "Ayrılma hal eki" },
    { pattern: /tan$/, suffix: "-tan", type: "Çekim Eki", meaning: "Ayrılma hal eki" },
    { pattern: /ten$/, suffix: "-ten", type: "Çekim Eki", meaning: "Ayrılma hal eki" },
    { pattern: /a$/, suffix: "-a", type: "Çekim Eki", meaning: "Yönelme hal eki" },
    { pattern: /e$/, suffix: "-e", type: "Çekim Eki", meaning: "Yönelme hal eki" },
    { pattern: /lık$/, suffix: "-lık", type: "Yapım Eki", meaning: "İsimden isim yapım eki" },
    { pattern: /lik$/, suffix: "-lik", type: "Yapım Eki", meaning: "İsimden isim yapım eki" },
    { pattern: /luk$/, suffix: "-luk", type: "Yapım Eki", meaning: "İsimden isim yapım eki" },
    { pattern: /lük$/, suffix: "-lük", type: "Yapım Eki", meaning: "İsimden isim yapım eki" },
    { pattern: /cı$/, suffix: "-cı", type: "Yapım Eki", meaning: "Meslek/uğraş yapım eki" },
    { pattern: /ci$/, suffix: "-ci", type: "Yapım Eki", meaning: "Meslek/uğraş yapım eki" },
    { pattern: /cu$/, suffix: "-cu", type: "Yapım Eki", meaning: "Meslek/uğraş yapım eki" },
    { pattern: /cü$/, suffix: "-cü", type: "Yapım Eki", meaning: "Meslek/uğraş yapım eki" },
    { pattern: /sız$/, suffix: "-sız", type: "Yapım Eki", meaning: "Yokluk/olumsuzluk yapım eki" },
    { pattern: /siz$/, suffix: "-siz", type: "Yapım Eki", meaning: "Yokluk/olumsuzluk yapım eki" },
    { pattern: /suz$/, suffix: "-suz", type: "Yapım Eki", meaning: "Yokluk/olumsuzluk yapım eki" },
    { pattern: /süz$/, suffix: "-süz", type: "Yapım Eki", meaning: "Yokluk/olumsuzluk yapım eki" },
    { pattern: /mak$/, suffix: "-mak", type: "Yapım Eki", meaning: "Mastar eki" },
    { pattern: /mek$/, suffix: "-mek", type: "Yapım Eki", meaning: "Mastar eki" },
    { pattern: /dı$/, suffix: "-dı", type: "Çekim Eki", meaning: "Geçmiş zaman eki" },
    { pattern: /di$/, suffix: "-di", type: "Çekim Eki", meaning: "Geçmiş zaman eki" },
    { pattern: /du$/, suffix: "-du", type: "Çekim Eki", meaning: "Geçmiş zaman eki" },
    { pattern: /dü$/, suffix: "-dü", type: "Çekim Eki", meaning: "Geçmiş zaman eki" },
    { pattern: /yor$/, suffix: "-yor", type: "Çekim Eki", meaning: "Şimdiki zaman eki" },
    { pattern: /acak$/, suffix: "-acak", type: "Çekim Eki", meaning: "Gelecek zaman eki" },
    { pattern: /ecek$/, suffix: "-ecek", type: "Çekim Eki", meaning: "Gelecek zaman eki" },
    { pattern: /mış$/, suffix: "-mış", type: "Çekim Eki", meaning: "Duyulan geçmiş zaman eki" },
    { pattern: /miş$/, suffix: "-miş", type: "Çekim Eki", meaning: "Duyulan geçmiş zaman eki" },
    { pattern: /muş$/, suffix: "-muş", type: "Çekim Eki", meaning: "Duyulan geçmiş zaman eki" },
    { pattern: /müş$/, suffix: "-müş", type: "Çekim Eki", meaning: "Duyulan geçmiş zaman eki" },
  ]

  let remaining = lowerWord
  const foundSuffixes: typeof results.suffixes = []

  for (let i = 0; i < 5; i++) {
    for (const { pattern, suffix, type, meaning } of suffixes) {
      if (pattern.test(remaining) && remaining.length > 2) {
        foundSuffixes.unshift({ suffix, type, meaning })
        remaining = remaining.replace(pattern, "")
        break
      }
    }
  }

  results.root = remaining || lowerWord
  results.suffixes = foundSuffixes

  return results
}

function MorphologyContent() {
  const [inputWord, setInputWord] = useState("")
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeMorphology> | null>(null)

  const handleAnalyze = () => {
    if (inputWord.trim()) {
      setAnalysis(analyzeMorphology(inputWord.trim()))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Morfolojik Çözümleyici</h1>
            <p className="text-muted-foreground leading-relaxed">
              Türkçe sözcükleri kök ve eklerine ayırın. Yapım ve çekim eklerini analiz edin.
            </p>
          </div>

          <Card className="p-6 border-border">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Bir Türkçe sözcük girin (örn: evlerimizden)"
                    value={inputWord}
                    onChange={(e) => setInputWord(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleAnalyze}>Çözümle</Button>
              </div>
            </div>
          </Card>

          {analysis && (
            <Card className="p-6 border-border">
              <h3 className="text-lg font-serif font-semibold text-foreground mb-4">Çözümleme Sonucu</h3>

              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg">
                  <span className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">
                    {analysis.root}
                  </span>
                  {analysis.suffixes.map((s, i) => (
                    <span
                      key={i}
                      className={`px-3 py-2 rounded-lg font-mono text-sm ${
                        s.type === "Yapım Eki"
                          ? "bg-chart-3/20 text-chart-3 border border-chart-3/30"
                          : "bg-chart-2/20 text-chart-2 border border-chart-2/30"
                      }`}
                    >
                      {s.suffix}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Kök</p>
                    <p className="text-lg font-semibold text-foreground">{analysis.root}</p>
                  </div>

                  {analysis.suffixes.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Ekler</p>
                      {analysis.suffixes.map((s, i) => (
                        <div key={i} className="p-4 rounded-lg border border-border bg-muted/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-semibold text-foreground">{s.suffix}</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                s.type === "Yapım Eki" ? "bg-chart-3/20 text-chart-3" : "bg-chart-2/20 text-chart-2"
                              }`}
                            >
                              {s.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{s.meaning}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Bu sözcükte ek tespit edilemedi.</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6 border-border">
            <h3 className="text-lg font-serif font-semibold text-foreground mb-4">Örnek Sözcükler</h3>
            <div className="flex flex-wrap gap-2">
              {["evlerimizden", "güzellik", "kitapçı", "öğretmenler", "çalışıyordu", "gelecekmiş", "odasız"].map(
                (word) => (
                  <button
                    key={word}
                    onClick={() => {
                      setInputWord(word)
                      setAnalysis(analyzeMorphology(word))
                    }}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm font-mono text-foreground transition-colors"
                  >
                    {word}
                  </button>
                ),
              )}
            </div>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default function MorphologyPage() {
  return (
    <Suspense fallback={null}>
      <MorphologyContent />
    </Suspense>
  )
}
