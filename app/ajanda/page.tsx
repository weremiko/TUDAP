import type { Metadata } from 'next'
import { getEvents } from '@/app/actions/events'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, MapPin, Users, Mail, ExternalLink } from 'lucide-react'

const BASE = "https://dilbilim.org.tr"

const EVENT_TYPES: Record<string, { label: string; color: string }> = {
  seminar:      { label: 'Seminer',             color: 'bg-blue-100 text-blue-800' },
  conference:   { label: 'Konferans',           color: 'bg-purple-100 text-purple-800' },
  workshop:     { label: 'Çalıştay',            color: 'bg-green-100 text-green-800' },
  student_conf: { label: 'Öğrenci Konferansı',  color: 'bg-yellow-100 text-yellow-800' },
  webinar:      { label: 'Webinar',             color: 'bg-cyan-100 text-cyan-800' },
  lecture:      { label: 'Konuşma/Ders',        color: 'bg-orange-100 text-orange-800' },
  meeting:      { label: 'Toplantı',            color: 'bg-gray-100 text-gray-800' },
  other:        { label: 'Diğer',               color: 'bg-gray-100 text-gray-800' },
}

export const metadata: Metadata = {
  title: 'Türkiye Dilbilim Ajandası — Seminerler, Konferanslar & Çalıştaylar | TÜDAP',
  description:
    'Türkiye genelinde düzenlenen dilbilim seminerleri, konferanslar, öğrenci konferansları, webinarlar ve çalıştaylar. Yaklaşan dilbilim etkinliklerini takip edin.',
  keywords: [
    'dilbilim etkinlikleri', 'dilbilim semineri', 'dilbilim konferansı',
    'öğrenci konferansı', 'dilbilim çalıştayı', 'türkiye dilbilim',
    'akademik etkinlik', 'dilbilim webinar', 'türkçe dil bilimi etkinlikleri',
  ],
  alternates: { canonical: `${BASE}/ajanda` },
  openGraph: {
    type: 'website',
    title: 'Türkiye Dilbilim Ajandası — Seminerler & Konferanslar | TÜDAP',
    description: 'Türkiye genelinde düzenlenen dilbilim seminerleri, konferanslar ve çalıştaylar.',
    url: `${BASE}/ajanda`,
    siteName: 'TÜDAP',
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: 'Türkiye Dilbilim Ajandası' }],
  },
}

export default async function AjandaPage() {
  const events = await getEvents()

  const eventListJsonLd = events.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Türkiye Dilbilim Etkinlikleri",
    url: `${BASE}/ajanda`,
    numberOfItems: events.length,
    itemListElement: events.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Event",
        name: e.title,
        description: e.description,
        startDate: new Date(e.date).toISOString(),
        ...(e.endDate ? { endDate: new Date(e.endDate).toISOString() } : {}),
        ...(e.location ? { location: { "@type": "Place", name: e.location } } : {}),
        ...(e.organizer ? { organizer: { "@type": "Organization", name: e.organizer } } : {}),
        ...(e.url ? { url: e.url } : {}),
        inLanguage: "tr",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      },
    })),
  } : null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {eventListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventListJsonLd) }} />
      )}
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 flex-1">
        <div className="space-y-2 mb-10">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Platform</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Türkiye Dilbilim Ajandası</h1>
          <p className="text-base text-muted-foreground mt-3">
            Dilbilim alanında düzenlenen tüm seminerler, konferanslar, çalıştaylar ve etkinlikleri burada takip edebilirsiniz.
          </p>
        </div>

        {/* Duyuru Bilgisi */}
        <Alert className="mb-8 border-l-4 border-l-accent bg-accent/5">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Etkinlik duyurusu yapmak mı istiyorsunuz?</span> Lütfen <span className="font-semibold text-accent">iletisim@dilbilim.org.tr</span> adresine e-posta göndererek etkinlik detaylarını paylaşın. En kısa sürede eklenecektir.
          </AlertDescription>
        </Alert>

        {events.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Şu anda programlanmış etkinlik bulunmamaktadır.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {events.map((event) => {
              const typeInfo = EVENT_TYPES[event.eventType] || EVENT_TYPES.other
              const eventDate = new Date(event.date)

              return (
                <Card key={event.id} className="p-6 hover:shadow-lg transition border-l-4 border-l-chart-1">
                  <div className="flex items-start gap-6">
                    {/* Tarih Kutusu */}
                    <div className="text-center min-w-max py-3 px-4 bg-muted rounded-lg shrink-0">
                      <div className="text-xs text-muted-foreground font-mono uppercase">
                        {eventDate.toLocaleDateString('tr-TR', { month: 'short' })}
                      </div>
                      <div className="text-3xl font-bold leading-none my-1">
                        {eventDate.getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {event.endDate && (() => {
                        const ed = new Date(event.endDate)
                        const sameDay = ed.toDateString() === eventDate.toDateString()
                        return (
                          <div className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border">
                            {sameDay
                              ? `— ${ed.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
                              : `— ${ed.getDate()} ${ed.toLocaleDateString('tr-TR', { month: 'short' })}`
                            }
                          </div>
                        )
                      })()}
                    </div>

                    {/* İçerik */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-xl font-serif font-bold">{event.title}</h2>
                        <Badge className={`${typeInfo.color}`}>
                          {typeInfo.label}
                        </Badge>
                      </div>

                      <p className="text-foreground mb-4 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                        {event.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.organizer && (
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 shrink-0" />
                            <span>{event.organizer}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {event.tags && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {event.tags.split(',').map((t: string) => t.trim()).filter(Boolean).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* URL */}
                      {event.url && (
                        <div className="mt-3">
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Etkinlik Sayfası
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
