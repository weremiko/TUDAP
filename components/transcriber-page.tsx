"use client"

import { useState, useEffect, useRef } from "react"
import {
  Moon, Sun, Volume2, Copy, BookOpen, ChevronUp,
  Download, RotateCcw, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { turkishToIPA } from "@/lib/turkish-to-ipa"
import { sanitizeInput } from "@/lib/sanitize"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { saveQueryLog, checkQueryLimit } from "@/app/actions/logs"
import { saveErrorReport } from "@/app/actions/errors"
import { getCustomTranscriptions } from "@/app/actions/transcriptions"
import { useSession } from "@/lib/auth-client"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const MAX_WORDS = 3

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length
}

// ── Reference tables ───────────────────────────────────────────────────────────
const VOWELS: [string, string, string][] = [
  ["a", "α / αː / a", "Artdamaksıl Türkçe / ğ yanında / yabancı ödünç"],
  ["e", "ɛ / e", "Açık (tek/son hece) / kapalı (ilk hece)"],
  ["ı", "ϊ", "Ortadil düz dar (değişkesiz)"],
  ["i", "ɪ / i", "Kısa açık / uzun kapalı"],
  ["o", "ɔ / o", "Kısa açık / alıntı-uzun kapalı"],
  ["ö", "œ / ø", "Açık / kapalı (uzun/ğ sonrası)"],
  ["u", "U / ʊ:", "Kısa açık / alıntı-uzun"],
  ["ü", "Y / y", "Açık / kapalı (ğ sonrası)"],
]

const CONSONANTS: [string, string, string][] = [
  ["c", "dʒ / tʃ", "Ötümlü / sonseste ötümsüz"],
  ["ç", "tʃ", "Ötümsüz postalveolar afrikat"],
  ["ğ", "ː", "Ünlü uzatması (yapı harfi, ses değeri yok)"],
  ["h (ön ünlü)", "h", "Gırtlak sürtünücü — ön ünlü (e,i,ö,ü) yanında veya sözcük başında"],
  ["h (art ünlü)", "x", "Art damak sürtünücü — art ünlü (a,ı,o,u) yanında"],
  ["j", "ʒ", "Ötümlü postalveolar frikatif"],
  ["r", "r / ɼ / ɣ", "Baş (çok vuruşlu) / iç (tek vuruşlu) / son"],
  ["ş", "ʃ", "Ötümsüz postalveolar frikatif"],
  ["y", "j / ∙I / :", "Önses / hece-sonu / i sonrası uzatma"],
  ["p", "pʰ / p", "Önseste üflemeli / sonseste veya sonses"],
  ["t", "tʰ / t", "Önseste üflemeli / sonseste veya sonses"],
  ["k (ön)", "cʰ / c", "Damaksıl k, önseste üflemeli / sonses"],
  ["k (arka)", "kʰ / k", "Art damaksıl k, önseste üflemeli / sonses"],
  ["l (ince)", "l", "Öndil ünlüleri yanında"],
  ["l (kalın)", "ɫ", "Artdil ünlüleri yanında"],
  ["n (k/g önü)", "ŋ", "Art damak öncesi"],
  ["n (f/v önü)", "ɱ", "Diş-dudak öncesi"],
  ["v (düz)", "v", "Düz ünlüler (a,e,ı,i) yanında"],
  ["v (yuvarlak)", "β", "Yuvarlak ünlüler (o,ö,u,ü) yanında"],
  ["v (arası)", "ʋ", "Yuvarlak-düz ünlü arasında (içses)"],
]

const LOADING_STEPS_TR = [
  "Veri temizleniyor…",
  "Algoritma çalışıyor…",
  "Sonuçlar derleniyor…",
]

const LOADING_STEPS_EN = [
  "Cleaning data…",
  "Running algorithm…",
  "Compiling results…",
]

const UI = {
  tr: {
    loadingSteps: LOADING_STEPS_TR,
    betaBanner: { bold: "Akademik Açık Erişim Sürümü:", text: "Bu araç aktif geliştirme aşamasındadır ve %100 doğruluk garanti etmez. Akademik çalışmalar için sonuçları uzman denetiminden geçirerek kullanınız." },
    limitLabel: "Günlük sorgu sınırı:",
    limitSub: (r: number) => `Oturum açın veya kayıt olun — sınırsız kullanım için.`,
    limitSignIn: "Oturum açın",
    limitSignUp: "kayıt olun",
    toolLabel: "Sesbilim Aracı",
    title: "Sesbilimsel Abece Çeviricisi",
    desc: "Türkçe metinleri Uluslararası Fonetik Alfabe formatına dönüştürün. Türkiye Türkçesi boğumlanma özelliklerine dayalı akademik transkripsiyon.",
    methodology: "Motorumuz kural tabanlı çalıştığı için bağlamsal istisnalarda sapmalar olabilmektedir; temel mantık Ergenç (2002)'ye dayanmaktadır.",
    broad: "Geniş Transkripsiyon",
    refOpen: "IPA Referans",
    refClose: "Referansı Kapat",
    refTitle: "IPA Referans Tablosu",
    refSub: "Türkçe ses birimleri ve IPA değişkeleri",
    vowels: "Ünlüler",
    consonants: "Ünsüzler",
    inputLabel: "Türkçe Metin",
    wordCount: (c: number, m: number) => `${c} / ${m} sözcük`,
    wordLimit: (m: number) => `En fazla ${m} sözcük girilebilir. Akademik Açık Erişim Sürümünde sözcük sınırı uygulanmaktadır.`,
    placeholder: "Çevirmek istediğiniz Türkçe metni buraya yazın…",
    speak: "Seslendir",
    clear: "Temizle",
    reportBtn: "Hatalı Çevriyazı Bildir",
    reportWord: "Hatalı sözcük (ör: 'kitap')…",
    reportNote: "Açıklama (isteğe bağlı)…",
    reportSend: "Gönder",
    reportCancel: "İptal",
    outputLabel: "IPA Transkripsiyon",
    download: "İndir",
    copy: "Kopyala",
    outputEmpty: "Transkripsiyon sonucu burada görünecek…",
    outputStatus: (len: number) => `${len} simge · fonemik gösterim`,
    outputIdle: "Sola metin girin, çeviri anlık güncellenir",
    toastSession: { title: "Oturum kurtarıldı", desc: "Önceki çalışma oturumunuz kurtarıldı." },
    toastCopied: { title: "Kopyalandı", desc: "IPA transkripsiyon panoya kopyalandı." },
    toastCopyFail: { title: "Hata", desc: "Kopyalama başarısız." },
    toastAudioFail: { title: "Uyarı", desc: "Sesli okuma bu tarayıcıda desteklenmiyor." },
    toastDownloaded: { title: "İndirildi", desc: "IPA transkripsiyon dosyası kaydedildi." },
    toastLimitReached: { title: "Günlük sınıra ulaştınız", desc: "Oturum açarak sınırsız kullanım yapabilirsiniz." },
    toastReportEmpty: { title: "Açıklama boş", desc: "Lütfen hata hakkında bilgi giriniz." },
    toastReportSent: { title: "Hata bildirimi gönderildi", desc: "Raporunuz admin paneline kaydedilmiştir." },
    downloadFilename: "ipa-transkripsiyon.txt",
  },
  en: {
    loadingSteps: LOADING_STEPS_EN,
    betaBanner: { bold: "Beta Version:", text: "This tool is under active development and does not guarantee 100% accuracy. For academic use, please verify results with an expert." },
    limitLabel: "Daily query limit:",
    limitSub: (r: number) => `Sign in or register for unlimited use.`,
    limitSignIn: "Sign in",
    limitSignUp: "register",
    toolLabel: "Phonetics Tool",
    title: "Phonetic Transcription Tool",
    desc: "Convert Turkish text into International Phonetic Alphabet notation. Academic broad transcription based on Turkish phonological properties.",
    methodology: "Because the engine is rule-based, deviations may occur in contextual exceptions; its core logic is based on Ergenç (2002).",
    broad: "Broad Transcription",
    refOpen: "IPA Reference",
    refClose: "Close Reference",
    refTitle: "IPA Reference Table",
    refSub: "Turkish phonemes and IPA allophones",
    vowels: "Vowels",
    consonants: "Consonants",
    inputLabel: "Turkish Text",
    wordCount: (c: number, m: number) => `${c} / ${m} words`,
    wordLimit: (m: number) => `Maximum ${m} words allowed. Word limit applies in beta.`,
    placeholder: "Type the Turkish text you want to transcribe here…",
    speak: "Play audio",
    clear: "Clear",
    reportBtn: "Report Error",
    reportWord: "Incorrect word (e.g. 'kitap')…",
    reportNote: "Description (optional)…",
    reportSend: "Send",
    reportCancel: "Cancel",
    outputLabel: "IPA Transcription",
    download: "Download",
    copy: "Copy",
    outputEmpty: "Transcription result will appear here…",
    outputStatus: (len: number) => `${len} symbols · phonemic notation`,
    outputIdle: "Enter text on the left, translation updates instantly",
    toastSession: { title: "Session restored", desc: "Your previous session has been restored." },
    toastCopied: { title: "Copied", desc: "IPA transcription copied to clipboard." },
    toastCopyFail: { title: "Error", desc: "Copy failed." },
    toastAudioFail: { title: "Warning", desc: "Audio playback is not supported in this browser." },
    toastDownloaded: { title: "Downloaded", desc: "IPA transcription file saved." },
    toastLimitReached: { title: "Daily limit reached", desc: "Sign in for unlimited use." },
    toastReportEmpty: { title: "Description empty", desc: "Please enter information about the error." },
    toastReportSent: { title: "Error report submitted", desc: "Your report has been saved to the admin panel." },
    downloadFilename: "ipa-transcription.txt",
  },
}

const LS_INPUT = "tudap_transcriber_input"
const LS_MODE = "tudap_transcriber_mode"
const LS_DARK  = "tudap_transcriber_dark"

type TranscriptionMode = "narrow" | "broad" | "traditional"

function getTranscriptionOptions(mode: TranscriptionMode) {
  return {
    broad: mode !== "narrow",
    rules: mode === "traditional"
      ? { allophones: false, assimilation: true, aspiration: false, stress: false }
      : undefined,
  }
}

export function TranscriberPage({ lang = "tr" }: { lang?: "tr" | "en" }) {
  const t = UI[lang]
  const { toast } = useToast()
  const { data: session } = useSession()

  const [savedInput, setSavedInput, , inputHydrated] = useLocalStorage<string>(LS_INPUT, "")
  const [savedMode, setSavedMode, , modeHydrated] = useLocalStorage<TranscriptionMode>(LS_MODE, "narrow")
  const [savedDark,  setSavedDark,  , darkHydrated]  = useLocalStorage<boolean>(LS_DARK, false)

  const [inputText,          setInputText]          = useState("")
  const [outputText,         setOutputText]          = useState("")
  const [transcriptionMode, setTranscriptionMode] = useState<TranscriptionMode>("narrow")
  const [isDark,             setIsDark]              = useState(false)
  const [showReference,      setShowReference]       = useState(false)
  const [isProcessing,       setIsProcessing]        = useState(false)
  const [loadingStep,        setLoadingStep]         = useState(0)
  const [wordLimitWarning,   setWordLimitWarning]    = useState(false)
  const [customTranscriptions, setCustomTranscriptions] = useState<Array<{input: string, output: string}>>([])

  // Error report state — no dialog, just direct send
  const [errorNote,          setErrorNote]           = useState("")
  const [errorWord,          setErrorWord]           = useState("")
  const [showErrorForm,      setShowErrorForm]       = useState(false)

  const sessionRestoredRef = useRef(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Hydrate from localStorage
  useEffect(() => {
    if (!inputHydrated || !modeHydrated || !darkHydrated) return
    if (sessionRestoredRef.current) return
    sessionRestoredRef.current = true

    if (savedDark) {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
    setTranscriptionMode(savedMode)
    setInputText(savedInput)
    if (savedInput) setOutputText(turkishToIPA(savedInput, getTranscriptionOptions(savedMode)))
    if (savedInput.length > 0) {
      toast({ title: t.toastSession.title, description: t.toastSession.desc })
    }
  }, [inputHydrated, modeHydrated, darkHydrated]) // eslint-disable-line

  // Load custom transcriptions once on mount
  useEffect(() => {
    getCustomTranscriptions()
      .then(data => setCustomTranscriptions(data))
      .catch(err => console.error('[v0] Error loading custom transcriptions:', err))
  }, [])

  // Process pipeline
  const processInput = async (raw: string, mode: TranscriptionMode) => {
    if (!raw.trim()) { setOutputText(""); return }
    
    const { allowed } = await checkQueryLimit()
    if (!allowed) {
      toast({
        title: t.toastLimitReached.title,
        description: t.toastLimitReached.desc,
        variant: "destructive"
      })
      return
    }
    
    setIsProcessing(true)
    setLoadingStep(0)
    const clean = await sanitizeInput(raw)
    setLoadingStep(1)
    await new Promise((r) => setTimeout(r, 80))
    
    // Apply custom transcriptions BEFORE IPA conversion:
    // Split input into tokens, if a token matches a custom rule use that output directly,
    // otherwise run it through turkishToIPA normally.
    let ipa: string
    if (customTranscriptions.length > 0) {
      const customMap = new Map(
        customTranscriptions.map(c => [c.input.toLowerCase().trim(), c.output])
      )
      const tokens = clean.split(/(\s+|[.,!?;:—\-()'"«»""])/g)
      ipa = tokens.map(token => {
        if (!token) return ""
        // Keep punctuation/whitespace as-is
        if (token.match(/^[\s.,!?;:—\-()'"«»""]+$/)) return token
        const key = token.toLowerCase()
        if (customMap.has(key)) {
          return customMap.get(key)!
        }
        return turkishToIPA(token, getTranscriptionOptions(mode))
      }).join("")
    } else {
      ipa = turkishToIPA(clean, getTranscriptionOptions(mode))
    }
    
    setLoadingStep(2)
    await new Promise((r) => setTimeout(r, 40))
    setOutputText(ipa)
    setIsProcessing(false)
    
    // Persist to DB — fire and forget, never blocks UI
    saveQueryLog({
      inputText: clean,
      ipaOutput: ipa,
      transcriptionType: mode === "broad" ? "broad" : "narrow",
      charCount: clean.length,
    }).catch(() => {})
  }

  // Handlers
  const handleInputChange = (value: string) => {
    if (countWords(value) > MAX_WORDS) { setWordLimitWarning(true); return }
    setWordLimitWarning(false)
    setInputText(value)
    setSavedInput(value)
    
    // Debounce processInput: clear timer, set new one (500ms)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      processInput(value, transcriptionMode)
    }, 500)
  }

  const handleModeChange = (mode: TranscriptionMode) => {
    setTranscriptionMode(mode)
    setSavedMode(mode)
    if (inputText.trim()) processInput(inputText, mode)
  }

  const toggleDarkMode = () => {
    const next = !isDark
    setIsDark(next)
    setSavedDark(next)
    document.documentElement.classList.toggle("dark")
  }

  const handleClear = () => {
    setInputText("")
    setOutputText("")
    setSavedInput("")
    setWordLimitWarning(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText)
      toast({ title: t.toastCopied.title, description: t.toastCopied.desc })
    } catch {
      toast({ title: t.toastCopyFail.title, description: t.toastCopyFail.desc, variant: "destructive" })
    }
  }

  const handlePlayAudio = () => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(inputText)
      u.lang = "tr-TR"
      window.speechSynthesis.speak(u)
    } else {
      toast({ title: t.toastAudioFail.title, description: t.toastAudioFail.desc, variant: "destructive" })
    }
  }

  const handleDownload = () => {
    if (!outputText) return
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = t.downloadFilename
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
    toast({ title: t.toastDownloaded.title, description: t.toastDownloaded.desc })
  }

  // Direct DB save: on click, save error to admin panel
  const handleErrorReport = async () => {
    const note  = errorNote.trim()
    if (!note) {
      toast({ title: t.toastReportEmpty.title, description: t.toastReportEmpty.desc, variant: "destructive" })
      return
    }
    
    await saveErrorReport({
      message: note,
      userEmail: session?.user?.email || 'anonymous',
      url: typeof window !== 'undefined' ? window.location.href : '',
      errorWord: errorWord.trim(),
    })
    
    setShowErrorForm(false)
    setErrorNote("")
    setErrorWord("")
    toast({ title: t.toastReportSent.title, description: t.toastReportSent.desc })
  }

  return (
    <div className={`min-h-screen bg-background flex flex-col ${isDark ? "dark" : ""}`}>
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-10 md:py-14 flex-1">
        <div className="space-y-10">

          {/* Beta banner */}
          <div className="rounded-lg border border-amber-200/60 bg-amber-50/60 dark:bg-amber-900/20 dark:border-amber-800/40 px-4 py-3">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <span className="font-semibold">{t.betaBanner.bold}</span>{" "}
              {t.betaBanner.text}
            </p>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4 border-b border-border pb-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-accent font-medium">{t.toolLabel}</p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground text-balance">
                {t.title}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                {t.desc}
              </p>
              <p className="max-w-xl border-l-2 border-primary/30 pl-3 text-xs leading-relaxed text-muted-foreground/80">
                {t.methodology}
              </p>
            </div>
            {/* Dark mode toggle isolated to transcriber */}
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}
              className="text-muted-foreground hover:text-foreground shrink-0 h-8 w-8 mt-1">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          {/* Reference panel */}
          {showReference && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-base font-serif font-semibold text-foreground">{t.refTitle}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.refSub}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowReference(false)}
                  className="h-7 w-7 text-muted-foreground">
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[{ label: t.vowels, rows: VOWELS, wClass: "w-12" }, { label: t.consonants, rows: CONSONANTS, wClass: "w-16" }].map(({ label, rows, wClass }) => (
                  <div key={label}>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{label}</p>
                    <div className="divide-y divide-border rounded border border-border overflow-hidden">
                      {rows.map(([letter, ipa, desc]) => (
                        <div key={letter} className="flex items-center gap-4 px-3 py-2 bg-background hover:bg-muted/40 transition-colors">
                          <span className={`font-mono text-sm font-semibold text-foreground ${wClass} shrink-0`}>{letter}</span>
                          <span className="font-mono text-primary text-sm flex-1">{ipa}</span>
                          <span className="text-xs text-muted-foreground hidden lg:block text-right">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcription modes */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="tablist" aria-label="Transkripsiyon biçimi">
              {([
                ["narrow", lang === "en" ? "Modern acoustic phonetics" : "Modern Akustik Fonetik", "[ … ]"],
                ["broad", lang === "en" ? "Broad phonemic transcription" : "Geniş Fonemik Çevriyazı", "/ … /"],
                ["traditional", lang === "en" ? "Traditional / comparative" : "Geleneksel / Karşılaştırmalı", "IPA"],
              ] as const).map(([mode, label, notation]) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={transcriptionMode === mode}
                  onClick={() => handleModeChange(mode)}
                  className={`min-h-16 rounded-lg border px-3 py-2 text-left transition-colors ${
                    transcriptionMode === mode
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="block text-xs font-medium leading-snug">{label}</span>
                  <span className="mt-1 block font-mono text-xs opacity-70">{notation}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {transcriptionMode === "narrow" ? (lang === "en" ? "Modern acoustic phonetics" : "Modern Akustik Fonetik") :
                    transcriptionMode === "broad" ? t.broad : (lang === "en" ? "Traditional / comparative" : "Geleneksel / Karşılaştırmalı")}
                </span>
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  {transcriptionMode === "narrow" ? "[ … ]" : transcriptionMode === "broad" ? "/ … /" : "IPA"}
                </span>
              </Label>
              <Button variant="ghost" size="sm" onClick={() => setShowReference(!showReference)}
                className="text-muted-foreground hover:text-foreground gap-1.5 text-xs">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">{showReference ? t.refClose : t.refOpen}</span>
              </Button>
            </div>

          </div>

          {/* Editor grid */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Input panel */}
            <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{t.inputLabel}</span>
                <span className={`text-xs tabular-nums font-medium ${
                  wordLimitWarning || countWords(inputText) >= MAX_WORDS ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {t.wordCount(countWords(inputText), MAX_WORDS)}
                </span>
              </div>

              {wordLimitWarning && (
                <div className="flex items-center gap-2 px-4 py-2 bg-destructive/8 border-b border-destructive/15 text-destructive text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {t.wordLimit(MAX_WORDS)}
                </div>
              )}

              <Textarea
                placeholder={t.placeholder}
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                className="flex-1 min-h-[320px] resize-none border-0 rounded-none focus-visible:ring-0 font-sans text-sm leading-relaxed bg-transparent"
              />

              <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-muted/10">
                <Button onClick={handlePlayAudio} disabled={!inputText.trim()} variant="outline" size="sm"
                  className="bg-transparent text-xs">
                  <Volume2 className="h-3.5 w-3.5 mr-1.5" />
                  {t.speak}
                </Button>
                <Button onClick={handleClear} disabled={!inputText && !outputText} variant="ghost" size="sm"
                  className="text-xs text-muted-foreground">
                  <RotateCcw className="h-3 w-3 mr-1.5" />
                  {t.clear}
                </Button>

                {/* Error report — inline form toggle */}
                <div className="ml-auto flex items-center gap-2">
                  {!showErrorForm ? (
                    <Button
                      onClick={() => setShowErrorForm(true)}
                      disabled={!outputText}
                      variant="ghost" size="sm"
                      className="text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                      {t.reportBtn}
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2 w-72">
                      <input
                        autoFocus
                        type="text"
                        value={errorWord}
                        onChange={(e) => setErrorWord(e.target.value)}
                        placeholder={t.reportWord}
                        className="h-7 text-xs px-2 rounded border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="text"
                        value={errorNote}
                        onChange={(e) => setErrorNote(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleErrorReport(); if (e.key === "Escape") { setShowErrorForm(false); setErrorNote(""); setErrorWord("") } }}
                        placeholder={t.reportNote}
                        className="h-7 text-xs px-2 rounded border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex items-center gap-2">
                        <Button onClick={handleErrorReport} size="sm" className="h-7 text-xs flex-1">
                          {t.reportSend}
                        </Button>
                        <Button onClick={() => { setShowErrorForm(false); setErrorNote(""); setErrorWord("") }} variant="ghost" size="sm"
                          className="h-7 text-xs text-muted-foreground">
                          {t.reportCancel}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Output panel */}
            <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{t.outputLabel}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!outputText || isProcessing}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground px-2">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    {t.download}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!outputText || isProcessing}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground px-2">
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    {t.copy}
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-[320px] p-4 font-mono text-sm leading-loose whitespace-pre-wrap break-words text-foreground [font-variant-numeric:tabular-nums] [letter-spacing:0.01em] [font-feature-settings:'kern'_0]">
                {isProcessing ? (
                  <div className="flex flex-col gap-3 pt-2">
                    {t.loadingSteps.map((step, idx) => (
                      <div key={step} className={`flex items-center gap-2 text-sm transition-opacity duration-300 ${idx <= loadingStep ? "opacity-100" : "opacity-30"}`}>
                        {idx < loadingStep ? (
                          <span className="text-primary font-bold text-xs">✓</span>
                        ) : idx === loadingStep ? (
                          <span className="inline-block h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        ) : (
                          <span className="inline-block h-3 w-3 rounded-full border border-border" />
                        )}
                        <span className={`text-sm ${idx === loadingStep ? "text-foreground" : "text-muted-foreground font-sans"}`}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : outputText ? (
                  outputText
                ) : (
                  <span className="text-muted-foreground/60 italic font-sans text-sm">
                    {t.outputEmpty}
                  </span>
                )}
              </div>

              <div className="px-4 py-3 border-t border-border bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  {isProcessing
                    ? t.loadingSteps[loadingStep]
                    : outputText
                    ? t.outputStatus(outputText.length)
                    : t.outputIdle}
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <SiteFooter />
      <Toaster />
    </div>
  )
}
