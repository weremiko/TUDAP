import type { Metadata } from 'next'
import { CorporateIdentityPage } from '@/components/corporate-identity-page'

const BASE = 'https://dilbilim.org.tr'

export const metadata: Metadata = {
  title: 'Brand assets — TÜDAP',
  description: 'Download official TÜDAP logo and symbol files in their original resolution.',
  alternates: { canonical: `${BASE}/en/brand`, languages: { tr: `${BASE}/kurumsal-kimlik` } },
}

export default function EnglishBrandPage() {
  return <CorporateIdentityPage locale="en" />
}
