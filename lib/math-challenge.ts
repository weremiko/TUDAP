import { createHmac, timingSafeEqual } from 'node:crypto'

const CHALLENGE_TTL_MS = 10 * 60 * 1000

function challengeSecret() {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET
  if (!secret) throw new Error('BETTER_AUTH_SECRET veya AUTH_SECRET tanımlı değil')
  return secret
}

function signChallenge(payload: string) {
  return createHmac('sha256', challengeSecret()).update(payload).digest('base64url')
}

export function createMathChallenge() {
  const left = Math.floor(Math.random() * 8) + 2
  const right = Math.floor(Math.random() * 8) + 2
  const payload = `${left}+${right}:${left + right}:${Date.now() + CHALLENGE_TTL_MS}`
  return {
    challenge: Buffer.from(payload).toString('base64url'),
    question: `${left} + ${right} = ?`,
    signature: signChallenge(payload),
  }
}

export function validateMathChallenge(challenge: string, signature: string, answer: string) {
  try {
    const payload = Buffer.from(challenge, 'base64url').toString('utf8')
    const [question, expected, expiresAt] = payload.split(':')
    const expectedSignature = Buffer.from(signChallenge(payload))
    const receivedSignature = Buffer.from(signature)
    if (expectedSignature.length !== receivedSignature.length || !timingSafeEqual(expectedSignature, receivedSignature)) return false
    return Number(expiresAt) > Date.now() && Number(answer.trim()) === Number(expected) && /^\d+\+\d+$/.test(question)
  } catch {
    return false
  }
}
