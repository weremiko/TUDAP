"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Download, Trash2, ArrowLeft, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function SyntaxTreePage() {
  const [inputText, setInputText] = useState("")
  const [treeData, setTreeData] = useState<any>(null)
  const { toast } = useToast()
  const treeRef = useRef<HTMLDivElement>(null)

  const parseTree = (input: string) => {
    const tokens = input.match(/\[|\]|[^[\]\s]+/g) || []
    let index = 0

    function parseNode(): any {
      if (tokens[index] === "[") {
        index++
        const label = tokens[index++]
        const children = []

        while (tokens[index] !== "]" && index < tokens.length) {
          children.push(parseNode())
        }

        index++
        return { label, children }
      } else {
        return { label: tokens[index++], children: [] }
      }
    }

    try {
      return parseNode()
    } catch {
      return null
    }
  }

  const handleGenerate = () => {
    if (!inputText.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir sözdizimi yapısı girin.",
        variant: "destructive",
      })
      return
    }

    const parsed = parseTree(inputText)
    if (!parsed) {
      toast({
        title: "Hata",
        description: "Geçersiz parantez yapısı. Lütfen kontrol edin.",
        variant: "destructive",
      })
      return
    }

    setTreeData(parsed)
    toast({
      title: "Başarılı",
      description: "Sözdizimi ağacı oluşturuldu!",
    })
  }

  const handleClear = () => {
    setInputText("")
    setTreeData(null)
  }

  const handleDownload = () => {
    if (!treeRef.current) return

    // Create a simple text representation for now
    const textRepresentation = inputText
    const blob = new Blob([textRepresentation], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sozdizimi-agaci.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "İndirildi",
      description: "Sözdizimi ağacı dosyası indirildi.",
    })
  }

  const renderTree = (node: any, depth = 0): any => {
    if (!node) return null

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="px-4 py-2 rounded-lg border-2 border-primary/30 bg-primary/10 font-semibold text-foreground shadow-md">
          {node.label}
        </div>
        {node.children && node.children.length > 0 && (
          <div className="flex gap-8 relative">
            <div className="absolute top-0 left-0 right-0 h-4 flex justify-center">
              <div className="w-full border-t-2 border-l-2 border-r-2 border-primary/20 rounded-t-lg" />
            </div>
            {node.children.map((child: any, index: number) => (
              <div key={index} className="flex flex-col items-center pt-4">
                <div className="w-px h-4 bg-primary/20" />
                {renderTree(child, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 lg:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Sözdizimi Ağaç Çizici</h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              Parantezli notasyondan otomatik sözdizimi ağaç diyagramı oluşturun. X-Bar teorisi ve karmaşık yapı
              desteği.
            </p>
          </div>

          {/* Info Card */}
          <Card className="p-6 border-border bg-muted/20">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Nasıl Kullanılır?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Parantezli notasyon kullanarak sözdizimi yapınızı girin. Örnek:{" "}
                  <code className="px-2 py-0.5 rounded bg-muted text-foreground">
                    [S [NP Ali] [VP [NP eve] [V gitti]]]
                  </code>
                </p>
                <p className="text-sm text-muted-foreground">
                  X-Bar teorisi için:{" "}
                  <code className="px-2 py-0.5 rounded bg-muted text-foreground">
                    [XP [Spec ...] [X&apos; [X ...] [Comp ...]]]
                  </code>
                </p>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Input Panel */}
            <Card className="lg:col-span-2 p-6 border-border">
              <div className="space-y-4">
                <h3 className="text-base font-serif font-semibold text-foreground">Parantezli Notasyon</h3>

                <Textarea
                  placeholder="[S [NP Ali] [VP [NP eve] [V gitti]]]"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px] resize-none font-mono text-sm"
                />

                <div className="flex flex-col gap-3">
                  <Button onClick={handleGenerate} size="lg" className="w-full">
                    Ağacı Oluştur
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handleClear} disabled={!inputText && !treeData}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Temizle
                    </Button>
                    <Button variant="outline" onClick={handleDownload} disabled={!treeData}>
                      <Download className="h-4 w-4 mr-2" />
                      İndir
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Output Panel */}
            <Card className="lg:col-span-3 p-6 border-border bg-muted/20 min-h-[500px]">
              <div className="space-y-4 h-full">
                <h3 className="text-base font-serif font-semibold text-foreground">Sözdizimi Ağacı</h3>

                <div ref={treeRef} className="flex-1 flex items-center justify-center overflow-auto p-8">
                  {treeData ? (
                    renderTree(treeData)
                  ) : (
                    <p className="text-muted-foreground italic text-center">
                      Ağaç diyagramı burada görünecektir...
                      <br />
                      <span className="text-sm">
                        Parantezli notasyonunuzu girin ve &quot;Ağacı Oluştur&quot; butonuna tıklayın.
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Examples */}
          <Card className="p-6 border-border">
            <h3 className="font-serif font-semibold text-foreground mb-4">Örnek Yapılar</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Basit Cümle", code: "[S [NP Çocuk] [VP [V koştu]]]" },
                { title: "Nesne ile Cümle", code: "[S [NP Ali] [VP [NP kitap] [V okudu]]]" },
                { title: "X-Bar Yapısı", code: "[VP [NP Ali] [V' [V koş] [AdvP hızla]]]" },
                { title: "Karmaşık Yapı", code: "[S [NP [Det Bu] [N kitap]] [VP [Adv çok] [Adj ilginç]]]" },
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(example.code)}
                  className="p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 text-left transition-colors"
                >
                  <p className="text-sm font-medium text-foreground mb-2">{example.title}</p>
                  <code className="text-xs text-muted-foreground font-mono break-all">{example.code}</code>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <SiteFooter />
      <Toaster />
    </div>
  )
}
