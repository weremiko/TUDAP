"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const OPEN_COOKIE_SETTINGS_EVENT = "tudap:open-cookie-settings"

const CONSENT_KEY = "tudap-cookie-consent-v1"
const ADS_SCRIPT_ID = "tudap-adsense-script"
type ConsentChoice = "accepted" | "rejected"

function setAdScriptEnabled(enabled: boolean) {
  const existingScript = document.getElementById(ADS_SCRIPT_ID)
  if (!enabled) {
    existingScript?.remove()
    return
  }
  if (existingScript) return

  const script = document.createElement("script")
  script.id = ADS_SCRIPT_ID
  script.async = true
  script.crossOrigin = "anonymous"
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1996929774645844"
  document.head.appendChild(script)
}

function readChoice(): ConsentChoice | null {
  try {
    const saved = window.localStorage.getItem(CONSENT_KEY)
    if (!saved) return null
    const parsed = JSON.parse(saved) as { version?: number; choice?: ConsentChoice }
    return parsed.version === 1 && (parsed.choice === "accepted" || parsed.choice === "rejected")
      ? parsed.choice
      : null
  } catch {
    return null
  }
}

export function CookieConsent() {
  const pathname = usePathname()
  const isEnglish = pathname.startsWith("/en")
  const [choice, setChoice] = useState<ConsentChoice | null>(null)
  const [ready, setReady] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const savedChoice = readChoice()
    setChoice(savedChoice)
    setAdScriptEnabled(savedChoice === "accepted")
    setReady(true)

    const openSettings = () => setSettingsOpen(true)
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings)
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings)
  }, [])

  const saveChoice = (nextChoice: ConsentChoice) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify({
        version: 1,
        choice: nextChoice,
        updatedAt: new Date().toISOString(),
      }))
    } catch {
      return
    }
    setChoice(nextChoice)
    setSettingsOpen(false)
    setAdScriptEnabled(nextChoice === "accepted")
  }

  if (!ready || (choice && !settingsOpen)) return null

  return (
    <aside
      aria-label={isEnglish ? "Cookie preferences" : "Çerez tercihleri"}
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-border bg-background/98 shadow-[0_-16px_48px_-28px_rgba(0,0,0,0.35)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-sm font-semibold text-foreground">
            {isEnglish ? "Your privacy choices" : "Çerez tercihleri"}
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground sm:text-sm">
            {isEnglish
              ? "Essential session cookies and requested local features keep the platform working. Optional Google advertising loads only if you allow it. You can change this choice later."
              : "Oturum için gerekli çerezler ve isteğinizle çalışan yerel özellikler platformun çalışmasını sağlar. İsteğe bağlı Google reklam hizmeti yalnızca izin verirseniz yüklenir. Tercihinizi daha sonra değiştirebilirsiniz."}{" "}
            <Link href={isEnglish ? "/en/privacy-policy" : "/cerez-politikasi"} className="font-medium text-foreground underline underline-offset-2">
              {isEnglish ? "Details" : "Ayrıntılar"}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => saveChoice("rejected")}
            className="min-h-10 border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {isEnglish ? "Reject optional" : "Reddet"}
          </button>
          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="min-h-10 bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isEnglish ? "Allow optional" : "Kabul et"}
          </button>
        </div>
      </div>
    </aside>
  )
}