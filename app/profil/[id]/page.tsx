import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getPublicProfile } from '@/app/actions/profile'
import { ProfileFollowButton } from '@/components/profile-follow-button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BadgeCheck, Building2, CalendarDays, Link2, Sparkles, Users } from 'lucide-react'

export const metadata: Metadata = { title: 'Kullanıcı Profili — TÜDAP', robots: { index: false } }

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getPublicProfile(id)
  if (!profile) notFound()
  const session = await auth.api.getSession({ headers: await headers() })
  const canFollow = Boolean(session?.user && session.user.id !== profile.id)

  const initials = profile.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto max-w-5xl px-4 py-10 md:py-14 flex-1">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium">TÜDAP topluluğu</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2">Kullanıcı profili</h1>
        </div>

        <section className="border-y border-border py-8 md:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 md:gap-7">
            <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background ring-1 ring-border">
              <AvatarImage src={profile.image ?? undefined} alt={profile.name} />
              <AvatarFallback className="text-2xl font-serif">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground break-words flex items-center gap-2">{profile.name}{profile.isVerified && <BadgeCheck className="h-5 w-5 text-primary" aria-label="Doğrulanmış profil" />}</h2>
              {profile.institution && <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-3"><Building2 className="h-3.5 w-3.5" />{profile.institution}</p>}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2"><Link2 className="h-3.5 w-3.5" />TÜDAP topluluk profili</p>
            </div>
            {canFollow && <ProfileFollowButton targetUserId={profile.id} initialFollowing={profile.isFollowing} />}
          </div>
          <div className="grid grid-cols-2 max-w-sm mt-8 border-t border-border pt-5">
            <div><p className="text-xl font-semibold text-foreground">{profile.followers}</p><p className="text-xs text-muted-foreground mt-1">Takipçi</p></div>
            <div><p className="text-xl font-semibold text-foreground">{profile.following}</p><p className="text-xs text-muted-foreground mt-1">Takip</p></div>
          </div>
        </section>

        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-10 md:gap-14 pt-9">
          <section>
            <div className="flex items-center gap-2 mb-5"><Sparkles className="h-4 w-4 text-accent" /><h2 className="text-sm uppercase tracking-[0.16em] font-semibold text-foreground">Hakkımda</h2></div>
            <p className="text-sm leading-7 text-muted-foreground max-w-xl">{profile.bio || 'Bu kullanıcı henüz bir biyografi eklememiş.'}</p>
          </section>
          <aside className="border-l-0 md:border-l border-border md:pl-8">
            <div className="flex items-center gap-2 mb-5"><Users className="h-4 w-4 text-primary" /><h2 className="text-sm uppercase tracking-[0.16em] font-semibold text-foreground">Topluluk</h2></div>
            <p className="text-sm leading-relaxed text-muted-foreground">TÜDAP üzerinde dilbilim kaynaklarını keşfeden ve paylaşan bir topluluk üyesi.</p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground mt-6"><CalendarDays className="h-3.5 w-3.5" />Herkese açık profil</p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
