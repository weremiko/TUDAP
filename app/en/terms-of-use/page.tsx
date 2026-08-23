import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "Terms of Use — TÜDAP",
  description: "Terms governing the use of TÜDAP's Turkish linguistics research tools and community features.",
  alternates: { canonical: `${BASE}/en/terms-of-use`, languages: { tr: `${BASE}/kullanim-kosullari` } },
}

const SECTIONS = [
  ["Acceptance", "By using TÜDAP, you agree to these Terms of Use. If you do not agree with them, please do not use the platform."],
  ["Purpose and Acceptable Use", "TÜDAP provides academic and educational tools for Turkish linguistics research. You must not abuse the service, create excessive load, attempt unauthorized access, bypass security controls, submit unlawful content or use the platform for harmful activities."],
  ["Accuracy and Academic Responsibility", "The platform is actively developed and does not guarantee 100% accuracy. Transcription and analysis results are provided as research aids. Review results with a qualified expert before relying on them in academic, professional or high-impact work."],
  ["Accounts and User Content", "You are responsible for keeping your account credentials secure and for the content you submit. You must provide accurate information and must not use another person's identity. You retain rights in your submissions, while granting TÜDAP the limited permission needed to operate, review and improve the service."],
  ["Community Features", "Profiles are public by design. Following, blog submissions, terminology suggestions and error reports must be used respectfully. We may remove content or restrict accounts that violate these terms or threaten the security of the platform."],
  ["Intellectual Property", "TÜDAP's software, design, branding and original materials belong to TÜDAP or their respective owners. You may use the platform's public tools for lawful academic and personal purposes. Do not copy, reverse engineer or redistribute protected platform materials without permission."],
  ["Service Changes", "TÜDAP may update, suspend or discontinue features when necessary for maintenance, security, legal compliance or development. We will make reasonable efforts to preserve the availability of the service but do not guarantee uninterrupted operation."],
  ["Disclaimer and Liability", "The service is provided on an as-is and as-available basis. To the extent permitted by law, TÜDAP is not responsible for decisions made solely from automated results, service interruptions or indirect losses arising from use of the platform."],
  ["Governing Law and Contact", "These terms are governed by the laws of the Republic of Türkiye. Questions about these terms may be sent to iletisim@dilbilim.org.tr."],
] as const

export default function TermsOfUsePage() {
  return <div className="min-h-screen bg-background flex flex-col"><SiteHeader /><main className="container mx-auto max-w-3xl px-4 py-14 flex-1"><div className="mb-10 space-y-2"><p className="text-xs uppercase tracking-widest text-accent font-medium">Legal</p><h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Terms of Use</h1><p className="text-sm text-muted-foreground">Last updated: August 2026</p></div><div className="space-y-8">{SECTIONS.map(([title, body]) => <section key={title}><h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2><p className="text-sm leading-relaxed text-muted-foreground">{body}</p></section>)}</div></main><SiteFooter /></div>
}
