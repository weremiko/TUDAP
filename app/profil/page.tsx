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
import { Settings, Mail, Shield, Building2, CalendarDays, Sparkles, Users, FileText, Copy, BadgeCheck, PenLine } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Profil — TÜDAP',
  robots: { index: false },
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  await Promise.all([ensureProfileColumns(), ensureQueryRateColumns()])

  const [[profile], [{ transcriptionCount }], followSummary] = await Promise.all([
    db.select({ name: user.name, email: user.email, image: user.image, role: user.role, points: user.points, institution: user.institution, bio: user.bio, createdAt: user.createdAt })
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
      <main className="container mx-auto max-w-5xl px-4 py-10 md:py-14 flex-1">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium">Hesap merkezi</p>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2">Profilim</h1>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
            <Link href="/profil/ayarlar"><Settings className="h-4 w-4" />Profili düzenle</Link>
          </Button>
        </div>

        <section className="border-y border-border py-7 md:py-9">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 md:gap-7">
            <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background ring-1 ring-border">
              <AvatarImage src={profile.image ?? undefined} alt={profile.name} />
              <AvatarFallback className="text-2xl font-serif">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground flex items-center gap-2">{profile.name}{(profile.blueVerified || profile.email.toLowerCase().endsWith('.edu.tr')) && <BadgeCheck className="h-5 w-5 text-primary" aria-label="Doğrulanmış profil" />}</h2>
                <span className="text-[10px] uppercase tracking-widest border border-accent/30 text-accent px-2 py-1 rounded-full">{profile.role === 'user' ? 'Üye' : profile.role}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
              {profile.institution && <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-3"><Building2 className="h-3.5 w-3.5" />{profile.institution}</p>}
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-2 self-start sm:self-center"><Link href={`/profil/${session.user.id}`}><Copy className="h-3.5 w-3.5" />Genel profil</Link></Button>
          </div>
          <div className="grid grid-cols-3 max-w-xl mt-8 border-t border-border pt-5">
            <div><p className="text-xl font-semibold text-foreground">{followSummary.followers}</p><p className="text-xs text-muted-foreground mt-1">Takipçi</p></div>
            <div><p className="text-xl font-semibold text-foreground">{followSummary.following}</p><p className="text-xs text-muted-foreground mt-1">Takip</p></div>
            <div><p className="text-xl font-semibold text-foreground">{profile.points.toLocaleString('tr-TR')}</p><p className="text-xs text-muted-foreground mt-1">Topluluk puanı</p></div>
          </div>
        </section>

        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-10 md:gap-14 pt-9">
          <section>
            <div className="flex items-center gap-2 mb-5"><Sparkles className="h-4 w-4 text-accent" /><h2 className="text-sm uppercase tracking-[0.16em] font-semibold text-foreground">Hakkımda</h2></div>
            {profile.bio ? <p className="text-sm leading-7 text-muted-foreground max-w-xl">{profile.bio}</p> : <p className="text-sm text-muted-foreground">Henüz bir biyografi eklemediniz. <Link href="/profil/ayarlar" className="text-primary hover:underline">Profilinizi tamamlayın.</Link></p>}
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mt-8 pt-6 border-t border-border">
              <div><dt className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"><Mail className="h-3.5 w-3.5" />E-posta</dt><dd className="text-sm text-foreground mt-2 break-all">{profile.email}</dd></div>
              <div><dt className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />Üyelik</dt><dd className="text-sm text-foreground mt-2">{profile.createdAt.toLocaleDateString('tr-TR')}</dd></div>
            </dl>
          </section>
          <aside className="border-l-0 md:border-l border-border md:pl-8">
            <div className="flex items-center gap-2 mb-5"><FileText className="h-4 w-4 text-primary" /><h2 className="text-sm uppercase tracking-[0.16em] font-semibold text-foreground">Katkı özeti</h2></div>
            <div className="space-y-5">
              <div><p className="text-3xl font-serif font-bold text-foreground">{transcriptionCount.toLocaleString('tr-TR')}</p><p className="text-xs text-muted-foreground mt-1">Kayıtlı transkripsiyon</p></div>
              <div className="h-px bg-border" />
              <div><p className="text-sm font-medium text-foreground">Topluluk katkısı</p><p className="text-xs leading-relaxed text-muted-foreground mt-1">Onaylanan hata bildirimleri ve madde başı önerileri puan kazandırır.</p></div>
              <Link href="/terim-sozlugu" className="inline-flex items-center gap-2 text-sm text-primary hover:underline"><Users className="h-4 w-4" />Topluluğa katkıda bulun</Link>
              <Link href="/profil/blog-basvurusu" className="flex items-center gap-2 text-sm text-primary hover:underline"><PenLine className="h-4 w-4" />Blog yazısı gönder</Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
