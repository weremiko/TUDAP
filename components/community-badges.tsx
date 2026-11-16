import { Award, Compass, Crown, Medal, Star, Trophy, type LucideIcon } from 'lucide-react'

const BADGE_TIERS: { label: string; threshold: number; Icon: LucideIcon; color: string }[] = [
  { label: 'İlk Adım', threshold: 10, Icon: Compass, color: 'text-sky-700 bg-sky-100' },
  { label: 'Katkı Sağlayıcı', threshold: 50, Icon: Star, color: 'text-emerald-700 bg-emerald-100' },
  { label: 'Araştırmacı', threshold: 150, Icon: Award, color: 'text-amber-700 bg-amber-100' },
  { label: 'Uzman', threshold: 350, Icon: Medal, color: 'text-rose-700 bg-rose-100' },
  { label: 'Topluluk Öncüsü', threshold: 750, Icon: Crown, color: 'text-violet-700 bg-violet-100' },
]

export function CommunityBadges({ points, showProgress = false }: { points: number; showProgress?: boolean }) {
  const safePoints = Number.isFinite(points) ? Math.max(0, points) : 0
  const earned = BADGE_TIERS.filter((badge) => safePoints >= badge.threshold)
  const next = BADGE_TIERS.find((badge) => safePoints < badge.threshold)
  const previousThreshold = earned.at(-1)?.threshold ?? 0
  const progressRange = next ? next.threshold - previousThreshold : 1
  const progress = next
    ? Math.min(100, Math.max(0, ((safePoints - previousThreshold) / progressRange) * 100))
    : 100

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Topluluk rozetleri</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {BADGE_TIERS.map(({ label, threshold, Icon, color }) => {
          const unlocked = safePoints >= threshold

          return (
            <span
              key={label}
              title={`${threshold} topluluk puanında kazanılır`}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                unlocked
                  ? `${color} border-transparent`
                  : 'border-border bg-muted/60 text-muted-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </span>
          )
        })}
      </div>

      {showProgress && (next ? (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-1.5">
            Sıradaki: {next.label} · {Math.max(0, next.threshold - safePoints)} puan kaldı
          </p>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={`${next.label} rozeti ilerlemesi`}
            aria-valuemin={0}
            aria-valuemax={next.threshold}
            aria-valuenow={safePoints}
          >
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          {earned.length > 0 ? 'Tüm topluluk rozetleri kazanıldı.' : 'İlk rozet 10 topluluk puanında açılır.'}
        </p>
      ))}
    </div>
  )
}