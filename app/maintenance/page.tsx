import type { Metadata } from 'next'
import { MaintenancePage } from '@/components/maintenance-page'

export const metadata: Metadata = {
  title: 'TÜDAP — Açılış hazırlıkları',
  description: 'Türkçe Dilbilim Araştırma Platformu açılış hazırlıklarını sürdürüyor.',
  robots: { index: false, follow: false, nocache: true },
}

export default function TurkishMaintenanceRoute() {
  return <MaintenancePage locale="tr" />
}
