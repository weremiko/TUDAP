'use client'

import { useState, useEffect } from 'react'
import { getErrorReports, markErrorAsResolved, exportErrorsToPDF } from '@/app/actions/errors'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ChevronLeft, ChevronRight, Check, Download, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { addCustomTranscription } from '@/app/actions/transcriptions'

interface ErrorReport {
  id: number
  message: string
  userEmail: string
  url: string
  errorWord: string
  resolved: boolean
  createdAt: Date
}

export default function AdminErrorsPage() {
  const [reports, setReports] = useState<ErrorReport[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [fixModalOpen, setFixModalOpen] = useState(false)
  const [fixTarget, setFixTarget] = useState<ErrorReport | null>(null)
  const [fixIPA, setFixIPA] = useState('')
  const { toast } = useToast()

  const loadReports = async () => {
    setIsLoading(true)
    try {
      const result = await getErrorReports(page, search)
      setReports(result.reports as ErrorReport[])
      setTotal(result.total)
      setPages(result.pages)
    } catch (error) {
      console.error('Error loading reports:', error)
    }
    setIsLoading(false)
  }

  const handleResolve = async (id: number) => {
    setIsPending(true)
    try {
      await markErrorAsResolved(id)
      await loadReports()
    } catch (error) {
      console.error('Error resolving report:', error)
    }
    setIsPending(false)
  }

  const handleAddCustomTranscription = async () => {
    if (!fixTarget?.errorWord || !fixIPA.trim()) {
      toast({ title: "Eksik bilgi", description: "Kelime ve çeviri gereklidir.", variant: "destructive" })
      return
    }
    
    setIsPending(true)
    try {
      await addCustomTranscription({
        input: fixTarget.errorWord,
        output: fixIPA.trim(),
        category: 'error-fix',
        notes: `Hata raporu #${fixTarget.id} üzerinden düzeltildi`,
      })
      console.log("[v0] Custom transcription saved successfully")
      toast({ title: "Eklendi", description: `"${fixTarget.errorWord}" → "${fixIPA}" kaydedildi. Çevirici sayfası yenilendi.` })
      setFixModalOpen(false)
      setFixTarget(null)
      setFixIPA('')
      await markErrorAsResolved(fixTarget.id)
      
      // Refresh page to clear cache in transcriber
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("[v0] Error in handleAddCustomTranscription:", error)
      toast({ title: "Hata", description: "Çeviri eklenemedi: " + (error instanceof Error ? error.message : String(error)), variant: "destructive" })
    }
    setIsPending(false)
  }

  const handleExportPDF = async () => {
    setIsPending(true)
    try {
      const buffer = await exportErrorsToPDF()
      const blob = new Blob([buffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tüdap-hata-raporları-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
    setIsPending(false)
  }

  useEffect(() => {
    loadReports()
  }, [page, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-foreground">Hata Raporları</h1>
        <p className="text-muted-foreground mt-2">
          Kullanıcılardan gelen hata bildirimleri — toplam <span className="font-semibold text-foreground">{total}</span> rapor
        </p>
      </div>

      {/* Search and Export */}
      <div className="flex gap-2 justify-between items-center flex-wrap">
        <Input
          placeholder="Rapor arama..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-xs"
        />
        <Button variant="outline" onClick={handleExportPDF} disabled={total === 0 || isPending} className="bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          PDF İndir
        </Button>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Henüz hata raporu yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="p-4 hover:bg-muted/50 transition-colors border-l-4 border-l-destructive"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{report.message}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    #{report.id}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {report.errorWord && (
                    <p>
                      <span className="font-semibold">Hatalı Sözcük:</span>{' '}
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-destructive">{report.errorWord}</code>
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">Email:</span>{' '}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{report.userEmail}</code>
                  </p>
                  {report.url && (
                    <p>
                      <span className="font-semibold">URL:</span>{' '}
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate inline-block max-w-xs"
                      >
                        {report.url}
                      </a>
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    {report.createdAt ? new Date(report.createdAt).toLocaleString('tr-TR') : 'Tarih bilinmiyor'}
                  </p>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border flex-wrap">
                  {!report.resolved && report.errorWord ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setFixTarget(report)
                          setFixIPA('')
                          setFixModalOpen(true)
                        }}
                        disabled={isPending}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Çeviri Düzelt
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleResolve(report.id)} 
                        disabled={isPending}
                        className="h-7 text-xs"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Çözüldü İşaretle
                      </Button>
                    </>
                  ) : (
                    <Badge variant="default" className="h-7">
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Çözüldü
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Sayfa {page} / {pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Çeviri Düzelt Modal */}
      <Dialog open={fixModalOpen} onOpenChange={setFixModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Çeviriyi Düzelt</DialogTitle>
            <DialogDescription>
              Hatalı kelime için doğru IPA çevrisini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label>Hatalı Kelime</Label>
              <Input 
                value={fixTarget?.errorWord || ''} 
                disabled 
                className="font-mono bg-muted"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fixIPA">Doğru IPA Çevirisi</Label>
              <Textarea
                id="fixIPA"
                value={fixIPA}
                onChange={(e) => setFixIPA(e.target.value)}
                placeholder="örn. [kɪˈtɑp]"
                rows={3}
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setFixModalOpen(false)} className="bg-transparent">İptal</Button>
            <Button onClick={handleAddCustomTranscription} disabled={isPending}>
              Kaydet ve Çözümlü İşaretle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
