'use server'

import { createMathChallenge } from '@/lib/math-challenge'

export async function getMathChallenge() {
  return createMathChallenge()
}
