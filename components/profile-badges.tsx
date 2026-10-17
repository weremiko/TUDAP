import { BadgeCheck, BookOpen, Medal, UserRoundCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type ProfileBadgesProps = {
  points: number
  isVerified: boolean
  hasBio: boolean
  hasInstitution: boolean
  transcriptionCount?: number
}

export function ProfileBadges({ points, isVerified, hasBio, hasInstitution, transcriptionCount = 0 }: ProfileBadgesProps) {
  const badges = [
    isVerified ? { label: "Doğrulanmış", icon: BadgeCheck } : null,
    points >= 100 ? { label: "Aktif katkıcı", icon: Medal } : null,
    transcriptionCount >= 1 ? { label: "Dil araştırmacısı", icon: BookOpen } : null,
    hasBio && hasInstitution ? { label: "Tam profil", icon: UserRoundCheck } : null,
  ].filter(Boolean) as { label: string; icon: typeof BadgeCheck }[]

  if (!badges.length) return null

  return (
    <div className="mt-5 flex flex-wrap gap-2" aria-label="Profil rozetleri">
      {badges.map(({ label, icon: Icon }) => (
        <Badge key={label} variant="secondary" className="gap-1.5 rounded-full px-3 py-1 font-normal">
          <Icon data-icon="inline-start" aria-hidden="true" />
          {label}
        </Badge>
      ))}
    </div>
  )
}
