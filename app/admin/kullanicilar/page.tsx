"use client"

import { useEffect, useState, useTransition } from "react"
import { getAllUsers, setUserRole, deleteUser, setUserBlueVerification, setUserTeamMember } from "@/app/actions/admin"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ShieldCheck, ShieldHalf, Trash2, Loader2, RefreshCw, BadgeCheck, UsersRound } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

type User = Awaited<ReturnType<typeof getAllUsers>>[number]
type Role = "admin" | "moderator" | "user"

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  moderator: "Moderatör",
  user: "Kullanıcı",
}

const ROLE_STYLES: Record<Role, string> = {
  admin:     "bg-primary/10 text-primary border-primary/20",
  moderator: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  user:      "bg-muted text-muted-foreground border-border",
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const load = async () => {
    setLoading(true)
    const data = await getAllUsers()
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleRoleChange = (userId: string, newRole: Role) => {
    startTransition(async () => {
      await setUserRole(userId, newRole)
      toast({ title: "Rol güncellendi", description: `Kullanıcı rolü "${ROLE_LABELS[newRole]}" yapıldı.` })
      await load()
    })
  }

  const handleDelete = (userId: string, name: string) => {
    if (!confirm(`"${name}" adlı kullanıcıyı silmek istediğinize emin misiniz?`)) return
    startTransition(async () => {
      await deleteUser(userId)
      toast({ title: "Silindi", description: `${name} kaldırıldı.`, variant: "destructive" })
      await load()
    })
  }

  const handleVerification = (userId: string, verified: boolean) => {
    startTransition(async () => {
      await setUserBlueVerification(userId, verified)
      toast({ title: verified ? "Mavi tik verildi" : "Mavi tik kaldırıldı" })
      await load()
    })
  }

  const handleTeamToggle = (u: User) => {
    startTransition(async () => {
      await setUserTeamMember(u.id, { role: u.teamRole ? null : 'member', order: u.teamOrder, visible: !u.teamRole })
      toast({ title: u.teamRole ? "Takımdan çıkarıldı" : "Takıma eklendi" })
      await load()
    })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Kullanıcılar</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} kayıtlı kullanıcı</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading || isPending} className="bg-transparent">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Henüz kayıtlı kullanıcı yok.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3">Ad Soyad</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3">E-posta</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3">Mevcut Rol</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3 hidden sm:table-cell">Kayıt Tarihi</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3">Rol Değiştir</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const role = (u.role ?? "user") as Role
                return (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {role === "admin" && <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                        {role === "moderator" && <ShieldHalf className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">{u.name}{u.blueVerified && <BadgeCheck className="h-4 w-4 text-primary" />}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_STYLES[role]}`}>
                        {ROLE_LABELS[role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" disabled={isPending} onClick={() => handleVerification(u.id, !u.blueVerified)}>
                        <BadgeCheck className="h-3.5 w-3.5 text-primary" />{u.blueVerified ? "Tiki kaldır" : "Mavi tik"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" disabled={isPending} onClick={() => handleTeamToggle(u)} title="Takıma ekle/çıkar">
                        <UsersRound className="h-3.5 w-3.5" />{u.teamRole ? "Takımdan çıkar" : "Takıma ekle"}
                      </Button>
                      <Select
                        value={role}
                        onValueChange={(v) => handleRoleChange(u.id, v as Role)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-8 w-36 text-xs bg-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderatör</SelectItem>
                          <SelectItem value="user">Kullanıcı</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 h-7 w-7"
                        disabled={isPending}
                        onClick={() => handleDelete(u.id, u.name)}
                        title="Kullanıcıyı sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Toaster />
    </div>
  )
}
