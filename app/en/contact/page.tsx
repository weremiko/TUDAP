import type { Metadata } from "next"
import { Mail } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Contact — TÜDAP",
  description: "Get in touch with TÜDAP. For bug reports, suggestions and academic collaboration requests.",
  alternates: {
    canonical: "https://dilbilim.org.tr/en/contact",
    languages: { "tr": "https://dilbilim.org.tr/iletisim" },
  },
}

const FAQ = [
  {
    q: "Is this platform free?",
    a: "Yes, TÜDAP is completely free and non-commercial.",
  },
  {
    q: "Is my data stored?",
    a: "No. The text you enter is only processed in your browser; no data is stored on our servers.",
  },
  {
    q: "How can I report a bug?",
    a: "You can use the 'Report Error' button on any tool page or send an email to the address below.",
  },
  {
    q: "Can I submit a linguistics event to the agenda?",
    a: "Yes. Send the event details to iletisim@dilbilim.org.tr and it will be added to the agenda by our team.",
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 flex-1">
        <div className="space-y-2 mb-10">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Platform</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Contact</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We are always open to your questions, suggestions and academic collaboration requests.
          </p>
        </div>

        <div className="space-y-10">
          {/* Email card */}
          <a
            href="mailto:iletisim@dilbilim.org.tr"
            className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">iletisim@dilbilim.org.tr</p>
            </div>
          </a>

          {/* FAQ */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-5">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {FAQ.map(({ q, a }) => (
                <div key={q} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground mb-1">{q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
