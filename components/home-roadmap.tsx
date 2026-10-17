import type { InferSelectModel } from "drizzle-orm"
import { events } from "@/lib/db/schema"

type HomeEvent = InferSelectModel<typeof events>

const EVENT_LABELS: Record<string, string> = {
  seminar: "Seminer",
  conference: "Konferans",
  call: "Bildiri çağrısı",
  workshop: "Çalıştay",
  webinar: "Webinar",
  lecture: "Konuşma / ders",
}

const FALLBACK_EVENTS: HomeEvent[] = [
  { id: -1, title: "Yaklaşan dilbilim etkinlikleri", description: "Ajandadaki güncel seminer, konferans ve çağrılar burada listelenecek.", eventType: "seminar", date: new Date("2026-11-12"), location: "", organizer: "TÜDAP", url: "/ajanda", tags: "", endDate: null, createdById: "", createdAt: new Date(), updatedAt: new Date() },
]

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date))
}

export function HomeRoadmap({ events: upcomingEvents }: { events: HomeEvent[] }) {
  const eventsToShow = upcomingEvents.length > 0 ? upcomingEvents.slice(0, 5) : FALLBACK_EVENTS

  return (
    <section className="container mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 sm:py-20">
      <div className="mb-7 flex items-end justify-between gap-6 border-b border-border pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Ajanda</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">Yaklaşan etkinlikler</h2>
        </div>
        <a href="/ajanda" className="hidden text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:text-accent hover:decoration-accent sm:block">Tüm ajanda</a>
      </div>
      <div className="divide-y divide-border border-b border-border">
        {eventsToShow.map((event) => (
          <a key={event.id} href={event.url || "/ajanda"} className="grid gap-2 py-5 transition-colors hover:bg-muted/40 sm:grid-cols-[150px_minmax(0,1fr)_150px] sm:items-center sm:gap-6 sm:px-3">
            <time dateTime={new Date(event.date).toISOString()} className="text-sm tabular-nums text-muted-foreground">{formatDate(event.date)}</time>
            <span className="font-serif text-lg font-semibold text-foreground">{event.title}</span>
            <span className="text-sm text-muted-foreground sm:text-right">{EVENT_LABELS[event.eventType] || event.eventType}</span>
            {event.tags && <span className="text-xs text-muted-foreground sm:col-start-2">Son başvuru: {event.tags}</span>}
          </a>
        ))}
      </div>
      <a href="/ajanda" className="mt-5 inline-block text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:text-accent hover:decoration-accent sm:hidden">Tüm ajanda</a>
      {/* Gerçek etkinlik verisi getEvents() ile ajanda sayfasındaki veritabanından geliyor. */}
    </section>
  )
}
