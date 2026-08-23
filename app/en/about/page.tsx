import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "About — Turkish Linguistics Research Platform | TÜDAP",
  description: "Learn about TÜDAP, a Turkish linguistics research platform for IPA transcription, terminology, academic writing and events.",
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
              TÜDAP (Türkçe Dilbilim Araştırma Platformu — Turkish Linguistics Research Platform) was created
              to make reliable digital resources for Turkish linguistics easier to access. What began as a
              Turkish IPA transcription tool has grown into a research-oriented platform connecting tools,
              terminology, academic writing and events in one place.
            </p>
            <p className="mt-3 italic text-right text-xs">— The TÜDAP Team</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">Features</h2>
            <ul className="space-y-2 list-none">
              {[
                "IPA phonetic transcription — broad and narrow options informed by Turkish phonology",
                "Linguistics terminology dictionary — Turkish examples, definitions and English equivalents",
                "Academic blog — research articles and platform updates",
                "Turkish Linguistics Agenda — seminars, conferences and workshops",
                "Public community profiles and contribution features",
                "Audio playback, local draft recovery and file download",
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
              The IPA transcription system is based on rules informed by the phonological properties of
              Turkish. Phenomena such as palatalization, word-final devoicing, vowel lengthening and
              consonant assimilation are processed automatically. The tool is actively developed and
              should be reviewed by an expert before academic publication or high-impact use.
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
