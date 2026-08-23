"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X, Megaphone, ExternalLink } from "lucide-react"

type Announcement = {
  id: number
  title: string
  content: string
  linkLabel: string | null
  linkUrl: string | null
}

export function AnnouncementPopup({ announcement }: { announcement: Announcement | null }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!announcement) return
    const dismissed = window.localStorage.getItem(`tudap-announcement-${announcement.id}`)
    if (!dismissed) setVisible(true)
  }, [announcement])

  if (!announcement || !visible) return null

  const dismiss = () => {
    window.localStorage.setItem(`tudap-announcement-${announcement.id}`, "dismissed")
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/20 p-4 backdrop-blur-[2px] sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="announcement-title" className="relative w-full max-w-lg overflow-hidden rounded-xl border border-accent/30 bg-background shadow-2xl">
        <div className="h-1 bg-accent" />
        <button type="button" onClick={dismiss} aria-label="Duyuruyu kapat" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent"><Megaphone className="h-4 w-4" /> Duyuru</div>
          <h2 id="announcement-title" className="mt-4 pr-8 text-2xl font-serif font-bold text-foreground">{announcement.title}</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">{announcement.content}</p>
          {announcement.linkUrl && announcement.linkLabel && <Link href={announcement.linkUrl} target="_blank" rel="noopener noreferrer" onClick={dismiss} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">{announcement.linkLabel}<ExternalLink className="h-3.5 w-3.5" /></Link>}
        </div>
      </div>
    </div>
  )
}
