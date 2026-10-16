"use client"

import { useEffect, useState, useTransition } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createAnnouncement, deleteAnnouncement, getAnnouncements, toggleAnnouncement } from "@/app/actions/announcements"
import { CheckCircle2, Loader2, Megaphone, Plus, Trash2 } from "lucide-react"

type Announcement = Awaited<ReturnType<typeof getAnnouncements>>[number]

function dateValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export default function AdminAnnouncementsPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [linkLabel, setLinkLabel] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [startsAt, setStartsAt] = useState(dateValue(new Date()))
  const [endsAt, setEndsAt] = useState("")
  const [active, setActive] = useState(true)

  const load = async () => {
    try { setItems(await getAnnouncements()) } catch { toast({ title: "Duyurular yüklenemedi", variant: "destructive" }) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submit = () => startTransition(async () => {
    try {
      await createAnnouncement({ title, content, linkLabel, linkUrl, startsAt: new Date(startsAt).toISOString(), endsAt: endsAt ? new Date(endsAt).toISOString() : undefined, active })
      setTitle(""); setContent(""); setLinkLabel(""); setLinkUrl(""); setEndsAt("")
      toast({ title: "Duyuru oluşturuldu" }); await load()
    } catch (error) { toast({ title: "Duyuru oluşturulamadı", description: error instanceof Error ? error.message : "Alanları kontrol edin.", variant: "destructive" }) }
  })

  return <AdminShell><div className="mx-auto max-w-4xl space-y-6"><div><h1 className="flex items-center gap-2 text-2xl font-serif font-bold text-foreground"><Megaphone className="h-5 w-5 text-accent" />Duyurular</h1><p className="mt-1 text-sm text-muted-foreground">Ana sayfada popup olarak gösterilecek duyuruları planlayın.</p></div><Card className="p-6"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2 md:col-span-2"><label className="text-sm font-medium">Başlık</label><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" /></div><div className="space-y-2 md:col-span-2"><label className="text-sm font-medium">İçerik</label><Textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} rows={5} /></div><div className="space-y-2"><label className="text-sm font-medium">Bağlantı metni (isteğe bağlı)</label><input value={linkLabel} onChange={(event) => setLinkLabel(event.target.value)} maxLength={80} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" placeholder="Detayları incele" /></div><div className="space-y-2"><label className="text-sm font-medium">Bağlantı adresi (isteğe bağlı)</label><input type="url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} maxLength={500} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" placeholder="https://..." /></div><div className="space-y-2"><label className="text-sm font-medium">Başlangıç</label><input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" /></div><div className="space-y-2"><label className="text-sm font-medium">Bitiş (isteğe bağlı)</label><input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" /></div><label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />Duyuru aktif olsun</label></div><Button onClick={submit} disabled={pending} className="mt-5 gap-2">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Duyuru ekle</Button></Card><div className="space-y-3">{loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : items.map((item) => <Card key={item.id} className="flex items-start justify-between gap-4 p-5"><div><div className="flex items-center gap-2"><h2 className="font-serif font-semibold text-foreground">{item.title}</h2><span className={`text-xs ${item.active ? "text-primary" : "text-muted-foreground"}`}>{item.active ? "Aktif" : "Pasif"}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.startsAt.toLocaleString("tr-TR")} {item.endsAt ? `- ${item.endsAt.toLocaleString("tr-TR")}` : "- Süresiz"}</p><p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.content}</p></div><div className="flex shrink-0 gap-2"><Button variant="outline" size="sm" onClick={() => startTransition(async () => { await toggleAnnouncement(item.id, !item.active); await load() })}>{item.active ? "Pasifleştir" : "Aktifleştir"}</Button><Button variant="ghost" size="icon" aria-label="Duyuruyu sil" onClick={() => startTransition(async () => { await deleteAnnouncement(item.id); await load() })}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></Card>)}</div></div></AdminShell>
}
