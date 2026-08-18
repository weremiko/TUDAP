import type { Metadata } from "next"
import { TranscriberPage } from "@/components/transcriber-page"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "Türkçe IPA Çevirici — Sesbilimsel Transkripsiyon Aracı | TÜDAP",
  description:
    "Türkçe metinleri IPA (Uluslararası Fonetik Alfabe) formatına ücretsiz dönüştürün. Damaksıllaşma, sözcük sonu ötümsüzleşme, ünlü uyumu kuralları dahil akademik geniş transkripsiyon.",
  keywords: [
    "türkçe IPA çevirici", "fonetik transkripsiyon", "sesbilimsel transkripsiyon",
    "türkçe fonetik", "IPA türkçe", "uluslararası fonetik alfabe türkçe",
    "türkçe ses bilgisi", "transkripsiyon aracı", "dilbilim aracı", "sesbilim",
    "türkçe IPA online", "fonetik alfabe çevirici",
  ],
  alternates: {
    canonical: `${BASE}/cevirici`,
    languages: { "en": `${BASE}/en/transcriber`, "tr": `${BASE}/cevirici` },
  },
  openGraph: {
    title: "Türkçe IPA Çevirici — Sesbilimsel Transkripsiyon Aracı | TÜDAP",
    description: "Türkçe metinleri IPA formatına ücretsiz dönüştürün. Akademik geniş transkripsiyon.",
    url: `${BASE}/cevirici`,
    siteName: "TÜDAP",
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "Türkçe IPA Çevirici" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Türkçe IPA Çevirici | TÜDAP",
    description: "Türkçe metinleri ücretsiz IPA transkripsiyon formatına dönüştürün.",
    images: [`${BASE}/og-image.png`],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Türkçe IPA Çevirici",
  alternateName: "Sesbilimsel Abece Çeviricisi",
  url: `${BASE}/cevirici`,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web Browser",
  inLanguage: "tr",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "TRY",
    availability: "https://schema.org/InStock",
  },
  description:
    "Türkçe metinleri Uluslararası Fonetik Alfabe (IPA) formatına dönüştüren ücretsiz akademik transkripsiyon aracı. Sesbilimsel kurallara dayalı geniş transkripsiyon.",
  publisher: { "@type": "Organization", name: "TÜDAP", url: BASE },
  featureList: [
    "Geniş fonetik transkripsiyon",
    "Dar fonetik transkripsiyon",
    "Damaksıllaşma kuralları",
    "Sözcük sonu ötümsüzleşme",
    "Ünlü uyumu işleme",
    "Ses dosyası oluşturma",
    "Metin indirme",
  ],
}

export default function TranscriberRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TranscriberPage lang="tr" />
    </>
  )
}
