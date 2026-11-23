import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { desc, eq } from "drizzle-orm"
import { CalendarDays, CheckCircle2, Ticket } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { keynoteRegistrations, user } from "@/lib/db/schema"
import { ensureKeynoteTable } from "@/lib/keynote"
import { getPageSections } from "@/app/actions/page-content"
import { KeynoteHeroEditor } from "@/components/admin/keynote-hero-editor"
import { KeynoteCheckIn } from "@/components/admin/keynote-check-in"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "KEYNOTE Kayıtları — TÜDAP Admin",
  robots: { index: false, follow: false },
}

export default async function AdminKeynotePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?callbackUrl=/admin/keynote")

  const [currentUser] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (currentUser?.role !== "admin") redirect("/admin")

  await ensureKeynoteTable()
  const [registrations, heroSections] = await Promise.all([
    db.select().from(keynoteRegistrations).orderBy(desc(keynoteRegistrations.createdAt)),
    getPageSections("keynote"),
  ])
  const heroValues = Object.fromEntries(heroSections.map(({ key, content }) => [key, content]))
  const checkedInCount = registrations.filter((registration) => registration.checkedInAt).length

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7">
      <header>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"><Ticket className="size-4" />Etkinlik yönetimi</p>
        <h1 className="font-serif text-3xl font-bold tracking-tight">KEYNOTE’26 kayıtları</h1>
        <p className="mt-2 text-sm text-muted-foreground">Katılımcı bilgileri ve giriş durumları.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-4 p-5">
          <Ticket className="size-5 text-primary" />
          <div><p className="text-sm text-muted-foreground">Toplam kayıt</p><p className="text-2xl font-semibold">{registrations.length}</p></div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <CheckCircle2 className="size-5 text-primary" />
          <div><p className="text-sm text-muted-foreground">Giriş yapan</p><p className="text-2xl font-semibold">{checkedInCount}</p></div>
        </Card>
      </div>

      <KeynoteHeroEditor initialValues={heroValues} />
      <KeynoteCheckIn />

      {registrations.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">Henüz KEYNOTE kaydı yok.</Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Katılımcı</th>
                <th className="px-4 py-3 font-medium">Kurum / Bölüm</th>
                <th className="px-4 py-3 font-medium">Tür</th>
                <th className="px-4 py-3 font-medium">Kayıt zamanı</th>
                <th className="px-4 py-3 font-medium">Giriş</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registrations.map((registration) => (
                <tr key={registration.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-medium">{registration.firstName} {registration.lastName}</p>
                    <a className="mt-1 inline-block text-xs text-muted-foreground hover:text-primary" href={`mailto:${registration.email}`}>{registration.email}</a>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">{registration.id}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p>{registration.institution}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{registration.department}</p>
                  </td>
                  <td className="px-4 py-4"><Badge variant="secondary">{registration.role}</Badge></td>
                  <td className="px-4 py-4 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{registration.createdAt.toLocaleString("tr-TR")}</span>
                  </td>
                  <td className="px-4 py-4">
                    {registration.checkedInAt ? (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Giriş yapıldı</Badge>
                    ) : (
                      <Badge variant="outline">Bekliyor</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}