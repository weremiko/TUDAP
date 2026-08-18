import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description: "TÜDAP çerez politikası — hangi çerezlerin kullanıldığı ve nasıl yönetileceği.",
  alternates: { canonical: "https://dilbilim.org.tr/cerez-politikasi" },
}

export default function CerezPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 flex-1">
        <div className="space-y-2 mb-10">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Yasal</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Çerez Politikası</h1>
          <p className="text-sm text-muted-foreground">Son güncelleme: Haziran 2026</p>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Çerez Kullanımı</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              TÜDAP, geleneksel anlamda çerez (cookie) kullanmamaktadır. Oturum bilgileriniz yalnızca tarayıcınızın{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">localStorage</code> alanında saklanır.
              Bu depolama yöntemi sunucularımıza herhangi bir veri göndermez.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Analitik</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vercel Analytics aracılığıyla anonimleştirilmiş sayfa görüntüleme verileri toplanmaktadır.
              Bu veriler kişisel tanımlama içermez ve yalnızca platformun kullanım istatistiklerini ölçmek amacıyla kullanılır.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Yerel Depolamayı Temizleme</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tarayıcınızın geliştirici araçları üzerinden{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">localStorage</code> alanını
              dilediğiniz zaman temizleyebilirsiniz.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">İletişim</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Çerez politikamızla ilgili sorularınız için{" "}
              <a href="mailto:iletisim@dilbilim.org.tr" className="text-primary hover:underline">
                iletisim@dilbilim.org.tr
              </a>{" "}
              adresine ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
