"use client"

import { useState, useEffect, useTransition } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getPageSections, upsertAllPageSections } from "@/app/actions/page-content"
import type { PageSection } from "@/app/actions/page-content"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Loader2, ExternalLink, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "@/lib/auth-client"

const PAGES = [
  { key: "hakkinda", label: "Hakkında", path: "/hakkinda" },
  { key: "iletisim", label: "İletişim", path: "/iletisim" },
]

function SectionEditor({
  section,
  value,
  onChange,
}: {
  section: PageSection
  value: string
  onChange: (val: string) => void
}) {
  const isMultiline = value.includes("\n") || value.length > 120

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {section.label}
        </label>
        {isMultiline && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            Her satır ayrı madde olarak gösterilir
          </span>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={isMultiline ? Math.min(Math.max(value.split("\n").length + 1, 4), 12) : 3}
        className="text-sm font-sans resize-y min-h-[72px]"
        placeholder="İçerik girin…"
      />
    </div>
  )
}

export default function SayfalarPage() {
  const { data: sessionData } = useSession()
  const userRole = (sessionData?.user as any)?.role ?? "admin"
  const { toast } = useToast()
  const [activePage, setActivePage] = useState("hakkinda")
  const [sections, setSections] = useState<PageSection[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [savedKeys, setSavedKeys] = useState<string[]>([])

  // Load sections when active page changes
  useEffect(() => {
    setLoading(true)
    getPageSections(activePage).then((rows) => {
      setSections(rows)
      const initial: Record<string, string> = {}
      rows.forEach((r) => (initial[r.key] = r.content))
      setDrafts(initial)
      setSavedKeys([])
      setLoading(false)
    })
  }, [activePage])

  const isDirty = sections.some((s) => drafts[s.key] !== s.content)

  const handleSave = () => {
    startTransition(async () => {
      const updates = sections.map((s) => ({ key: s.key, content: drafts[s.key] ?? s.content }))
      await upsertAllPageSections(activePage, updates)
      // Update local baseline
      setSections((prev) => prev.map((s) => ({ ...s, content: drafts[s.key] ?? s.content })))
      setSavedKeys(sections.map((s) => s.key))
      toast({ title: "Kaydedildi", description: "Sayfa içerikleri güncellendi." })
      setTimeout(() => setSavedKeys([]), 2500)
    })
  }

  const handleReset = () => {
    const original: Record<string, string> = {}
    sections.forEach((s) => (original[s.key] = s.content))
    setDrafts(original)
  }

  const currentPage = PAGES.find((p) => p.key === activePage)!

  return (
    <AdminShell userRole={userRole}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">Sayfa Düzenleyici</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sitedeki statik sayfa içeriklerini düzenleyin. Değişiklikler anında yayına girer.
            </p>
          </div>
          <a
            href={currentPage.path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-2.5 py-1.5 transition-colors shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Önizle
          </a>
        </div>

        {/* Page tabs */}
        <div className="flex gap-1 border-b border-border">
          {PAGES.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePage(p.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                activePage === p.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Sections */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <div
                key={section.key}
                className={cn(
                  "rounded-lg border bg-card p-5 transition-colors",
                  savedKeys.includes(section.key)
                    ? "border-primary/40 bg-primary/5"
                    : drafts[section.key] !== section.content
                    ? "border-amber-400/40 bg-amber-50/5"
                    : "border-border"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-muted-foreground/60 bg-muted px-2 py-0.5 rounded">
                    {section.key}
                  </span>
                  {savedKeys.includes(section.key) && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Kaydedildi
                    </span>
                  )}
                  {drafts[section.key] !== section.content && !savedKeys.includes(section.key) && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">Kaydedilmemiş değişiklik</span>
                  )}
                </div>
                <SectionEditor
                  section={section}
                  value={drafts[section.key] ?? section.content}
                  onChange={(val) => setDrafts((d) => ({ ...d, [section.key]: val }))}
                />
              </div>
            ))}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={!isDirty || isPending}
                className="text-muted-foreground"
              >
                Değişiklikleri Geri Al
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isDirty || isPending}
                className="gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isPending ? "Kaydediliyor…" : "Kaydet"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
