import type { Metadata } from "next"
import { Mail, Linkedin, ExternalLink, Award, BookOpen, Briefcase } from "lucide-react"

export const metadata: Metadata = {
  title: "Eren Gültekin",
  description: "Founder, linguist, and software developer based in Türkiye.",
  robots: { index: false, follow: false },
}

const EXPERIENCE = [
  {
    org: "Way Labs",
    role: "Founder",
    period: "Jan 2024 — Present",
    desc: "Microsoft DENEME21212121 Founders Hub-backed technology start-up. Developing software solutions with a focus on artificial intelligence and natural language processing.",
  },
  {
    org: "FIRST Robotics — İdigna #9502",
    role: "Team Mentor & Public Relations Lead",
    period: "Sep 2024 — Present",
    desc: "Serving as mentor and public relations lead for an FRC robotics team, coordinating outreach efforts and guiding student members through technical challenges.",
  },
  {
    org: "Republican People's Party — Halkçı Liseliler",
    role: "Deputy President",
    period: "Mar 2023 — Mar 2026",
    desc: "Elected as Deputy President of the Central Executive Committee of CHP's secondary school branch, following prior service as Yenişehir District Chair.",
  },
  {
    org: "Türkiye Teknoloji Takımı Foundation (T3)",
    role: "Educational Support Scholar",
    period: "Jan 2023 — Dec 2023",
    desc: "Recipient of a merit-based scholarship awarded to students demonstrating outstanding engagement in national technology initiatives.",
  },
  {
    org: "Almas Financial Consulting",
    role: "Accounting Assistant",
    period: "May 2022 — Dec 2022",
    desc: "Provided accounting and financial advisory support at a Diyarbakır-based consultancy firm.",
  },
]

const EDUCATION = [
  {
    school: "Istanbul University",
    dept: "Management Information Systems — B.Sc.",
    period: "2025 — 2029",
  },
  {
    school: "Necmettin Erbakan University",
    dept: "Linguistics — B.A.",
    period: "2025 — 2029",
  },
]

const AWARDS = [
  "TEKNOFEST Smart Transportation — Semi-Finalist",
  "16th International MOE Robot Competition — Finalist",
  "Diyarbakır Cultural Heritage Hackathon — 2nd Place",
  "FRC Halic Regional Competition",
  "EU Code Week Turkey National Hackathon — 3rd Place",
]

const SKILLS = ["JavaScript", "PHP", "Python", "Artificial Intelligence", "Natural Language Processing"]
const LANGS = ["Turkish (Native)", "English (Professional)"]

const CERTS = [
  "XR Academy Project",
  "Community Relations — Local Government Workshop",
  "A2 English Certificate",
  "Diyarbakır Cultural Heritage Hackathon",
  "Python Programming",
]

export default function ErenPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-sans">

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <p className="text-sm tracking-widest uppercase text-[#c1440e] mb-4 font-medium">Portfolio</p>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 text-balance leading-tight">
          Eren Gültekin
        </h1>
        <p className="text-xl text-zinc-300 leading-relaxed max-w-xl">
          Founder of Way Labs. Dual undergraduate student in Linguistics and Management Information Systems.
          Active in software development, artificial intelligence, and public affairs.
        </p>
        <p className="mt-4 text-zinc-400 leading-relaxed max-w-xl">
          Based in Diyarbakır, Türkiye. Supported by Microsoft Founders Hub through Way Labs,
          with a published research contribution on NLP applications in medical technology.
        </p>

        <div className="flex flex-wrap items-center gap-6 mt-8">
          <a
            href="mailto:eren@dilbilim.org.tr"
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors group"
          >
            <Mail className="h-4 w-4 text-zinc-500 group-hover:text-[#c1440e] transition-colors" />
            eren@dilbilim.org.tr
          </a>
          <a
            href="https://www.linkedin.com/in/eren-gultekin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors group"
          >
            <Linkedin className="h-4 w-4 text-zinc-500 group-hover:text-[#c1440e] transition-colors" />
            LinkedIn
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 border-t border-zinc-800" />

      {/* Experience */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-10">
          <Briefcase className="h-4 w-4 text-[#c1440e]" />
          <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400">Experience</h2>
        </div>

        <div className="space-y-10">
          {EXPERIENCE.map((e) => (
            <div key={e.org} className="grid grid-cols-[160px_1fr] gap-6 md:gap-10">
              <p className="text-xs text-zinc-500 pt-1 leading-relaxed">{e.period}</p>
              <div>
                <p className="font-medium text-white">{e.role}</p>
                <p className="text-sm text-[#c1440e] mb-2">{e.org}</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 border-t border-zinc-800" />

      {/* Education */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-10">
          <BookOpen className="h-4 w-4 text-[#c1440e]" />
          <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400">Education</h2>
        </div>

        <div className="space-y-6">
          {EDUCATION.map((e) => (
            <div key={e.school} className="grid grid-cols-[160px_1fr] gap-6 md:gap-10">
              <p className="text-xs text-zinc-500 pt-1">{e.period}</p>
              <div>
                <p className="font-medium text-white">{e.school}</p>
                <p className="text-sm text-zinc-400">{e.dept}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 border-t border-zinc-800" />

      {/* Awards + Skills */}
      <section className="max-w-3xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">

        <div>
          <div className="flex items-center gap-3 mb-8">
            <Award className="h-4 w-4 text-[#c1440e]" />
            <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400">Distinctions</h2>
          </div>
          <ul className="space-y-3">
            {AWARDS.map((a) => (
              <li key={a} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="mt-2 h-1 w-1 rounded-full bg-[#c1440e] shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-10">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-5">Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full text-xs border border-zinc-700 text-zinc-300">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-5">Languages</h3>
            <ul className="space-y-2">
              {LANGS.map((l) => (
                <li key={l} className="text-sm text-zinc-300">{l}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-5">Certifications</h3>
            <ul className="space-y-2">
              {CERTS.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="mt-2 h-1 w-1 rounded-full bg-zinc-600 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 border-t border-zinc-800" />

      {/* Publication */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-8">Publication</h2>
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <p className="text-white font-medium leading-snug">
            The Linguistic Dimension of Digital Transformation in Medicine: NLP Applications in Artificial Intelligence and Robotic Systems
          </p>
          <p className="mt-2 text-sm text-[#c1440e]">Eren Gültekin</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 border-t border-zinc-800" />

      {/* Contact */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-2xl font-serif text-white mb-3 text-balance leading-snug">
          Open to collaboration, research inquiries, and opportunities.
        </p>
        <p className="text-sm text-zinc-400 mb-8">
          For professional correspondence, please reach out via email.
        </p>
        <a
          href="mailto:eren@dilbilim.org.tr"
          className="inline-flex items-center gap-2 text-sm font-medium text-white border border-zinc-700 hover:border-[#c1440e] hover:text-[#c1440e] rounded-lg px-5 py-2.5 transition-colors"
        >
          <Mail className="h-4 w-4" />
          eren@dilbilim.org.tr
        </a>
      </section>

      <footer className="max-w-3xl mx-auto px-6 pb-12">
        <p className="text-xs text-zinc-600">© 2026 Eren Gültekin</p>
      </footer>

    </div>
  )
}
