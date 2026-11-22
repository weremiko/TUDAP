"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { upsertHomepageContent } from "@/app/actions/page-content"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const GROUPS = [
  { title: "SEO", keys: ["seo_title", "seo_description"] },
  { title: "Hero", keys: ["hero_eyebrow", "hero_headlines", "hero_description", "hero_primary_label", "hero_primary_href", "hero_secondary_label", "hero_secondary_href"] },
  { title: "Hero istatistikleri ve terim arama", keys: ["stat_1_value", "stat_1_label", "stat_2_value", "stat_2_label", "stat_3_value", "stat_3_label", "term_search_label", "term_search_placeholder", "term_search_button"] },
  { title: "Etkinlik ajandası", keys: ["roadmap_eyebrow", "roadmap_title", "roadmap_link_label", "events_empty_title", "events_empty_description"] },
  { title: "Araçlar ve kartlar", keys: ["tools_eyebrow", "tools_title", "tab_tools", "tab_resources", "tab_platform", "tool_transcriber_title", "tool_transcriber_desc", "tool_transcriber_href", "tool_glossary_title", "tool_glossary_desc", "tool_glossary_href", "resource_blog_title", "resource_blog_desc", "resource_blog_href", "resource_agenda_title", "resource_agenda_desc", "resource_agenda_href", "platform_about_title", "platform_about_desc", "platform_about_href", "platform_team_title", "platform_team_desc", "platform_team_href"] },
  { title: "Blog ve sözlük araması", keys: ["blog_eyebrow", "blog_title", "glossary_eyebrow", "glossary_title", "glossary_description", "glossary_prompts", "glossary_input_label", "glossary_search_button"] },
] as const

type SectionValue = { key: string; label: string; content: string }

export function HomepageContentEditor({ sections }: { sections: SectionValue[] }) {
  const initialValues = Object.fromEntries(sections.map(({ key, content }) => [key, content]))
  const labels = Object.fromEntries(sections.map(({ key, label }) => [key, label]))
  const [values, setValues] = useState(initialValues)
  const [savedValues, setSavedValues] = useState(initialValues)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const isDirty = sections.some(({ key }) => values[key] !== savedValues[key])

  const save = () => {
    startTransition(async () => {
      try {
        await upsertHomepageContent(sections.map(({ key }) => ({ key, content: values[key] ?? "" })))
        setSavedValues(values)
        toast({ title: "Ana sayfa güncellendi", description: "Değişiklikler yayımlandı." })
      } catch (error) {
        toast({
          title: "Kaydetme başarısız",
          description: error instanceof Error ? error.message : "Ana sayfa içerikleri kaydedilemedi.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="space-y-5">
      {GROUPS.map((group) => (
        <Card key={group.title} className="space-y-5 p-5">
          <h2 className="font-serif text-lg font-semibold">{group.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.keys.map((key) => {
              const label = labels[key] ?? key
              const multiline = key.includes("description") || key.includes("headlines") || key.includes("prompts")
              return (
                <label key={key} className={`space-y-2 text-sm font-medium ${multiline ? "sm:col-span-2" : ""}`}>
                  <span>{label}</span>
                  {multiline ? (
                    <Textarea
                      value={values[key] ?? ""}
                      onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                      rows={key.includes("headlines") || key.includes("prompts") ? 5 : 3}
                      maxLength={2000}
                    />
                  ) : (
                    <Input
                      value={values[key] ?? ""}
                      onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                      maxLength={2000}
                    />
                  )}
                </label>
              )
            })}
          </div>
        </Card>
      ))}

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} disabled={!isDirty || isPending} className="gap-2 shadow-lg">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          {isPending ? "Kaydediliyor…" : "Ana sayfayı kaydet"}
        </Button>
      </div>
    </div>
  )
}