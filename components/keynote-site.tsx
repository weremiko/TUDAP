"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import qrcode from "qrcode-generator"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

type Ticket = {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  institution: string
  verifyUrl: string
}

type KeynoteHero = {
  eyebrow: string
  title: string
  description: string
  date: string
  location: string
  posterUrl: string
}

export function KeynoteSite({ hero }: { hero: KeynoteHero }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [institution, setInstitution] = useState("")
  const [department, setDepartment] = useState("")
  const [role, setRole] = useState("")
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState("")
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [qr, setQr] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoveryMessage, setRecoveryMessage] = useState("")
  const [saveMessage, setSaveMessage] = useState("")
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const privacyDialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = privacyDialog.current
    if (!dialog) return
    if (privacyOpen && !dialog.open) dialog.showModal()
    if (!privacyOpen && dialog.open) dialog.close()
  }, [privacyOpen])

  const previewName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || "AD SOYAD"
  const previewDetails = [department.trim(), institution.trim()].filter(Boolean).join(" / ") || "BÖLÜM / KURUM"

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    const form = event.currentTarget
    if (!form.reportValidity()) {
      setError("Lütfen gerekli alanları eksiksiz doldur ve aydınlatma onayını işaretle.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/keynote/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, institution, department, role, consent, website }),
      })
      const result = await response.json() as { ticket?: Ticket; error?: string }
      if (!response.ok || !result.ticket) throw new Error(result.error || "Kayıt oluşturulamadı.")

      const code = qrcode(0, "H")
      code.addData(result.ticket.verifyUrl)
      code.make()
      const qrData = code.createDataURL(8, 4)
      setTicket(result.ticket)
      setQr(qrData)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Bağlantı hatası. Lütfen yeniden deneyin.")
    } finally {
      setLoading(false)
    }
  }

  const downloadTicket = async () => {
    if (!ticket || !qr) return
    const canvas = document.createElement("canvas")
    canvas.width = 1800
    canvas.height = 1050
    const context = canvas.getContext("2d")
    if (!context) return
    const drawWrapped = (value: string, x: number, y: number, maxWidth: number, lineHeight: number, fontSize: number, color: string, maxLines = 2) => {
      context.font = `${fontSize}px Arial, sans-serif`
      context.fillStyle = color
      const words = value.trim().split(/\s+/)
      const lines: string[] = []
      let line = ""
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word
        if (context.measureText(candidate).width > maxWidth && line) {
          lines.push(line)
          line = word
        } else line = candidate
      }
      if (line) lines.push(line)
      const visibleLines = lines.slice(0, maxLines)
      if (lines.length > maxLines) {
        let last = visibleLines[maxLines - 1]
        while (last && context.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1)
        visibleLines[maxLines - 1] = `${last.trimEnd()}…`
      }
      visibleLines.forEach((text, index) => context.fillText(text, x, y + index * lineHeight, maxWidth))
      return y + visibleLines.length * lineHeight
    }

    context.fillStyle = "#15355c"
    context.fillRect(0, 0, 1200, 1050)
    context.fillStyle = "#eef3f8"
    context.fillRect(1200, 0, 600, 1050)
    context.fillStyle = "#ffffff"
    context.font = "600 24px Arial, sans-serif"
    context.fillText("TÜDAP  /  DİLBİLİM ARAŞTIRMA PLATFORMU", 76, 82)
    context.textAlign = "right"
    context.fillStyle = "#c5d5e6"
    context.font = "500 22px Arial, sans-serif"
    context.fillText("15 ARALIK 2026", 1120, 82)
    context.textAlign = "left"

    context.fillStyle = "#b8cce1"
    context.font = "700 18px Arial, sans-serif"
    context.fillText("DİJİTAL KATILIM BİLETİ", 76, 190)
    context.fillStyle = "#ffffff"
    context.font = "700 112px Georgia, serif"
    context.fillText("KEYNOTE’26", 70, 315, 1050)
    context.fillStyle = "#9ebde0"
    context.fillRect(78, 350, 1040, 2)

    context.fillStyle = "#b8cce1"
    context.font = "700 17px Arial, sans-serif"
    context.fillText("KATILIMCI", 78, 430)
    const nameBottom = drawWrapped(`${ticket.firstName} ${ticket.lastName}`, 78, 505, 1030, 70, 62, "#ffffff", 2)
    const detailsBottom = drawWrapped(`${ticket.department} · ${ticket.institution}`, 80, nameBottom + 18, 1020, 34, 24, "#dce7f1", 2)
    context.fillStyle = "#b8cce1"
    context.font = "700 17px Arial, sans-serif"
    context.fillText("ETKİNLİK", 78, Math.max(760, detailsBottom + 55))
    context.fillStyle = "#ffffff"
    context.font = "600 28px Arial, sans-serif"
    context.fillText("15 Aralık 2026  ·  Köyceğiz Merkez Kütüphane", 78, Math.max(805, detailsBottom + 100), 1030)
    context.fillStyle = "#b8cce1"
    context.font = "500 18px monospace"
    context.fillText(ticket.id, 78, 990)

    context.fillStyle = "#15355c"
    context.font = "700 20px Arial, sans-serif"
    context.textAlign = "center"
    context.fillText("GİRİŞ QR KODU", 1500, 150)
    const qrImage = new Image()
    qrImage.src = qr
    await qrImage.decode()
    context.fillStyle = "#ffffff"
    context.fillRect(1280, 235, 440, 440)
    context.drawImage(qrImage, 1310, 265, 380, 380)
    context.fillStyle = "#15355c"
    context.font = "700 19px monospace"
    context.fillText("BİLET NUMARASI", 1500, 760)
    context.font = "600 24px monospace"
    context.fillText(ticket.id, 1500, 802)
    context.fillStyle = "#4b5c6e"
    context.font = "18px Arial, sans-serif"
    context.fillText("QR kodu girişte görevliye gösterin.", 1500, 875)
    context.textAlign = "left"
    const link = document.createElement("a")
    link.download = `KEYNOTE26-${ticket.id}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
    setSaveMessage("Biletiniz indiriliyor. Mobilde indirme klasörünü veya paylaşım listesini kontrol edin.")
  }

  const shareTicket = async () => {
    if (!ticket) return
    if (!navigator.share) {
      await downloadTicket()
      return
    }
    try {
      await navigator.share({
        title: "KEYNOTE’26 dijital bilet",
        text: `${ticket.firstName} ${ticket.lastName} için KEYNOTE’26 bilet bilgileri`,
        url: ticket.verifyUrl,
      })
    } catch (shareError) {
      if (shareError instanceof Error && shareError.name !== "AbortError") {
        setSaveMessage("Paylaşım açılamadı. Bileti indirip kaydedebilirsiniz.")
      }
    }
  }

  const recoverTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRecoveryLoading(true)
    setRecoveryMessage("")
    try {
      const response = await fetch("/api/keynote/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      })
      const result = await response.json() as { message?: string; error?: string; ticket?: Ticket }
      if (!response.ok) throw new Error(result.error || "Geçerli bir e-posta adresi girin.")
      setRecoveryMessage(result.message || "Bu e-posta için eşleşen bir kayıt bulunamadı.")
      if (result.ticket) {
        const code = qrcode(0, "H")
        code.addData(result.ticket.verifyUrl)
        code.make()
        setTicket(result.ticket)
        setQr(code.createDataURL(8, 4))
        setSaveMessage("Biletiniz bulundu ve açıldı.")
        window.requestAnimationFrame(() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" }))
      }
      setRecoveryEmail("")
    } catch (recoveryError) {
      setRecoveryMessage(recoveryError instanceof Error ? recoveryError.message : "İstek gönderilemedi.")
    } finally {
      setRecoveryLoading(false)
    }
  }

  return (
    <div className="kn-page">
      <SiteHeader />

      <main className="kn-main" id="top">
        <section className="kn-hero">
          <div className="kn-hero-copy">
            <div className="kn-eyebrow">{hero.eyebrow} <span className="kn-eyebrow-line" /> {hero.date}</div>
            <h1>{hero.title.split("\n").map((line, index) => <span key={`${index}-${line}`} className={index === 1 ? "kn-title-accent" : undefined}>{line}{index < hero.title.split("\n").length - 1 && <br />}</span>)}</h1>
            <p className="kn-hero-sub">{hero.description} <span>{hero.location}</span></p>
            <div className="kn-hero-actions">
              <a href="#register" className="kn-primary">KAYIT FORMUNA GEÇ <span>↘</span></a>
              <a href="#details" className="kn-text-link">ETKİNLİK BİLGİLERİ <span>↓</span></a>
            </div>
          </div>
        </section>

        <section className="kn-section kn-details" id="details">
          <div className="kn-section-top"><span>ETKİNLİK BİLGİLERİ</span><span>KEYNOTE’26</span></div>
          <div className="kn-detail-grid">
            <article className="kn-detail"><span className="kn-detail-num">01</span><span className="kn-detail-heading">TARİH</span><strong>15<span className="kn-detail-unit"> ARALIK</span></strong><p>2026</p><p>15.00-16.45</p></article>
            <article className="kn-detail"><span className="kn-detail-num">02</span><span className="kn-detail-heading">YER</span><strong className="kn-detail-location">Köyceğiz<br />Merkez Kütüphane</strong><p>Köyceğiz</p></article>
            <article className="kn-detail"><span className="kn-detail-num">03</span><span className="kn-detail-heading">KATILIM</span><strong className="kn-detail-access">Ön kayıt</strong><p>Kayıt tamamlandığında QR biletin oluşturulur.</p></article>
          </div>
          <div className="kn-speaker">
            <div className="kn-speaker-label">DAVETLİ KONUŞMACI / 01</div>
            <h3>Prof. Dr. Jaklin Kornfilt</h3>
            <p>Syracuse University · New York, ABD</p>
            <a href="https://instagram.com/tudaporg" target="_blank" rel="noopener noreferrer">ETKİNLİK DUYURULARINI INSTAGRAM'DA TAKİP ET ↗</a>
          </div>
        </section>

        <section className="kn-register" id="register">
          <div className="kn-register-head">
            <div><span className="kn-label">KATILIM / ÖN KAYIT</span><h2>Etkinliğe<br /><i>kaydol.</i></h2></div>
            <div className="kn-register-note"><span>15 ARALIK 2026</span><p>Bilgilerini doldur. Kişisel QR biletin kayıt tamamlandığında oluşturulacak.</p></div>
          </div>
          <div className={`kn-register-grid ${ticket ? "kn-register-grid--success" : ""}`}>
            <div className="kn-form-panel" hidden={Boolean(ticket)}>
              <div className="kn-panel-title"><span>01 — KATILIMCI BİLGİLERİ</span><span className="kn-secure">15 Aralık, Salı. 15.00</span></div>
              <form className="kn-form" onSubmit={handleSubmit}>
                <div className="kn-form-row">
                  <div className="kn-field"><label htmlFor="kn-first-name">ADIN <b>*</b></label><input id="kn-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Adın" autoComplete="given-name" required minLength={2} maxLength={120} /></div>
                  <div className="kn-field"><label htmlFor="kn-last-name">SOYADIN <b>*</b></label><input id="kn-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Soyadın" autoComplete="family-name" required minLength={2} maxLength={120} /></div>
                </div>
                <div className="kn-field"><label htmlFor="kn-email">E-POSTA ADRESİN <b>*</b></label><input id="kn-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" autoComplete="email" required maxLength={254} /></div>
                <div className="kn-form-row">
                  <div className="kn-field"><label htmlFor="kn-institution">ÜNİVERSİTE / KURUM <b>*</b></label><input id="kn-institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Kurumun" required minLength={2} maxLength={100} /></div>
                  <div className="kn-field"><label htmlFor="kn-department">BÖLÜM <b>*</b></label><input id="kn-department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Bölümün" required minLength={2} maxLength={100} /></div>
                </div>
                <div className="kn-field"><label htmlFor="kn-role">KATILIMCI TÜRÜ <b>*</b></label><div className="kn-select"><select id="kn-role" value={role} onChange={(e) => setRole(e.target.value)} required><option value="" disabled>Katılımcı türünü seç</option><option>Öğrenci</option><option>Akademisyen</option><option>Araştırmacı</option><option>Diğer</option></select><span aria-hidden="true">⌄</span></div></div>
                <div className="kn-honeypot" aria-hidden="true"><label htmlFor="kn-website">Website</label><input id="kn-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
                <div className="kn-consent"><input id="kn-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required aria-label="Kişisel verilerimin etkinlik kaydı ve giriş doğrulaması için kullanılmasını kabul ediyorum" /><span>Bilgilerimin etkinlik kaydı ve giriş doğrulaması için kullanılmasını kabul ediyorum. <button type="button" className="kn-privacy-button" onClick={() => setPrivacyOpen(true)}>Aydınlatma metni</button></span></div>
                <div className="kn-error" role="alert" aria-live="polite">{error}</div>
                <button type="submit" className="kn-submit" disabled={loading}><span>{loading ? "BİLETİN OLUŞTURULUYOR…" : "BİLETİMİ OLUŞTUR"}</span><span aria-hidden="true">↗</span></button>
                <div className="kn-under-submit"><span>↗ DİJİTAL BİLET / ANINDA TESLİM</span><span>KAYIT SONRASI BİLET</span></div>
              </form>
            </div>

            {ticket && <div className="kn-success" aria-live="polite"><span className="kn-label"><span className="kn-dot" /> KAYDIN BAŞARIYLA ALINDI</span><h3>Biletin hazır.</h3><p>İndirip telefonuna veya dosya alanına kaydet. Etkinlikte QR kodu göster.</p><div className="kn-success-actions"><button type="button" className="kn-primary" onClick={downloadTicket}>PNG OLARAK İNDİR <span>↓</span></button><button type="button" className="kn-secondary" onClick={shareTicket}>PAYLAŞ / KAYDET <span>↗</span></button><button type="button" className="kn-secondary" onClick={() => window.print()}>YAZDIR / PDF</button></div>{saveMessage && <p className="kn-save-message" role="status">{saveMessage}</p>}<div className="kn-ticket-reference"><span>BİLET NUMARAN</span><strong>{ticket.id}</strong></div><a className="kn-verify-link" href={ticket.verifyUrl} target="_blank" rel="noopener noreferrer">BİLET DOĞRULAMA SAYFASI ↗</a></div>}

            <div className="kn-ticket-column">
              <div className="kn-preview-top"><span>02 — DİJİTAL BİLETİN</span><span>ÖNİZLEME / CANLI</span></div>
              <div className="kn-ticket-stage">
                <div className="kn-ticket">
                  <div className="kn-ticket-main"><div className="kn-ticket-kicker"><span>TÜDAP / 2026</span><span>GİRİŞ BİLETİ <span className="kn-ticket-kicker-star">●</span></span></div><div className="kn-ticket-title">KEYNOTE<span>’26</span></div><div className="kn-ticket-wave" /><div className="kn-ticket-meta"><span>LANSMAN ETKİNLİĞİ</span><span>15.12.2026</span></div><div className="kn-ticket-attendee"><small>KATILIMCI</small><strong>{previewName}</strong><span>{previewDetails}</span></div></div>
                  <div className="kn-ticket-stub"><div className="kn-ticket-stub-left"><span className="kn-stub-caption">ETKİNLİK GİRİŞİ</span><strong className="kn-ticket-date">15<span>ARA</span></strong><span>KÖYCEĞİZ<br />MERKEZ KÜTÜPHANE</span></div><div className="kn-qr">{qr ? <img src={qr} alt="Bilet doğrulama QR kodu" /> : <span aria-hidden="true">●</span>}</div></div>
                  <div className="kn-ticket-id">NO. {ticket?.id ?? "— — — — — —"}</div>
                </div>
              </div>
              <div className="kn-explainer"><span className="kn-explainer-icon">✳</span><p>Her bilet kişiye özeldir. Kayıt tamamlandığında benzersiz QR kodun ve bilet numaran oluşturulur.</p></div>
            </div>
          </div>


          <div className="kn-recovery">
            <div>
              <span className="kn-label">BİLETİNİ KAYBETTİNİZ Mİ?</span>
              <h3>Tekrar ulaş.</h3>
              <p>KEYNOTE kaydında kullandığınız e-posta adresini girin.</p>
            </div>
            <form onSubmit={recoverTicket}>
              <label htmlFor="kn-recovery-email">E-POSTA ADRESİ</label>
              <div className="kn-recovery-row">
                <input id="kn-recovery-email" type="email" value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} placeholder="ornek@universite.edu.tr" required maxLength={254} />
                <button type="submit" disabled={recoveryLoading}>{recoveryLoading ? "SORGU YAPILIYOR…" : "BİLETİ AÇ"}</button>
              </div>
              {recoveryMessage && <p className="kn-recovery-message" role="status">{recoveryMessage}</p>}
            </form>
          </div>
        </section>

      </main>

      <SiteFooter />

      <dialog className="kn-dialog" ref={privacyDialog} onClose={() => setPrivacyOpen(false)}>
        <button type="button" className="kn-dialog-close" aria-label="Kapat" onClick={() => setPrivacyOpen(false)}>×</button>
        <span className="kn-label">AYDINLATMA / BİLGİLENDİRME</span>
        <h2>Kişisel verilerin kullanımı</h2>
        <p>Ad, soyad, e-posta, kurum, bölüm ve katılımcı türü bilgileriniz KEYNOTE’26 etkinlik kaydını oluşturmak, size özel giriş bileti hazırlamak ve etkinlik girişini doğrulamak amacıyla işlenir. Kayıt sırasında bu bildirime verdiğiniz onay, zaman bilgisi ve bildirim sürümüyle birlikte saklanır. QR kod tarayıcınızda yerel olarak üretilir; bilet bağlantısı üçüncü taraf QR sağlayıcısına gönderilmez. Herkese açık bilet doğrulama sayfası ad, e-posta, kurum veya bölüm bilgilerinizi göstermez. Bilgilerin saklama süresi, veri sorumlusu bilgisi ve ilgili kişi başvuru kanalları etkinlik organizatörü tarafından yayın öncesinde doğrulanmalıdır. Sorularınız için <a href="mailto:iletisim@dilbilim.org.tr">iletisim@dilbilim.org.tr</a> adresine yazabilirsiniz. Ayrıntılar için TÜDAP’ın <Link href="/gizlilik-politikasi" target="_top">Gizlilik Politikası</Link> sayfasını inceleyin.</p>
        <button type="button" className="kn-modal-ok" onClick={() => setPrivacyOpen(false)}>ANLADIM</button>
      </dialog>
    </div>
  )
}
