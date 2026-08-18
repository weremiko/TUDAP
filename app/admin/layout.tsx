import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { AdminShell } from "@/components/admin/admin-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Paneli — TÜDAP",
  description: "TÜDAP yönetim paneli.",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [currentUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "moderator")) redirect("/")

  return <AdminShell userRole={currentUser.role}>{children}</AdminShell>
}
