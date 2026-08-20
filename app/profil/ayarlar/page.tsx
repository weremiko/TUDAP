'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateProfile } from '@/app/actions/profile'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSession } from '@/lib/auth-client'
import { ArrowLeft, Save } from 'lucide-react'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [name, setName] = useState(session?.user?.name ?? '')
  const [image, setImage] = useState((session?.user as { image?: string | null } | undefined)?.image ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!session?.user) return
    setName(session.user.name)
    setImage((session.user as { image?: string | null }).image ?? '')
  }, [session?.user])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await updateProfile({ name, image })
      setMessage('Profil bilgileriniz güncellendi.')
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Profil güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  if (!session?.user) {
    return <main className="min-h-svh bg-background" />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto max-w-2xl px-4 py-12 flex-1">
        <Link href="/profil" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />Profile dön
        </Link>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Hesap</p>
          <h1 className="text-3xl font-serif font-bold text-foreground mt-2">Profil Ayarları</h1>
          <p className="text-sm text-muted-foreground mt-2">Görünen adınızı ve profil görseli bağlantınızı yönetin.</p>
        </div>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" value={session.user.email} disabled />
              <p className="text-xs text-muted-foreground">E-posta adresi hesap kimliğidir ve bu ekrandan değiştirilemez.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Profil görseli URL’si</Label>
              <Input id="image" type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://…" maxLength={500} />
            </div>
            {message && <p className="text-sm text-primary" role="status">{message}</p>}
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />{saving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
      <SiteFooter />
    </div>
  )
}
