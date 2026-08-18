"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Languages } from "lucide-react"

interface LanguageSelectorProps {
  onSelectLanguage: (language: "tr" | "en") => void
}

export function LanguageSelector({ onSelectLanguage }: LanguageSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-12 shadow-2xl border-2">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Languages className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              TurkPhon
            </h1>
            <p className="text-xl text-muted-foreground font-light">Turkish to IPA Phonetic Converter</p>
            <p className="text-base text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
              Türkçe Sesbilimsel Transkripsiyon Aracı
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Select Language / Dil Seçin
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="w-48 h-16 text-lg font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200 border-2 bg-transparent"
                onClick={() => onSelectLanguage("tr")}
              >
                Türkçe
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-48 h-16 text-lg font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200 border-2 bg-transparent"
                onClick={() => onSelectLanguage("en")}
              >
                English
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
