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
  const [posterImage, setPosterImage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const privacyDialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = privacyDialog.current
    if (!dialog) return
    if (privacyOpen && !dialog.open) dialog.showModal()
    if (!privacyOpen && dialog.open) dialog.close()
  }, [privacyOpen])

  useEffect(() => {
    if (hero.posterUrl.trim()) {
      setPosterImage(hero.posterUrl.trim())
      return
    }
    fetch("/keynote-poster.b64")
      .then((response) => response.ok ? response.text() : Promise.reject(new Error("Poster yüklenemedi.")))
      .then((encoded) => setPosterImage(`data:image/jpeg;base64,${encoded.replace(/\s/g, "")}`))
      .catch(() => setPosterImage(""))
  }, [hero.posterUrl])

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
    canvas.width = 1600
    canvas.height = 860
    const context = canvas.getContext("2d")
    if (!context) return
    context.fillStyle = "#080908"
    context.fillRect(0, 0, 1600, 690)
    context.fillStyle = "#d1d1cb"
    context.font = "23px monospace"
    context.fillText("TÜDAP / KEYNOTE’26", 60, 80)
    context.textAlign = "right"
    context.fillText("15 ARALIK 2026", 1540, 80)
    context.textAlign = "left"
    context.fillStyle = "white"
    context.font = "bold 136px Arial"
    context.fillText("KEYNOTE", 50, 245)
    context.fillStyle = "#a9c8e8"
    context.font = "bold 80px Arial"
    context.fillText("’26", 820, 245)
    context.fillStyle = "#d7d4e6"
    context.font = "25px monospace"
    context.fillText("TÜRKÇE DİLBİLİM ARAŞTIRMA PLATFORMU", 62, 300)
    context.fillStyle = "#aaa8c3"
    context.font = "18px monospace"
    context.fillText("KATILIMCI", 62, 465)
    context.fillStyle = "white"
    context.font = "bold 53px Arial"
    context.fillText(`${ticket.firstName} ${ticket.lastName}`.slice(0, 43), 60, 532)
    context.fillStyle = "#cecec8"
    context.font = "24px Arial"
    context.fillText(`${ticket.department} / ${ticket.institution}`.slice(0, 80), 62, 584)
    context.fillStyle = "#f7f7f4"
    context.fillRect(0, 690, 1600, 170)
    context.fillStyle = "#15151a"
    context.font = "bold 70px Arial"
    context.fillText("15", 62, 777)
    context.font = "24px monospace"
    context.fillText("ARALIK 2026", 165, 766)
    context.font = "20px monospace"
    context.fillText("KÖYCEĞİZ / MERKEZ KÜTÜPHANE", 165, 802)
    context.fillStyle = "#777"
    context.font = "19px monospace"
    context.fillText(ticket.id, 62, 838)
    const qrImage = new Image()
    qrImage.src = qr
    await qrImage.decode()
    context.fillStyle = "white"
    context.fillRect(1330, 570, 230, 230)
    context.drawImage(qrImage, 1340, 580, 210, 210)
    const link = document.createElement("a")
    link.download = `KEYNOTE26-${ticket.id}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="kn-page">
      <SiteHeader />

      <main className="kn-main" id="top">
        <section className="kn-hero">
          <div className="kn-hero-art" aria-hidden="true">{posterImage && <img src={posterImage} alt="" />}</div>
          <div className="kn-hero-copy">
            <div className="kn-eyebrow">{hero.eyebrow} <span className="kn-eyebrow-line" /> {hero.date}</div>
            <h1>{hero.title.split("\n").map((line, index) => <span key={`${index}-${line}`} className={index === 1 ? "kn-title-accent" : undefined}>{line}{index < hero.title.split("\n").length - 1 && <br />}</span>)}</h1>
            <p className="kn-hero-sub">{hero.description} <span>{hero.location}</span></p>
            <div className="kn-hero-actions">
              <a href="#register" className="kn-primary">KAYIT FORMUNA GEÇ <span>↘</span></a>
              <a href="#details" className="kn-text-link">ETKİNLİK BİLGİLERİ <span>↓</span></a>
            </div>
          </div>
          <div className="kn-hero-bottom">
            <div className="kn-hero-bottom-left"><span className="kn-section-index">KEYNOTE’26</span><div>{hero.date} <span>/</span> {hero.location}</div></div>
            <div className="kn-scroll-cue">TÜDAP <span>↘</span></div>
          </div>
        </section>

        <section className="kn-section kn-about" id="about">
          <div className="kn-section-top"><span>ETKİNLİK HAKKINDA</span><span>TÜDAP / 2026</span></div>
          <div className="kn-intro-grid">
            <h2>TÜDAP’ın<br /><span>lansman buluşması.</span></h2>
            <div className="kn-intro-copy">
              <p><strong>KEYNOTE’26</strong>, Türkçe Dilbilim Araştırma Platformu’nun lansman etkinliği.</p>
              <p>Dilbilimde dijital geleceği konuşmak üzere 15 Aralık’ta Köyceğiz Merkez Kütüphane’de buluşuyoruz.</p>
              <a href="https://dilbilim.org.tr" target="_blank" rel="noopener noreferrer" className="kn-external">TÜDAP.ORG.TR <span>↗</span></a>
            </div>
          </div>
        </section>

        <section className="kn-section kn-details" id="details">
          <div className="kn-section-top"><span>ETKİNLİK BİLGİLERİ</span><span>KEYNOTE’26</span></div>
          <div className="kn-detail-grid">
            <article className="kn-detail"><span className="kn-detail-num">01</span><span className="kn-detail-heading">TARİH</span><strong>15<span className="kn-detail-unit"> ARALIK</span></strong><p>2026</p></article>
            <article className="kn-detail"><span className="kn-detail-num">02</span><span className="kn-detail-heading">YER</span><strong className="kn-detail-location">Köyceğiz<br />Merkez Kütüphane</strong><p>Köyceğiz</p></article>
            <article className="kn-detail"><span className="kn-detail-num">03</span><span className="kn-detail-heading">KATILIM</span><strong className="kn-detail-access">Ön kayıt</strong><p>Kayıt tamamlandığında QR biletin oluşturulur.</p></article>
          </div>
        </section>

        <section className="kn-register" id="register">
          <div className="kn-register-head">
            <div><span className="kn-label">KATILIM / ÖN KAYIT</span><h2>Etkinliğe<br /><i>kaydol.</i></h2></div>
            <div className="kn-register-note"><span>15 ARALIK 2026</span><p>Bilgilerini doldur. Kişisel QR biletin kayıt tamamlandığında oluşturulacak.</p></div>
          </div>
          <div className="kn-register-grid">
            <div className="kn-form-panel" hidden={Boolean(ticket)}>
              <div className="kn-panel-title"><span>01 — KATILIMCI BİLGİLERİ</span><span className="kn-secure">● GÜVENLİ KAYIT</span></div>
              <form className="kn-form" onSubmit={handleSubmit}>
                <div className="kn-form-row">
                  <div className="kn-field"><label htmlFor="kn-first-name">ADIN <b>*</b></label><input id="kn-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Adın" autoComplete="given-name" required minLength={2} maxLength={120} /></div>
                  <div className="kn-field"><label htmlFor="kn-last-name">SOYADIN <b>*</b></label><input id="kn-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Soyadın" autoComplete="family-name" required minLength={2} maxLength={120} /></div>
                </div>
                <div className="kn-field"><label htmlFor="kn-email">E-POSTA ADRESİN <b>*</b></label><input id="kn-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@universite.edu.tr" autoComplete="email" required maxLength={254} /></div>
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

          {ticket && <div className="kn-success" aria-live="polite"><span className="kn-label"><span className="kn-dot" /> KAYDIN BAŞARIYLA ALINDI</span><h3>Görüşmek<br />üzere<span>!</span></h3><p>Kişisel giriş biletin hazır. Biletini indirip etkinlik günü girişte QR kodunu gösterebilirsin.</p><div className="kn-success-actions"><button type="button" className="kn-primary" onClick={downloadTicket}>BİLETİ PNG OLARAK İNDİR <span>↓</span></button><button type="button" className="kn-secondary" onClick={() => window.print()}>YAZDIR / PDF KAYDET ↗</button></div><div className="kn-ticket-reference"><span>BİLET NUMARAN</span><strong>{ticket.id}</strong></div><a className="kn-verify-link" href={ticket.verifyUrl} target="_blank" rel="noopener noreferrer">BİLET DOĞRULAMA SAYFASI ↗</a></div>}
        </section>

        <section className="kn-closing"><span>TÜDAP / KEYNOTE’26</span><div>Köyceğiz’de<br /><em>görüşmek üzere.</em></div><a href="#top" aria-label="Yukarı çık">↑</a></section>
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
