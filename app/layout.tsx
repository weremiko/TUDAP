import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Lora } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "TÜDAP — Türkçe Dilbilim Platformu",
    template: "%s | TÜDAP",
  },
  description:
    "Türkiye Türkçesine özgü IPA fonetik transkripsiyon, dilbilim terimleri sözlüğü, akademik blog ve etkinlik ajandası. Dilbilimciler ve araştırmacılar için ücretsiz dijital platform.",
  keywords: [
    "türkçe dilbilim", "IPA çevirici", "fonetik transkripsiyon", "türkçe IPA",
    "dilbilim terimleri sözlüğü", "sesbilim", "sözdizimi", "anlambilim",
    "dilbilim semineri", "dilbilim konferansı", "türkçe ses bilgisi",
    "TÜDAP", "dilbilim.org.tr", "türkçe dilbilgisi", "morfoloji",
  ],
  authors: [{ name: "TÜDAP", url: BASE }],
  creator: "TÜDAP",
  publisher: "TÜDAP",
  alternates: { canonical: BASE },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: BASE,
    siteName: "TÜDAP",
    title: "TÜDAP — Türkçe Dilbilim Platformu",
    description: "Türkiye Türkçesine özgü IPA fonetik transkripsiyon, dilbilim terimleri sözlüğü, blog ve etkinlik ajandası.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TÜDAP — Türkçe Dilbilim Platformu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TÜDAP — Türkçe Dilbilim Platformu",
    description: "Türkçe dilbilim araştırmaları için ücretsiz araçlar, blog ve etkinlik ajandası.",
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
}

const org = {
  "@type": "Organization",
  "@id": `${BASE}/#organization`,
  name: "TÜDAP",
  alternateName: "Türkçe Dilbilim Platformu",
  url: BASE,
  logo: {
    "@type": "ImageObject",
    url: `${BASE}/og-image.png`,
    width: 1200,
    height: 630,
  },
  email: "iletisim@dilbilim.org.tr",
  sameAs: [`${BASE}/hakkinda`, `${BASE}/en/about`],
  foundingDate: "2024",
  description: "Türkiye Türkçesine özgü IPA fonetik transkripsiyon, dilbilim terimleri sözlüğü, akademik blog ve etkinlik ajandası sunan ücretsiz platformdur.",
}

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE}/#website`,
    name: "TÜDAP",
    alternateName: "Türkçe Dilbilim Platformu",
    url: BASE,
    inLanguage: ["tr", "en"],
    description: "Türkçe Dilbilim Platformu — IPA fonetik transkripsiyon, dilbilim terimleri sözlüğü, akademik blog ve etkinlik ajandası.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BASE}/terim-sozlugu?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
    publisher: { "@id": `${BASE}/#organization` },
  },
  {
    "@context": "https://schema.org",
    ...org,
  },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geist.variable} ${geistMono.variable} ${lora.variable} bg-background`}>
      <head>
        {structuredData.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
