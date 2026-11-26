"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, RotateCcw, Share2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import styles from "@/app/pusula/pusula.module.css"

type QuadKey = "tl" | "tr" | "bl" | "br" | "center"
type Point = { x: number; y: number }
type Question = { text: string; dx: number; dy: number }
type Linguist = Point & { name: string; initials: string; label: string; description: string }

const questions: Question[] = [
  { text: "Çocuklar duyduklarından fazlasını öğrenir.", dx: -1, dy: -0.4 },
  { text: "Hiç duymadığım bir tümce yine de doğru olabilir.", dx: -0.5, dy: -1 },
  { text: "Argo, bir dilin en ciddi hâlidir.", dx: 1, dy: 0.2 },
  { text: "Aynı tümceyi iki farklı kişi söylediğinde, aynı tümceyi söylemiş olmazlar.", dx: 1, dy: -0.3 },
  { text: "Konuşucu kendi dili hakkında yanılabilir.", dx: 0.2, dy: 1 },
  { text: "İyi bir model önce güzel olmalı. Doğruluğu sonra gelir.", dx: -0.2, dy: -1 },
  { text: "Dil en çok mutfakta, çay eşliğinde değişir.", dx: 1, dy: 0 },
  { text: "Hatalar, doğru konuşmaktan daha çok şey öğretir.", dx: -0.4, dy: 1 },
  { text: "Dil insan türünün bir özelliğidir. Kültür sadece üstüne serilmiş bir örtü.", dx: -1, dy: -0.2 },
  { text: "Konuşurken neyi söylemediğimiz, söylediğimizden fazlasını anlatır.", dx: 0.7, dy: -0.7 },
  { text: "Bir makalede fikir yoksa ama tablolar güzelse, o makale yine de iş görür.", dx: 0, dy: 1 },
  { text: "Yapay zekâ dil modelleri bize dil hakkında pek bir şey öğretmez.", dx: -0.7, dy: -0.7 },
  { text: "Bir sözcüğün anlamı sözlükte değil, o sözcüğü söyleyenin elindedir.", dx: 1, dy: -0.2 },
  { text: "Bir kuram, doğru olmasından önce çürütülebilir olmalıdır.", dx: 0, dy: 1 },
  { text: "Dilbilgisi hatası diye bir şey yoktur. Yalnızca başka bir dilbilgisi vardır.", dx: 0.7, dy: 0.3 },
  { text: "Bir dilin ölmesi, bir doğal alanın yok olmasından daha ağırdır.", dx: 0.7, dy: 0 },
  { text: "Anadili konuşan herkes aslında kendi küçük dilini konuşur.", dx: -0.4, dy: 0.3 },
  { text: "Sözdizimi, anlamın hizmetçisidir.", dx: 0.5, dy: -0.5 },
  { text: "Çocuk “gittim” yerine “gidiyordum” dediğinde hata yapmaz, mantık yürütür.", dx: -0.7, dy: -0.2 },
  { text: "Bir tümceyi duyduğumda, onu kuranın kim olduğunu da tahmin ederim.", dx: 1, dy: 0.3 },
]

const options = [
  { label: "Hayır, hocam, asla", value: -2 },
  { label: "Pek sanmam", value: -1 },
  { label: "Bu soru dilbilgisel ama anlamsız", value: 0 },
  { label: "Evet gibi", value: 1 },
  { label: "Tezimin ilk tümcesi bu", value: 2 },
]

const quads: Record<QuadKey, {
  title: string; place: string; description: string; color: string; tool: string; enemy: string
  mantra: string; advisor: string; drink: string; sentence: string
}> = {
  tl: {
    title: "Üretimci Kafa", place: "Temsil ettiği yer: kara tahta", color: "#df4a40",
    description: "Dil senin için kafanın içinde bir organ. Dışarıdaki konuşma gürültü, asıl iş ağaç diyagramında. “Uyarıcının yoksulluğu” lafını duyunca gözlerin parlıyor, “korpus” duyunca hafif bir baş ağrısı başlıyor.",
    tool: "Kapağı açık bir keçeli kalem", enemy: "“Peki ya korpusta nasıl geçiyor?” sorusu", mantra: "Önce model, veri sonra gelir.", advisor: "“Çok güzel ama bir örnek ekleyelim.”", drink: "Soğumuş sade filtre kahve", sentence: "Renksiz yeşil fikirler öfkeyle uyur.",
  },
  tr: {
    title: "Eleştirel Söylemci", place: "Temsil ettiği yer: panel kürsüsü", color: "#2f80d6",
    description: "Her tümcede bir iktidar ilişkisi görüyorsun ve çoğu zaman haklısın. Bir haber başlığında üç ideoloji buluyorsun, kahve siparişinde dördüncüyü.",
    tool: "Megafon ve fosforlu kalem", enemy: "“Bu sadece bir tümce” diyen kişi", mantra: "Dil hiçbir zaman masum değildir.", advisor: "“Argümanın sağlam. Kimi hedef aldığını biraz yumuşatalım mı?”", drink: "Üç farklı bardakta çay", sentence: "Tarafsız dil diye bir şey yok.",
  },
  bl: {
    title: "Psikodilbilimci", place: "Temsil ettiği yer: laboratuvar", color: "#2c9a57",
    description: "Kafanın içine bakmak istiyorsun ama sezgiyle değil, milisaniyeyle. Katılımcı bulmak hayatının en zor işi. p değeri 0.051 çıkınca bir hafta kimseyle konuşmuyorsun.",
    tool: "Göz izleme cihazı ve “katılımcı aranıyor” afişi", enemy: "On iki kişilik örneklem", mantra: "Ölçemediğim şey kafamda yok.", advisor: "“Katılımcıyı yirmi dörde çıkarırsak güç analizi güzel bitiyor.”", drink: "Gece ikide enerji içeceği", sentence: "Etki var ama küçük.",
  },
  br: {
    title: "Korpuscu", place: "Temsil ettiği yer: saha, sokak ve market", color: "#8a55d1",
    description: "İnsanlar gerçekte ne diyorsa dil odur. Twitter'ı, altyazıları ve şikâyet sitelerini veri olarak görüyorsun ve haksız da değilsin. Laptopta üç yüz sekme, birinde yarım kalmış bir regex.",
    tool: "Ses kaydedici ve yarım kalmış bir regex", enemy: "Gerekçe göstermeyen sezgi", mantra: "İnsanlar ne diyorsa dil odur.", advisor: "“Veri çok iyi. Bir de kuram koyalım mı?”", drink: "Prizin yanındaki masada filtre kahve", sentence: "Frekans neyse odur.",
  },
  center: {
    title: "Panel Moderatörü", place: "Temsil ettiği yer: tam orta, sahne arkası", color: "#d89b1c",
    description: "Herkesin biraz haklı olduğunu düşünüyorsun. Bu yüzden her sempozyuma davet ediliyorsun ve hiçbir tartışmayı kazanmıyorsun. Soru-cevap kısmında “hepimiz aslında aynı şeyi söylüyoruz” tümcesini sen kuruyorsun.",
    tool: "Mikrofon ve zaman uyarısı kartı", enemy: "“Yani sen hangi taraftasın?” sorusu", mantra: "Hepsinde bir gerçeklik payı var.", advisor: "“Bu hangi kuramsal çerçeve?” diye soruyor ve cevap vermene izin veriyor.", drink: "Her masadan bir yudum", sentence: "Hepinize teşekkürler, çok verimli bir tartışmaydı.",
  },
}

const linguists: Linguist[] = [
  { name: "Noam Chomsky", initials: "Ch", x: -0.8, y: -0.75, label: "Hassas Genç Erkek", description: "Dilbilimi kafanın içine taşıdı ve oraya bir kilit taktı. Şimdi herkes kapıda anahtar arıyor. Çocuk hiç duymadığı tümceyi nasıl kuruyor sorusunu hayat felsefesi yaptı, “ya korpus?” diyene sakin bir tebessümle bakar." },
  { name: "Ray Jackendoff", initials: "Ja", x: -0.5, y: -0.55, label: "Evin İçindeki Muhalefet Lideri", description: "Üretimci ailenin içinden, ama sözdizimini tek başına tahta oturtmayı sevmeyen biri. “Bence şöyle de olabilir” demek için akşam yemeğine bile geliyor." },
  { name: "Michael Halliday", initials: "Ha", x: 0.6, y: -0.6, label: "Her Şeyi Üçe Bölen Abi", description: "Dilin üç işlevi var, tümcenin de üç anlamı. Sofra kurulsa tabaklar bile metafonksiyonlara göre dizilir." },
  { name: "Norman Fairclough", initials: "Fa", x: 0.8, y: -0.7, label: "Haber Başlığında Üç İdeoloji Bulan Kişi", description: "Bir haber başlığını okur, ardından o tümceyi kimin, kime, hangi güçle söylediğinin hesabını sorar. Çay içerken bile “peki bunu kim söylüyor?” diye sorar." },
  { name: "Deborah Cameron", initials: "Ca", x: 0.7, y: -0.3, label: "Dil Bekçilerine Karşı Nöbetçi", description: "“Dil bozuluyor” diyenlerin karşısında. Bu telaşın dilden çok toplumla ilgili olduğunu sakin sakin, ama sivri zekâyla anlatır." },
  { name: "Willem Levelt", initials: "Le", x: -0.55, y: 0.7, label: "Kafadaki Konuşma Fabrikasını Çizen Mühendis", description: "Bir tümcenin kafada nasıl üretildiğini kutular ve oklarla gösterdi. Dil sürçmeleri onun için gürültü değil, değerli veri." },
  { name: "Steven Pinker", initials: "Pi", x: -0.65, y: 0.35, label: "Hassas Genç Erkek'in Popüler Bilimci Kuzeni", description: "Dil İçgüdüsü ile dilbilimi havaalanı kitapçılarına taşıdı. Evrimi, sözdizimini ve çocuk dilini aynı kitapta toplayabilen az sayıda kişiden." },
  { name: "Elissa Newport", initials: "Ne", x: -0.35, y: 0.78, label: "Bebeğe Yapay Dil Dinleten Laboratuvar Sakini", description: "Bir bebek bilmediği bir dilin kalıplarını istatistikle yakalayabilir mi? Deneyle bakar, tabloyla anlatır." },
  { name: "William Labov", initials: "La", x: 0.7, y: 0.8, label: "Alışveriş Merkezinde “r” Sayan Adam", description: "New York'ta mağaza çalışanlarının “r” seslerini sayarak dil değişimini toplumsal sınıfla ilişkilendirdi. Bir deney için bir alışveriş merkezi yeter." },
  { name: "Penelope Eckert", initials: "Ec", x: 0.8, y: 0.45, label: "Lise Koridorunun Etnografı", description: "Liselilerin dilini koridorda, kantinde ve kulüplerde gözlemledi. Kimlik bazen tek bir ünlünün biraz daha öne çıkmasında saklıdır." },
  { name: "Joan Bybee", initials: "By", x: 0.25, y: 0.55, label: "Sık Geçen Şey Dilbilgisi Olur Diyen Hoca", description: "Çok kullanılan yapı kalıplaşır, kalıplaşan yapı dilbilgisi olur. Dilbilgisi bir tür tekrar işi: tekrar, tekrar, tekrar." },
  { name: "John Sinclair", initials: "Si", x: 0.3, y: 0.78, label: "Sözcükleri Komşusundan Tanıyan Sözlükçü", description: "Sözcük tek başına yaşamaz diyerek sözlüğü korpustan çıkardı. “Bu sözcük nerede, kimlerle geçiyor?” sorusunun hayat boyu abonesi." },
  { name: "Ferdinand de Saussure", initials: "Sa", x: 0.12, y: -0.1, label: "Herkesin Atası, Kimsenin Okumadığı Kitabın Yazarı", description: "Dilbilimi bağımsız bir bilim yaptı. Ünlü kitabını kendisinin değil, öğrencilerinin ders notlarından derlendiğini ise çoğumuz unutuyoruz." },
  { name: "David Crystal", initials: "Cr", x: 0.12, y: 0.1, label: "Her Konuda Bir “Dil Nedir” Kitabı Olan Hoca", description: "Ansiklopediden internet diline kadar yazdı. Dilbilim giriş kitaplarının sessiz hükümdarı." },
]

const reads: Record<QuadKey, { title: string; url: string; note: string }> = {
  tl: { title: "Dilbilim Nasıl Bilim Oldu?", url: "/blog/dilbilim-nasil-bilim-oldu", note: "Kuralcı gramerden zihinsel yetiye uzanan hikâye tam senin karenin hikâyesi." },
  tr: { title: "Sosyodilbilim Nedir? Dil ve Toplum Arasındaki İlişki", url: "/blog/sosyodilbilim-nedir-dil-ve-toplum-arasindaki-iliski", note: "Dilin yaş, sınıf ve çevreyle nasıl şekillendiğine dair bir başlangıç." },
  bl: { title: "Aşk Bir Savaş mıdır, Yolculuk mu?", url: "/blog/ask-bir-savas-midir-yolculuk-mu", note: "Zihnin metaforlarla nasıl çalıştığını anlatan, kafanın içine bakan bir okuma." },
  br: { title: "Hesaplamalı Dilbilim Nedir? Yapay Zekâ ile Dilbilimin Kesişim Noktası", url: "/blog/hesaplamali-dilbilim-nedir-yapay-zek-ile-dilbilimin-kesisim-noktasi", note: "Veri, korpus ve modelleme sevenler için." },
  center: { title: "Anlambilim (Semantik) Nedir?", url: "/blog/anlambilim-semantik-nedir", note: "Her yaklaşımın uğradığı ortak bir durak: anlam." },
}

const quadKeys: QuadKey[] = ["tl", "tr", "bl", "br"]
const clamp = (value: number) => Math.max(-1, Math.min(1, value))
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

function getQuad(x: number, y: number): QuadKey {
  if (Math.abs(x) < 0.18 && Math.abs(y) < 0.18) return "center"
  return y < 0 ? (x < 0 ? "tl" : "tr") : (x < 0 ? "bl" : "br")
}

function getAffinity(x: number, y: number) {
  const px = (x + 1) / 2
  const py = (y + 1) / 2
  const raw = { tl: (1 - px) * (1 - py), tr: px * (1 - py), bl: (1 - px) * py, br: px * py }
  const result = Object.fromEntries(quadKeys.map((key) => [key, Math.round(raw[key] * 100)])) as Record<(typeof quadKeys)[number], number>
  const sum = Object.values(result).reduce((total, value) => total + value, 0)
  const highest = quadKeys.reduce((best, key) => raw[key] > raw[best] ? key : best, quadKeys[0])
  result[highest] += 100 - sum
  return result
}

function shuffle(values: number[]) {
  const shuffled = values.slice()
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]]
  }
  return shuffled
}

export default function PusulaTool() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro")
  const [order, setOrder] = useState<number[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [point, setPoint] = useState<Point | null>(null)
  const [showLinguists, setShowLinguists] = useState(true)
  const [selectedLinguist, setSelectedLinguist] = useState<Linguist | null>(null)
  const [copied, setCopied] = useState(false)

  const resultKey = point ? getQuad(point.x, point.y) : null
  const result = resultKey ? quads[resultKey] : null
  const percentages = point ? getAffinity(point.x, point.y) : null
  const sortedAffinities = percentages ? [...quadKeys].sort((a, b) => percentages[b] - percentages[a]) : []

  useEffect(() => {
    if (phase !== "quiz") return
    const handleKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.key < "1" || event.key > "5") return
      event.preventDefault()
      submitAnswer(options[Number(event.key) - 1].value)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  })

  function startQuiz() {
    setOrder(shuffle(questions.map((_, questionIndex) => questionIndex)))
    setIndex(0)
    setAnswers([])
    setPoint(null)
    setSelectedLinguist(null)
    setPhase("quiz")
  }

  function submitAnswer(value: number) {
    if (phase !== "quiz") return
    const nextAnswers = answers.slice(0, index)
    nextAnswers[index] = value
    setAnswers(nextAnswers)
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      return
    }
    let sx = 0
    let sy = 0
    let maxX = 0
    let maxY = 0
    order.forEach((questionIndex, answerIndex) => {
      const question = questions[questionIndex]
      sx += nextAnswers[answerIndex] * question.dx
      sy += nextAnswers[answerIndex] * question.dy
      maxX += 2 * Math.abs(question.dx)
      maxY += 2 * Math.abs(question.dy)
    })
    setPoint({ x: clamp((sx / maxX) * 1.6), y: clamp((sy / maxY) * 1.6) })
    setPhase("result")
  }

  function goBack() {
    if (index === 0) return
    setAnswers(answers.slice(0, index))
    setIndex(index - 1)
  }

  async function copyResult() {
    if (!point || !resultKey) return
    const nearest = getNearest(point, resultKey)
    const text = `Dilbilim Pusulası: ${quads[resultKey].title}. ${axisSummary(point)}. İkizim: ${nearest.twin.name} (${nearest.twin.label}). Kabus senaryom: ${quads[resultKey].enemy}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      textarea.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function downloadResult() {
    if (!point || !resultKey) return
    const nearest = getNearest(point, resultKey)
    const canvas = document.createElement("canvas")
    canvas.width = 1080
    canvas.height = 1350
    const context = canvas.getContext("2d")
    if (!context) return
    context.fillStyle = quads[resultKey].color
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "#fff"
    context.fillRect(54, 54, 972, 1230)
    context.strokeStyle = "#111"
    context.lineWidth = 6
    context.strokeRect(54, 54, 972, 1230)
    context.fillStyle = "#596074"
    context.font = "600 34px sans-serif"
    context.fillText("TÜDAP · Dilbilim Pusulası", 110, 130)
    context.fillStyle = quads[resultKey].color
    context.font = "900 84px sans-serif"
    context.fillText(quads[resultKey].title, 110, 245)
    const x0 = 190
    const y0 = 360
    const size = 700
    const colors = [quads.tl.color, quads.tr.color, quads.bl.color, quads.br.color]
    ;[[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([x, y], itemIndex) => {
      context!.fillStyle = colors[itemIndex]
      context!.fillRect(x0 + x * size / 2, y0 + y * size / 2, size / 2, size / 2)
    })
    context.strokeStyle = "#111"
    context.lineWidth = 5
    context.strokeRect(x0, y0, size, size)
    context.beginPath()
    context.moveTo(x0 + size / 2, y0)
    context.lineTo(x0 + size / 2, y0 + size)
    context.moveTo(x0, y0 + size / 2)
    context.lineTo(x0 + size, y0 + size / 2)
    context.stroke()
    linguists.forEach((linguist) => {
      const x = x0 + size / 2 + linguist.x * size * 0.467
      const y = y0 + size / 2 + linguist.y * size * 0.467
      context!.beginPath()
      context!.arc(x, y, 18, 0, Math.PI * 2)
      context!.fillStyle = "white"
      context!.fill()
      context!.stroke()
      context!.fillStyle = "#111"
      context!.font = "bold 17px sans-serif"
      context!.textAlign = "center"
      context!.textBaseline = "middle"
      context!.fillText(linguist.initials, x, y)
    })
    const userX = x0 + size / 2 + point.x * size * 0.467
    const userY = y0 + size / 2 + point.y * size * 0.467
    context.beginPath()
    context.arc(userX, userY, 25, 0, Math.PI * 2)
    context.fillStyle = "white"
    context.fill()
    context.lineWidth = 6
    context.stroke()
    context.fillStyle = "#111"
    context.font = "bold 28px sans-serif"
    context.fillText("sen", userX, userY - 43)
    context.textAlign = "left"
    context.textBaseline = "alphabetic"
    context.fillStyle = "#596074"
    context.font = "bold 30px sans-serif"
    context.fillText("Gerçek hayattaki ikizin", 110, 1140)
    context.fillStyle = "#111"
    context.font = "bold 54px sans-serif"
    context.fillText(nearest.twin.name, 110, 1205)
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

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Link href="/" className={styles.breadcrumb}><ArrowLeft size={16} /> Ana Sayfa <span>/</span> Araçlar <span>/</span> Dilbilim Pusulası</Link>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>ARAÇLAR <span>·</span> 3 DAKİKA</p>
          <h1>Dilbilim <em>Pusulası</em></h1>
          <p className={styles.lead}>20 önerme, 5 şık. Sonunda dilbilimdeki yerin, gerçek hayatta kime benzediğin ve tez danışmanının seni nasıl gördüğü belli olacak.</p>
          <p className={styles.notice}><strong>Eğlence amaçlıdır.</strong> Bu test bilimsel bir ölçek değildir; dilbilimcilerle yapılan eşleştirmeler dostane bir şakadır. Akademik içerik için <Link href="/blog">blog</Link> ve <Link href="/terim-sozlugu">terim sözlüğü</Link> bölümlerine bakın.</p>
        </header>

        {phase === "intro" && (
          <section className={`${styles.panel} ${styles.intro}`}>
            <div className={styles.introMark} aria-hidden="true"><span>4</span><i>×</i><span>4</span></div>
            <div className={styles.introCopy}>
              <p>Önermelere ne kadar katıldığını söyle. Hangi sorunun neyi ölçtüğünü söylemiyoruz. Sen de bulamayacaksın, denedik.</p>
              <div className={styles.chips}><span>4 kare</span><span>4 farklı karakter</span><span>14 gerçek dilbilimci</span><span>Yaklaşık 3 dakika</span></div>
              <button className={styles.primary} onClick={startQuiz}>Teste başla <span aria-hidden="true">↗</span></button>
            </div>
          </section>
        )}

        {phase === "quiz" && (
          <section className={`${styles.panel} ${styles.quiz}`} aria-live="polite">
            <div className={styles.quizTop}><span>YAKLAŞIMINI BUL</span><span>{String(index + 1).padStart(2, "0")} <i>/</i> {questions.length}</span></div>
            <div className={styles.progress}><span style={{ width: `${(index / questions.length) * 100}%` }} /></div>
            <p className={styles.question}>{questions[order[index]]?.text}</p>
            <div className={styles.options}>
              {options.map((option, optionIndex) => (
                <button key={option.label} onClick={() => submitAnswer(option.value)}>
                  <kbd>{optionIndex + 1}</kbd><span>{option.label}</span><b aria-hidden="true">↗</b>
                </button>
              ))}
            </div>
            <div className={styles.quizFoot}>
              {index > 0 ? <button className={styles.back} onClick={goBack}><ArrowLeft size={15} /> Önceki soruya dön</button> : <span />}
              <span>Klavyede 1–5 de çalışır</span>
            </div>
          </section>
        )}

        {phase === "result" && point && result && resultKey && percentages && (
          <ResultView
            point={point}
            resultKey={resultKey}
            percentages={percentages}
            sortedAffinities={sortedAffinities}
            showLinguists={showLinguists}
            setShowLinguists={setShowLinguists}
            selectedLinguist={selectedLinguist}
            setSelectedLinguist={setSelectedLinguist}
            copied={copied}
            onCopy={copyResult}
            onDownload={downloadResult}
            onRestart={startQuiz}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

function getNearest(point: Point, key: QuadKey) {
  const pool = key === "center" ? linguists : linguists.filter((linguist) => getQuad(linguist.x, linguist.y) === key)
  const twin = [...(pool.length ? pool : linguists)].sort((a, b) => distance(a, point) - distance(b, point))[0]
  const neighbours = linguists.filter((linguist) => linguist !== twin).sort((a, b) => distance(a, point) - distance(b, point)).slice(0, 2)
  return { twin, neighbours }
}

function axisSummary(point: Point) {
  const x = Math.round(Math.abs(point.x) * 100)
  const y = Math.round(Math.abs(point.y) * 100)
  const horizontal = x < 3 ? "Zihin ile toplum arasında tam ortada" : `${point.x < 0 ? "Zihin" : "Toplum"} %${x}`
  const vertical = y < 3 ? "kuram ile veri arasında tam ortada" : `${point.y < 0 ? "Kuram" : "Veri"} %${y}`
  return `${horizontal}, ${vertical}`
}

function ResultView({
  point, resultKey, percentages, sortedAffinities, showLinguists, setShowLinguists,
  selectedLinguist, setSelectedLinguist, copied, onCopy, onDownload, onRestart,
}: {
  point: Point; resultKey: QuadKey; percentages: Record<(typeof quadKeys)[number], number>
  sortedAffinities: (typeof quadKeys)[number][]; showLinguists: boolean
  setShowLinguists: (value: boolean) => void; selectedLinguist: Linguist | null
  setSelectedLinguist: (linguist: Linguist | null) => void; copied: boolean
  onCopy: () => void; onDownload: () => void; onRestart: () => void
}) {
  const result = quads[resultKey]
  const { twin, neighbours } = getNearest(point, resultKey)
  const axis = axisSummary(point)
  const reading = reads[resultKey]

  return (
    <section className={`${styles.result} ${styles[`theme_${resultKey}`]}`}>
      <div className={styles.banner}>
        <div className={styles.bannerIndex}>TÜDAP <span>·</span> SONUÇ 01</div>
        <p>Sen şusun:</p>
        <h2>{result.title}</h2>
        <span className={styles.place}>{result.place}</span>
        <div className={styles.bannerShape} aria-hidden="true">{resultKey === "tl" ? "∴" : resultKey === "tr" ? "◒" : resultKey === "bl" ? "◉" : resultKey === "br" ? "⌁" : "✳"}</div>
      </div>

      <div className={styles.resultBody}>
        <div className={styles.resultGrid}>
          <div>
            <div className={styles.chartHeader}><span>YANIT HARİTAN</span><span>{axis}</span></div>
            <div className={styles.chartWrap}>
              <svg className={styles.chart} viewBox="0 0 340 340" role="img" aria-label={`Dilbilim pusulası grafiği. ${axis}`}>
                <rect x="20" y="20" width="150" height="150" fill={quads.tl.color} />
                <rect x="170" y="20" width="150" height="150" fill={quads.tr.color} />
                <rect x="20" y="170" width="150" height="150" fill={quads.bl.color} />
                <rect x="170" y="170" width="150" height="150" fill={quads.br.color} />
                <path d="M20 20H320V320H20Z M170 20V320 M20 170H320" fill="none" stroke="#17231f" strokeWidth="2.5" />
                <g className={styles.chartLabels}>
                  <text x="28" y="36">Üretimci Kafa</text><text x="312" y="36" textAnchor="end">Eleştirel Söylemci</text>
                  <text x="28" y="310">Psikodilbilimci</text><text x="312" y="310" textAnchor="end">Korpuscu</text>
                  <text x="170" y="13" textAnchor="middle">Kuram</text><text x="170" y="337" textAnchor="middle">Veri</text>
                  <text x="11" y="170" textAnchor="middle" transform="rotate(-90 11 170)">Zihin</text><text x="330" y="170" textAnchor="middle" transform="rotate(90 330 170)">Toplum</text>
                </g>
                {showLinguists && linguists.map((linguist) => (
                  <g key={linguist.name} className={`${styles.linguistDot} ${selectedLinguist?.name === linguist.name ? styles.dotSelected : ""}`} transform={`translate(${170 + linguist.x * 140} ${170 + linguist.y * 140})`} role="button" tabIndex={0} aria-label={`${linguist.name}, ${linguist.label}`} onClick={() => setSelectedLinguist(linguist)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedLinguist(linguist) } }}>
                    <circle r="9" /><text y="0.5">{linguist.initials}</text>
                  </g>
                ))}
                <g className={styles.userDot} transform={`translate(${170 + point.x * 140} ${170 + point.y * 140})`}>
                  <circle r="12" /><circle r="4" /><text y="-18">sen</text>
                </g>
              </svg>
            </div>
            <label className={styles.toggle}><input type="checkbox" checked={showLinguists} onChange={(event) => setShowLinguists(event.target.checked)} /> Gerçek dilbilimcileri haritada göster</label>
            <p className={styles.caption} aria-live="polite">{selectedLinguist ? <><strong>{selectedLinguist.name}</strong> — {selectedLinguist.label}</> : "Beyaz noktalara dokun, kim olduklarını gör."}</p>
            <h3 className={styles.sectionLabel}>KARELERE YAKINLIĞIN</h3>
            <div className={styles.affinities}>
              {sortedAffinities.map((key) => (
                <div className={styles.affinity} key={key}>
                  <span>{quads[key].title}</span><div><i style={{ width: `${percentages[key]}%`, background: quads[key].color }} /></div><b>%{percentages[key]}</b>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.resultDetails}>
            {Math.abs(point.x) > 0.7 && Math.abs(point.y) > 0.7 && <p className={styles.badge}>Köşe şampiyonu: diğer karelere sadece selam veriyorsun</p>}
            {(Math.abs(point.x) <= 0.7 || Math.abs(point.y) <= 0.7) && Math.max(Math.abs(point.x), Math.abs(point.y)) > 0.82 && <p className={styles.badge}>Uç nokta uyarısı: bu köşede çok az kişi var</p>}
            <p className={styles.axisText}>{axis}.</p>
            <p className={styles.description}>{result.description}</p>

            <h3 className={styles.sectionLabel}>GERÇEK HAYATTAKİ İKİZİN</h3>
            <div className={styles.twin}><p className={styles.twinName}>{twin.name}</p><p className={styles.twinLabel}>{twin.label}</p><p>{twin.description}</p></div>
            <h3 className={styles.sectionLabel}>EN YAKIN KOMŞULARIN</h3>
            <div className={styles.neighbours}>{neighbours.map((linguist) => <div key={linguist.name}><strong>{linguist.name} <span>— {linguist.label}</span></strong><p>{linguist.description}</p></div>)}</div>

            <h3 className={styles.sectionLabel}>BU KARE NEYİ TEMSİL EDER</h3>
            <div className={styles.facts}>
              {[["Aletin", result.tool], ["Kabus senaryon", result.enemy], ["Motton", result.mantra], ["Danışmanın sana der ki", result.advisor], ["İçeceğin", result.drink], ["Favori tümcen", result.sentence]].map(([label, value]) => <div key={label}><b>{label}</b><span>{value}</span></div>)}
            </div>

            <h3 className={styles.sectionLabel}>SANA ÖZEL OKUMA ÖNERİSİ</h3>
            <Link href={reading.url} className={styles.reading}><strong>{reading.title}<span aria-hidden="true">↗</span></strong><span>{reading.note}</span></Link>
          </div>
        </div>

        <details className={styles.method}>
          <summary>Sonuç nasıl hesaplanıyor?</summary>
          <p>İki eksen ölçülür: yatayda dilin zihinde mi yoksa toplumda mı aranması gerektiği, dikeyde işin kuramla mı yoksa veriyle mi yürütüleceği. Her önerme bu eksenlerden birini ya da ikisini farklı ağırlıklarla etkiler. Cevapların ağırlıklı toplamı noktanı belirler. Dilbilimcilerin haritadaki yeri yazarın yorumudur, kişilerin kendi tanımları değildir.</p>
        </details>
        <div className={styles.actions}>
          <button className={styles.primary} onClick={onDownload}><Download size={16} /> Görsel olarak indir</button>
          <button className={styles.secondary} onClick={onCopy}><Share2 size={16} /> {copied ? "Kopyalandı" : "Sonucu kopyala"}</button>
          <button className={styles.secondary} onClick={onRestart}><RotateCcw size={16} /> Yeniden çöz</button>
        </div>
        <p className={styles.privacy}>Hiçbir cevabın kaydedilmez ya da sunucuya gönderilmez; hesaplama tarayıcında yapılır.</p>
      </div>
    </section>
  )
}