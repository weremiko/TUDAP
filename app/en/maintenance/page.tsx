import type { Metadata } from 'next'
import { MaintenancePage } from '@/components/maintenance-page'

export const metadata: Metadata = {
  title: 'TÜDAP — Launch preparations',
  description: 'The Turkish Linguistics Research Platform is preparing to launch.',
  robots: { index: false, follow: false, nocache: true },
}

export default function EnglishMaintenanceRoute() {
  return <MaintenancePage locale="en" />
}
