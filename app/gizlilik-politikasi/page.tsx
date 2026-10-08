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
    title: "İçerik Başvuruları ve Medya Dosyaları",
    body: "Üyelerin gönderdiği içerik başvurularındaki başlık, açıklama, metin ve hesap bilgileri başvuruyu değerlendirmek için saklanır. Video, podcast ve PDF dosyaları private Vercel Blob depolamasında tutulur. Dosyalar yalnızca yayımlanmış içeriklerde veya başvuruyu yapan üye ve yetkili moderatörler tarafından görüntülenebilir; medya bağlantıları kısa ömürlü imzalı erişimle sunulur.",
  },
  {
    title: "Çerezler ve Yerel Depolama",
    body: "Platform, önceki oturumunuzu geri yüklemek amacıyla tarayıcınızın localStorage alanını kullanmaktadır. Bu veriler yalnızca kendi cihazınızda tutulur ve üçüncü taraflarla paylaşılmaz.",
  },
  {
    title: "Üçüncü Taraf Hizmetler",
    body: "Vercel Analytics anonimleştirilmiş ziyaretçi istatistiklerini toplar. Medya dosyaları Vercel Blob depolama hizmetinde tutulur. Bu hizmetler kendi altyapıları üzerinden veri işler.",
  },
  {
    title: "Veri Saklama ve Güvenliği",
    body: "Sorgu günlükleri, hesap bilgileri ve başvuru kayıtları Neon Postgres veritabanında depolanır. Uygulama verilerine erişim yetkilendirme ile sınırlandırılır; medya dosyaları private Blob depolamasında tutulur ve erişim her istekte içerik yayını veya kullanıcı rolüne göre denetlenir. Tüm bağlantılar HTTPS üzerinden şifrelenir.",
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
