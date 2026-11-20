import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "Cookie Policy — TÜDAP",
  description: "How TÜDAP uses session cookies, local storage and optional advertising technologies.",
  alternates: { canonical: `${BASE}/en/cookie-policy`, languages: { tr: `${BASE}/cerez-politikasi` } },
}

const SECTIONS = [
  ["Essential session cookies", "Better Auth uses session cookies to keep you signed in and protect your account. These are required for the account features you request."],
  ["Local storage", "The platform may store a transcription draft and preferences, dismissed-announcement state, and your cookie choice in localStorage on your device. These entries are not automatically sent to our servers; text you submit to the transcription tool may separately be processed and logged as described in the Privacy Policy."],
  ["Optional advertising", "The Google AdSense script is loaded only after you choose Allow optional in the consent banner. Choosing Reject prevents the script from loading. Google may use cookies or similar technologies when its advertising service is enabled."],
  ["Changing your choice", "Use Cookie settings in the site footer to change your advertising choice. You can also clear local site data and third-party cookies in your browser settings. Removing a script does not automatically delete cookies that a third party has already placed."],
  ["Analytics", "Vercel Analytics is not currently active on this application."],
  ["Contact", "For questions about this policy, contact iletisim@dilbilim.org.tr."],
] as const

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-14 flex-1 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-2">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Legal</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: November 2026</p>
        </div>
        <div className="space-y-8">
          {SECTIONS.map(([title, body]) => (
            <section key={title}>
              <h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {title === "Optional advertising" ? (
                  <>
                    {body}{" "}Read{" "}
                    <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's explanation of data use on partner sites</a>{" "}
                    for details.
                  </>
                ) : body}
              </p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}