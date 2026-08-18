"use client"

/**
 * Client-side input sanitization using DOMPurify.
 * Strips all HTML tags and dangerous attributes before any processing.
 * Server-side: a parallel sanitization step should be added in the API route
 * using a server-safe library (e.g. isomorphic-dompurify or sanitize-html).
 */
export async function sanitizeInput(text: string): Promise<string> {
  if (typeof window === "undefined") {
    // SSR fallback: strip tags with a simple regex (DOMPurify needs DOM)
    return text.replace(/<[^>]*>/g, "").trim()
  }

  const DOMPurify = (await import("dompurify")).default
  // ALLOWED_TAGS: [] strips every tag; ALLOWED_ATTR: [] strips every attribute.
  // We only want plain text in a phonetic transcription tool.
  const clean = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
  return clean.trim()
}
