import Image from 'next/image'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

type Locale = 'tr' | 'en'

type BrandFile = {
  name: string
  label: { tr: string; en: string }
}

type BrandGroup = {
  title: { tr: string; en: string }
  description: { tr: string; en: string }
  files: BrandFile[]
}

const BRAND_GROUPS: BrandGroup[] = [
  {
    title: { tr: 'Tam logo', en: 'Full logo' },
    description: { tr: 'Sembol ve TÜDAP yazısını birlikte içeren ana kullanım.', en: 'Primary lockup combining the symbol and TÜDAP wordmark.' },
    files: [
      { name: 'logo-renkli.png', label: { tr: 'Renkli', en: 'Color' } },
      { name: 'logo-renksiz.png', label: { tr: 'Tek renk', en: 'Monochrome' } },
    ],
  },
  {
    title: { tr: 'Yazı logosu', en: 'Wordmark' },
    description: { tr: 'TÜDAP adı ve platform unvanından oluşan yatay kullanım.', en: 'The TÜDAP name with the platform descriptor.' },
    files: [
      { name: 'yazi-renkli.png', label: { tr: 'Renkli', en: 'Color' } },
      { name: 'yazi-renksiz.png', label: { tr: 'Tek renk', en: 'Monochrome' } },
    ],
  },
  {
    title: { tr: 'Sembol', en: 'Symbol' },
    description: { tr: 'Dar alanlarda veya uygulama simgesi olarak kullanılabilir.', en: 'For compact spaces and application icons.' },
    files: [
      { name: 'icon-renkli.png', label: { tr: 'Renkli', en: 'Color' } },
      { name: 'icon-renksiz.png', label: { tr: 'Tek renk', en: 'Monochrome' } },
    ],
  },
]

export function CorporateIdentityPage({ locale }: { locale: Locale }) {
  const isEnglish = locale === 'en'
  const t = isEnglish
    ? {
        eyebrow: 'TÜDAP · Brand assets',
        title: 'Corporate identity',
        intro: 'Official TÜDAP logos are available below as original, high-resolution PNG files. Choose the color or monochrome version that suits your background.',
        preview: 'Official mark',
        downloads: 'Logo files',
        original: 'Original PNG · 6250 × 6250 px',
        download: 'Download',
        home: 'Home',
      }
    : {
        eyebrow: 'TÜDAP · Marka dosyaları',
        title: 'Kurumsal kimlik',
        intro: 'TÜDAP’ın resmî logo dosyaları aşağıda özgün, yüksek çözünürlüklü PNG biçiminde sunuluyor. Kullanacağınız zemine uygun renkli veya tek renk sürümü seçin.',
        preview: 'Resmî logo',
        downloads: 'Logo dosyaları',
        original: 'Özgün PNG · 6250 × 6250 px',
        download: 'İndir',
        home: 'Ana sayfa',
      }

  return (
    <div lang={locale} className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <nav aria-label={isEnglish ? 'Breadcrumb' : 'Sayfa konumu'} className="mb-8 text-xs text-muted-foreground">
          <Link href={isEnglish ? '/en' : '/'} className="underline decoration-border underline-offset-4 hover:text-foreground">{t.home}</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span aria-current="page">{t.title}</span>
        </nav>

        <header className="grid gap-10 border-b border-border pb-10 md:grid-cols-[1fr_0.8fr] md:items-center md:gap-16 md:pb-14">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{t.eyebrow}</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{t.title}</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">{t.intro}</p>
          </div>
          <figure className="flex min-h-48 items-center justify-center gap-5 border border-border bg-card px-6 py-8 sm:gap-8 sm:px-10">
            <Image src="/tudap-symbol.png" alt="" width={88} height={88} className="size-16 object-contain sm:size-20" priority />
            <Image src="/tudap-wordmark.png" alt="TÜDAP — Türkçe Dilbilim Araştırma Platformu" width={180} height={180} className="h-20 w-40 object-contain sm:h-24 sm:w-48" priority />
            <figcaption className="sr-only">{t.preview}</figcaption>
          </figure>
        </header>

        <section className="pt-9 md:pt-12" aria-labelledby="brand-files-heading">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="brand-files-heading" className="font-serif text-2xl font-semibold text-foreground">{t.downloads}</h2>
            <p className="text-xs text-muted-foreground">{t.original}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {BRAND_GROUPS.map((group) => (
              <article key={group.title.en} className="flex flex-col border-t border-border pt-4">
                <h3 className="font-semibold text-foreground">{group.title[locale]}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{group.description[locale]}</p>
                <ul className="mt-4 flex flex-col border-t border-border">
                  {group.files.map((file) => (
                    <li key={file.name} className="border-b border-border">
                      <a
                        href={`/brand/${file.name}`}
                        download={file.name}
                        aria-label={`${t.download}: ${group.title[locale]} — ${file.label[locale]} (${file.name})`}
                        className="flex min-h-12 items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span>{file.label[locale]} <span className="font-mono text-xs text-muted-foreground">PNG</span></span>
                        <span className="inline-flex items-center gap-2 font-medium"><Download aria-hidden="true" className="size-4" />{t.download}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
