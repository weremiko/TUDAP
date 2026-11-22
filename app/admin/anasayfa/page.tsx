import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { House } from "lucide-react"
import { getPageSections } from "@/app/actions/page-content"
import { HomepageContentEditor } from "@/components/admin/homepage-content-editor"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"

export const metadata = {
  title: "Ana Sayfa İçerikleri — TÜDAP Admin",
  robots: { index: false, follow: false },
}

export default async function AdminHomepagePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?callbackUrl=/admin/anasayfa")
  const [currentUser] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (currentUser?.role !== "admin") redirect("/admin")

  const sections = await getPageSections("anasayfa")

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"><House className="size-4" />Site içeriği</p>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Ana sayfa</h1>
        <p className="mt-2 text-sm text-muted-foreground">Metinleri, kartları, bağlantıları ve arama alanlarını düzenleyin. Blog yazıları ve etkinlikler kendi yönetim alanlarından güncellenir.</p>
      </header>
      <HomepageContentEditor sections={sections} />
    </div>
  )
}