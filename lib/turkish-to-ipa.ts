export interface TranscriptionOptions {
  broad: boolean
  rules?: {
    allophones: boolean
    assimilation: boolean
    aspiration: boolean
    stress: boolean
  }
}

const DEFAULT_RULES = {
  allophones: true,
  assimilation: true,
  aspiration: true,
  stress: true,
}

// ──────────────────────────────────────────────
// Yardımcı sınıflandırıcılar
// ──────────────────────────────────────────────

// Damaksıllaşmayı tetikleyen GERÇEK öndil ünlüleri (kaynak karakter düzeyinde).
// y, ∙I ve diğer IPA sembolleri bu kümede YER ALMAZ.
const REAL_FRONT_VOWELS = "eiöü"

function isVowel(c: string): boolean {
  return "aeıioöuüâîûAEIİOÖUÜÂÎÛ".includes(c)
}

function isFrontVowel(c: string): boolean {
  // İnce ünlüler: e, i, ö, ü (ve uzun karşılıkları)
  // NOT: y, ∙I ve diğer IPA sembolleri burada ASLA yer almaz.
  return "eiöüîiİÖÜ".includes(c)
}

function isBackVowel(c: string): boolean {
  // Kalın ünlüler: a, ı, o, u (ve uzun karşılıkları)
  return "aıouâûAIOU".includes(c)
}

function isRoundVowel(c: string): boolean {
  // Yuvarlak ünlüler: o, ö, u, ü
  return "oöuüOÖUÜ".includes(c)
}

function isUnvoicedStop(c: string): boolean {
  return "ptk".includes(c)
}

// Önceki hece başlangıcı araması
function isWordOrSyllableStart(chars: string[], i: number): boolean {
  if (i === 0) return true
  // Önceki karakter ünlü veya boşluk ise hece başı
  return isVowel(chars[i - 1]) || chars[i - 1] === " "
}

// ──────────────────────────────────────────────
// Ünlü düşmesi (apokope / senkop) ön işleme
// Dar ünlülü ikinci heceli kökler + ünlüyle başlayan ek
// Örn. burun + u → burnu, ağız + a → ağza
// ──────────────────────────────────────────────
function applyVowelDrop(word: string): string {
  // Basit hece sayısı → 2 heceli ve 2. hecede dar ünlü (ı,i,u,ü) varsa düşür
  // Bu ön-morfoloji katmanı; gerçek ek tespiti yapılmıyor, ancak bilinen kalıpları yakalar
  const patterns: [RegExp, string][] = [
    [/^(bur)(u)(n)([aeıioöuü])/, "$1$3$4"],   // burun+ünlü
    [/^(al)(ı)(n)([aeıioöuü])/, "$1$3$4"],    // alın+ünlü
    [/^(ağ)(ı)(z)([aeıioöuü])/, "$1$3$4"],    // ağız+ünlü
    [/^(gön)(ü)(l)([aeıioöuü])/, "$1$3$4"],   // gönül+ünlü
    [/^(kır)(ı)(k)([aeıioöuü])/, "$1$3$4"],   // kırık+ünlü
  ]
  let result = word
  for (const [re, rep] of patterns) {
    result = result.replace(re, rep)
  }
  return result
}

// ──────────────────────────────────────────────
// Metatez (ses aktarımı) ön işleme
// kibrit→kirbit, yanlış→yalnış vb.
// ──────────────────────────────────────────────
function applyMetathesis(word: string): string {
  const map: Record<string, string> = {
    kibrit: "kirbit",
    yanlış: "yalnış",
    yanlış: "yalnış",
  }
  return map[word.toLowerCase()] ?? word
}

// ──────────────────────────────────────────────
// /h/ düşmesi (hane bileşikleri)
// Örn. kahvehane → kahveane, dershane → dersane
// ──────────────────────────────────────────────
function applyHDrop(word: string): string {
  // -hane → -ane (ve önceki ünlü uzar – uzama ː ile ayrıca işlenir)
  return word.replace(/hane/g, "ːane")
}

// ──────────────────────────────────────────────
// Çıkış yeri benzeşmesi: n + b/p → m
// Örn. on bir → [ɔmbɪɾ]
// ──────────────────────────────────────────────
function applyNAssimilation(word: string): string {
  return word.replace(/n([bp])/g, "m$1")
}

// ──────────────────────────────────────────────
// Çıkış biçimi benzeşmesi: nl → nn
// Örn. yanlış → yannış (metatezden sonra yalnış ama bu kural nl için)
// ──────────────────────────────────────────────
function applyNLAssimilation(word: string): string {
  return word.replace(/nl/g, "nn")
}

// ──────────────────────────────────────────────
// Ana transkripsiyon (tek kelime, IPA dizisi döndürür)
// ──────────────────────────────────────────────
function transcribeWord(rawWord: string, options: TranscriptionOptions): string {
  const rules = { ...DEFAULT_RULES, ...options.rules }
  // 1. Ön işleme zinciri
  let word = rawWord.toLowerCase()
  if (rules.assimilation) {
    word = applyMetathesis(word)
    word = applyHDrop(word)
    word = applyNAssimilation(word)
    word = applyNLAssimilation(word)
    word = applyVowelDrop(word)
  }

  const chars = word.split("")
  let result = ""

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    const prev = i > 0 ? chars[i - 1] : ""
    const next = i < chars.length - 1 ? chars[i + 1] : ""
    const isFirst = i === 0
    const isLast = i === chars.length - 1

    // ── Boşluk / noktalama ──
    if (c.match(/[\s.,!?;:\-()'"]/)) { result += c; continue }

    // ── Önceden işlenmiş uzatma belirteci ──
    if (c === "ː") { result += "ː"; continue }

    // ══════════════════════════════════════
    // ÜNLÜLER
    // ══════════════════════════════════════
    if (isVowel(c)) {
      // ── Düzeltme işaretli (uzun) ünlüler ──
      if (c === "â") { result += "αː"; continue }
      if (c === "î") { result += "iː"; continue }
      if (c === "û") { result += "uː"; continue }

      // ── /a/ ──
      // Türkçe kökenli artdamaksıl [α]; yabancı ödünç sözcüklerde öndamaksıl [a]
      // <ğ> yanında uzun [αː], diş-üstün konsonant yanında [a]
      if (c === "a") {
        if (!rules.allophones) { result += "a"; continue }
        const afterIsGhOrLong = next === "ğ" || next === "ː"
        const prevIsGhOrLong = prev === "ğ" || prev === "ː"
        const nearDentalOrAlveolar = /[tdsznl]/.test(next) || /[tdsznl]/.test(prev)
        
        // Ödünç sözcüklerde [a] (dental/alveolar yanında veya yabancı bağlam)
        if (nearDentalOrAlveolar && !prevIsGhOrLong && !afterIsGhOrLong) {
          result += "a"
        } else if (afterIsGhOrLong || prevIsGhOrLong) {
          result += "αː"
        } else {
          result += "α"
        }
        continue
      }

      // ── /e/ ──
      // Açık [ɛ]: tek heceli sözcük, kelime sonu, <ğ>/<y> yanında, çok heceli son hece
      // Kapalı [e]: yabancı uzun, çok heceli ilk hece, ek aldığında
      if (c === "e") {
        if (!rules.allophones) { result += "e"; continue }
        const syllables = countSyllablesBefore(chars, i)
        const totalSyllables = countTotalSyllables(chars)
        const isWordFinal = !isVowel(next) && (isLast || !chars.slice(i + 1).some(isVowel))
        const isLastSyllable = syllables === totalSyllables - 1
        const nextIsGhOrY = next === "ğ" || next === "y"
        const prevIsGhOrY = prev === "ğ" || prev === "y"
        const isSingleSyllable = totalSyllables === 1

        if (isSingleSyllable || isWordFinal || isLastSyllable || nextIsGhOrY || prevIsGhOrY) {
          result += "ɛ"
        } else {
          result += "e"
        }
        continue
      }

      // ── /ı/ ──
      // Değişkesi yok: daima ortadil-düz-dar [ϊ]
      if (c === "ı") { result += rules.allophones ? "ϊ" : "ɯ"; continue }

      // ── /i/ ──
      // Kısa → açık [ɪ], uzun (ğ sonrası) → kapalı [i]
      if (c === "i") {
        if (!rules.allophones) { result += "i"; continue }
        const isLong = prev === "ğ" || next === "ː"
        result += isLong ? "i" : "ɪ"
        continue
      }

      // ── /o/ ──
      // Türkçe kökenli kısa → açık [ɔ], alıntı/uzun → kapalı [o]
      if (c === "o") {
        if (!rules.allophones) { result += "o"; continue }
        const isLong = prev === "ğ" || next === "ː"
        result += isLong ? "o" : "ɔ"
        continue
      }

      // ── /ö/ ──
      // Açık [œ] (genel), kapalı [ø] (uzun/ğ sonrası); sözcük sonunda kullanılmaz (Türkçe kısıtı)
      if (c === "ö") {
        if (!rules.allophones) { result += "ö"; continue }
        const isLong = prev === "ğ" || next === "ː"
        result += isLong ? "ø" : "œ"
        continue
      }

      // ── /u/ ──
      // Kısa → açık [U], alıntı/uzun (ğ sonrası veya uzatma) → [ʊ:] veya [ʊ]
      if (c === "u") {
        if (!rules.allophones) { result += "u"; continue }
        const isLong = prev === "ğ" || next === "ː"
        result += isLong ? "ʊ:" : "U"
        continue
      }

      // ── /ü/ ──
      // Açık [Y], kapalı [y] (uzun/ğ sonrası)
      if (c === "ü") {
        if (!rules.allophones) { result += "y"; continue }
        const isLong = prev === "ğ" || next === "ː"
        result += isLong ? "y" : "Y"
        continue
      }

      result += c
      continue
    }

    // ── /ğ/ ──
    // Ses değeri yok: sadece önceki ünlüyü uzatır [ː]
    // Kalın ünlü sonrası → sade uzatma
    // İnce ünlü sonrası → diphthong kısaltması (diphthong oluşur)
    if (c === "ğ") {
      result += "ː"
      continue
    }

    // ══════════════════════════════════════
    // ÜNSÜZLER
    // ══════════════════════════════════════

    // ── /p/ – aspirasyon ──
    // Kelime/hece başı + arkasından ünlü geliyorsa üflemeli [pʰ]; sözcük sonunda yok
    if (c === "p") {
      const aspirate = rules.aspiration && isWordOrSyllableStart(chars, i) && isVowel(next) && !isLast
      result += aspirate ? "pʰ" : "p"
      continue
    }

    // ── /t/ – aspirasyon ──
    if (c === "t") {
      const aspirate = rules.aspiration && isWordOrSyllableStart(chars, i) && isVowel(next) && !isLast
      result += aspirate ? "tʰ" : "t"
      continue
    }

    // ── /k/ – aspirasyon + damaksıllaşma ──
    // Damaksıllaşma YALNIZCA gerçek öndil ünlüsü (e, i, ö, ü) komşuluğunda.
    // Kalın ünlüler (a, ı, o, u) ve y/∙I gibi yarı ünlü / IPA sembolleri damaksıllaştırmaz.
    // Sözcük sonunda aspirasyon yok.
    if (c === "k") {
      const front = rules.allophones && ((prev.length > 0 && REAL_FRONT_VOWELS.includes(prev)) ||
                    (next.length > 0 && REAL_FRONT_VOWELS.includes(next)))
      const base = front ? "c" : "k"
      const aspirate = rules.aspiration && isWordOrSyllableStart(chars, i) && isVowel(next) && !isLast
      result += aspirate ? base + "ʰ" : base
      continue
    }

    // ── /b/ – son ses ötümsüzleşmesi ──
    if (c === "b") {
      result += rules.allophones && isLast ? "p" : "b"
      continue
    }

    // ── /d/ – son ses ötümsüzleşmesi ──
    if (c === "d") {
      result += rules.allophones && isLast ? "t" : "d"
      continue
    }

    // ── /c/ (Türkçe <c> = /dʒ/) – son ses ötümsüzleşmesi ──
    if (c === "c") {
      result += rules.allophones && isLast ? "tʃ" : "dʒ"
      continue
    }

    // ── /g/ – son ses ötümsüzleşmesi + damaksıllaşma ──
    // Damaksıllaşma YALNIZCA gerçek öndil ünlüsü (e, i, ö, ü) komşuluğunda.
    // y, ∙I, kalın ünlüler (a, ı, o, u) damaksıllaştırmaz.
    if (c === "g") {
      if (!rules.allophones) { result += "ɡ"; continue }
      const front = (prev.length > 0 && REAL_FRONT_VOWELS.includes(prev)) ||
                    (next.length > 0 && REAL_FRONT_VOWELS.includes(next))
      if (isLast) {
        result += front ? "c" : "k"
      } else {
        result += front ? "ɟ" : "ɡ"
      }
      continue
    }

    // ── /z/ – son seste yarı ötümsüzleşme ──
    if (c === "z") {
      result += rules.allophones && isLast ? "z̥" : "z"
      continue
    }

    // ── /n/ – çıkış yeri benzeşmesi ──
    // SADECE hemen sonraki harf k/g ise [ŋ], hemen sonraki f/v ise [ɱ].
    // Sözcük sonu veya başka harf → kesinlikle [n].
    if (c === "n") {
      if (!isLast && "kg".includes(next)) {
        result += "ŋ"       // artdamak öncesi
      } else if (!isLast && "fv".includes(next)) {
        result += "ɱ"       // diş-dudak öncesi
      } else if (!isLast && "pb".includes(next)) {
        result += "m"       // çift dudak (ön işlemede zaten m olur, güvenlik)
      } else {
        result += "n"       // sözcük sonu dahil diğer tüm durumlar
      }
      continue
    }

    // ── /l/ – ince/kalın değişke ──
    if (c === "l") {
      if (!rules.allophones) { result += "l"; continue }
      // Öndil ünlüleri ve alıntı /a/ yanında ince [l], artdil ünlüleriyle kalın [ɫ]
      const thinContext = isFrontVowel(prev) || isFrontVowel(next)
      result += thinContext ? "l" : "ɫ"
      continue
    }

    // ── /r/ – konum değişkeleri ──
    if (c === "r") {
      if (!rules.allophones) { result += "ɾ"; continue }
      if (isFirst) {
        result += "r"         // sözcük başı: çok vuruşlu [r]
      } else if (isLast) {
        result += "ɣ"         // sözcük sonu: sürtünücü [ɣ]
      } else {
        result += "ɼ"         // içses: tek vuruşlu [ɼ]
      }
      continue
    }

    // ── /f, v/ – dudaksıllaşma ──
    if (c === "f") {
      if (!rules.allophones) { result += "f"; continue }
      const roundCtx = isRoundVowel(prev) || isRoundVowel(next)
      result += roundCtx ? "ɸ" : "f"
      continue
    }

    // ── /v/ – dudaksıllaşma + ünlü arasında yarı ünlü ──
    // Düz ünlüler (a, e, ı, i) yanında standart [v]
    // Yuvarlak ünlüler (o, ö, u, ü) yanında dudaksıllaşma [β] veya [v˚]
    // Yuvarlak-düz ünlü arasında (içses) → [ʋ]
    if (c === "v") {
      if (!rules.allophones) { result += "v"; continue }
      const prevRound = isRoundVowel(prev)
      const nextRound = isRoundVowel(next)
      const prevVowel = isVowel(prev)
      const nextVowel = isVowel(next)
      
      // Yuvarlak-düz ünlü arasında [ʋ]
      if (prevRound && nextVowel && !nextRound) {
        result += "ʋ"
      } else if (nextRound && prevVowel && !prevRound) {
        result += "ʋ"
      }
      // Yuvarlak ünlü yanında dudaksıllaşma
      else if (prevRound || nextRound) {
        result += "β"
      }
      // Düz ünlüler yanında standart [v]
      else {
        result += "v"
      }
      continue
    }

    // ── /y/ – yarı ünlü değişkeleri (ÇOK ÖNEMLİ) ──
    if (c === "y") {
      // /i/ sonrası → önceki [i]'yi uzatır, [y] kendisi ses vermez, [:] olur
      if (prev === "i") {
        result += ":"
        continue
      }
      // Yuvarlak öndil ünlüsü (ö, ü) sonrası → [∙I]
      if (prev === "ö" || prev === "ü") {
        result += "∙I"
        continue
      }
      // Sözcük/hece başında (önses) → [j]
      if (isFirst || !isVowel(prev)) {
        result += "j"
        continue
      }
      // Hece sonu / sonses: arkasından ünsüz geliyorsa veya kelime bitiyorsa → [∙I]
      if (!isVowel(next) || isLast) {
        result += "∙I"
        continue
      }
      // İki ünlü arasında kalan durumlar → [j]
      result += "j"
      continue
    }

    // ── /h/ – konuma bağlı değişke ──
    // Art ünlü (a, ı, o, u) yanında art damak sürtünücü [x]
    // Ön ünlü (e, i, ö, ü) yanında veya sözcük başında gırtlak sürtünücü [h]
    if (c === "h") {
      if (!rules.allophones) { result += "h"; continue }
      const backCtx = isBackVowel(prev) || isBackVowel(next)
      result += backCtx ? "x" : "h"
      continue
    }

    // ── /ç/ – ötümsüz postalveolar afrikat ──
    // Geniş transkripsiyonda /tʃ/, dar transkripsiyonda aynı; tabloda /ç/ simgesiyle gösterilir
    if (c === "ç") {
      result += options.broad ? "tʃ" : "tʃ"
      continue
    }

    // ── Kalan sabit ünsüzler ──
    const consonantMap: Record<string, string> = {
      j: "ʒ",
      m: "m",
      s: "s",
      ş: "ʃ",
    }
    result += consonantMap[c] ?? c
  }

  return result
}

// ────────────────────────────────���─────────────
// Hece yardımcıları
// ────────────────────────────────────���─────────

function countSyllablesBefore(chars: string[], pos: number): number {
  let count = 0
  for (let i = 0; i < pos; i++) {
    if (isVowel(chars[i])) count++
  }
  return count
}

function countTotalSyllables(chars: string[]): number {
  return chars.filter(isVowel).length
}

// ──────────────────────────────────────────────
// Vurgu ekleme (dar transkripsiyon)
// Türkçede genel kural: son hece vurgulu
// ──────────────────────────────────────────────
function addStress(transcribed: string): string {
  const vowelIPA = "aeɛαɯɪiɔœøʊuʏyː"
  let lastVowelGroupStart = -1
  let inVowel = false
  for (let i = transcribed.length - 1; i >= 0; i--) {
    if (vowelIPA.includes(transcribed[i])) {
      if (!inVowel) { lastVowelGroupStart = i; inVowel = true }
    } else {
      if (inVowel) break
    }
  }
  if (lastVowelGroupStart <= 0) return transcribed
  // Son hece başını bul
  let syllableStart = lastVowelGroupStart
  while (syllableStart > 0 && !vowelIPA.includes(transcribed[syllableStart - 1])) {
    syllableStart--
  }
  return transcribed.slice(0, syllableStart) + "ˈ" + transcribed.slice(syllableStart)
}

// ──────────────────────────────────────────────
// Dışa aktarılan ana fonksiyon
// ──────────────────────────────────────────────
export function turkishToIPA(text: string, options: TranscriptionOptions): string {
  if (!text) return ""

  const tokens = text.split(/(\s+|[.,!?;:—\-()'"«»""])/g)

  return tokens
    .map((token) => {
      if (!token) return ""
      if (token.match(/^[\s.,!?;:—\-()'"«»""]+$/)) return token
      const transcribed = transcribeWord(token, options)
      const withStress = !options.broad && rules.stress ? addStress(transcribed) : transcribed
      return options.broad ? `/${withStress}/` : `[${withStress}]`
    })
    .join("")
}
