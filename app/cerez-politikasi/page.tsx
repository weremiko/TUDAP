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
          <p className="text-sm text-muted-foreground">Son güncelleme: Kasım 2026</p>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Çerez Kullanımı</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hesabınız açıkken oturumun sürdürülmesi ve güvenliğin sağlanması için gerekli oturum çerezleri kullanılır. Ayrıca çevirici taslağı ve tercihleri, duyuru kapatma bilgisi ve çerez tercihiniz tarayıcınızdaki{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">localStorage</code> alanında saklanabilir. Bu yerel kayıtlar sunucuya otomatik olarak gönderilmez; ancak uygulamada ayrıca gönderdiğiniz metinler sorgu kaydı kapsamında işlenebilir.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">İsteğe Bağlı Reklam Hizmeti</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Google AdSense reklam kodu, yalnızca çerez tercih bandında “Kabul et” seçildiğinde yüklenir. “Reddet” seçeneği reklam kodunun yüklenmesini engeller. Tercihinizi sayfanın altındaki “Çerez tercihleri” bağlantısından değiştirebilirsiniz. Google’ın veri kullanımı hakkında{" "}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google’ın ortak sitelerdeki veri kullanımı açıklamasını</a>{" "}
              inceleyebilirsiniz.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Tercihi Değiştirme ve Verileri Temizleme</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Reklam tercihinizi sayfanın altındaki “Çerez tercihleri” bağlantısından değiştirebilirsiniz. Daha önce yüklenmiş üçüncü taraf çerezlerini tarayıcı ayarlarınızdan ayrıca silebilirsiniz. Yerel kayıtları silmek için tarayıcınızın site verilerini temizleyin.
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
