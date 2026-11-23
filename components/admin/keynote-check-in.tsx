"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, CameraOff, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>
}

type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorLike

function parseTicketUrl(value: string) {
  try {
    const url = new URL(value.trim())
    if (url.origin !== window.location.origin) return null
    const match = url.pathname.match(/^\/keynote\/verify\/(KN26-[A-F0-9]{10})$/i)
    const signature = url.searchParams.get("sig")
    if (!match || !signature || !/^[a-f0-9]{32}$/i.test(signature)) return null
    return { id: match[1], sig: signature }
  } catch {
    return null
  }
}

export function KeynoteCheckIn() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)
  const busyRef = useRef(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [ticketUrl, setTicketUrl] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const stopCamera = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
  }

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
  }, [])

  const checkIn = async (value: string): Promise<boolean> => {
    if (busyRef.current) return false
    const ticket = parseTicketUrl(value)
    if (!ticket) {
      setError("Geçerli KEYNOTE bilet QR kodu okutun veya doğrulama bağlantısını girin.")
      return false
    }

    busyRef.current = true
    setError("")
    setMessage("")
    try {
      const response = await fetch("/api/keynote/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
      })
      const result = await response.json() as { success?: boolean; ticket?: { id?: string }; error?: string }
      if (!response.ok || !result.success) throw new Error(result.error || "Giriş doğrulanamadı.")
      setMessage(`Giriş onaylandı · ${result.ticket?.id ?? ticket.id}`)
      setTicketUrl("")
      stopCamera()
      return true
    } catch (checkInError) {
      setError(checkInError instanceof Error ? checkInError.message : "Giriş doğrulanamadı.")
      stopCamera()
      return false
    } finally {
      busyRef.current = false
    }
  }

  const startCamera = async () => {
    setError("")
    setMessage("")
    const Detector = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
    if (!Detector) {
      setError("Bu tarayıcıda kamera QR taraması desteklenmiyor. Bilet bağlantısını aşağıya girin.")
      return
    }

    try {
      const detector = new Detector({ formats: ["qr_code"] })
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      streamRef.current = stream
      if (!videoRef.current) throw new Error("Kamera görüntüsü açılamadı.")
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCameraActive(true)

      const scan = async () => {
        const video = videoRef.current
        if (!video || !streamRef.current) return
        try {
          const [barcode] = await detector.detect(video)
          if (barcode?.rawValue) {
            setTicketUrl(barcode.rawValue)
            const checkedIn = await checkIn(barcode.rawValue)
            if (!checkedIn) stopCamera()
            return
          }
        } catch {
          setError("QR kod okunamadı. Görüntüyü sabit tutup yeniden deneyin.")
        }
        if (streamRef.current) frameRef.current = requestAnimationFrame(() => { void scan() })
      }
      void scan()
    } catch {
      stopCamera()
      setError("Kamera açılamadı. İzinleri kontrol edin veya bilet bağlantısını elle girin.")
    }
  }

  return (
    <Card className="space-y-4 p-5">
      <div>
        <h2 className="font-serif text-lg font-semibold">Katılımcı girişi</h2>
        <p className="mt-1 text-sm text-muted-foreground">Bilet QR kodunu kamerayla okutun veya doğrulama bağlantısını girin.</p>
      </div>
      {cameraActive && <video ref={videoRef} className="aspect-video max-h-80 w-full rounded-md bg-black object-cover" muted playsInline aria-label="Bilet QR tarama kamerası" />}
      {!cameraActive && <video ref={videoRef} className="hidden" muted playsInline aria-hidden="true" />}
      <div className="flex flex-wrap gap-2">
        {cameraActive ? (
          <Button type="button" variant="outline" onClick={stopCamera} className="gap-2"><CameraOff className="size-4" />Kamerayı kapat</Button>
        ) : (
          <Button type="button" onClick={startCamera} className="gap-2"><Camera className="size-4" />Kamerayla tara</Button>
        )}
      </div>
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); void checkIn(ticketUrl) }}>
        <Input value={ticketUrl} onChange={(event) => setTicketUrl(event.target.value)} placeholder="Bilet doğrulama bağlantısı" aria-label="Bilet doğrulama bağlantısı" />
        <Button type="submit" variant="outline" disabled={!ticketUrl.trim()}>Girişi doğrula</Button>
      </form>
      {message && <p className="flex items-center gap-2 text-sm text-emerald-700" role="status"><CheckCircle2 className="size-4" />{message}</p>}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </Card>
  )
}