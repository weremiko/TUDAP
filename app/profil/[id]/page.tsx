import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getPublicProfile } from '@/app/actions/profile'
import { ProfileFollowButton } from '@/components/profile-follow-button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

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
      <main className="container mx-auto max-w-2xl px-4 py-12 flex-1">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16"><AvatarImage src={profile.image ?? undefined} alt={profile.name} /><AvatarFallback className="text-lg">{initials}</AvatarFallback></Avatar>
              <div><h1 className="text-2xl font-serif font-bold text-foreground">{profile.name}</h1>{profile.institution && <p className="text-sm text-muted-foreground mt-1">{profile.institution}</p>}</div>
            </div>
            {canFollow && <ProfileFollowButton targetUserId={profile.id} initialFollowing={profile.isFollowing} />}
          </div>
          {profile.bio && <p className="mt-6 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}
          <div className="mt-6 flex gap-8 border-t border-border pt-6 text-sm"><span><strong className="text-foreground">{profile.followers}</strong> <span className="text-muted-foreground">takipçi</span></span><span><strong className="text-foreground">{profile.following}</strong> <span className="text-muted-foreground">takip</span></span></div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  )
}
