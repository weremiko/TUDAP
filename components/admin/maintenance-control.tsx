'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, LoaderCircle, Power } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { setMaintenanceMode } from '@/app/actions/maintenance'

export function MaintenanceControl({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleChange(nextEnabled: boolean) {
    setEnabled(nextEnabled)
    startTransition(async () => {
      try {
        await setMaintenanceMode(nextEnabled)
        toast.success(nextEnabled ? 'Bakım modu açıldı.' : 'Bakım modu kapatıldı.')
        router.refresh()
      } catch (error) {
        setEnabled(!nextEnabled)
        toast.error(error instanceof Error ? error.message : 'Ayar kaydedilemedi.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <section className={`rounded-2xl border p-6 sm:p-8 ${enabled ? 'border-amber-500/30 bg-amber-500/[0.06]' : 'border-border bg-card'}`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${enabled ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-primary/10 text-primary'}`}>
              {enabled ? <AlertTriangle className="size-5" /> : <Power className="size-5" />}
            </span>
            <div>
              <h2 className="text-lg font-semibold">{enabled ? 'Bakım modu açık' : 'Site yayında'}</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                {enabled
                  ? 'Ziyaretçiler Aralık lansmanı için hazırlanan bakım sayfasını görür. Yönetim paneli ve giriş sayfaları erişilebilir kalır.'
                  : 'Ziyaretçiler site içeriğini normal şekilde görüntüler. Lansman öncesi bakım sayfasını istediğiniz zaman açabilirsiniz.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-sm font-medium">{enabled ? 'Açık' : 'Kapalı'}</span>
            <Switch checked={enabled} onCheckedChange={handleChange} disabled={isPending} aria-label="Bakım modunu aç veya kapat" />
          </div>
        </div>
        {isPending && <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="size-3.5 animate-spin" />Ayar kaydediliyor…</p>}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="size-5" /></span>
          <div>
            <h3 className="font-semibold">Aralık lansmanına hazır</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Bakım sayfası TÜDAP&apos;ın marka renkleri ve logosuyla hazırlanmıştır. Modu açtığınız anda site ziyaretçileri bu sayfaya yönlendirilir; yönetici olarak giriş yapıp kontrol panelini kullanmaya devam edebilirsiniz.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
