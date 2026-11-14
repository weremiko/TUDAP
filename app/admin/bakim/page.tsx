import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { Wrench } from 'lucide-react'
import { MaintenanceControl } from '@/components/admin/maintenance-control'
import { getMaintenanceMode } from '@/app/actions/maintenance'

export const metadata = {
  title: 'Bakım Modu — TÜDAP Admin',
  robots: { index: false, follow: false },
}

export default async function MaintenanceAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in?callbackUrl=/admin/bakim')
  const [currentUser] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (currentUser?.role !== 'admin') redirect('/admin')

  const enabled = await getMaintenanceMode()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <header>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground"><Wrench className="size-4" />Site yönetimi</div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Bakım modu</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Lansman öncesi bakım sayfasını yönetin. Değişiklik anında tüm ziyaretçilere uygulanır.</p>
      </header>
      <MaintenanceControl initialEnabled={enabled} />
    </div>
  )
}
