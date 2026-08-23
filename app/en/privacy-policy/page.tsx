import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "Privacy Policy — TÜDAP",
  description: "How TÜDAP collects, uses and protects account, usage and profile data.",
  alternates: { canonical: `${BASE}/en/privacy-policy`, languages: { tr: `${BASE}/gizlilik-politikasi` } },
}

const SECTIONS = [
  ["Information We Collect", "When you create an account, we store your name, email address and a securely hashed password through Better Auth. If you complete your profile, we may also store your profile image, institution, biography, website link and public profile slug."],
  ["Usage and Query Logs", "Transcription requests may be recorded in query logs for platform operation, quality control and usage analysis. These records can include the submitted text, IPA output, character count, transcription type, IP address and, when you are signed in, your user ID."],
  ["Error Reports and Suggestions", "When you submit an error report or terminology suggestion, we store the message and relevant fields such as the reported word, page URL and email address when provided. These records are reviewed by authorized administrators to improve the platform."],
  ["Authentication and Sessions", "Authentication is handled by Better Auth. Passwords are not stored in plain text. Session records include a session token, user ID, expiry information and may include IP address and user-agent data. Sessions expire after seven days unless renewed."],
  ["Cookies and Local Storage", "The platform uses essential cookies for authentication. Some browser features, such as restoring a transcription draft or display preferences, may use localStorage on your device."],
  ["Third-Party Services", "The platform is hosted on Vercel, uses Neon/PostgreSQL for application data and may use Vercel Analytics for aggregate visitor statistics. Google AdSense may use cookies and similar technologies according to Google's policies."],
  ["Security and Retention", "We use HTTPS, server-side authorization checks, input limits, security headers and rate limits appropriate to the application. No online service can guarantee absolute security. Data is retained only as long as needed for operation, security, support or legal obligations."],
  ["Children's Privacy", "TÜDAP does not knowingly collect personal information from children under 13. Parents and guardians should supervise children's internet use."],
  ["Contact", "For privacy questions or data requests, contact eren@dilbilim.org.tr or iletisim@dilbilim.org.tr."],
] as const

export default function PrivacyPolicyPage() {
  return <div className="min-h-screen bg-background flex flex-col"><SiteHeader /><main className="container mx-auto max-w-3xl px-4 py-14 flex-1"><div className="mb-10 space-y-2"><p className="text-xs uppercase tracking-widest text-accent font-medium">Legal</p><h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Privacy Policy</h1><p className="text-sm text-muted-foreground">Last updated: August 2026</p></div><div className="space-y-8">{SECTIONS.map(([title, body]) => <section key={title}><h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2><p className="text-sm leading-relaxed text-muted-foreground">{body}</p></section>)}</div></main><SiteFooter /></div>
}
