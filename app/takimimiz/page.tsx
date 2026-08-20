import type { Metadata } from 'next'
import { getPageSections } from '@/app/actions/page-content'
import { getPublicTeamMembers } from '@/app/actions/admin'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { BadgeCheck, Building2, UsersRound } from 'lucide-react'

export const metadata: Metadata = { title: 'Takımımız — TÜDAP', description: 'TÜDAP takımını ve akademik danışmanlığını tanıyın.' }

function getSection(sections: Record<string, string>, key: string) {
  return sections[key]?.trim() || 'Henüz bilgi eklenmedi.'
}

export default async function TeamPage() {
  const [rows, members] = await Promise.all([getPageSections('takimimiz'), getPublicTeamMembers()])
  const sections: Record<string, string> = {}
  rows.forEach((row) => { sections[row.key] = row.content })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-16 flex-1">
        <header className="max-w-2xl mb-12"><p className="text-xs uppercase tracking-[0.2em] text-accent font-medium">TÜDAP</p><h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2">Takımımız</h1><p className="text-sm leading-relaxed text-muted-foreground mt-3">Platformun akademik ve teknik gelişimine katkı sunan ekip.</p></header>
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {([['kurucu', 'kurucu_fotograf', 'Kurucu'], ['akademik_danisman', 'akademik_danisman_fotograf', 'Akademik Danışman']] as const).map(([key, imageKey, label]) => <section key={key} className="border-t-2 border-primary pt-4"><div className="flex items-start gap-4"><Avatar className="h-16 w-16 shrink-0"><AvatarImage src={sections[imageKey] || undefined} alt={label} /><AvatarFallback>{label.slice(0, 2)}</AvatarFallback></Avatar><div><p className="text-xs uppercase tracking-widest text-accent font-medium">{label}</p><p className="text-sm leading-7 text-muted-foreground mt-3 whitespace-pre-line">{getSection(sections, key)}</p></div></div></section>)}
        </div>
        <section><div className="flex items-center gap-2 mb-6"><UsersRound className="h-4 w-4 text-primary" /><h2 className="text-sm uppercase tracking-[0.16em] font-semibold text-foreground">Takım</h2></div>{members.length === 0 ? <p className="text-sm text-muted-foreground">Takım üyeleri yakında burada yer alacak.</p> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{members.map((member) => { const initials = member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(); return <Card key={member.id} className="p-5"><div className="flex items-center gap-3"><Avatar className="h-12 w-12"><AvatarImage src={member.image ?? undefined} alt={member.name} /><AvatarFallback>{initials}</AvatarFallback></Avatar><div><p className="font-semibold text-foreground flex items-center gap-1">{member.name}{member.blueVerified && <BadgeCheck className="h-4 w-4 text-primary" />}</p>{member.institution && <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><Building2 className="h-3 w-3" />{member.institution}</p>}</div></div>{member.bio && <p className="text-sm leading-relaxed text-muted-foreground mt-4">{member.bio}</p>}</Card> })}</div>}</section>
      </main>
      <SiteFooter />
    </div>
  )
}