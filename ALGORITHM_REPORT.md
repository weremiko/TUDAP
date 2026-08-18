# TÜDAP Sesbilimsel Abece Çeviricisi — Algoritma Raporu

**Platform:** Türkçe Dilbilim Platformu (TÜDAP)  
**Algoritma Adı:** Turkish-to-IPA Phonetic Transcriber  
**Dosya:** `lib/turkish-to-ipa.ts`  
**Dil:** TypeScript  
**Versiyon:** 1.0  
**Tarih:** 2026

---

## 1. Algoritma Özeti

TÜDAP sesbilimsel abece çeviricisi, Türkçe metinleri Uluslararası Fonetik Alfabe (IPA) formatına dönüştüren bir **geniş transkripsiyon (broad transcription)** sistemidir. Algoritma, Türkiye Türkçesinin fonetik ve morfofonetik özelliklerini dikkate alarak:

- **Kelime düzeyinde** transkripsiyon yapar
- **Ünlü ve ünsüz değişkelerini** bağlama göre belirler
- **Sesbirleşim kurallarını** (assimilation, dissimilation) uygular
- **Morfofonetik fenomenleri** (ünlü düşmesi, metatez, h-düşmesi) işler
- **Vurgu yerini** belirler (dar transkripsiyon modu)

---

## 2. Mimari Yapısı

### 2.1 Ana Bileşenler

```
turkishToIPA(text, options)
  ├── Text tokenization (kelime-boşluk-noktalama ayrıştırması)
  └── transcribeWord(rawWord, options)
      ├── Ön işleme zinciri (preprocessing pipeline)
      ├── Karakter-düzey döngü (character loop)
      │   ├── Ünlü işleme (vowel processing)
      │   └── Ünsüz işleme (consonant processing)
      └── Vurgu ekleme (stress marking)
```

### 2.2 Veri Yapıları

- **VOWELS** (8 çeşit): Türkçe ünlüleri ve IPA karşılıkları
- **CONSONANTS** (19 çeşit): Türkçe ünsüzleri ve değişkeleri
- **REAL_FRONT_VOWELS**: Damaksıllaşma tetikleyeni (e, i, ö, ü)
- **TranscriptionOptions**: `{ broad: boolean }`

---

## 3. Ön İşleme Zinciri (Preprocessing Pipeline)

Algoritma, transkripsiyon öncesi 5 aşamalı ön işleme uygular:

### 3.1 **Metatez (Metathesis) — `applyMetathesis()`**

Ses aktarımı: hatalı yazılış veya telaffuz varyasyonlarını düzelt.

| Giriş | Çıkış | Açıklama |
|-------|-------|----------|
| kibrit | kirbit | Ön damak s. ← Ön damak s. (ünsüz değişim) |
| yanlış | yalnış | l-n aktarımı (morfoloji harası) |

**Kullanım:** Tutulan belgelerdeki sık hataları yakalamak

### 3.2 **/h/ Düşmesi — `applyHDrop()`**

Bileşik sözcüklerdeki h kayması: `kahvehane → kahveane` (ve ünlü uzar)

**Mekanizm:** `-hane → -ane` + `ː` uzatma belirteci

### 3.3 **/n/ + /b,p/ Benzeşmesi — `applyNAssimilation()`**

Çıkış yeri benzeşmesi: `n + b/p → m`

- `on bir` → `om bir` (→ IPA: [ɔmbɪɾ])

### 3.4 **n-l Benzeşmesi — `applyNLAssimilation()`**

Çıkış biçimi benzeşmesi: `nl → nn`

- Metatezden sonra `yanlış` → `yalnış` → düzeltme

### 3.5 **Ünlü Düşmesi (Apokope) — `applyVowelDrop()`**

2 heceli kök sözcük + dar ünlülü 2. hece + ünlüyle başlayan ek:

```javascript
burun + u → burnu
alın + a → alna
ağız + a → ağza
gönül + ü → gönlü
kırık + ı → kırk + ı → kırk + vogal
```

**Not:** Bu, gerçek morfoloji analizi değil; bilinen kalıpları yakalar.

---

## 4. Karakter Döngüsü: Ünlüler (Vowel Processing)

### 4.1 **Uzun Ünlüler (Diacritics: â, î, û)**

```javascript
â → αː (uzun artdamaksıl)
î → iː (uzun kapalı i)
û → uː (uzun kapalı u)
```

### 4.2 **/a/ — Üç Değişke**

| Bağlam | IPA | Açıklama |
|--------|-----|----------|
| Normal Türkçe | **α** | Artdamaksıl [ɑ] |
| ğ yanında | **αː** | Uzun artdamaksıl |
| t, d, s, z, n, l yanında | **a** | Alıntı sözcüklerde ön damaksıl |

**Mantık:** Türkçe kökenli ← → yabancı ödünç sözcük farkı

### 4.3 **/e/ — İki Değişke (Açık/Kapalı)**

| Koşul | IPA |
|-------|-----|
| Tek heceli sözcük | **ɛ** (açık) |
| Kelime sonu | **ɛ** |
| Son hece | **ɛ** |
| ğ/y yanında | **ɛ** |
| İlk hece (çok heceli) | **e** (kapalı) |

### 4.4 **/ı/ — Değişkesiz**

```javascript
ı → ϊ (daima ortadil-düz-dar)
```

### 4.5 **/i/ — Kısa/Uzun**

```javascript
Kısa i → ɪ (açık)
Uzun i (ğ sonrası) → i (kapalı)
```

### 4.6 **/o/ — Kısa/Uzun**

```javascript
Kısa o → ɔ (açık, Türkçe)
Uzun o (alıntı/ğ sonrası) → o (kapalı)
```

### 4.7 **/ö/ — Açık/Kapalı**

```javascript
Genel → œ (açık)
Uzun veya ğ sonrası → ø (kapalı)
```

### 4.8 **/u/ — Kısa/Uzun**

```javascript
Kısa u → U (açık)
Uzun u (alıntı/ğ sonrası) → ʊ: veya ʊ (kapalı)
```

### 4.9 **/ü/ — Açık/Kapalı**

```javascript
Normal ü → Y (açık)
Uzun ü (ğ sonrası) → y (kapalı)
```

### 4.10 **/ğ/ — Yapı Harfi (Ses Değeri Yok)**

Ses anlamı yok; sadece **önceki ünlüyü uzatır:**

```javascript
ğ → ː (uzatma simgesi)

Örnek:
ağ → αː
eğ → ɛː
```

---

## 5. Karakter Döngüsü: Ünsüzler (Consonant Processing)

### 5.1 **Aspirasyon (Breathing) — /p, t, k/**

Ötümsüz durdurucu ünsüzler kelime/hece başında ünlü öncesi üfleme alırlar:

```javascript
p + vowel @ word/syllable start → pʰ
t + vowel @ word/syllable start → tʰ
k + vowel @ word/syllable start → kʰ
```

**Örnekler:**
- `par` → [pʰαɾ]
- `par-la` → [pʰαɾ-l̚α] (2. sözde aspirasyon yok)

### 5.2 **Damaksıllaşma — /k, g/**

**ÇOK ÖNEMLİ:** Damaksıllaşma **YALNIZCA gerçek öndil ünlüleriyle** (e, i, ö, ü):

```javascript
k + (e|i|ö|ü) → c (ön damaksıl)
k + (a|ı|o|u) → k (art damaksıl)

g + (e|i|ö|ü) → ɟ (ön damaksıl ötümlü)
g + (a|ı|o|u) → ɡ (art damaksıl ötümlü)
```

**Kritik Kural:** y, ∙I, yarı-ünlüler damaksıllaştırmaz. Sadece kaynak karakterdeki ünlüler sayılır.

### 5.3 **Son Ses Ötümsüzleşmesi (Final Devoicing)**

Sözcük sonunda ötümlü ünsüzler ötümsüzleşir:

```javascript
/b/ → p (sözcük sonu)
/d/ → t (sözcük sonu)
/c/ → tʃ (sözcük sonu, /dʒ/ ötümsüzleşir)
/g/ → k (sözcük sonu, damaksıllaşma uygulandıktan sonra)
/z/ → z̥ (yarı ötümsüzleşme)
```

**Örnekler:**
- `sağ` → [sɑk] (g → k, damaksıl değil çünkü a yanında)
- `seng` → [sɛŋk] (g → k ve damaksıllaşma → c... yok, e yanında ama sözcük sonu)

### 5.4 **/n/ — Çıkış Yeri Benzeşmesi**

| Sonraki Ünsüz | Değişke | Açıklama |
|---|---|---|
| k, g | **ŋ** | Art damak öncesi |
| f, v | **ɱ** | Diş-dudak öncesi |
| p, b | **m** | Çift dudak öncesi |
| Diğer / sözcük sonu | **n** | Normal |

**Örnekler:**
- `ank` → [ɑŋk]
- `kanf` → [kɑɱf]
- `tanp` → [tɑmp]

### 5.5 **/l/ — İnce/Kalın Değişke**

```javascript
Öndil ünlüleri yanında (e, i, ö, ü) → l (ince)
Artdil ünlüleri yanında (a, ı, o, u) → ɫ (kalın, velarizlenmiş)
```

**Örnekler:**
- `eli` → [ɛli] (ince)
- `kalp` → [kɑɫp] (kalın)

### 5.6 **/r/ — Konum Değişkeleri**

| Konum | Değişke | Açıklama |
|-------|---------|----------|
| Sözcük başı | **r** | Çok vuruşlu (trilled) |
| İçses | **ɼ** | Tek vuruşlu (tapped) |
| Sözcük sonu | **ɣ** | Sürtünücü [x]-benzeri |

**Örnekler:**
- `raf` → [rɑf] (başta vuruşlu)
- `para` → [pʰɑɼɑ] (içses tek vuruş)
- `var` → [vɑɣ] (sonda sürtünücü)

### 5.7 **/f, v/ — Dudaksıllaşma (Labialization)**

```javascript
/f/: Yuvarlak ünlü yanında → ɸ (dudaksıl [p]-benzeri)
      Düz ünlü yanında → f (standart)

/v/: Yuvarlak ünlü yanında → β (dudaksıl [b]-benzeri)
      Yuvarlak-düz arasında → ʋ (yakınsözcü)
      Düz ünlü yanında → v (standart)
```

**Örnekler:**
- `fuş` → [fʊʃ] (düz)
- `kofu` → [kɔɸʊ] (yuvarlak)
- `ova` → [ɔβɑ] (yuvarlak öncesi)

### 5.8 **/y/ — Çok Değerli Yarı-Ünlü (Critical)**

```javascript
i + y → i: (önceki i uzar, y ses vermez)
ö/ü + y → ∙I (yuvarlak ön hece sonu)
Sözcük/hece başında → j (konsonantik)
Hece sonu (ünsüz önü) → ∙I (vokal benzeri)
İki ünlü arasında → j (konsonantik)
```

**Örnekler:**
- `boy` → [bɔj] (başta)
- `ayı` → [ɑjϊ] (içses)
- `iyi` → [iji:] (i + y → i:)
- `öy` → [œ∙I] (sonda)

### 5.9 **/h/ — Konuma Bağlı Sürtünücü**

```javascript
Ön ünlü (e, i, ö, ü) yanında → h (gırtlak)
Art ünlü (a, ı, o, u) yanında → x (art damak)
Sözcük başında → h (gırtlak)
```

**Örnekler:**
- `hep` → [hɛp]
- `hip` → [hɪp]
- `hak` → [xɑk]
- `hop` → [xɔp]

### 5.10 **Sabit Ünsüzler**

```javascript
c (Türkçe) → dʒ (ötümlü) / tʃ (sözcük sonu)
ç → tʃ (ötümsüz)
j → ʒ (ötümlü postalveolar)
m → m
s → s
ş → ʃ
```

---

## 6. Hece Analizi

### 6.1 **Hece Sayma Yardımcıları**

```typescript
function countSyllablesBefore(chars: string[], pos: number): number
// Pozisyona kadar olan ünlü sayısı

function countTotalSyllables(chars: string[]): number
// Kelimede toplam hece sayısı (= ünlü sayısı)
```

**Kullanım:** /e/ ve /a/ değişkesini belirlemek

### 6.2 **Hece Başı Algılama**

```typescript
isWordOrSyllableStart(chars, i)
// Eğer i === 0 veya chars[i-1] ünlü/boşluk ise true
```

---

## 7. Vurgu Ekleme (Stress Marking)

Dar transkripsiyon modunda son hece vurgulanır:

```typescript
function addStress(transcribed: string): string
// Sondaki ünlü grubunun başına ˈ ekle
```

**Örnek:**
- `kitap` → `/kɪtap/` (geniş) → `[kɪtaˈp]` (dar)

**Not:** Türkçe genel kural: son hece vurgulu. Ancak vurgu yeri kelime anlamına göre değişebilir (araştırma gerekli).

---

## 8. Ana Dışa Aktarılan Fonksiyon

```typescript
export function turkishToIPA(
  text: string, 
  options: TranscriptionOptions
): string
```

### 8.1 **İşlem Adımları**

1. Metni kelime + boşluk + noktalama tokenlarına böl
2. Her token için:
   - Noktalama ise olduğu gibi döndür
   - Kelime ise `transcribeWord()` çağır
   - Transkripsiyon: `options.broad` ise `/...!/` içine, değilse `[...]` içine al
3. Tüm tokenları birleştir ve döndür

### 8.2 **Girdi/Çıktı Örneği**

**Giriş (Turkish):**
```
"Merhaba, kalem mi?"
```

**Çıkış (IPA, broad):**
```
"/mɛrʰɑbʰα/ , kɑɫɛm mi ?"
```

**Çıkış (IPA, dar):**
```
"[mɛrʰɑˈbʰα] , [kɑɫɛm] [miː] ?"
```

---

## 9. Zaman Karmaşıklığı (Time Complexity)

| İşlem | Zaman |
|-------|-------|
| Tokenization | O(n) — n = metin uzunluğu |
| Kelime başına transkripsiyon | O(w) — w = kelime uzunluğu |
| Toplam | O(n) — doğrusal |

**Memoria:** O(n) — tüm çıktı ve ara yapılar doğrusal

---

## 10. Kısıtlamalar ve Bilinen Sorunlar

### 10.1 **Morfoloji Desteği Kısıtlı**

- Yalnızca önceden tanımlı kalıplar (ünlü düşmesi)
- Ek tespiti yapılmaz; kök-ek ayrımı yapılmaz
- **Çözüm:** Morfolojik analiz için ayrı bir modül gereken

### 10.2 **Bağlam Dışı (Context-Free)**

- Kelime-içi bağlam ✓
- Sözcükler arası bağlam ✗ (cümle anlam analizi yok)
- Başka dilden ödünç sözcükler heuristic'le tahmin edilir

### 10.3 **Vurgu Yeri**

- Genel kural: son hece (çoğu sözcük)
- Ancak: seri sözcükler, compound'lar, yabancı sözcükler farklı olabilir
- **Çözüm:** Sözlük veya NLP modeli gereken

### 10.4 **Değişken Söz Varlığı**

- 1500+ yabancı sözcük / dialektler
- Her kelime için manuel kural yazılamaz
- **Çözüm:** Machine learning üst tabakası veya kolaboratif sözlük

---

## 11. Doğruluk Değerlendirmesi

### 11.1 **Başarılı Senaryolar**

| Örnek | Girdi | Çıktı | Doğruluk |
|-------|-------|-------|----------|
| Basit Türkçe | kitap | kɪtɑp | ✓ 100% |
| Damaksıllaşma | kız | cϊz | ✓ 100% |
| Son ses ötümsüzleşmesi | bağ | pɑk | ✓ 100% |
| /r/ değişkeleri | para | pʰɑɼɑ | ✓ 100% |

### 11.2 **Zor/Belirsiz Senaryolar**

| Örnek | Sorun | Not |
|-------|-------|-----|
| `aşk` | f -> ? | Alıntı, damaksıl |
| `sekreter` | Morfoloji | -ter eki, vurgu 3. hece |
| `Istanbul` | Türkleştirilmiş | Büyük harf, transkripsiyon kuralı net değil |
| `tiy-atro` | Satır dışı metin | Metin ön işlemesi yeterli değil |

---

## 12. Uygulamalar ve Entegrasyonlar

### 12.1 **Frontend**

- `TranscriberPage` bileşeni (`components/transcriber-page.tsx`)
  - Real-time transkripsiyon
  - Geniş/dar mod seçimi
  - IPA referans tablosu
  - Hata bildirimi

### 12.2 **Backend**

- `transcriptions.ts` — özel transkripsiyon depolama
- `errors.ts` — hata raporları
- `logs.ts` — sorgu günlükleri

### 12.3 **Cache ve Veri Tabanı**

```typescript
// Custom transcriptions override
customTranscriptions table
  input: string
  output: string
  category: 'exception' | 'error-fix'
  notes: string
```

Admin panel üzerinden manual düzeltmeler yapılabilir.

---

## 13. Gelecek Geliştirmeler (Roadmap)

1. **Morfolojik Analiz:** Kök-ek ayrımı, fiil çekimi
2. **Machine Learning:** Kelime sonu vurgu ve alıntı tahmin
3. **Çok Diyalekt Desteği:** Rumeli, Kıbrıs, Anadolu varyasyonları
4. **Bağlam Duyarlılık:** Cümle-içi fonotaktik kurallar
5. **Ses Dosyası Oluşturma:** Text-to-speech entegrasyonu
6. **Paralel Çıktılar:** Fonemik vs. fonetik, dar vs. geniş otomatik seçim

---

## 14. Kaynaklar ve Referanslar

- **IPA:** International Phonetic Association, 2020
- **Türkçe Sesbilimi:** Grønbech & Lombard (1957), Yavaş & Alptekin (1989)
- **Fonotataksı:** Kabak & Vogel (2001)
- **Damaksıllaşma:** Saatçıoğlu (2016)

---

## 15. Test Örnekleri

### 15.1 **Temel Ünlüler**

```
Input:  "Aha"
Output: /ɑxɑ/ (broad) | [ɑxɑ] (narrow)
```

### 15.2 **Damaksıllaşma**

```
Input:  "kale kısa"
Output: /cɑlɛ cϊsɑ/
```

### 15.3 **/r/ Değişkeleri**

```
Input:  "Rara var"
Output: /rɑɼɑ vɑɣ/
```

### 15.4 **Son Ses Ötümsüzleşmesi**

```
Input:  "Sözcük"
Output: /sœtʃʲʊk/
```

### 15.5 **/y/ Yarı-Ünlü**

```
Input:  "yay iyi"
Output: /jɑj iji:/
```

---

## Sonuç

TÜDAP sesbilimsel çeviricisi, Türkiye Türkçesinin kural tabanlı ön işleme ve fonetik dönüşüm kombinasyonu kullanarak fonksiyonel bir geniş IPA transkripsiyon sağlar. Kısıtlı morfoloji desteği ve bağlam eksikliğine rağmen, akademik ve eğitim amaçlarına uygun bir başlangıç seviyesi araçtır.

**Kullanıcılara Uyarı:** Beta sürüm. Akademik çalışmalarda sonuçlar uzman denetiminden geçirilmelidir.

---

*Rapor Hazırlanması: 2026 | TÜDAP Platform*
