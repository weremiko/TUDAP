'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getOwnProfile, updateProfile } from '@/app/actions/profile'
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
  const [institution, setInstitution] = useState('')
  const [bio, setBio] = useState('')
  const [profileVisibility, setProfileVisibility] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!session?.user) return
    getOwnProfile().then((profile) => {
      if (!profile) return
      setName(profile.name)
      setImage(profile.image ?? '')
      setInstitution(profile.institution ?? '')
      setBio(profile.bio ?? '')
      setProfileVisibility(profile.profileVisibility)
    }).catch(() => setError('Profil bilgileri yüklenemedi.'))
  }, [session?.user])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await updateProfile({ name, image, institution, bio, profileVisibility })
      setMessage('Profil bilgileriniz güncellendi.')
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Profil güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir görsel dosyası seçin.')
      return
    }
    if (file.size > 1_500_000) {
      setError('Profil fotoğrafı 1,5 MB’dan küçük olmalıdır.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
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
              <Label htmlFor="photo">Profil fotoğrafı</Label>
              <Input id="photo" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handlePhotoChange} className="h-auto py-2" />
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP veya GIF; en fazla 1,5 MB.</p>
              {image && <button type="button" onClick={() => setImage('')} className="text-xs text-destructive hover:underline">Fotoğrafı kaldır</button>}
              <Label htmlFor="image" className="sr-only">Profil görseli URL’si</Label>
              <Input id="image" type="url" value={image.startsWith('data:') ? '' : image} onChange={(event) => setImage(event.target.value)} placeholder="İsterseniz görsel URL’si kullanın" maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Kurum / Üniversite</Label>
              <Input id="institution" value={institution} onChange={(event) => setInstitution(event.target.value)} maxLength={120} placeholder="Örn. Ankara Üniversitesi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Kısa biyografi</Label>
              <textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} rows={4} placeholder="Kendinizden kısaca bahsedin…" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <p className="text-xs text-muted-foreground text-right">{bio.length} / 500</p>
            </div>
            <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
              <input type="checkbox" checked={profileVisibility} onChange={(event) => setProfileVisibility(event.target.checked)} className="mt-0.5" />
              <span><span className="block font-medium text-foreground">Profilimi görünür yap</span><span className="text-xs text-muted-foreground">Bu tercih ileride herkese açık profil kartlarında kullanılabilir.</span></span>
            </label>
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
