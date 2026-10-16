"use client"

import { useState } from "react"
import { Check, ChevronDown, Copy, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CitationFormat = "apa" | "mla" | "bibtex"

type Citation = {
  richText: string
  plainText: string
}

const citations: Record<CitationFormat, Citation> = {
  apa: {
    richText: 'Gültekin, E., &amp; Bülbül, A. (2026). <i>TÜDAP Türkçe Sesbilimsel Abece (IPA) Çeviricisi (Sürüm 1.0)</i> [Yazılım]. Türkçe Dilbilim Araştırma Platformu. https://dilbilim.org.tr/cevirici',
    plainText: "Gültekin, E., & Bülbül, A. (2026). TÜDAP Türkçe Sesbilimsel Abece (IPA) Çeviricisi (Sürüm 1.0) [Yazılım]. Türkçe Dilbilim Araştırma Platformu. https://dilbilim.org.tr/cevirici",
  },
  mla: {
    richText: 'Gültekin, Eren, ve Ayten Bülbül. "TÜDAP Türkçe Sesbilimsel Abece (IPA) Çeviricisi." <i>Türkçe Dilbilim Araştırma Platformu</i>, 2026, https://dilbilim.org.tr/cevirici.',
    plainText: 'Gültekin, Eren, ve Ayten Bülbül. "TÜDAP Türkçe Sesbilimsel Abece (IPA) Çeviricisi." Türkçe Dilbilim Araştırma Platformu, 2026, https://dilbilim.org.tr/cevirici.',
  },
  bibtex: {
    richText: String.raw`@software{gultekin_bulbul_2026_ipa,
  author       = {G{\"u}ltekin, Eren and B{\"u}lb{\"u}l, Ayten},
  title        = {T{\"U}DAP T{\"u}rk{\c{c}}e Sesbilimsel Abece (IPA) {\c{C}}eviricisi},
  year         = {2026},
  publisher    = {T{\"u}rk{\c{c}}e Dilbilim Ara{\c{s}}t{\i}rma Platformu (T{\"U}DAP)},
  version      = {1.0},
  url          = {https://dilbilim.org.tr/cevirici}
}`,
    plainText: String.raw`@software{gultekin_bulbul_2026_ipa,
  author       = {G{\"u}ltekin, Eren and B{\"u}lb{\"u}l, Ayten},
  title        = {T{\"U}DAP T{\"u}rk{\c{c}}e Sesbilimsel Abece (IPA) {\c{C}}eviricisi},
  year         = {2026},
  publisher    = {T{\"u}rk{\c{c}}e Dilbilim Ara{\c{s}}t{\i}rma Platformu (T{\"U}DAP)},
  version      = {1.0},
  url          = {https://dilbilim.org.tr/cevirici}
}`,
  },
}

export function CiteThisTool() {
  const [activeFormat, setActiveFormat] = useState<CitationFormat>("apa")
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const activeCitation = citations[activeFormat]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCitation.plainText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="cite-this-tool-panel"
        className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <Quote className="h-4 w-4" />
        <span className="hidden sm:inline">Akademik Atıf</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <section
          id="cite-this-tool-panel"
          className="absolute right-0 top-full z-20 mt-2 w-[calc(100vw-2rem)] max-w-[640px] rounded-2xl border border-border bg-card shadow-lg sm:w-[640px]"
        >
          <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground">
                <Quote className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Akademik Atıf</p>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">Cite This Tool</h2>
              </div>
            </div>

            <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              TÜDAP · 2026 · v1.0
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <Tabs
              value={activeFormat}
              onValueChange={(value) => setActiveFormat(value as CitationFormat)}
              className="w-full"
            >
              <TabsList className="w-full justify-start rounded-xl bg-muted/40 p-1">
                <TabsTrigger value="apa" className="rounded-lg px-4 py-2 text-sm">APA 7</TabsTrigger>
                <TabsTrigger value="bibtex" className="rounded-lg px-4 py-2 text-sm">BibTeX</TabsTrigger>
                <TabsTrigger value="mla" className="rounded-lg px-4 py-2 text-sm">MLA 9</TabsTrigger>
              </TabsList>

              {(["apa", "bibtex", "mla"] as CitationFormat[]).map((format) => (
                <TabsContent key={format} value={format} className="mt-4">
                  <div className="overflow-hidden rounded-xl border border-border bg-background/80">
                    {format === "bibtex" ? (
                      <pre className="overflow-x-auto bg-slate-950 p-4 text-[12px] leading-6 text-slate-100 dark:bg-slate-900 dark:text-slate-50">
                        <code>{activeCitation.plainText}</code>
                      </pre>
                    ) : (
                      <p
                        className="p-4 text-sm leading-7 text-foreground sm:text-[15px]"
                        dangerouslySetInnerHTML={{ __html: activeCitation.richText }}
                      />
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Button onClick={handleCopy} className="inline-flex gap-2 self-start">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Citation"}
              </Button>

              <div className="text-xs leading-relaxed text-muted-foreground">
                Developed by Eren Gültekin &amp; Ayten Bülbül with contributions from the TÜDAP Research Team.
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
