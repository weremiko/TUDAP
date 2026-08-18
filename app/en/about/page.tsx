import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "About — TÜDAP",
  description: "About TÜDAP — Turkish Linguistics Platform. Learn about the project's purpose, features and academic foundation.",
  alternates: {
    canonical: "https://dilbilim.org.tr/en/about",
    languages: { "tr": "https://dilbilim.org.tr/hakkinda" },
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 flex-1">
        <div className="space-y-2 mb-10">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Platform</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">About</h1>
        </div>

        <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">About the Project</h2>
            <p>
              TÜDAP (Türkçe Dilbilim Platformu — Turkish Linguistics Platform) was developed to address
              the lack of digital resources in the field of linguistics. The project started from the idea
              of a Turkish IPA converter and has since grown into a comprehensive platform covering phonetic
              transcription, terminology dictionary and an academic events agenda.
            </p>
            <p className="mt-3 italic text-right text-xs">— The TÜDAP Team</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">Features</h2>
            <ul className="space-y-2 list-none">
              {[
                "IPA phonetic transcription — broad transcription based on Turkish phonology",
                "700+ linguistics terminology dictionary — with Turkish examples and academic definitions",
                "Academic blog — research articles and platform updates",
                "Turkish Linguistics Agenda — seminars, conferences and workshops",
                "Audio playback and file download",
                "Completely free, no usage limit for registered users",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">–</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">Use Cases</h2>
            <ul className="space-y-2 list-none">
              {[
                "Linguistics research and academic studies",
                "Turkish language teaching and pronunciation training",
                "Speech therapy and voice training",
                "Teaching Turkish as a foreign language",
                "Dictionary preparation and pronunciation analysis",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">–</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">Academic Foundation</h2>
            <p>
              The IPA transcription system is based on academic rules grounded in the phonological properties
              of Turkish. Phonetic phenomena such as palatalization, word-final devoicing, vowel lengthening
              and consonant assimilation are processed automatically.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">Contact</h2>
            <p>
              For suggestions, bug reports and collaboration requests, you can write to{" "}
              <a href="mailto:iletisim@dilbilim.org.tr" className="text-primary hover:underline">
                iletisim@dilbilim.org.tr
              </a>.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
