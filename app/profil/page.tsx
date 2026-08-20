import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { queryLogs } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { ensureProfileColumns, getFollowSummary } from '@/app/actions/profile'
import { ensureQueryRateColumns } from '@/app/actions/logs'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Settings, Mail, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Profil — TÜDAP',
  robots: { index: false },
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  await Promise.all([ensureProfileColumns(), ensureQueryRateColumns()])

  const [[profile], [{ transcriptionCount }], followSummary] = await Promise.all([
    db.select({ name: user.name, email: user.email, image: user.image, role: user.role, institution: user.institution, bio: user.bio, profileVisibility: user.profileVisibility, createdAt: user.createdAt })
      .from(user).where(eq(user.id, session.user.id)).limit(1),
    db.select({ transcriptionCount: count() }).from(queryLogs).where(eq(queryLogs.userId, session.user.id)),
    getFollowSummary(session.user.id),
  ])

  if (!profile) redirect('/sign-in')

  const initials = profile.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-12 flex-1">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-medium">Hesap</p>
            <h1 className="text-3xl font-serif font-bold text-foreground mt-2">Profilim</h1>
            <p className="text-sm text-muted-foreground mt-2">Hesap bilgilerinizi ve üyelik durumunuzu görüntüleyin.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
            <Link href="/profil/ayarlar"><Settings className="h-4 w-4" />Ayarlar</Link>
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.image ?? undefined} alt={profile.name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          {profile.bio && <p className="pt-6 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}
          <dl className="grid gap-5 sm:grid-cols-2 pt-6">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">E-posta</dt><dd className="text-sm text-foreground mt-1">{profile.email}</dd></div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Hesap türü</dt><dd className="text-sm text-foreground mt-1">{profile.role === 'user' ? 'Üye' : profile.role}</dd></div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Üyelik</dt><dd className="text-sm text-foreground mt-1">{profile.createdAt.toLocaleDateString('tr-TR')}</dd></div>
            </div>
            {profile.institution && <div className="flex items-start gap-3 sm:col-span-2"><Mail className="h-4 w-4 text-muted-foreground mt-0.5" /><div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Kurum</dt><dd className="text-sm text-foreground mt-1">{profile.institution}</dd></div></div>}
          </dl>
          <div className="mt-6 border-t border-border pt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Transkripsiyon kullanımı</p>
            <p className="text-2xl font-semibold text-foreground mt-2">{transcriptionCount.toLocaleString('tr-TR')}</p>
            <p className="text-xs text-muted-foreground mt-1">Bu hesapla oluşturulan kayıtlı çalışma</p>
          </div>
          <div className="mt-6 flex gap-8 border-t border-border pt-6 text-sm">
            <span><strong className="text-foreground">{followSummary.followers}</strong> <span className="text-muted-foreground">takipçi</span></span>
            <span><strong className="text-foreground">{followSummary.following}</strong> <span className="text-muted-foreground">takip</span></span>
          </div>
          {profile.profileVisibility && <p className="mt-5 text-xs text-muted-foreground">Herkese açık profil: <Link href={`/profil/${session.user.id}`} className="text-primary hover:underline">Profil bağlantısını görüntüle</Link></p>}
        </Card>
      </main>
      <SiteFooter />
    </div>
  )
}
