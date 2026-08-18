"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  ClipboardList,
  Menu,
  X,
  ExternalLink,
  LayoutDashboard,
  Users,
  LogOut,
  AlertTriangle,
  Zap,
  Newspaper,
  Calendar,
  FileEdit,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const allNavItems = [
  { label: "Genel Bakış",    href: "/admin",             icon: LayoutDashboard, roles: ['admin', 'moderator'] },
  { label: "Kullanıcılar",    href: "/admin/kullanicilar", icon: Users,           roles: ['admin'] },
  { label: "Sözlük Yönetimi", href: "/admin/sozluk",      icon: BookOpen,        roles: ['admin', 'moderator'] },
  { label: "Sabit Çeviriler", href: "/admin/sabit-ceviriler", icon: Zap,        roles: ['admin', 'moderator'] },
  { label: "Blog",            href: "/admin/blog",           icon: Newspaper,      roles: ['admin', 'moderator'] },
  { label: "Ajanda",          href: "/admin/ajanda",         icon: Calendar,       roles: ['admin', 'moderator'] },
  { label: "Sayfalar",        href: "/admin/sayfalar",       icon: FileEdit,       roles: ['admin', 'moderator'] },
  { label: "Sorgu Logları",   href: "/admin/loglar",         icon: ClipboardList,  roles: ['admin'] },
  { label: "Hata Raporları",  href: "/admin/hatalar",      icon: AlertTriangle,   roles: ['admin', 'moderator'] },
]

function Sidebar({ onClose, userRole = 'admin' }: { onClose?: () => void; userRole?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = allNavItems.filter(item => item.roles.includes(userRole))

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif font-bold text-lg text-sidebar-foreground group-hover:text-primary transition-colors">
            dilbilim.org.tr
          </span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-sidebar-foreground">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Admin badge */}
      <div className="px-6 py-3 border-b border-sidebar-border">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Admin Paneli
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          Siteye Git
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}

export function AdminShell({ children, userRole = 'admin' }: { children: React.ReactNode; userRole?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0">
        <div className="w-full">
          <Sidebar userRole={userRole} />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} userRole={userRole} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center h-16 px-4 border-b border-border bg-background shrink-0 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-3 font-serif font-semibold text-foreground">Admin Paneli</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
