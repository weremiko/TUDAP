import Image from 'next/image'
import Link from 'next/link'
import { getPublicTeamMembers } from '@/app/actions/admin'
import { getMaintenanceSettings, type MaintenanceSettings } from '@/app/actions/maintenance'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Locale = 'tr' | 'en'
type Member = Awaited<ReturnType<typeof getPublicTeamMembers>>[number]

const ROLE_LABELS: Record<string, { tr: string; en: string }> = {
  founder: { tr: 'Kurucu', en: 'Founder' },
  advisor: { tr: 'Akademik danışman', en: 'Academic adviser' },
  member: { tr: 'Ekip üyesi', en: 'Team member' },
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((part) => part[0] ?? '').join('').slice(0, 2).toLocaleUpperCase('tr-TR')
}

function getLaunchDate(month: string, locale: Locale) {
  if (!month) return null
  const [year, monthNumber] = month.split('-').map(Number)
  if (!year || !monthNumber) return null
  return new Intl.DateTimeFormat(locale === 'en' ? 'en' : 'tr-TR', { month: 'long', year: 'numeric' })
    .format(new Date(Date.UTC(year, monthNumber - 1, 1)))
}

function MemberRow({ member, locale }: { member: Member; locale: Locale }) {
  const role = member.teamRole ? ROLE_LABELS[member.teamRole]?.[locale] ?? member.teamRole : null
  return (
    <li className="flex items-center gap-3 border-t border-border py-4">
      <Avatar className="size-11 shrink-0 rounded-md">
        <AvatarImage src={member.image ?? undefined} alt="" />
        <AvatarFallback className="rounded-md bg-muted text-sm font-medium">{getInitials(member.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
        {role && <p className="mt-1 text-xs text-muted-foreground">{role}</p>}
      </div>
    </li>
  )
}

export async function MaintenancePage({ locale }: { locale: Locale }) {
  const settings = await getMaintenanceSettings()
  const teamMembers = settings.showTeam ? await getPublicTeamMembers() : []
  return <MaintenanceContent locale={locale} settings={settings} teamMembers={teamMembers} />
}

function MaintenanceContent({ locale, settings, teamMembers }: { locale: Locale; settings: MaintenanceSettings; teamMembers: Member[] }) {
  const isEnglish = locale === 'en'
  const title = isEnglish ? settings.titleEn : settings.titleTr
  const description = isEnglish ? settings.descriptionEn : settings.descriptionTr
  const launchDate = getLaunchDate(settings.launchMonth, locale)

  return (
    <main lang={locale} className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between border-b border-border py-5">
          <Link href={isEnglish ? '/en' : '/'} className="flex items-center gap-3" aria-label="TÜDAP">
            <Image src="/tudap-symbol.png" alt="" width={36} height={36} className="size-9 object-contain" priority />
            <span className="text-xs font-medium uppercase tracking-[0.16em]">TÜDAP</span>
          </Link>
          <nav aria-label={isEnglish ? 'Language' : 'Dil'} className="flex items-center gap-3 text-xs">
            <Link href="/maintenance" lang="tr" aria-current={isEnglish ? undefined : 'page'} className={!isEnglish ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}>TR</Link>
            <span aria-hidden="true" className="text-border">/</span>
            <Link href="/en/maintenance" lang="en" aria-current={isEnglish ? 'page' : undefined} className={isEnglish ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}>EN</Link>
          </nav>
        </header>

        <div className="grid flex-1 content-center gap-12 py-14 lg:grid-cols-12 lg:gap-10 lg:py-20">
          <section className="lg:col-span-8">
            <p className="mb-7 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              {isEnglish ? 'A note from TÜDAP' : 'TÜDAP’tan bir not'}
            </p>
            <h1 className="max-w-4xl font-serif text-5xl font-medium leading-[1.02] tracking-[-0.035em] text-balance sm:text-6xl lg:text-7xl">{title}</h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{description}</p>
            {launchDate && (
              <p className="mt-7 text-sm font-medium text-foreground">
                {isEnglish ? 'Official launch' : 'Resmî açılış'} <span className="mx-2 text-border">/</span> {launchDate}
              </p>
            )}
          </section>

          <aside className="flex flex-col justify-end border-t border-border pt-6 lg:col-span-3 lg:col-start-10 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{isEnglish ? 'The platform' : 'Platform'}</p>
            <p className="mt-3 font-serif text-2xl leading-snug">{isEnglish ? 'Turkish linguistics, open to everyone.' : 'Türkçe dilbilim için açık bir çalışma alanı.'}</p>
            <div className="mt-6 flex flex-col items-start gap-3 text-sm">
              <a href="mailto:iletisim@dilbilim.org.tr" className="underline decoration-border underline-offset-4 hover:text-accent">iletisim@dilbilim.org.tr</a>
              <a href="https://instagram.com/tudaporg" target="_blank" rel="noopener noreferrer" className="underline decoration-border underline-offset-4 hover:text-accent">Instagram</a>
            </div>
            <Link href="/sign-in" className="mt-7 w-fit text-xs text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground">
              {isEnglish ? 'Administrator sign in' : 'Yönetici girişi'}
            </Link>
          </aside>
        </div>

        {settings.showTeam && teamMembers.length > 0 && (
          <section className="border-t border-border py-8" aria-labelledby="maintenance-team-heading">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 id="maintenance-team-heading" className="font-serif text-2xl font-semibold">{isEnglish ? 'The team' : 'Takımımız'}</h2>
              <p className="text-sm text-muted-foreground">{isEnglish ? 'People working on the platform.' : 'Platform üzerinde çalışan ekip.'}</p>
            </div>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => <MemberRow key={member.id} member={member} locale={locale} />)}
            </ul>
          </section>
        )}

        <footer className="mt-auto flex flex-col gap-2 border-t border-border py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© TÜDAP · Türkçe Dilbilim Araştırma Platformu</span>
          <span>{isEnglish ? 'Turkish Linguistics Research Platform' : 'Türkçe Dilbilim Araştırma Platformu'}</span>
        </footer>
      </div>
    </main>
  )
}
