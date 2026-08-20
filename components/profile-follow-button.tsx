'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleFollow } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { UserPlus, UserMinus } from 'lucide-react'

export function ProfileFollowButton({ targetUserId, initialFollowing }: { targetUserId: string; initialFollowing: boolean }) {
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    setPending(true)
    try {
      const next = await toggleFollow(targetUserId)
      setFollowing(next)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={pending} variant={following ? 'outline' : 'default'} size="sm" className="gap-2">
      {following ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {following ? 'Takipten Çık' : 'Takip Et'}
    </Button>
  )
}
