import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "TÜDAP gizlilik politikası — kişisel verilerinizin nasıl işlendiği hakkında bilgi.",
  alternates: { canonical: "https://dilbilim.org.tr/gizlilik-politikasi" },
}

const SECTIONS = [
  {
    title: "Toplanan Veriler",
    body: "TÜDAP, girdilerinizi ve transkripsiyon çıktılarını anonim olarak günlüğe kaydeder. Bu veriler yalnızca platform geliştirmesi, kullanım analizi ve kalite kontrol amacıyla saklanır. Giriş yaptığınız takdirde işlemleriniz hesabınızla ilişkilendirilir; giriş yapmayarak da anonim şekilde kullanabilirsiniz.",
  },
  {
    title: "Hata Raporları",
    body: "Hata bildiri gönderdiğinizde, mesajınız, email adresiniz (eğer gönderildiyse) ve ilgili URL'yi emniyetli şekilde kaydederiz. Bu veriler sadece platform sorunlarını çözmek amacıyla kullanıcılar ve sistem yöneticileri tarafından incelenebilir.",
  },
  {
    title: "Çerezler ve Yerel Depolama",
    body: "Platform, önceki oturumunuzu geri yüklemek amacıyla tarayıcınızın localStorage alanını kullanmaktadır. Bu veriler yalnızca kendi cihazınızda tutulur ve üçüncü taraflarla paylaşılmaz.",
  },
  {
    title: "Üçüncü Taraf Hizmetler",
    body: "Vercel Analytics anonimleştirilmiş ziyaretçi istatistiklerini toplamaktadır. Bu veriler bireysel kullanıcıları tanımlamaz ve yalnızca platform performansını iyileştirme amacıyla kullanılır.",
  },
  {
    title: "Veri Saklama ve Güvenliği",
    body: "Sorgu günlükleri ve hata raporları Neon Postgres veritabanında güvenli şekilde depolanır. Tüm bağlantılar HTTPS üzerinden şifrelenmektedir. Veriler yalnızca yetkili yöneticiler ve sistem bileşenleri tarafından erişilebilir.",
  },
  {
    title: "Çocukların Gizliliği",
    body: "Platform 13 yaş altı çocuklardan bilerek kişisel bilgi toplamaz. Ebeveyn ve vasiler, çocuklarının internet kullanımını denetlemekle sorumludur.",
  },
  {
    title: "İletişim",
    body: "Gizlilik politikamızla ilgili sorularınız için eren@dilbilim.org.tr adresine ulaşabilirsiniz.",
  },
]

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 flex-1">
        <div className="space-y-2 mb-10">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Yasal</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Gizlilik Politikası</h1>
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
