import Link from "next/link"
import { getModeratorActionLogs } from "@/app/actions/logs"
import { Badge } from "@/components/ui/badge"

type Props = { searchParams: Promise<{ page?: string }> }

const ACTION_LABELS: Record<string, string> = {
  create: "Oluşturdu",
  update: "Güncelledi",
  delete: "Sildi",
  publish: "Yayımladı",
  unpublish: "Yayından kaldırdı",
  submit: "İçerik başvurusu yaptı",
  "submission-approved": "Başvuruyu onayladı",
  "submission-rejected": "Başvuruyu reddetti",
  activate: "Etkinleştirdi",
  deactivate: "Devre dışı bıraktı",
  resolve: "Çözüldü olarak işaretledi",
  "bulk-import": "Toplu içe aktardı",
  "update-section": "Sayfa bölümünü güncelledi",
  "update-sections": "Sayfa bölümlerini güncelledi",
}

const ENTITY_LABELS: Record<string, string> = {
  content: "İçerik",
  announcement: "Duyuru",
  event: "Etkinlik",
  "glossary-entry": "Sözlük maddesi",
  "page-content": "Sayfa içeriği",
  "error-report": "Hata raporu",
  "fixed-transcription": "Sabit çeviri",
}

export default async function ModeratorActionLogPage({ searchParams }: Props) {
  const page = Math.max(1, Number((await searchParams).page) || 1)
  const { rows, total, pages } = await getModeratorActionLogs(page)

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase text-accent">Denetim</p>
        <h1 className="mt-1 text-2xl font-serif font-bold text-foreground">Moderatör Eylemleri</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} kayıt</p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[680px] text-left">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Zaman</th>
              <th className="px-4 py-3">Moderatör</th>
              <th className="px-4 py-3">Eylem</th>
              <th className="px-4 py-3">Hedef</th>
              <th className="px-4 py-3">Ayrıntı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-14 text-center text-sm text-muted-foreground">Henüz moderatör eylemi kaydedilmedi.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(row.createdAt))}</td>
                <td className="px-4 py-3 text-sm font-medium">{row.actorName}</td>
                <td className="px-4 py-3 text-sm">{ACTION_LABELS[row.action] ?? row.action}</td>
                <td className="px-4 py-3"><Badge variant="outline">{ENTITY_LABELS[row.entity] ?? row.entity}{row.entityId ? ` #${row.entityId}` : ""}</Badge></td>
                <td className="max-w-sm px-4 py-3 text-sm text-muted-foreground">{row.summary || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && <nav aria-label="Log sayfaları" className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Sayfa {page} / {pages}</span>
        <div className="flex gap-2">
          {page > 1 && <Link className="rounded border border-border px-3 py-1.5 hover:bg-muted" href={`?page=${page - 1}`}>Önceki</Link>}
          {page < pages && <Link className="rounded border border-border px-3 py-1.5 hover:bg-muted" href={`?page=${page + 1}`}>Sonraki</Link>}
        </div>
      </nav>}
    </div>
  )
}