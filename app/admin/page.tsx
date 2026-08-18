import { getAdminStats, getAllUsers } from "@/app/actions/admin"
import { getLogStats } from "@/app/actions/logs"
import { getErrorStats } from "@/app/actions/errors"
import { getAllGlossaryAdmin } from "@/app/actions/glossary"
import { Card } from "@/components/ui/card"
import { Users, ShieldCheck, Activity, TrendingUp, BookOpen, ClipboardList, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function AdminIndexPage() {
  // Get current user role
  const session = await auth.api.getSession({ headers: await headers() })
  const [currentUser] = await db.select({ role: user.role }).from(user).where(eq(user.id, session!.user!.id)).limit(1)
  const isModerator = currentUser?.role === 'moderator'

  // For moderator: only load glossary and error data
  // For admin: load all data
  const queries = isModerator
    ? [
        Promise.resolve({ total: 0, today: 0 }), // placeholder stats
        Promise.resolve([]), // no users
        Promise.resolve({ total: 0, today: 0 }), // no logs
        getAllGlossaryAdmin(1, ""),
        getErrorStats(),
      ]
    : [
        getAdminStats(),
        getAllUsers(),
        getLogStats(),
        getAllGlossaryAdmin(1, ""),
        getErrorStats(),
      ]

  const [stats, users, logStats, glossaryData, errorStats] = await Promise.all(queries)
  const recentUsers = users.slice(0, 5)

  // Build stat cards based on role
  const statCardsAll = [
    { label: "Toplam Kullanıcı",  value: stats.totalUsers,        icon: Users,        href: "/admin/kullanicilar" },
    { label: "Aktif Oturum",      value: stats.activeSessions,    icon: Activity,     href: null },
    { label: "Sözlük Terimi",     value: glossaryData.total,      icon: BookOpen,     href: "/admin/sozluk" },
    { label: "Bugün Sorgu",       value: logStats.today,          icon: TrendingUp,   href: "/admin/loglar" },
    { label: "Toplam Sorgu",      value: logStats.total,          icon: ClipboardList,href: "/admin/loglar" },
    { label: "Admin Sayısı",      value: stats.adminCount,        icon: ShieldCheck,  href: "/admin/kullanicilar" },
    { label: "Hata Raporu",       value: errorStats.today,        icon: AlertTriangle,href: "/admin/hatalar" },
  ]

  const statCardsMod = [
    { label: "Sözlük Terimi",     value: glossaryData.total,      icon: BookOpen,     href: "/admin/sozluk" },
    { label: "Hata Raporu (Bugün)",value: errorStats.today,        icon: AlertTriangle,href: "/admin/hatalar" },
    { label: "Toplam Hata Raporu", value: errorStats.total,        icon: AlertTriangle,href: "/admin/hatalar" },
  ]

  const statCards = isModerator ? statCardsMod : statCardsAll

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Genel Bakış</h1>
        <p className="text-sm text-muted-foreground mt-1">TÜDAP yönetim paneline hoş geldiniz.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold font-mono text-foreground">{s.value}</p>
            {s.href && (
              <Link href={s.href} className="text-xs text-primary hover:underline mt-2 inline-block">
                Görüntüle →
              </Link>
            )}
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent users — only for admin */}
        {!isModerator && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-serif text-foreground">Son Kayıt Olanlar</h2>
            <Link href="/admin/kullanicilar" className="text-xs text-primary hover:underline">
              Tümünü Gör →
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz kullanıcı yok.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    u.role === "admin"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
        )}

        {/* Quick links */}
        <Card className="p-5">
          <h2 className="font-semibold font-serif text-foreground mb-4">Hızlı Erişim</h2>
          <div className="space-y-2">
            {[
              { href: "/admin/kullanicilar", icon: Users,        label: "Kullanıcı Yönetimi", desc: "Tüm hesapları listele ve yönet" },
              { href: "/admin/sozluk",       icon: BookOpen,     label: "Sözlük Yönetimi",   desc: "Dilbilim terimlerini düzenle" },
              { href: "/admin/loglar",       icon: ClipboardList,label: "Sorgu Logları",      desc: "Çevirici kullanım kayıtları" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="p-2 rounded-md bg-primary/10">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
