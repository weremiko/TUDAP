"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

type Ticket = {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  institution: string
  verifyUrl: string
}

type QrCodeApi = { toDataURL: (text: string, options?: Record<string, unknown>) => Promise<string> }

declare global {
  interface Window { QRCode?: QrCodeApi }
}

function loadQrLibrary() {
  if (window.QRCode) return Promise.resolve(window.QRCode)
  return new Promise<QrCodeApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-keynote-qr]')
    const script = existing ?? document.createElement("script")
    const onLoad = () => window.QRCode ? resolve(window.QRCode) : reject(new Error("QR kütüphanesi yüklenemedi."))
    script.addEventListener("load", onLoad, { once: true })
    script.addEventListener("error", () => reject(new Error("QR kütüphanesi yüklenemedi.")), { once: true })
    if (!existing) {
      script.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js"
      script.dataset.keynoteQr = "true"
      document.head.appendChild(script)
    }
  })
}

export function KeynoteSite() {
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
  const ticketCard = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialog = privacyDialog.current
    if (!dialog) return
    if (privacyOpen && !dialog.open) dialog.showModal()
    if (!privacyOpen && dialog.open) dialog.close()
  }, [privacyOpen])

  useEffect(() => {
    fetch("/keynote-poster.b64")
      .then((response) => response.ok ? response.text() : Promise.reject(new Error("Poster yüklenemedi.")))
      .then((encoded) => setPosterImage(`data:image/jpeg;base64,${encoded.replace(/\s/g, "")}`))
      .catch(() => setPosterImage(""))
  }, [])

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
      const qrApi = await loadQrLibrary()
      const response = await fetch("/api/keynote/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, institution, department, role, consent, website }),
      })
      const result = await response.json() as { ticket?: Ticket; error?: string }
      if (!response.ok || !result.ticket) throw new Error(result.error || "Kayıt oluşturulamadı.")

      const qrData = await qrApi.toDataURL(result.ticket.verifyUrl, { errorCorrectionLevel: "H", margin: 1, width: 360 })
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
    const gradient = context.createLinearGradient(0, 0, 1100, 860)
    gradient.addColorStop(0, "#25082c")
    gradient.addColorStop(.6, "#19142e")
    gradient.addColorStop(1, "#363458")
    context.fillStyle = gradient
    context.fillRect(0, 0, 1600, 690)
    context.fillStyle = "#d8d5e4"
    context.font = "23px monospace"
    context.fillText("TÜDAP / OFFICIAL ACCESS PASS", 60, 80)
    context.textAlign = "right"
    context.fillText("15 DEC 2026", 1540, 80)
    context.textAlign = "left"
    context.fillStyle = "white"
    context.font = "bold 136px Arial"
    context.fillText("KEYNOTE", 50, 245)
    context.fillStyle = "#d7fa63"
    context.font = "bold 80px Arial"
    context.fillText("’26", 820, 245)
    context.fillStyle = "#d7d4e6"
    context.font = "25px monospace"
    context.fillText("TÜDAP LANSMANI", 62, 300)
    context.fillStyle = "#aaa8c3"
    context.font = "18px monospace"
    context.fillText("KATILIMCI / ATTENDEE", 62, 465)
    context.fillStyle = "white"
    context.font = "bold 53px Arial"
    context.fillText(`${ticket.firstName} ${ticket.lastName}`.slice(0, 43), 60, 532)
    context.fillStyle = "#c6c4d2"
    context.font = "24px Arial"
    context.fillText(`${ticket.department} / ${ticket.institution}`.slice(0, 80), 62, 584)
    context.fillStyle = "#f7f6f2"
    context.fillRect(0, 690, 1600, 170)
    context.fillStyle = "#15151a"
    context.font = "bold 70px Arial"
    context.fillText("15", 62, 777)
    context.font = "24px monospace"
    context.fillText("ARALIK / DECEMBER", 165, 766)
    context.font = "20px monospace"
    context.fillText("KÖYCEĞİZ, MERKEZ KÜTÜPHANE", 165, 802)
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

  const markTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.innerWidth < 700 || !ticketCard.current) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2
    ticketCard.current.style.setProperty("--tiltx", `${-y * 7}deg`)
    ticketCard.current.style.setProperty("--tilty", `${x * 9}deg`)
  }

  return (
    <div className="kn-page">
      <header className="kn-nav">
        <a href="#top" className="kn-brand" aria-label="KEYNOTE 26 ana sayfa">
          <span className="kn-brand-mark">K<span>.</span></span>
          <span className="kn-brand-caption">KEYNOTE <b>26</b><small>TÜDAP LANSMANI</small></span>
        </a>
        <nav className="kn-nav-links">
          <a className="kn-nav-link" href="#about">ETKİNLİK HAKKINDA</a>
          <span className="kn-nav-rule" />
          <a className="kn-nav-cta" href="#register">YERİNİ AYIRT <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main className="kn-main" id="top">
        <section className="kn-hero">
          <div className="kn-scene" aria-hidden="true"><div className="kn-prism"><div className="kn-prism-core" /><div className="kn-prism-flare" /><div className="kn-prism-edge" /></div></div>
          <div className="kn-hero-copy">
            <div className="kn-eyebrow"><span className="kn-dot" /> TÜRKÇE DİLBİLİM ARAŞTIRMA PLATFORMU SUNAR <span className="kn-eyebrow-line" /> 001 / 026</div>
            <h1>Bir dil.<br /><em>Sonsuz</em><br /> olasılık.</h1>
            <p className="kn-hero-sub">Dilbilimde dijital gelecek <span>kuruluyor.</span> Yeni bir düşünce biçimine, yeni bir başlangıca tanıklık et.</p>
            <div className="kn-hero-actions">
              <a href="#register" className="kn-primary">ETKİNLİĞE KAYIT OL <span>↗</span></a>
              <a href="#about" className="kn-text-link">ETKİNLİĞİ KEŞFET <span>↓</span></a>
            </div>
          </div>
          <div className="kn-hero-side"><span>KEYNOTE / 2026</span><span>15.12.2026 — KONYA, TR</span></div>
          <div className="kn-hero-bottom">
            <div className="kn-hero-bottom-left"><span className="kn-section-index">01 / LANSMAN</span><div>15 ARALIK 2026 <span>/</span> KÖYCEĞİZ, MERKEZ KÜTÜPHANE</div></div>
            <div className="kn-scroll-cue">KAYDIRARAK KEŞFET <span>↓</span></div>
          </div>
        </section>

        <section className="kn-section" id="about">
          <div className="kn-section-top"><span>01 / MANİFESTO</span><span>GELENEKTEN GELECEĞE</span></div>
          <div className="kn-intro-grid">
            <h2>Bir lansmandan<br /><span>çok daha fazlası.</span></h2>
            <div className="kn-intro-copy">
              <p>Dil değişir. Teknoloji gelişir. Düşünce sınırlarını aşar. <strong>KEYNOTE’26</strong>, Türkçe Dilbilim Araştırma Platformu’nun yeni dönemine açılan kapı.</p>
              <p>Dilbilimin geleceğine dair merakın, fikirlerin ve yeni bağlantıların aynı salonda buluştuğu bir başlangıç.</p>
              <a href="https://dilbilim.org.tr" target="_blank" rel="noopener noreferrer" className="kn-external">TÜDAP’I KEŞFET <span>↗</span></a>
            </div>
          </div>
          <div className="kn-statement"><div className="kn-statement-glow" /><span>LANGUAGE IS THE INTERFACE.</span><strong>GELECEK<br />ŞİMDİ BAŞLIYOR<span className="kn-acid">.</span></strong></div>
        </section>

        <section className="kn-section kn-details">
          <div className="kn-section-top"><span>02 / DETAYLAR</span><span>TEK GÜN. YENİ BİR BAŞLANGIÇ.</span></div>
          <div className="kn-detail-grid">
            <article className="kn-detail"><span className="kn-detail-num">[ 01 ]</span><span className="kn-detail-heading">TARİH</span><strong>15<span className="kn-detail-unit">/12</span><span className="kn-detail-year">2026</span></strong><p>Salı, 15 Aralık</p></article>
            <article className="kn-detail"><span className="kn-detail-num">[ 02 ]</span><span className="kn-detail-heading">KONUM</span><strong className="kn-detail-location">Köyceğiz<br />Merkez<br />Kütüphane</strong><p>Necmettin Erbakan Üniversitesi · Konya</p></article>
            <article className="kn-detail"><span className="kn-detail-num">[ 03 ]</span><span className="kn-detail-heading">KATILIM</span><strong className="kn-detail-access">KAYIT<span className="kn-acid">↗</span></strong><p>Kayıt sonrasında kişiye özel dijital bilet</p></article>
          </div>
          <div className="kn-poster-row">
            <div><span className="kn-label">KEYNOTE’26 / TÜDAP</span><h3>Kimliğimiz.<br />Ortak geleceğimiz.</h3><p>KEYNOTE’26, TÜDAP’ın dijital geleceğe attığı yeni adımın buluşma noktası.</p></div>
            <div className="kn-poster-frame">{posterImage ? <img src={posterImage} alt="KEYNOTE’26 TÜDAP lansman etkinliği afişi" /> : <div className="kn-prism" aria-hidden="true"><div className="kn-prism-core" /><div className="kn-prism-flare" /><div className="kn-prism-edge" /></div>}<span>OFFICIAL VISUAL / 2026</span></div>
          </div>
        </section>

        <section className="kn-register" id="register">
          <div className="kn-register-head">
            <div><span className="kn-label"><span className="kn-dot" /> 03 / KATILIM</span><h2>Gelecekte<br /><i>yerini al.</i></h2></div>
            <div className="kn-register-note"><span>15 ARALIK / 2026</span><p>Bilgilerini doldur, sana özel dijital biletini anında oluştur.</p></div>
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
              <div className="kn-ticket-stage" onPointerMove={markTilt}>
                <div className="kn-ticket" ref={ticketCard}>
                  <div className="kn-ticket-main"><div className="kn-ticket-kicker"><span>TÜDAP / 2026</span><span>ACCESS PASS <span className="kn-ticket-kicker-star">✳</span></span></div><div className="kn-ticket-title">KEYNOTE<span>’26</span></div><div className="kn-ticket-wave" /><div className="kn-ticket-meta"><span>LANSMAN ETKİNLİĞİ</span><span>15.12.2026</span></div><div className="kn-ticket-attendee"><small>KATILIMCI / ATTENDEE</small><strong>{previewName}</strong><span>{previewDetails}</span></div></div>
                  <div className="kn-ticket-stub"><div className="kn-ticket-stub-left"><span className="kn-stub-caption">GİRİŞ BİLETİ / ADMIT ONE</span><strong className="kn-ticket-date">15<span>ARA</span></strong><span>KÖYCEĞİZ<br />MERKEZ KÜTÜPHANE</span></div><div className="kn-qr">{qr ? <img src={qr} alt="Bilet doğrulama QR kodu" /> : <span aria-hidden="true">✳</span>}</div></div>
                  <div className="kn-ticket-id">NO. {ticket?.id ?? "— — — — — —"}</div>
                </div>
              </div>
              <div className="kn-explainer"><span className="kn-explainer-icon">✳</span><p>Her bilet kişiye özeldir. Kayıt tamamlandığında benzersiz QR kodun ve bilet numaran oluşturulur.</p></div>
            </div>
          </div>

          {ticket && <div className="kn-success" aria-live="polite"><span className="kn-label"><span className="kn-dot" /> KAYDIN BAŞARIYLA ALINDI</span><h3>Görüşmek<br />üzere<span>!</span></h3><p>Kişisel giriş biletin hazır. Biletini indirip etkinlik günü girişte QR kodunu gösterebilirsin.</p><div className="kn-success-actions"><button type="button" className="kn-primary" onClick={downloadTicket}>BİLETİ PNG OLARAK İNDİR <span>↓</span></button><button type="button" className="kn-secondary" onClick={() => window.print()}>YAZDIR / PDF KAYDET ↗</button></div><div className="kn-ticket-reference"><span>BİLET NUMARAN</span><strong>{ticket.id}</strong></div><a className="kn-verify-link" href={ticket.verifyUrl} target="_blank" rel="noopener noreferrer">BİLET DOĞRULAMA SAYFASI ↗</a></div>}
        </section>

        <section className="kn-closing"><span>GELECEK BİRLİKTE YAZILIR.</span><div>SEE YOU<br />AT <em>KEYNOTE.</em></div><a href="#top" aria-label="Yukarı çık">↑</a></section>
      </main>

      <footer className="kn-footer"><div className="kn-footer-mark">KEYNOTE<span>’26</span></div><div className="kn-footer-links"><Link href="/" target="_top">DİLBİLİM.ORG.TR ↗</Link><a href="https://www.instagram.com/tudaporg/" target="_blank" rel="noopener noreferrer">INSTAGRAM ↗</a><button type="button" onClick={() => setPrivacyOpen(true)}>GİZLİLİK / KVKK</button></div><div className="kn-footer-bottom"><span>© 2026 TÜDAP</span><span>DESIGNED FOR WHAT’S NEXT.</span></div></footer>

      <dialog className="kn-dialog" ref={privacyDialog} onClose={() => setPrivacyOpen(false)}>
        <button type="button" className="kn-dialog-close" aria-label="Kapat" onClick={() => setPrivacyOpen(false)}>×</button>
        <span className="kn-label">AYDINLATMA / BİLGİLENDİRME</span>
        <h2>Kişisel verilerin kullanımı</h2>
        <p>Ad, soyad, e-posta, kurum, bölüm ve katılımcı türü bilgileriniz KEYNOTE’26 etkinlik kaydını oluşturmak, size özel giriş bileti hazırlamak ve etkinlik girişini doğrulamak amacıyla işlenir. Kayıt sırasında bu bildirime verdiğiniz onay, zaman bilgisi ve bildirim sürümüyle birlikte saklanır. Bilet doğrulama QR kodu tarayıcınızda üretilir; bunun için jsDelivr üzerinden QR kütüphanesi yüklenir, bilet bağlantısı QR sağlayıcısına gönderilmez. Bilet bilgileri etkinlik girişinde doğrulanabilir. Bilgilerin saklama süresi, veri sorumlusu bilgisi ve ilgili kişi başvuru kanalları etkinlik organizatörü tarafından yayın öncesinde doğrulanmalıdır. Sorularınız için <a href="mailto:iletisim@dilbilim.org.tr">iletisim@dilbilim.org.tr</a> adresine yazabilirsiniz. Ayrıntılar için TÜDAP’ın <Link href="/gizlilik-politikasi" target="_top">Gizlilik Politikası</Link> sayfasını inceleyin.</p>
        <button type="button" className="kn-modal-ok" onClick={() => setPrivacyOpen(false)}>ANLADIM</button>
      </dialog>
    </div>
  )
}
