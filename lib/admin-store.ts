// ──────────────────────────────────────────────
// Tip tanımları
// ──────────────────────────────────────────────

export interface GlossaryEntry {
  id: string
  term: string
  phonetic: string
  category: string
  definition: string
  englishEquivalent: string
  createdAt: string
}

export interface QueryLog {
  id: string
  inputText: string
  ipaOutput: string
  transcriptionType: "broad" | "narrow"
  timestamp: string
  charCount: number
}

// ──────────────────────────────────────────────
// Rate limiter – token bucket (client-side mock)
// ──────────────────────────────────────────────

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000

interface RateLimitState {
  count: number
  windowStart: number
}

let rateLimitState: RateLimitState = {
  count: 0,
  windowStart: Date.now(),
}

export function checkRateLimit(): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  if (now - rateLimitState.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitState = { count: 0, windowStart: now }
  }
  if (rateLimitState.count >= RATE_LIMIT_MAX) {
    const resetIn = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - rateLimitState.windowStart)) / 1000)
    return { allowed: false, remaining: 0, resetIn }
  }
  rateLimitState.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - rateLimitState.count, resetIn: 0 }
}

// ──────────────────────────────────────────────
// IPA Obfuscation – Zero-width karakter enjeksiyonu
// ──────────────────────────────────────────────

const ZWNJ = "\u200C" // Zero-Width Non-Joiner
const ZWJ  = "\u200D" // Zero-Width Joiner
const ZWS  = "\u200B" // Zero-Width Space

export function obfuscateIPA(text: string): string {
  // Her karakterin arasına rastgele görünmez karakterler ekle
  return text
    .split("")
    .map((char, i) => {
      const invisible = [ZWNJ, ZWJ, ZWS][i % 3]
      return char + invisible
    })
    .join("")
}

// ──────────────────────────────────────────────
// Mock Sözlük Veri Deposu (in-memory, singleton)
// ──────────────────────────────────────────────

const MOCK_CATEGORIES = [
  "Sesbilim",
  "Sesbilgisi",
  "Biçimbilim",
  "Sözdizimi",
  "Anlambilim",
  "Edimbilim",
  "Söylem Çözümlemesi",
  "Tarihsel Dilbilim",
  "Toplumdilbilim",
  "Ruhdilbilim",
  "Metindilbilim",
  "Göstergebilim",
  "Çeviribilim",
  "Sözlükbilim",
  "Uygulamalı Dilbilim",
  "Dil Edinimi",
  "Genel Dilbilim",
]

export const CATEGORIES = MOCK_CATEGORIES

// Başlangıç verileri – glossary-data.ts'den alınan ilk 20 terim
const initialEntries: GlossaryEntry[] = [
  { id: "1", term: "fonem", phonetic: "/fo.nem/", category: "Sesbilim", definition: "Bir dilde anlam ayırt edici en küçük ses birimi.", englishEquivalent: "phoneme", createdAt: "2024-01-15" },
  { id: "2", term: "morfem", phonetic: "/moɾ.fem/", category: "Biçimbilim", definition: "Anlam taşıyan en küçük dil birimi.", englishEquivalent: "morpheme", createdAt: "2024-01-15" },
  { id: "3", term: "sözdizimi", phonetic: "/søz.d̪i.zi.mi/", category: "Sözdizimi", definition: "Tümcelerin yapısını ve tümce öğeleri arasındaki ilişkileri inceleyen dilbilim dalı.", englishEquivalent: "syntax", createdAt: "2024-01-16" },
  { id: "4", term: "anlambilim", phonetic: "/än.läm.bi.lim/", category: "Anlambilim", definition: "Dil göstergelerinin anlamını inceleyen dilbilim dalı.", englishEquivalent: "semantics", createdAt: "2024-01-16" },
  { id: "5", term: "edimbilim", phonetic: "/e.d̪im.bi.lim/", category: "Edimbilim", definition: "Dil kullanımını, söylem bağlamını ve konuşucu niyetini inceleyen dilbilim dalı.", englishEquivalent: "pragmatics", createdAt: "2024-01-17" },
  { id: "6", term: "alofon", phonetic: "/ä.lo.fon/", category: "Sesbilim", definition: "Bir fonemin bağlama göre değişen fiziksel seslenimleri.", englishEquivalent: "allophone", createdAt: "2024-01-17" },
  { id: "7", term: "biçimbirim", phonetic: "/bi.tʃim.bi.ɾim/", category: "Biçimbilim", definition: "Bkz. morfem.", englishEquivalent: "morpheme", createdAt: "2024-01-18" },
  { id: "8", term: "ünlü uyumu", phonetic: "/yn.ly y.ju.mu/", category: "Sesbilim", definition: "Türkçede sözcük içindeki ünlülerin belirli uyum kurallarına göre sıralanması.", englishEquivalent: "vowel harmony", createdAt: "2024-01-18" },
  { id: "9", term: "toplumdilbilim", phonetic: "/t̪op.lum.d̪il.bi.lim/", category: "Toplumdilbilim", definition: "Dil ile toplum arasındaki ilişkileri inceleyen dilbilim dalı.", englishEquivalent: "sociolinguistics", createdAt: "2024-01-19" },
  { id: "10", term: "edimyeti", phonetic: "/e.d̪im.je.t̪i/", category: "Edimbilim", definition: "Konuşucunun dil bilgisinin yanı sıra dili sosyal bağlamda doğru kullanabilme yetisi.", englishEquivalent: "communicative competence", createdAt: "2024-01-19" },
]

// Global mutable store
let glossaryStore: GlossaryEntry[] = [...initialEntries]
let queryLogStore: QueryLog[] = []
let nextId = initialEntries.length + 1

// ── CRUD operasyonları ──

export function getGlossaryEntries(): GlossaryEntry[] {
  return [...glossaryStore]
}

export function addGlossaryEntry(data: Omit<GlossaryEntry, "id" | "createdAt">): GlossaryEntry {
  const entry: GlossaryEntry = {
    ...data,
    id: String(nextId++),
    createdAt: new Date().toISOString().split("T")[0],
  }
  glossaryStore = [entry, ...glossaryStore]
  return entry
}

export function updateGlossaryEntry(id: string, data: Partial<Omit<GlossaryEntry, "id" | "createdAt">>): GlossaryEntry | null {
  const idx = glossaryStore.findIndex((e) => e.id === id)
  if (idx === -1) return null
  glossaryStore[idx] = { ...glossaryStore[idx], ...data }
  return glossaryStore[idx]
}

export function deleteGlossaryEntry(id: string): boolean {
  const before = glossaryStore.length
  glossaryStore = glossaryStore.filter((e) => e.id !== id)
  return glossaryStore.length < before
}

// ── Sorgu Log operasyonları ──

export function addQueryLog(data: Omit<QueryLog, "id" | "timestamp">): QueryLog {
  const log: QueryLog = {
    ...data,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  }
  queryLogStore = [log, ...queryLogStore]
  return log
}

export function getQueryLogs(): QueryLog[] {
  return [...queryLogStore]
}

export function clearQueryLogs(): void {
  queryLogStore = []
}
