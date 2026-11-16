import type { Metadata } from 'next'
import { CorporateIdentityPage } from '@/components/corporate-identity-page'

const BASE = 'https://dilbilim.org.tr'

export const metadata: Metadata = {
  title: 'Kurumsal Kimlik — TÜDAP',
  description: 'TÜDAP’ın resmî logo ve sembol dosyalarını özgün çözünürlüklerinde indirin.',
  alternates: { canonical: `${BASE}/kurumsal-kimlik`, languages: { en: `${BASE}/en/brand` } },
}

export default function TurkishBrandPage() {
  return <CorporateIdentityPage locale="tr" />
}
