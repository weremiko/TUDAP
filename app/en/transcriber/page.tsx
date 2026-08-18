import type { Metadata } from "next"
import { TranscriberPage } from "@/components/transcriber-page"

export const metadata: Metadata = {
  title: "Phonetic Transcription Tool — TÜDAP",
  description:
    "Convert Turkish text into IPA (International Phonetic Alphabet) notation. Academic broad transcription based on Turkish phonological properties. Free online tool.",
  keywords: [
    "Turkish IPA", "Turkish phonetic transcription", "IPA converter", "Turkish phonology",
    "fonetik transkripsiyon", "TÜDAP transcriber",
  ],
  alternates: {
    canonical: "https://dilbilim.org.tr/en/transcriber",
    languages: { "tr": "https://dilbilim.org.tr/cevirici" },
  },
}

export default function EnTranscriberPage() {
  return <TranscriberPage lang="en" />
}
