"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, RotateCcw, Share2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import questionsTr from "@/lib/pusula/questions-tr.json"
import questionsEn from "@/lib/pusula/questions-en.json"
import resultsData from "@/lib/pusula/results.json"
import { scoreAnswers, type Answer, type Quadrant, type Tier } from "@/lib/pusula/score"
import styles from "@/components/pusula-tool-spec.module.css"

type Lang = "tr" | "en"
type ResultSet = "main" | "turkish"
type ResultEntry = {
  name: string
  label: { tr: string; en: string }
  about: { tr: string; en: string }
  real: { tr: string; en: string }
  advisor: { tr: string; en: string }
}

const OPTION_TEXT = {
  tr: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"],
  en: ["Strongly disagree", "Disagree", "Undecided", "Agree", "Strongly agree"],
}

const QUADRANTS: Record<Quadrant, { tr: string; en: string; short: { tr: string; en: string } }> = {
  mimar: { tr: "Mimar", en: "Architect", short: { tr: "Biçimci", en: "Formal" } },
  dusunur: { tr: "Düşünür", en: "Thinker", short: { tr: "Bilişsel / İşlevsel", en: "Cognitive / Functional" } },
  kasif: { tr: "Kaşif", en: "Explorer", short: { tr: "Betimleyici / Tipolog", en: "Descriptive / Typological" } },
  gozlemci: { tr: "Gözlemci", en: "Observer", short: { tr: "Sosyodilbilim / Derlem", en: "Sociolinguistics / Corpus" } },
}

function getResultEntry(setName: ResultSet, quadrant: Quadrant, tier: Tier): ResultEntry {
  const setData = resultsData[setName] as Record<Quadrant, Partial<Record<Tier, ResultEntry>>>
  return setData[quadrant][tier] ?? setData[quadrant][tier === "B" ? "dengeli" : "dengeli"]!
}

export default function PusulaToolSpec() {
  const [lang, setLang] = useState<Lang>("tr")
  const [resultSet, setResultSet] = useState<ResultSet>("main")
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro")
  const [order, setOrder] = useState<number[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [highlighted, setHighlighted] = useState(0)
  const [scored, setScored] = useState<ReturnType<typeof scoreAnswers> | null>(null)
  const [copied, setCopied] = useState(false)

  const questions = lang === "tr" ? questionsTr : questionsEn
  const options = OPTION_TEXT[lang]

  useEffect(() => {
    if (phase !== "quiz") return
    const handleKey = (event: KeyboardEvent) => {
      if (/^[1-5]$/.test(event.key)) {
        event.preventDefault()
        void submitAnswer((Number(event.key) as 1 | 2 | 3 | 4 | 5))
      } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault()
        setHighlighted((value) => (value + 1) % 5)
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault()
        setHighlighted((value) => (value + 4) % 5)
      } else if (event.key === "Enter") {
        event.preventDefault()
        void submitAnswer((highlighted + 1) as Answer)
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  })

  function startQuiz() {
    const shuffled = questions.map((_, itemIndex) => itemIndex)
    for (let itemIndex = shuffled.length - 1; itemIndex > 0; itemIndex -= 1) {
      const target = Math.floor(Math.random() * (itemIndex + 1))
      ;[shuffled[itemIndex], shuffled[target]] = [shuffled[target], shuffled[itemIndex]]
    }
    setOrder(shuffled)
    setIndex(0)
    setAnswers({})
    setScored(null)
    setHighlighted(0)
    setPhase("quiz")
  }

  function submitAnswer(answer: Answer) {
    if (phase !== "quiz") return
    const question = questions[order[index]]
    const next = { ...answers, [question.id]: answer }
    setAnswers(next)
    if (index + 1 < questions.length) {
      setIndex((value) => value + 1)
      setHighlighted(0)
      return
    }

    const mergeSet = new Set<Quadrant>(resultSet === "main" ? ["kasif", "gozlemci"] : ["dusunur", "gozlemci"])
    setScored(scoreAnswers(next, questions, mergeSet))
    setPhase("result")
  }

  function goBack() {
    if (index === 0) return
    const question = questions[order[index]]
    const next = { ...answers }
    delete next[question.id]
    setAnswers(next)
    setIndex((value) => value - 1)
    setHighlighted(0)
  }

  const copyOrShare = async () => {
    if (!scored) return
    const entry = getResultEntry(resultSet, scored.quadrant, scored.tier)
    const text = lang === "tr"
      ? `Dilbilim Pusulası sonucum: ${entry.name} — ${QUADRANTS[scored.quadrant]["tr"]}. A=${scored.A}, B=${scored.B}.`
      : `My Linguistics Compass result: ${entry.name} — ${QUADRANTS[scored.quadrant]["en"]}. A=${scored.A}, B=${scored.B}.`
    try {
      if (navigator.share) await navigator.share({ title: lang === "tr" ? "Dilbilim Pusulası" : "Linguistics Compass", text, url: window.location.href })
      else await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setCopied(false)
    }
  }

  const downloadCard = () => {
    if (!scored) return
    const entry = getResultEntry(resultSet, scored.quadrant, scored.tier)
    const canvas = document.createElement("canvas")
    canvas.width = 1080
    canvas.height = 1350
    const context = canvas.getContext("2d")
    if (!context) return
    context.fillStyle = "#15355c"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "#f7f7f4"
    context.fillRect(54, 54, 972, 1236)
    context.fillStyle = "#15355c"
    context.font = "700 36px Georgia"
    context.fillText(lang === "tr" ? "TÜDAP · Dilbilim Pusulası" : "TÜDAP · Linguistics Compass", 105, 145)
    context.fillStyle = "#111"
    context.font = "700 70px Georgia"
    context.fillText(entry.name, 105, 260)
    context.fillStyle = "#315d8a"
    context.font = "700 30px monospace"
    context.fillText(entry.label[lang], 105, 310)

    const x0 = 160
    const y0 = 390
    const size = 760
    const colors = ["#e9eff7", "#dbe9f7", "#edf2f7", "#d5e3f1"]
    ;[[0,0],[1,0],[0,1],[1,1]].forEach(([column, row], index) => {
      context.fillStyle = colors[index]
      context.fillRect(x0 + column * size / 2, y0 + row * size / 2, size / 2, size / 2)
    })
    context.strokeStyle = "#15355c"
    context.lineWidth = 4
    context.strokeRect(x0, y0, size, size)
    context.beginPath()
    context.moveTo(x0 + size / 2, y0)
    context.lineTo(x0 + size / 2, y0 + size)
    context.moveTo(x0, y0 + size / 2)
    context.lineTo(x0 + size, y0 + size / 2)
    context.stroke()
    const pointX = x0 + size / 2 + (scored.A / 20) * size * 0.46
    const pointY = y0 + size / 2 - (scored.B / 20) * size * 0.46
    context.beginPath()
    context.arc(pointX, pointY, 24, 0, Math.PI * 2)
    context.fillStyle = "#15355c"
    context.fill()

    context.fillStyle = "#111"
    context.font = "700 28px Georgia"
    context.fillText(lang === "tr" ? "Senin hakkında" : "About you", 105, 1220)
    context.font = "24px Georgia"
    const about = entry.about[lang]
    const words = about.split(" ")
    let line = ""
    let lineY = 1260
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word
      if (context.measureText(testLine).width > 870) {
        context.fillText(line, 105, lineY)
        line = word
        lineY += 34
      } else line = testLine
    }
    context.fillText(line, 105, lineY)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "dilbilim-pusulasi.png"
      anchor.click()
      URL.revokeObjectURL(url)
    }, "image/png")
  }

  const text = {
    tr: {
      eyebrow: "ARAÇLAR · 3 DAKİKA", title: "Dilbilim Pusulası", intro: "20 önerme, 5 şık. Hangi dilbilimci yaklaşımına en yakın?", notice: "Eğlence amaçlıdır. Bu test bilimsel bir ölçek değildir; dilbilimcilerle yapılan eşleştirmeler dostane bir şakadır.", start: "Teste başla", back: "Geri", result: "Sonuç", about: "Senin hakkında", real: "Gerçek hayatta", advisor: "Tez danışmanın seni şöyle görür", download: "Görsel olarak indir", share: "Paylaş", restart: "Testi yeniden çöz", online: "Ana set", turkishSet: "Türkçe set",
    },
    en: {
      eyebrow: "TOOLS · 3 MINUTES", title: "Linguistics Compass", intro: "20 statements, 5 choices. Which linguist is closest to your approach?", notice: "This is for entertainment purposes. It is not a scientific scale, and the linguist matches are playful comparisons.", start: "Start", back: "Back", result: "Result", about: "About you", real: "In real life", advisor: "What your thesis supervisor might say", download: "Download image", share: "Share", restart: "Retake", online: "Main set", turkishSet: "Turkish set",
    },
  }[lang]

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>{text.eyebrow}</p>
        <header className={styles.hero}>
          <h1>{text.title}</h1>
          <p>{text.intro}</p>
          <p className={styles.notice}><strong>{text.notice}</strong></p>
        </header>

        <div className={styles.controls}>
          <div className={styles.segment} aria-label="Language">
            <button type="button" data-active={lang === "tr"} onClick={() => setLang("tr")}>TR</button>
            <button type="button" data-active={lang === "en"} onClick={() => setLang("en")}>EN</button>
          </div>
          <div className={styles.segment} aria-label="Result set">
            <button type="button" data-active={resultSet === "main"} onClick={() => setResultSet("main")}>{text.online}</button>
            <button type="button" data-active={resultSet === "turkish"} onClick={() => setResultSet("turkish")}>{text.turkishSet}</button>
          </div>
        </div>

        {phase === "intro" && (
          <section className={`${styles.panel} ${styles.intro}`}>
            <div className={styles.introMark} aria-hidden="true">4×4</div>
            <div className={styles.introCopy}>
              <p>{lang === "tr" ? "Önermelere ne kadar katıldığını seç. Hangi önermenin hangi ekseni ölçtüğü gösterilmez." : "Choose how much you agree with each statement. The axis measured by a statement is not shown."}</p>
              <div className={styles.chips}><span>20 {lang === "tr" ? "önerme" : "statements"}</span><span>5 {lang === "tr" ? "şık" : "choices"}</span><span>4 {lang === "tr" ? "kare" : "quadrants"}</span><span>14 {lang === "tr" ? "dilbilimci" : "linguists"}</span></div>
              <button className={styles.primary} onClick={startQuiz}>{text.start} <span aria-hidden="true">↗</span></button>
            </div>
          </section>
        )}

        {phase === "quiz" && (
          <section className={`${styles.panel} ${styles.quiz}`} aria-live="polite">
            <div className={styles.quizTop}><span>{text.result}</span><span>{String(index + 1).padStart(2, "0")} / {questions.length}</span></div>
            <div className={styles.progress} aria-label={`${index + 1} / ${questions.length}`}><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
            <p className={styles.question}>{questions[order[index]]?.text}</p>
            <div className={styles.options} role="radiogroup" aria-label={lang === "tr" ? "Cevap seçin" : "Choose an answer"}>
              {options.map((option, optionIndex) => (
                <button key={option} type="button" role="radio" aria-checked={highlighted === optionIndex} tabIndex={highlighted === optionIndex ? 0 : -1} onMouseEnter={() => setHighlighted(optionIndex)} onClick={() => submitAnswer((optionIndex + 1) as Answer)}>
                  <kbd>{optionIndex + 1}</kbd><span>{option}</span><b aria-hidden="true">↗</b>
                </button>
              ))}
            </div>
            <div className={styles.quizFoot}><button className={styles.back} type="button" onClick={goBack} disabled={index === 0}><ArrowLeft size={15} /> {text.back}</button><span>1–5 / ↑ ↓ / Enter</span></div>
          </section>
        )}

        {phase === "result" && scored && (
          <section className={styles.result} aria-live="polite">
            {(() => {
              const entry = getResultEntry(resultSet, scored.quadrant, scored.tier)
              const pointX = 170 + (scored.A / 20) * 140
              const pointY = 170 - (scored.B / 20) * 140
              const quadrantLabel = QUADRANTS[scored.quadrant][lang]
              return (
                <>
                  <div className={styles.resultHead}><div><p>TÜDAP / {text.result}</p><h2>{entry.name}</h2></div><span className={styles.quadrantMark}>{quadrantLabel} · {entry.label[lang]}</span></div>
                  <div className={styles.resultBody}>
                    <svg className={styles.chart} viewBox="0 0 340 340" role="img" aria-label={`A=${scored.A}, B=${scored.B}`}>
                      <rect x="20" y="20" width="150" height="150" fill="#edf2f7" />
                      <rect x="170" y="20" width="150" height="150" fill="#dbe9f7" />
                      <rect x="20" y="170" width="150" height="150" fill="#e9eff7" />
                      <rect x="170" y="170" width="150" height="150" fill="#d5e3f1" />
                      <path d="M20 20H320V320H20Z M170 20V320 M20 170H320" fill="none" stroke="var(--foreground)" strokeWidth="2" />
                      <text x="28" y="40" fill="var(--foreground)" fontSize="10">{QUADRANTS.mimar[lang]}</text>
                      <text x="312" y="40" fill="var(--foreground)" fontSize="10" textAnchor="end">{QUADRANTS.dusunur[lang]}</text>
                      <text x="28" y="310" fill="var(--foreground)" fontSize="10">{QUADRANTS.kasif[lang]}</text>
                      <text x="312" y="310" fill="var(--foreground)" fontSize="10" textAnchor="end">{QUADRANTS.gozlemci[lang]}</text>
                      <text x="170" y="12" fill="var(--foreground)" fontSize="9" textAnchor="middle">Kuram / Theory</text>
                      <text x="170" y="336" fill="var(--foreground)" fontSize="9" textAnchor="middle">Veri / Data</text>
                      <text x="10" y="170" fill="var(--foreground)" fontSize="9" textAnchor="middle" transform="rotate(-90 10 170)">Sistem / System</text>
                      <text x="330" y="170" fill="var(--foreground)" fontSize="9" textAnchor="middle" transform="rotate(90 330 170)">Kullanım / Use</text>
                      <g transform={`translate(${pointX} ${pointY})`}><circle r="12" fill="var(--primary)" /><text y="-18" fill="var(--foreground)" fontSize="11" textAnchor="middle">sen / you</text></g>
                    </svg>
                    <div className={styles.resultText}>
                      <h3>{text.about}</h3><p>{entry.about[lang]}</p>
                      <h3>{text.real}</h3><p>{entry.real[lang]}</p>
                      <h3>{text.advisor}</h3><p><strong>{entry.advisor[lang]}</strong></p>
                      <div className={styles.actions}><button className={styles.primary} type="button" onClick={downloadCard}><Download size={16} /> {text.download}</button><button className={styles.secondary} type="button" onClick={copyOrShare}><Share2 size={16} /> {copied ? (lang === "tr" ? "Kopyalandı" : "Copied") : text.share}</button><button className={styles.secondary} type="button" onClick={startQuiz}><RotateCcw size={16} /> {text.restart}</button></div>
                    </div>
                  </div>
                </>
              )
            })()}
          </section>
        )}

        {phase === "intro" && <p className={styles.noticeBottom}>{lang === "tr" ? "Sonuçlar tarayıcıda hesaplanır ve hiçbir cevap sunucuya gönderilmez." : "Results are calculated in your browser and no answers are sent to a server."}</p>}
        {phase === "result" && <><div className={styles.links}><Link href="/blog">Blog</Link><Link href="/terim-sozlugu">Terim sözlüğü</Link></div><p className={styles.noticeBottom}>{text.notice}</p></>}
      </main>
      <SiteFooter />
    </div>
  )
}
