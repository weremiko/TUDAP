'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, LoaderCircle, Power } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { saveMaintenanceSettings, type MaintenanceSettings } from '@/app/actions/maintenance'

type AuditEntry = { actorName: string; enabled: boolean; changedAt: Date }

export function MaintenanceControl({ settings: initialSettings, audit }: { settings: MaintenanceSettings; audit: AuditEntry[] }) {
  const [settings, setSettings] = useState(initialSettings)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function save(nextSettings: MaintenanceSettings, successMessage: string) {
    setSettings(nextSettings)
    startTransition(async () => {
      try {
        await saveMaintenanceSettings(nextSettings)
        toast.success(successMessage)
        router.refresh()
      } catch (error) {
        setSettings(settings)
        toast.error(error instanceof Error ? error.message : 'Ayarlar kaydedilemedi.')
      }
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    save(settings, 'Bakım modu ayarları kaydedildi.')
  }

  return (
    <div className="flex flex-col gap-8">
      <section className={`rounded-lg border p-5 sm:p-7 ${settings.enabled ? 'border-amber-600/30 bg-amber-500/[0.05]' : 'border-border bg-card'}`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${settings.enabled ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-primary/10 text-primary'}`}>
              {settings.enabled ? <AlertTriangle className="size-5" /> : <Power className="size-5" />}
            </span>
            <div>
              <h2 className="font-semibold">{settings.enabled ? 'Bakım modu açık' : 'Bakım modu kapalı'}</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                {settings.enabled ? 'Ziyaretçiler bakım sayfasını görür. Yönetici hesabınız siteye normal erişmeye devam eder.' : 'Bakım sayfası henüz ziyaretçilere gösterilmiyor.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-sm font-medium">{settings.enabled ? 'Açık' : 'Kapalı'}</span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => save({ ...settings, enabled }, enabled ? 'Bakım modu açıldı.' : 'Bakım modu kapatıldı.')}
              disabled={isPending}
              aria-label="Bakım modunu aç veya kapat"
            />
          </div>
        </div>
        {isPending && <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="size-3.5 animate-spin" />Kaydediliyor…</p>}
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <section className="grid gap-5 rounded-lg border border-border bg-card p-5 sm:grid-cols-2 sm:p-7" aria-labelledby="tr-copy-heading">
          <div className="sm:col-span-2">
            <h2 id="tr-copy-heading" className="font-serif text-xl font-semibold">Türkçe bakım sayfası</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ziyaretçilerin Türkçe sayfada göreceği metin.</p>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
            Başlık
            <input maxLength={140} required disabled={isPending} value={settings.titleTr} onChange={(event) => setSettings({ ...settings, titleTr: event.target.value })} className="rounded-md border border-input bg-background px-3 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
            Kısa açıklama
            <textarea maxLength={1200} required rows={3} disabled={isPending} value={settings.descriptionTr} onChange={(event) => setSettings({ ...settings, descriptionTr: event.target.value })} className="resize-y rounded-md border border-input bg-background px-3 py-2.5 leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
        </section>

        <section className="grid gap-5 rounded-lg border border-border bg-card p-5 sm:grid-cols-2 sm:p-7" aria-labelledby="en-copy-heading">
          <div className="sm:col-span-2">
            <h2 id="en-copy-heading" className="font-serif text-xl font-semibold">English maintenance page</h2>
            <p className="mt-1 text-sm text-muted-foreground">Copy shown to visitors using the English interface.</p>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
            Title
            <input maxLength={140} required disabled={isPending} value={settings.titleEn} onChange={(event) => setSettings({ ...settings, titleEn: event.target.value })} className="rounded-md border border-input bg-background px-3 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
            Short description
            <textarea maxLength={1200} required rows={3} disabled={isPending} value={settings.descriptionEn} onChange={(event) => setSettings({ ...settings, descriptionEn: event.target.value })} className="resize-y rounded-md border border-input bg-background px-3 py-2.5 leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
        </section>

        <section className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="launch-date" className="flex flex-col gap-1 text-sm font-medium">
              Lansman tarihi <span className="text-xs font-normal text-muted-foreground">Gün, ay ve yıl. Boş bırakılırsa bakım sayfasında gösterilmez.</span>
            </label>
            <input id="launch-date" type="date" value={settings.launchDate} onChange={(event) => setSettings({ ...settings, launchDate: event.target.value })} disabled={isPending} className="w-fit rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Takım bölümünü göster</p>
              <p className="mt-1 text-xs text-muted-foreground">Yalnızca /takimimiz sayfasında görünür olan üyeler listelenir.</p>
            </div>
            <Switch checked={settings.showTeam} onCheckedChange={(showTeam) => setSettings({ ...settings, showTeam })} disabled={isPending} aria-label="Takım bölümünü göster" />
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={isPending} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
            Ayarları kaydet
          </button>
        </div>
      </form>

      <section className="rounded-lg border border-border bg-card p-5 sm:p-7" aria-labelledby="audit-heading">
        <h2 id="audit-heading" className="font-serif text-xl font-semibold">Son durum değişiklikleri</h2>
        {audit.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Henüz bakım modu değişikliği kaydedilmedi.</p> : (
          <ul className="mt-4 divide-y divide-border">
            {audit.map((entry, index) => (
              <li key={`${entry.changedAt.toISOString()}-${index}`} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span><strong className="font-medium">{entry.actorName}</strong> bakım modunu {entry.enabled ? 'açtı' : 'kapattı'}.</span>
                <time dateTime={entry.changedAt.toISOString()} className="text-muted-foreground">{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(entry.changedAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
