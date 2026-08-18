"use client"

import { useState, useEffect, useTransition } from "react"
import { Search, Trash2, ChevronLeft, ChevronRight, ClipboardList, RefreshCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { getQueryLogsAdmin, clearAllQueryLogs, exportQueryLogs } from "@/app/actions/logs"

type Log = { id: number; inputText: string; ipaOutput: string; transcriptionType: string; charCount: number; createdAt: Date }

function fmt(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(d))
}

export default function LoglarPage() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [rows, setRows]   = useState<Log[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage]   = useState(1)
  const [search, setSearch]   = useState("")
  const [query, setQuery]     = useState("")
  const [confirmClear, setConfirmClear] = useState(false)

  const load = (p = 1, q = "") => {
    startTransition(async () => {
      const data = await getQueryLogsAdmin(p, q)
      setRows(data.rows as Log[])
      setTotal(data.total)
      setPages(data.pages)
    })
  }

  useEffect(() => { load() }, [])

  const handleSearch = () => { setPage(1); setQuery(search); load(1, search) }

  const handleExport = (format: 'csv' | 'json') => {
    startTransition(async () => {
      try {
        const content = await exportQueryLogs(format)
        const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tüdap-sorgular-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast({ title: "İndirildi", description: `Sorgular ${format.toUpperCase()} olarak indirildi.` })
      } catch (error) {
        toast({ title: "Hata", description: "İndirme başarısız oldu.", variant: "destructive" })
      }
    })
  }

  const handleClear = () => {
    startTransition(async () => {
      await clearAllQueryLogs()
      setRows([]); setTotal(0); setPages(1); setPage(1)
      setConfirmClear(false)
      toast({ title: "Loglar temizlendi", variant: "destructive" })
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Sorgu Logları</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} kayıt</p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')} disabled={total === 0 || isPending} className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />CSV İndir
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')} disabled={total === 0 || isPending} className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />JSON İndir
          </Button>
          <Button variant="outline" size="sm" onClick={() => load(page, query)} disabled={isPending} className="bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />Yenile
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmClear(true)} disabled={total === 0 || isPending} className="bg-transparent text-destructive border-destructive/40 hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-2" />Tümünü Sil
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Metin veya IPA çıktısında ara..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="pl-9" />
        </div>
        <Button variant="outline" onClick={handleSearch} disabled={isPending} className="bg-transparent">Ara</Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-36">Zaman</TableHead>
              <TableHead>Girilen Metin</TableHead>
              <TableHead className="hidden lg:table-cell">IPA Çıktısı</TableHead>
              <TableHead className="hidden sm:table-cell w-20">Tip</TableHead>
              <TableHead className="hidden md:table-cell w-16">Karakter</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <ClipboardList className="h-10 w-10 opacity-30" />
                    <p className="text-sm">{isPending ? "Yükleniyor..." : "Henüz sorgu kaydedilmedi."}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.map((log) => (
              <TableRow key={log.id} className="hover:bg-muted/30">
                <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">{fmt(log.createdAt)}</TableCell>
                <TableCell className="font-medium max-w-[180px] truncate">{log.inputText}</TableCell>
                <TableCell className="hidden lg:table-cell font-mono text-primary text-sm max-w-[200px] truncate">{log.ipaOutput}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={log.transcriptionType === "broad" ? "secondary" : "outline"} className="text-xs">
                    {log.transcriptionType === "broad" ? "Geniş" : "Dar"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{log.charCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Sayfa {page} / {pages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setPage(p => p - 1); load(page - 1, query) }} disabled={page === 1 || isPending} className="bg-transparent">
              <ChevronLeft className="h-4 w-4 mr-1" />Önceki
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setPage(p => p + 1); load(page + 1, query) }} disabled={page === pages || isPending} className="bg-transparent">
              Sonraki<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tüm logları sil</AlertDialogTitle>
            <AlertDialogDescription>{total} adet kayıt kalıcı olarak silinecek.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}
