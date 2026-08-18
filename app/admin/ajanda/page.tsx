'use client'

import { useState, useEffect } from 'react'
import { getAllEvents, addEvent, updateEvent, deleteEvent } from '@/app/actions/events'
import { AdminShell } from '@/components/admin/admin-shell'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Pencil, Trash2, Plus, Calendar, MapPin, User, Link as LinkIcon, Tag, Clock } from 'lucide-react'

const EVENT_TYPES = [
  { value: 'seminar',     label: 'Seminer',      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'conference',  label: 'Konferans',    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'workshop',    label: 'Çalıştay',     color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'student_conf',label: 'Öğrenci Konferansı', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { value: 'webinar',     label: 'Webinar',      color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { value: 'lecture',     label: 'Konuşma/Ders', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  { value: 'meeting',     label: 'Toplantı',     color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  { value: 'other',       label: 'Diğer',        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
]

interface Event {
  id: number
  title: string
  description: string
  eventType: string
  date: Date
  endDate?: Date | null
  location: string
  organizer: string
  url: string
  tags: string
  createdAt: Date
}

const emptyForm = {
  title: '',
  description: '',
  eventType: 'seminar',
  date: new Date().toISOString().split('T')[0],
  time: '10:00',
  endDate: '',
  endTime: '',
  location: '',
  organizer: '',
  url: '',
  tags: '',
}

export default function AdminAjandaPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isPending, setIsPending] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Event | null>(null)
  const [form, setForm] = useState(emptyForm)
  const { toast } = useToast()

  useEffect(() => { loadEvents() }, [])

  const loadEvents = async () => {
    try {
      const result = await getAllEvents()
      setEvents(result as Event[])
    } catch (err) {
      console.error('[v0] Error loading events:', err)
    }
  }

  const openDialog = (event?: Event) => {
    if (event) {
      setEditTarget(event)
      const d = new Date(event.date)
      const ed = event.endDate ? new Date(event.endDate) : null
      setForm({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        date: d.toISOString().split('T')[0],
        time: d.toTimeString().slice(0, 5),
        endDate: ed ? ed.toISOString().split('T')[0] : '',
        endTime: ed ? ed.toTimeString().slice(0, 5) : '',
        location: event.location,
        organizer: event.organizer,
        url: event.url || '',
        tags: event.tags || '',
      })
    } else {
      setEditTarget(null)
      setForm(emptyForm)
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Başlık gerekli', variant: 'destructive' })
      return
    }
    if (!form.date) {
      toast({ title: 'Tarih gerekli', variant: 'destructive' })
      return
    }
    setIsPending(true)
    try {
      const dateTime = new Date(`${form.date}T${form.time || '00:00'}:00`)
      const endDateTime = form.endDate
        ? new Date(`${form.endDate}T${form.endTime || '00:00'}:00`)
        : null
      const payload = {
        title: form.title,
        description: form.description,
        eventType: form.eventType,
        date: dateTime,
        endDate: endDateTime,
        location: form.location,
        organizer: form.organizer,
        url: form.url,
        tags: form.tags,
      }
      if (editTarget) {
        await updateEvent(editTarget.id, payload)
        toast({ title: 'Güncellendi', description: `"${form.title}" güncellendi.` })
      } else {
        await addEvent(payload)
        toast({ title: 'Eklendi', description: `"${form.title}" eklendi.` })
      }
      setDialogOpen(false)
      await loadEvents()
    } catch (err) {
      toast({ title: 'Hata', description: err instanceof Error ? err.message : 'Hata oluştu', variant: 'destructive' })
    }
    setIsPending(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) return
    setIsPending(true)
    try {
      await deleteEvent(id)
      toast({ title: 'Silindi' })
      await loadEvents()
    } catch {
      toast({ title: 'Hata', description: 'Silinemedi.', variant: 'destructive' })
    }
    setIsPending(false)
  }

  const getTypeInfo = (value: string) => EVENT_TYPES.find(t => t.value === value) ?? EVENT_TYPES[EVENT_TYPES.length - 1]

  const isUpcoming = (date: Date) => new Date(date) >= new Date()

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold">Dilbilim Ajandası</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Seminer, konferans, çalıştay ve etkinlikleri yönetin</p>
          </div>
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Etkinlik Ekle
          </Button>
        </div>

        {/* Events list */}
        {events.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Henüz etkinlik eklenmemiş.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const typeInfo = getTypeInfo(event.eventType)
              const upcoming = isUpcoming(event.date)
              const tagList = event.tags ? event.tags.split(',').map(t => t.trim()).filter(Boolean) : []

              return (
                <Card key={event.id} className={`p-4 transition-colors ${!upcoming ? 'opacity-50' : 'hover:bg-muted/30'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        {!upcoming && (
                          <span className="text-xs text-muted-foreground">Geçmiş</span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-base leading-snug">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.date).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                        {event.organizer && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {event.organizer}
                          </span>
                        )}
                        {event.url && (
                          <a href={event.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline">
                            <LinkIcon className="h-3 w-3" />
                            Bağlantı
                          </a>
                        )}
                      </div>
                      {tagList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tagList.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openDialog(event)} disabled={isPending} className="h-8 w-8 p-0 bg-transparent">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)} disabled={isPending} className="h-8 w-8 p-0 bg-transparent text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              {editTarget ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label>Başlık <span className="text-destructive">*</span></Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="örn. Türkçe Sesbilim Semineri"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label>Etkinlik Türü</Label>
              <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Başlangıç Tarihi <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Başlangıç Saati</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>

            {/* End Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Bitiş Tarihi <span className="text-xs text-muted-foreground font-normal">(opsiyonel)</span></Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Bitiş Saati</Label>
                <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>

            {/* Location + Organizer */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Yer</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="örn. İTÜ Taşkışla, Boğaziçi Ü."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Düzenleyen</Label>
                <Input
                  value={form.organizer}
                  onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  placeholder="örn. ODTÜ Dilbilim Bölümü"
                />
              </div>
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <Label>Etkinlik Bağlantısı (URL)</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                type="url"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label>Etiketler</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="sesbilim, sözdizim, Türkçe (virgülle ayırın)"
              />
              <p className="text-xs text-muted-foreground">Virgülle ayrılmış etiketler — filtreleme için kullanılır</p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Açıklama</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Etkinlik hakkında kısa bilgi, konuşmacılar, katılım koşulları..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent">
              İptal
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {editTarget ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </AdminShell>
  )
}
