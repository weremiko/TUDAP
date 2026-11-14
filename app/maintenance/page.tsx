import { MaintenancePage } from '@/components/maintenance-page'

export const metadata = {
  title: 'Yakında Açılıyoruz — TÜDAP',
  description: 'Türkçe Dilbilim Araştırma Platformu Aralık 2026’da açılıyor.',
  robots: { index: false, follow: false },
}

export default function MaintenanceRoute() {
  return <MaintenancePage />
}
