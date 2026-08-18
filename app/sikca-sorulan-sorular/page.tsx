import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular — IPA Çevirici & Dilbilim Araçları | TÜDAP",
  description:
    "TÜDAP hakkında en sık sorulan soruların yanıtları: IPA transkripsiyon doğruluğu, ücretsiz kullanım, veri güvenliği, akademik kullanım ve daha fazlası.",
  keywords: ["TÜDAP SSS", "IPA çevirici yardım", "dilbilim araçları nasıl kullanılır", "transkripsiyon doğruluğu"],
  alternates: { canonical: `${BASE}/sikca-sorulan-sorular` },
  openGraph: {
    title: "Sık Sorulan Sorular | TÜDAP",
    description: "TÜDAP araçları hakkında sık sorulan sorular ve yanıtları.",
    url: `${BASE}/sikca-sorulan-sorular`,
    siteName: "TÜDAP",
  },
}

const FAQ = [
  {
    q: "TÜDAP nedir?Eren",
    a: "TÜDAP (Türkçe Dilbilim Araştırma Platformu), Türkiye Türkçesine özgü fonetik transkripsiyon, sözdizimi analizi ve terminoloji araçları sunan ücretsiz bir akademik platformdur.",
  },
  {
    q: "IPA transkripsiyon aracı hangi dili destekliyor?",
    a: "Araç yalnızca Türkiye Türkçesini desteklemektedir. Transkripsiyon kuralları Türkçenin sesbilimsel özelliklerine göre tasarlanmıştır.",
  },
  {
    q: "Transkripsiyon sonuçları ne kadar doğru?",
    a: "Araç beta aşamasındadır; tipik sözcüklerde yüksek doğruluk sağlamakla birlikte özellikle alıntı sözcükler ve istisnai yapılarda hatalar oluşabilir. Akademik çalışmalar için uzman denetimi önerilir.",
  },
  {
    q: "Verilerimi saklıyor musunuz?",
    a: "Giriş yaptığınız metinler sunucularımızda saklanmaz. Oturum kurtarma özelliği tamamen tarayıcınızın localStorage alanını kullanır.",
  },
  {
    q: "Araçları ticari amaçla kullanabilir miyim?",
    a: "Akademik ve kişisel kullanım serbesttir. Ticari kullanım için lütfen iletisim@dilbilim.org.tr adresinden bizimle iletişime geçin.",
  },
  {
    q: "Beta sürümü ne zaman tamamlanacak?",
    a: "Kesin bir tarih bulunmamaktadır. Geliştirme süreci devam etmekte olup güncellemeler düzenli aralıklarla yayınlanmaktadır.",
  },
  {
    q: "Hata veya öneri bildirmek istiyorum.",
    a: "Herhangi bir sayfadaki 'Hata Bildir' bağlantısını veya doğrudan iletisim@dilbilim.org.tr adresini kullanabilirsiniz.",
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
}

export default function SSSPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 flex-1">
        <div className="space-y-2 mb-10">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Yardım</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Sık Sorulan Sorular</h1>
        </div>
        <div className="space-y-6">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="border-b border-border pb-6 last:border-0">
              <h2 className="text-base font-semibold text-foreground mb-2">{q}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
