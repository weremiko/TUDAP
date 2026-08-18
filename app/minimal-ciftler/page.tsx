"use client"

import { useState, Suspense } from "react"
import { ArrowLeft, Search, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const minimalPairs = [
  {
    word1: "kar",
    word2: "gar",
    ipa1: "/kɑɾ/",
    ipa2: "/gɑɾ/",
    phonemes: "/k/ - /g/",
    category: "Ötümlülük",
    meaning1: "Yağış türü",
    meaning2: "Tren istasyonu",
  },
  {
    word1: "dal",
    word2: "tal",
    ipa1: "/dɑɫ/",
    ipa2: "/tɑɫ/",
    phonemes: "/d/ - /t/",
    category: "Ötümlülük",
    meaning1: "Ağaç kolu",
    meaning2: "(Anlamsız)",
  },
  {
    word1: "bal",
    word2: "pal",
    ipa1: "/bɑɫ/",
    ipa2: "/pɑɫ/",
    phonemes: "/b/ - /p/",
    category: "Ötümlülük",
    meaning1: "Arı ürünü",
    meaning2: "(Anlamsız)",
  },
  {
    word1: "sac",
    word2: "saç",
    ipa1: "/sɑd͡ʒ/",
    ipa2: "/sɑt͡ʃ/",
    phonemes: "/d͡ʒ/ - /t͡ʃ/",
    category: "Ötümlülük",
    meaning1: "Metal levha",
    meaning2: "Baş kılı",
  },
  {
    word1: "aç",
    word2: "ac",
    ipa1: "/ɑt͡ʃ/",
    ipa2: "/ɑd͡ʒ/",
    phonemes: "/t͡ʃ/ - /d͡ʒ/",
    category: "Ötümlülük",
    meaning1: "Yiyeceksiz",
    meaning2: "(Anlamsız)",
  },
  {
    word1: "kır",
    word2: "kıl",
    ipa1: "/kɯɾ/",
    ipa2: "/kɯɫ/",
    phonemes: "/ɾ/ - /ɫ/",
    category: "Akıcılar",
    meaning1: "Açık alan",
    meaning2: "Tüy",
  },
  {
    word1: "kar",
    word2: "kal",
    ipa1: "/kɑɾ/",
    ipa2: "/kɑɫ/",
    phonemes: "/ɾ/ - /ɫ/",
    category: "Akıcılar",
    meaning1: "Yağış türü",
    meaning2: "Bekle (emir)",
  },
  {
    word1: "yan",
    word2: "yam",
    ipa1: "/jɑn/",
    ipa2: "/jɑm/",
    phonemes: "/n/ - /m/",
    category: "Genizsi",
    meaning1: "Kenar",
    meaning2: "(Anlamsız)",
  },
  {
    word1: "kol",
    word2: "kel",
    ipa1: "/kɔɫ/",
    ipa2: "/ceɫ/",
    phonemes: "/o/ - /e/",
    category: "Ünlüler",
    meaning1: "Uzuv",
    meaning2: "Saçsız",
  },
  {
    word1: "sol",
    word2: "sal",
    ipa1: "/sɔɫ/",
    ipa2: "/sɑɫ/",
    phonemes: "/o/ - /a/",
    category: "Ünlüler",
    meaning1: "Yön",
    meaning2: "Su aracı",
  },
  {
    word1: "kul",
    word2: "kol",
    ipa1: "/kuɫ/",
    ipa2: "/kɔɫ/",
    phonemes: "/u/ - /o/",
    category: "Ünlüler",
    meaning1: "Köle",
    meaning2: "Uzuv",
  },
  {
    word1: "gül",
    word2: "göl",
    ipa1: "/gyl/",
    ipa2: "/gøl/",
    phonemes: "/y/ - /ø/",
    category: "Ünlüler",
    meaning1: "Çiçek",
    meaning2: "Su birikintisi",
  },
  {
    word1: "sin",
    word2: "sun",
    ipa1: "/sin/",
    ipa2: "/sun/",
    phonemes: "/i/ - /u/",
    category: "Ünlüler",
    meaning1: "Gizlen (emir)",
    meaning2: "Uzat (emir)",
  },
  {
    word1: "bit",
    word2: "bot",
    ipa1: "/bit/",
    ipa2: "/bɔt/",
    phonemes: "/i/ - /o/",
    category: "Ünlüler",
    meaning1: "Asalak böcek",
    meaning2: "Ayakkabı türü",
  },
  {
    word1: "el",
    word2: "al",
    ipa1: "/el/",
    ipa2: "/ɑɫ/",
    phonemes: "/e/ - /a/",
    category: "Ünlüler",
    meaning1: "Uzuv",
    meaning2: "Kırmızı / Emir",
  },
  {
    word1: "şal",
    word2: "sal",
    ipa1: "/ʃɑɫ/",
    ipa2: "/sɑɫ/",
    phonemes: "/ʃ/ - /s/",
    category: "Sürtünme",
    meaning1: "Örtü",
    meaning2: "Su aracı",
  },
  {
    word1: "aş",
    word2: "as",
    ipa1: "/ɑʃ/",
    ipa2: "/ɑs/",
    phonemes: "/ʃ/ - /s/",
    category: "Sürtünme",
    meaning1: "Yemek",
    meaning2: "As (emir)",
  },
  {
    word1: "yaz",
    word2: "yar",
    ipa1: "/jɑz/",
    ipa2: "/jɑɾ/",
    phonemes: "/z/ - /ɾ/",
    category: "Karma",
    meaning1: "Mevsim",
    meaning2: "Sevgili",
  },
  {
    word1: "bak",
    word2: "pak",
    ipa1: "/bɑk/",
    ipa2: "/pɑk/",
    phonemes: "/b/ - /p/",
    category: "Ötümlülük",
    meaning1: "Gör (emir)",
    meaning2: "Temiz",
  },
  {
    word1: "dil",
    word2: "til",
    ipa1: "/dil/",
    ipa2: "/til/",
    phonemes: "/d/ - /t/",
    category: "Ötümlülük",
    meaning1: "Konuşma organı",
    meaning2: "(Anlamsız)",
  },
]

function MinimalPairsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(minimalPairs.map((p) => p.category)))

  const filteredPairs = minimalPairs.filter((pair) => {
    const matchesSearch =
      pair.word1.includes(searchTerm.toLowerCase()) ||
      pair.word2.includes(searchTerm.toLowerCase()) ||
      pair.phonemes.includes(searchTerm)
    const matchesCategory = !selectedCategory || pair.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "tr-TR"
      window.speechSynthesis.speak(utterance)
    }
  }

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
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Minimal Çiftler</h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              Türkçede anlam ayırt eden en küçük ses birimi farklarını gösteren sözcük çiftleri. Sesbilim çalışmaları ve
              fonem analizi için temel kaynak.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sözcük veya fonem ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Tümü
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPairs.map((pair, index) => (
              <Card key={index} className="p-5 border-border hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => speak(pair.word1)}
                        className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        <span className="text-lg font-bold text-foreground">{pair.word1}</span>
                        <Volume2 className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <span className="text-muted-foreground">~</span>
                      <button
                        onClick={() => speak(pair.word2)}
                        className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-chart-2/10 hover:bg-chart-2/20 transition-colors"
                      >
                        <span className="text-lg font-bold text-foreground">{pair.word2}</span>
                        <Volume2 className="h-3 w-3 text-chart-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span className="text-primary">{pair.ipa1}</span>
                    <span className="text-muted-foreground">~</span>
                    <span className="text-chart-2">{pair.ipa2}</span>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Fonem Karşıtlığı</span>
                      <span className="text-xs font-mono font-semibold text-foreground">{pair.phonemes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Kategori</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {pair.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <span className="text-primary">{pair.word1}:</span> {pair.meaning1} |{" "}
                    <span className="text-chart-2">{pair.word2}:</span> {pair.meaning2}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredPairs.length === 0 && (
            <Card className="p-12 text-center border-border">
              <p className="text-muted-foreground">Arama kriterinize uygun minimal çift bulunamadı.</p>
            </Card>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default function MinimalPairsPage() {
  return (
    <Suspense fallback={null}>
      <MinimalPairsContent />
    </Suspense>
  )
}
