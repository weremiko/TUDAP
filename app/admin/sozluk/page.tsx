"use client"

import { useState, useEffect, useTransition } from "react"
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  getAllGlossaryAdmin, addGlossaryEntry, updateGlossaryEntry, deleteGlossaryEntry, bulkImportGlossary,
} from "@/app/actions/glossary"

const CATEGORIES = [
  "Sesbilim","Sesbilgisi","Biçimbilim","Sözdizimi","Anlambilim","Edimbilim",
  "Söylem Çözümlemesi","Tarihsel Dilbilim","Toplumdilbilim","Ruhdilbilim",
  "Metindilbilim","Göstergebilim","Çeviribilim","Sözlükbilim",
  "Uygulamalı Dilbilim","Dil Edinimi","Genel Dilbilim",
]

const entrySchema = z.object({
  term: z.string().min(1, "Terim zorunludur").max(120),
  phonetic: z.string().max(120).default(""),
  category: z.string().min(1, "Kategori zorunludur"),
  definition: z.string().min(1, "Anlam zorunludur").max(500),
  englishEquivalent: z.string().max(120).default(""),
})
type EntryForm = z.infer<typeof entrySchema>

type Row = { id: number; term: string; phonetic: string; category: string; definition: string; englishEquivalent: string; createdAt: Date }

export default function SozlukAdminPage() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [rows, setRows]       = useState<Row[]>([])
  const [total, setTotal]     = useState(0)
  const [pages, setPages]     = useState(1)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState("")
  const [query, setQuery]     = useState("")

  const [dialogOpen, setDialogOpen]       = useState(false)
  const [bulkOpen, setBulkOpen]           = useState(false)
  const [bulkText, setBulkText]           = useState("")
  const [bulkError, setBulkError]         = useState("")
  const [editTarget, setEditTarget]       = useState<Row | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget]   = useState<Row | null>(null)

  const form = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: { term: "", phonetic: "", category: "", definition: "", englishEquivalent: "" },
  })

  const load = (p = page, q = query) => {
    startTransition(async () => {
      const data = await getAllGlossaryAdmin(p, q)
      setRows(data.rows as Row[])
      setTotal(data.total)
      setPages(data.pages)
    })
  }

  useEffect(() => { load(1, "") }, [])

  const handleSearch = () => {
    setPage(1)
    setQuery(search)
    load(1, search)
  }

  const openAdd = () => {
    setEditTarget(null)
    form.reset({ term: "", phonetic: "", category: "", definition: "", englishEquivalent: "" })
    setDialogOpen(true)
  }

  const openEdit = (row: Row) => {
    setEditTarget(row)
    form.reset({
      term: row.term, 
      phonetic: row.phonetic, 
      category: row.category,
      definition: row.definition, 
      englishEquivalent: row.englishEquivalent,
    })
    setEditDialogOpen(true)
  }

  const onSubmit = (data: EntryForm) => {
    startTransition(async () => {
      if (editTarget) {
        await updateGlossaryEntry(editTarget.id, data)
        toast({ title: "Kaydedildi", description: `"${data.term}" güncellendi.` })
        setEditDialogOpen(false)
      } else {
        await addGlossaryEntry(data)
        toast({ title: "Eklendi", description: `"${data.term}" sözlüğe eklendi.` })
        setDialogOpen(false)
      }
      setEditTarget(null)
      load(page, query)
    })
  }

  const handleBulkImport = () => {
    setBulkError("")
    let parsed: { term: string; phonetic?: string; category: string; definition: string; englishEquivalent?: string }[] = []
    try {
      // Try JSON first
      const json = JSON.parse(bulkText.trim())
      parsed = Array.isArray(json) ? json : [json]
    } catch {
      // Fall back to CSV: term|phonetic|category|definition|englishEquivalent
      const lines = bulkText.trim().split("\n").filter(Boolean)
      // Skip header if first line contains "term"
      const start = lines[0]?.toLowerCase().startsWith("term") ? 1 : 0
      parsed = lines.slice(start).map((line) => {
        const [term, phonetic, category, definition, englishEquivalent] = line.split("|").map(s => s.trim())
        return { term, phonetic, category: category || "Genel Dilbilim", definition, englishEquivalent }
      })
    }

    const invalid = parsed.filter(e => !e.term || !e.definition)
    if (invalid.length) {
      setBulkError(`${invalid.length} satırda "term" veya "definition" eksik.`)
      return
    }

    startTransition(async () => {
      const { inserted } = await bulkImportGlossary(parsed)
      toast({ title: "Toplu ekleme tamamlandı", description: `${inserted} terim başarıyla eklendi.` })
      setBulkOpen(false)
      setBulkText("")
      load(1, "")
    })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteGlossaryEntry(deleteTarget.id)
      toast({ title: "Silindi", description: `"${deleteTarget.term}" kaldırıldı.`, variant: "destructive" })
      setDeleteTarget(null)
      load(page, query)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Sözlük Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} terim</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => { setBulkText(""); setBulkError(""); setBulkOpen(true) }} disabled={isPending} className="bg-transparent">
            <Upload className="h-4 w-4 mr-2" />
            Toplu Ekle
          </Button>
          <Button onClick={openAdd} disabled={isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Terim Ekle
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Terim veya anlam ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handleSearch} disabled={isPending} className="bg-transparent">Ara</Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Terim</TableHead>
              <TableHead className="hidden md:table-cell">Fonetik (IPA)</TableHead>
              <TableHead className="hidden lg:table-cell">Kategori</TableHead>
              <TableHead className="hidden sm:table-cell">Anlam</TableHead>
              <TableHead className="hidden xl:table-cell">İngilizce</TableHead>
              <TableHead className="w-20 text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {isPending ? "Yükleniyor..." : "Sonuç bulunamadı."}
                </TableCell>
              </TableRow>
            ) : rows.map((row, idx) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                <TableCell className="text-xs text-muted-foreground font-mono w-12">{(page - 1) * 20 + idx + 1}</TableCell>
                <TableCell className="font-medium">{row.term}</TableCell>
                <TableCell className="hidden md:table-cell font-mono text-primary text-sm">{row.phonetic || "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="secondary" className="text-xs">{row.category}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground max-w-xs truncate">{row.definition}</TableCell>
                <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{row.englishEquivalent || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(row)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => setDeleteTarget(row)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Sayfa {page} / {pages} · {total} terim</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setPage(p => p - 1); load(page - 1, query) }} disabled={page === 1 || isPending} className="bg-transparent">
            <ChevronLeft className="h-4 w-4 mr-1" />Önceki
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setPage(p => p + 1); load(page + 1, query) }} disabled={page === pages || isPending} className="bg-transparent">
            Sonraki<ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Ekle / Düzenle */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Yeni Terim Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="term">Terim</Label>
              <Input id="term" {...form.register("term")} placeholder="örn. fonem" />
              {form.formState.errors.term && <p className="text-xs text-destructive">{form.formState.errors.term.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phonetic">Sesbilimsel Yazı <span className="text-muted-foreground font-normal">(opsiyonel)</span></Label>
              <Input id="phonetic" {...form.register("phonetic")} placeholder="örn. /fo.nem/" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Kategori seçin..." /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.formState.errors.category && <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="englishEquivalent">İngilizce Karşılık <span className="text-muted-foreground font-normal">(opsiyonel)</span></Label>
              <Input id="englishEquivalent" {...form.register("englishEquivalent")} placeholder="örn. phoneme" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="definition">Anlam / Tanım</Label>
              <Textarea id="definition" {...form.register("definition")} placeholder="Terimin tanımını yazın..." rows={3} className="resize-none" />
              {form.formState.errors.definition && <p className="text-xs text-destructive">{form.formState.errors.definition.message}</p>}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent">İptal</Button>
              <Button type="submit" disabled={isPending}>Ekle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Düzenleme Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Terimi Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-term">Terim</Label>
              <Input id="edit-term" {...form.register("term")} placeholder="örn. fonem" />
              {form.formState.errors.term && <p className="text-xs text-destructive">{form.formState.errors.term.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phonetic">Sesbilimsel Yazı <span className="text-muted-foreground font-normal">(opsiyonel)</span></Label>
              <Input id="edit-phonetic" {...form.register("phonetic")} placeholder="örn. /fo.nem/" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Kategori seçin..." /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.formState.errors.category && <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-englishEquivalent">İngilizce Karşılık <span className="text-muted-foreground font-normal">(opsiyonel)</span></Label>
              <Input id="edit-englishEquivalent" {...form.register("englishEquivalent")} placeholder="örn. phoneme" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-definition">Anlam / Tanım</Label>
              <Textarea id="edit-definition" {...form.register("definition")} placeholder="Terimin tanımını yazın..." rows={3} className="resize-none" />
              {form.formState.errors.definition && <p className="text-xs text-destructive">{form.formState.errors.definition.message}</p>}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-transparent">İptal</Button>
              <Button type="submit" disabled={isPending}>Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Silme onayı */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terimi sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.term}</strong> kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toplu Ekleme */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Toplu Terim Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-md bg-muted/50 border border-border p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground">Desteklenen formatlar:</p>
              <p><strong>JSON dizisi:</strong></p>
              <code className="block bg-background rounded px-2 py-1 text-[11px]">
                {`[{"term":"fonem","phonetic":"/fo.nem/","category":"Sesbilim","definition":"...","englishEquivalent":"phoneme"}]`}
              </code>
              <p className="pt-1"><strong>CSV (pipe ile ayrılmış):</strong> <span className="font-mono">term|phonetic|category|definition|englishEquivalent</span></p>
              <code className="block bg-background rounded px-2 py-1 text-[11px]">
                {`fonem|/fo.nem/|Sesbilim|Konuşma seslerinin soyut birimleri|phoneme`}
              </code>
              <p className="text-muted-foreground">Başlık satırı isteğe bağlıdır. Phonetic ve İngilizce karşılık opsiyoneldir.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bulkText">Veri</Label>
              <Textarea
                id="bulkText"
                value={bulkText}
                onChange={(e) => { setBulkText(e.target.value); setBulkError("") }}
                placeholder="JSON veya CSV yapıştırın..."
                rows={10}
                className="font-mono text-xs resize-y"
              />
              {bulkError && <p className="text-xs text-destructive">{bulkError}</p>}
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setBulkOpen(false)} className="bg-transparent">İptal</Button>
            <Button onClick={handleBulkImport} disabled={isPending || !bulkText.trim()}>
              <Upload className="h-4 w-4 mr-2" />
              İçe Aktar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
