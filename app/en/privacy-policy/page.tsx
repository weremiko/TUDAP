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
  ["KEYNOTE’26 Event Registration", "For KEYNOTE’26, we process your name, email, institution, department and attendee type to register you, issue a digital ticket and validate event entry. We also store when you accepted the event privacy notice and its version. QR codes are generated in your browser, and the public verification page does not display attendee names, institutions or departments. Registration confirmation emails are not sent. The event organizer must confirm the data controller details and retention period before publication."],
  ["Content Submissions and Media", "We store the title, description, text and account details associated with member content submissions so they can be reviewed. Video, podcast and PDF files are stored in private Vercel Blob storage. Media is available only for published content or to the submitting member and authorized moderators; delivery uses short-lived signed access URLs."],
  ["Authentication and Sessions", "Authentication is handled by Better Auth. Passwords are not stored in plain text. Session records include a session token, user ID, expiry information and may include IP address and user-agent data. Sessions expire after seven days unless renewed."],
  ["Cookies and Local Storage", "Better Auth uses essential session cookies for sign-in and security. A transcription draft and preferences, dismissed-announcement state, and your cookie choice may be stored in localStorage on your device. Google AdSense is loaded only after you explicitly allow optional advertising in the consent banner; you can change that choice using Cookie settings in the footer."],
  ["Third-Party Services", "The platform is hosted on Vercel, uses Neon/PostgreSQL for application data and Vercel Blob for uploaded media. Vercel Analytics is not active on this application. Google AdSense is loaded only for visitors who allow optional advertising and may process data under Google's own privacy disclosures."],
  ["Security and Retention", "We use HTTPS, server-side authorization checks, input limits, security headers and rate limits appropriate to the application. Application records are access-controlled, and media access is checked against publication status or the requesting user's role. No online service can guarantee absolute security. Data is retained only as long as needed for operation, security, support or legal obligations."],
  ["Children's Privacy", "TÜDAP does not knowingly collect personal information from children under 13. Parents and guardians should supervise children's internet use."],
  ["Contact", "For privacy questions or data requests, contact eren@dilbilim.org.tr or iletisim@dilbilim.org.tr."],
] as const

export default function PrivacyPolicyPage() {
  return <div className="min-h-screen bg-background flex flex-col"><SiteHeader /><main className="container mx-auto max-w-3xl px-4 py-14 flex-1"><div className="mb-10 space-y-2"><p className="text-xs uppercase tracking-widest text-accent font-medium">Legal</p><h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Privacy Policy</h1><p className="text-sm text-muted-foreground">Last updated: November 2026</p></div><div className="space-y-8">{SECTIONS.map(([title, body]) => <section key={title}><h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2><p className="text-sm leading-relaxed text-muted-foreground">{body}</p></section>)}</div></main><SiteFooter /></div>
}
