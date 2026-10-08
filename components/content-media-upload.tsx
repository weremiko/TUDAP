"use client"

import { useId, useState } from "react"
import { uploadPresigned } from "@vercel/blob/client"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MEDIA_UPLOAD_RULES, type ContentType, formatFileSize } from "@/lib/content-media"

type UploadableContentType = Exclude<ContentType, "article">

export function ContentMediaUpload({
  contentType,
  mediaUrl,
  onMediaUrlChange,
  onUploadingChange,
}: {
  contentType: UploadableContentType
  mediaUrl: string
  onMediaUrlChange: (url: string) => void
  onUploadingChange: (uploading: boolean) => void
}) {
  const inputId = useId()
  const rules = MEDIA_UPLOAD_RULES[contentType]
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)

    if (!rules.contentTypes.includes(file.type)) {
      setError("Bu dosya türü desteklenmiyor.")
      event.target.value = ""
      return
    }
    if (file.size > rules.maxSize) {
      setError(`Dosya en fazla ${formatFileSize(rules.maxSize)} olabilir.`)
      event.target.value = ""
      return
    }

    const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9.-]+/g, "-").replace(/-+/g, "-").slice(-100) || "media"
    setUploading(true)
    onUploadingChange(true)
    setProgress(0)
    try {
      const blob = await uploadPresigned(`content/${Date.now()}-${safeName}`, file, {
        access: "private",
        handleUploadUrl: "/api/content-upload",
        clientPayload: JSON.stringify({ contentType }),
        multipart: file.size > 5 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      })
      onMediaUrlChange(blob.pathname)
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Dosya yüklenemedi."
      const lowerMessage = message.toLowerCase()
      setError(lowerMessage.includes("token") || lowerMessage.includes("presigned url")
        ? "Private Blob bağlantısı eksik. Vercel projesine bu store'u bağlayıp BLOB_STORE_ID, VERCEL_OIDC_TOKEN ve BLOB_WEBHOOK_PUBLIC_KEY değişkenlerini etkinleştirin."
        : message)
    } finally {
      setUploading(false)
      onUploadingChange(false)
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        {contentType === "video" ? "Video dosyası" : contentType === "slides" ? "Slayt dosyası (PDF)" : contentType === "audio" ? "Podcast dosyası" : "Belge dosyası (PDF)"}
      </label>
      <Input id={inputId} type="file" accept={rules.accept} onChange={uploadFile} disabled={uploading} aria-describedby={`${inputId}-help`} />
      <p id={`${inputId}-help`} className="text-xs text-muted-foreground">
        En fazla {formatFileSize(rules.maxSize)}. Dosya doğrudan güvenli depolamaya yüklenir.
      </p>
      {uploading && (
        <div className="space-y-1" role="status" aria-live="polite">
          <div className="h-1.5 overflow-hidden rounded bg-muted" role="progressbar" aria-label="Yükleme ilerlemesi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">Yükleniyor %{progress}</p>
        </div>
      )}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {mediaUrl && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
          <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 shrink-0 text-emerald-600" />Dosya yüklendi; kaydedince içerikle ilişkilendirilir.</span>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onMediaUrlChange("")} aria-label="Yüklenen dosyayı kaldır" disabled={uploading}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}