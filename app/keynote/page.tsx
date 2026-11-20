import type { Metadata } from "next"
import { KeynoteSite } from "@/components/keynote-site"
import "@/styles/keynote.css"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "KEYNOTE’26 — Dilbilimde yeni bir frekans",
  description: "TÜDAP lansman etkinliği KEYNOTE’26 için etkinlik bilgileri ve dijital bilet kaydı.",
  alternates: { canonical: `${BASE}/keynote` },
  openGraph: {
    title: "KEYNOTE’26 — Dilbilimde yeni bir frekans",
    description: "15 Aralık 2026 · Köyceğiz, Merkez Kütüphane · TÜDAP lansmanı",
    url: `${BASE}/keynote`,
    siteName: "TÜDAP",
    locale: "tr_TR",
    type: "website",
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "KEYNOTE’26 TÜDAP lansman etkinliği" }],
  },
}

export default function KeynotePage() {
  return <KeynoteSite />
}
