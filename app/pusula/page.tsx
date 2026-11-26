import type { Metadata } from "next"
import PusulaTool from "@/components/pusula-tool-spec"
import { serializeJsonLd } from "@/lib/structured-data"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "Dilbilim Pusulası: Hangi Dilbilimci Tipisin?",
  description:
    "20 önerme ile dilbilimdeki yerini bul: zihin mi toplum mu, kuram mı veri mi? Dört karakter, 14 gerçek dilbilimci ve sana özel okuma önerisi.",
  alternates: { canonical: `${BASE}/pusula` },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: `${BASE}/pusula`,
    siteName: "TÜDAP",
    title: "Dilbilim Pusulası: Hangi Dilbilimci Tipisin?",
    description: "Zihin mi toplum mu, kuram mı veri mi? 20 önerme, 4 karakter, 14 gerçek dilbilimci.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Dilbilim Pusulası" }],
  },
  twitter: { card: "summary_large_image" },
}

export default function PusulaPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Dilbilim Pusulası",
    url: `${BASE}/pusula`,
    applicationCategory: "EducationalApplication",
    inLanguage: "tr",
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "TÜDAP", url: BASE },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      <PusulaTool />
    </>
  )
}