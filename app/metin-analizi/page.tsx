"use client"

import { useState } from "react"
import { BarChart3, FileText, Hash, Type, ArrowLeft } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function TextAnalysisPage() {
  const [inputText, setInputText] = useState("")

  // Text analysis functions
  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }

  const getCharCount = (text: string) => text.length
  const getCharCountNoSpaces = (text: string) => text.replace(/\s/g, "").length

  const getSentenceCount = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    return sentences.length
  }

  const getParagraphCount = (text: string) => {
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0)
    return paragraphs.length || (text.trim() ? 1 : 0)
  }

  const getSyllableCount = (text: string) => {
    const vowels = "aeıioöuüAEIİOÖUÜâîûÂÎÛ"
    let count = 0
    for (const char of text) {
      if (vowels.includes(char)) count++
    }
    return count
  }

  const getWordFrequency = (text: string) => {
    const words = text.toLowerCase().match(/[a-zçğıöşüâîû]+/gi) || []
    const freq: Record<string, number> = {}
    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1
    })
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
  }

  const getAvgWordLength = (text: string) => {
    const words = text.match(/[a-zçğıöşüâîû]+/gi) || []
    if (words.length === 0) return 0
    const totalLength = words.reduce((sum, word) => sum + word.length, 0)
    return (totalLength / words.length).toFixed(1)
  }

  const getAvgSentenceLength = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    if (sentences.length === 0) return 0
    const wordCount = getWordCount(text)
    return (wordCount / sentences.length).toFixed(1)
  }

  const wordFrequency = getWordFrequency(inputText)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 md:py-12">
        <div className="space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Metin Analizi</h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              Türkçe metinlerinizi analiz edin. Kelime sayısı, hece sayısı, cümle uzunluğu ve kelime sıklığı gibi
              detaylı istatistikler.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card className="p-6 border-border">
              <div className="space-y-4">
                <h3 className="text-base font-serif font-semibold text-foreground">Metin Girişi</h3>
                <Textarea
                  placeholder="Analiz etmek istediğiniz Türkçe metni buraya yazın..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[400px] resize-none font-sans text-base leading-relaxed"
                />
              </div>
            </Card>

            {/* Stats */}
            <div className="space-y-6">
              {/* Basic Stats */}
              <Card className="p-6 border-border">
                <h3 className="text-base font-serif font-semibold text-foreground mb-4">Temel İstatistikler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Type className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Kelime Sayısı</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{getWordCount(inputText)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-4 w-4 text-chart-2" />
                      <span className="text-xs text-muted-foreground">Karakter Sayısı</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{getCharCount(inputText)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-chart-3" />
                      <span className="text-xs text-muted-foreground">Cümle Sayısı</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{getSentenceCount(inputText)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-chart-4" />
                      <span className="text-xs text-muted-foreground">Hece Sayısı</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{getSyllableCount(inputText)}</p>
                  </div>
                </div>
              </Card>

              {/* Advanced Stats */}
              <Card className="p-6 border-border">
                <h3 className="text-base font-serif font-semibold text-foreground mb-4">Detaylı Analiz</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-sm text-muted-foreground">Paragraf Sayısı</span>
                    <span className="font-semibold text-foreground">{getParagraphCount(inputText)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-sm text-muted-foreground">Karakter (Boşluksuz)</span>
                    <span className="font-semibold text-foreground">{getCharCountNoSpaces(inputText)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-sm text-muted-foreground">Ortalama Sözcük Uzunluğu</span>
                    <span className="font-semibold text-foreground">{getAvgWordLength(inputText)} harf</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-sm text-muted-foreground">Ortalama Cümle Uzunluğu</span>
                    <span className="font-semibold text-foreground">{getAvgSentenceLength(inputText)} kelime</span>
                  </div>
                </div>
              </Card>

              {/* Word Frequency */}
              {wordFrequency.length > 0 && (
                <Card className="p-6 border-border">
                  <h3 className="text-base font-serif font-semibold text-foreground mb-4">
                    En Sık Kullanılan Kelimeler
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {wordFrequency.map(([word, count], index) => (
                      <div key={word} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="font-mono text-sm text-foreground">{word}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(count / wordFrequency[0][1]) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
