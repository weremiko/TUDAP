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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date))
}

export function HomeRoadmap({ events: upcomingEvents, content }: { events: HomeEvent[]; content: Record<string, string> }) {
  const eventsToShow = upcomingEvents.length > 0 ? upcomingEvents.slice(0, 5) : [
    { id: -1, title: content.events_empty_title, description: content.events_empty_description, eventType: "seminar", date: new Date("2026-11-12"), location: "", organizer: "TÜDAP", url: "/ajanda", tags: "", endDate: null, createdById: "", createdAt: new Date(), updatedAt: new Date() },
  ]

  return (
    <section className="container mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 sm:py-20">
      <div className="soft-section rounded-[1.7rem] p-5 sm:p-7">
        <div className="mb-7 flex items-end justify-between gap-6 border-b border-border pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">{content.roadmap_eyebrow}</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">{content.roadmap_title}</h2>
          </div>
          <a href="/ajanda" className="hidden text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:text-accent hover:decoration-accent sm:block">{content.roadmap_link_label}</a>
        </div>
        <div className="divide-y divide-border/80">
          {eventsToShow.map((event) => (
            <a key={event.id} href={event.url || "/ajanda"} className="grid gap-2 py-5 transition-colors hover:bg-muted/40 sm:grid-cols-[150px_minmax(0,1fr)_150px] sm:items-center sm:gap-6 sm:px-3">
              <time dateTime={new Date(event.date).toISOString()} className="text-sm tabular-nums text-muted-foreground">{formatDate(event.date)}</time>
              <span className="flex flex-col gap-1">
                <span className="font-serif text-lg font-semibold text-foreground">{event.title}</span>
                {event.description && <span className="text-sm leading-relaxed text-muted-foreground">{event.description}</span>}
              </span>
              <span className="text-sm text-muted-foreground sm:text-right">{EVENT_LABELS[event.eventType] || event.eventType}</span>
              {event.tags && <span className="text-xs text-muted-foreground sm:col-start-2">Son başvuru: {event.tags}</span>}
            </a>
          ))}
        </div>
      </div>
      <a href="/ajanda" className="mt-5 inline-block text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:text-accent hover:decoration-accent sm:hidden">{content.roadmap_link_label}</a>
      {/* Gerçek etkinlik verisi getEvents() ile ajanda sayfasındaki veritabanından geliyor. */}
    </section>
  )
}
