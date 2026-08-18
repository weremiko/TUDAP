import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: "TÜDAP platformunun kullanım koşulları ve kabul edilebilir kullanım politikası.",
  alternates: { canonical: "https://dilbilim.org.tr/kullanim-kosullari" },
}

const SECTIONS = [
  {
    title: "Kabul",
    body: "Bu platformu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Koşulları kabul etmiyorsanız platformu kullanmayınız.",
  },
  {
    title: "Kullanım Amacı",
    body: "TÜDAP araçları akademik ve eğitimsel amaçlar için tasarlanmıştır. Araçları kötüye kullanmak, aşırı yük oluşturmak veya tersine mühendislik uygulamak yasaktır.",
  },
  {
    title: "Doğruluk Garantisi",
    body: "Platform beta aşamasındadır. Transkripsiyon ve analiz sonuçlarının doğruluğu garanti edilmez. Sonuçlar referans amaçlıdır; kritik akademik çalışmalarda uzman denetimi şarttır.",
  },
  {
    title: "Fikri Mülkiyet",
    body: "Platform içeriği, tasarımı ve yazılımı TÜDAP'a aittir. Kullanıcıların girdiği veriler üzerindeki haklar kullanıcıya aittir.",
  },
  {
    title: "Akademik Atıf",
    body: "Akademik çalışmalarda platform araçlarını kullananların uygun biçimde atıf yapması beklenmektedir.",
  },
  {
    title: "Hizmetin Değiştirilmesi",
    body: "TÜDAP, önceden bildirim yapmaksızın hizmetlerini değiştirme, askıya alma veya sonlandırma hakkını saklı tutar.",
  },
  {
    title: "Uygulanacak Hukuk",
    body: "Bu koşullar Türkiye Cumhuriyeti yasalarına tabidir.",
  },
  {
    title: "İletişim",
    body: "Koşullarla ilgili sorularınız için iletisim@dilbilim.org.tr adresine yazabilirsiniz.",
  },
]

export default function KullanimPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 flex-1">
        <div className="space-y-2 mb-10">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Yasal</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Kullanım Koşulları</h1>
          <p className="text-sm text-muted-foreground">Son güncelleme: Haziran 2026</p>
        </div>
        <div className="space-y-8">
          {SECTIONS.map(({ title, body }) => (
            <div key={title}>
              <h2 className="text-base font-semibold text-foreground mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
