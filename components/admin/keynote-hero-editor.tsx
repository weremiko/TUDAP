"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { upsertKeynoteHero } from "@/app/actions/page-content"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const FIELDS = [
  { key: "hero_eyebrow", label: "Üst etiket", multiline: false },
  { key: "hero_title", label: "Başlık", multiline: true },
  { key: "hero_description", label: "Açıklama", multiline: true },
  { key: "hero_date", label: "Tarih", multiline: false },
  { key: "hero_location", label: "Konum", multiline: false },
  { key: "hero_poster_url", label: "Afiş görseli URL’si", multiline: false },
] as const

export function KeynoteHeroEditor({ initialValues }: { initialValues: Record<string, string> }) {
  const [values, setValues] = useState(initialValues)
  const [savedValues, setSavedValues] = useState(initialValues)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const isDirty = FIELDS.some(({ key }) => values[key] !== savedValues[key])

  const save = () => {
    startTransition(async () => {
      try {
        await upsertKeynoteHero(FIELDS.map(({ key }) => ({ key, content: values[key] ?? "" })))
        setSavedValues(values)
        toast({ title: "Hero güncellendi", description: "Değişiklikler KEYNOTE sayfasında yayımlandı." })
      } catch (error) {
        toast({
          title: "Kaydetme başarısız",
          description: error instanceof Error ? error.message : "Hero içeriği kaydedilemedi.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Card className="space-y-5 p-5">
      <div>
        <h2 className="font-serif text-lg font-semibold">KEYNOTE hero</h2>
        <p className="mt-1 text-sm text-muted-foreground">Başlıkta yeni satır kullanarak metnin görünümünü düzenleyin.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ key, label, multiline }) => (
          <label key={key} className={`space-y-2 text-sm font-medium ${multiline ? "sm:col-span-2" : ""}`}>
            <span>{label}</span>
            {multiline ? (
              <Textarea
                value={values[key] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                rows={key === "hero_title" ? 3 : 4}
                maxLength={2000}
              />
            ) : (
              <Input
                value={values[key] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                maxLength={2000}
                placeholder={key === "hero_poster_url" ? "https://… (boşsa etkinlik afişi kullanılır)" : undefined}
              />
            )}
          </label>
        ))}
      </div>
      <div className="flex justify-end border-t border-border pt-4">
        <Button onClick={save} disabled={!isDirty || isPending} className="gap-2">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          {isPending ? "Kaydediliyor…" : "Hero’yu kaydet"}
        </Button>
      </div>
    </Card>
  )
}