'use client'

import { useState, useEffect, useTransition } from 'react'
import { getCustomTranscriptions, addCustomTranscription, updateCustomTranscription, deleteCustomTranscription } from '@/app/actions/transcriptions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

interface CustomTranscription {
  id: number
  input: string
  output: string
  category: string
  notes: string
  createdAt: Date
}

interface TranscriptionForm {
  input: string
  output: string
  category: string
  notes: string
}

export default function AdminTranscriptionsPage() {
  const [transcriptions, setTranscriptions] = useState<CustomTranscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()
  
  const form = useForm<TranscriptionForm>({
    defaultValues: { input: '', output: '', category: 'exception', notes: '' }
  })

  useEffect(() => {
    loadTranscriptions()
  }, [])

  const loadTranscriptions = async () => {
    setIsLoading(true)
    try {
      const data = await getCustomTranscriptions()
      setTranscriptions(data as CustomTranscription[])
    } catch (error) {
      toast({ title: 'Hata', description: 'Sabit çeviriler yüklenemedi.', variant: 'destructive' })
    }
    setIsLoading(false)
  }

  const openAdd = () => {
    setEditingId(null)
    form.reset({ input: '', output: '', category: 'exception', notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: CustomTranscription) => {
    setEditingId(item.id)
    form.reset({ input: item.input, output: item.output, category: item.category, notes: item.notes })
    setDialogOpen(true)
  }

  const onSubmit = (data: TranscriptionForm) => {
    startTransition(async () => {
      try {
        if (editingId) {
          await updateCustomTranscription(editingId, data)
          toast({ title: 'Güncellendi', description: `"${data.input}" → "${data.output}" güncellendi.` })
        } else {
          await addCustomTranscription(data)
          toast({ title: 'Eklendi', description: `"${data.input}" → "${data.output}" eklendi.` })
        }
        setDialogOpen(false)
        await loadTranscriptions()
      } catch (error: any) {
        toast({ title: 'Hata', description: error.message || 'İşlem başarısız.', variant: 'destructive' })
      }
    })
  }

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      try {
        await deleteCustomTranscription(deleteId)
        toast({ title: 'Silindi', description: 'Sabit çeviri silindi.' })
        setDeleteId(null)
        await loadTranscriptions()
      } catch (error) {
        toast({ title: 'Hata', description: 'Silme başarısız.', variant: 'destructive' })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Sabit Çeviriler</h1>
        <p className="text-sm text-muted-foreground mt-1">Sesbilimsel abece çeviricisine özel istisnalar ve sabit kurallar ekleyin.</p>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Toplam: {transcriptions.length} kural</p>
        <Button onClick={openAdd} disabled={isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Çeviri Ekle
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
      ) : transcriptions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Henüz sabit çeviri eklenmemiş.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {transcriptions.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="bg-muted px-2 py-1 rounded font-mono text-sm">{item.input}</code>
                    <span className="text-muted-foreground">→</span>
                    <code className="bg-muted px-2 py-1 rounded font-mono text-sm text-primary">{item.output}</code>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><span className="font-semibold">Kategori:</span> {item.category}</p>
                    {item.notes && <p><span className="font-semibold">Notlar:</span> {item.notes}</p>}
                    <p><span className="font-semibold">Tarih:</span> {new Date(item.createdAt).toLocaleString('tr-TR')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(item)} disabled={isPending}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteId(item.id)} disabled={isPending} className="text-destructive border-destructive/40">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">{editingId ? 'Çeviri Düzenle' : 'Yeni Çeviri Ekle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="input">Giriş (Türkçe)</Label>
              <Input id="input" {...form.register('input')} placeholder="örn. kitap" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="output">Çıkış (IPA)</Label>
              <Input id="output" {...form.register('output')} placeholder="örn. kɪˈtɑp" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" {...form.register('category')} placeholder="örn. exception" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notlar (opsiyonel)</Label>
              <Textarea id="notes" {...form.register('notes')} placeholder="Bu kuralın açıklaması..." rows={2} className="resize-none" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
              <Button type="submit" disabled={isPending}>{editingId ? 'Kaydet' : 'Ekle'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Çeviriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>Bu sabit çeviriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
