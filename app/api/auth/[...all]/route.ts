import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import { validateMathChallenge } from '@/lib/math-challenge'
import { NextRequest, NextResponse } from 'next/server'

const { GET: betterAuthGet, POST: betterAuthPost } = toNextJsHandler(auth.handler)
const attempts = new Map<string, { count: number; resetAt: number }>()

async function limitedPost(request: NextRequest) {
	const pathname = new URL(request.url).pathname
	if (!pathname.endsWith('/sign-in/email') && !pathname.endsWith('/sign-up/email')) return betterAuthPost(request)

	let email = 'unknown'
	try {
		const body = await request.clone().json()
		email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : email
		if (!validateMathChallenge(body.challenge, body.challengeSignature, body.challengeAnswer)) {
			return NextResponse.json({ error: 'İnsan doğrulaması başarısız.' }, { status: 400 })
		}
		if (pathname.endsWith('/sign-up/email') && (body.email !== body.emailConfirmation || body.password !== body.passwordConfirmation)) {
			return NextResponse.json({ error: 'E-posta veya şifre tekrar alanları eşleşmiyor.' }, { status: 400 })
		}
		if (pathname.endsWith('/sign-up/email') && !isAllowedEmail(email)) {
			return NextResponse.json({ error: 'Bu e-posta sağlayıcısına izin verilmiyor.' }, { status: 400 })
		}
	} catch {
		return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
	}

	const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
	const key = `${ip}:${email}`
	const now = Date.now()
	const current = attempts.get(key)
	const window = current && current.resetAt > now ? current : { count: 0, resetAt: now + 15 * 60_000 }
	window.count += 1
	attempts.set(key, window)
	if (window.count > 10) {
		return NextResponse.json({ error: 'Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.' }, { status: 429, headers: { 'Retry-After': '900' } })
	}
	return betterAuthPost(request)
}

function isAllowedEmail(email: string) {
	const domain = email.split('@').pop() ?? ''
	return /^(gmail\.com|googlemail\.com|yahoo\.com|outlook\.com|hotmail\.com|proton\.me|protonmail\.com|dilbilim\.org\.tr|[a-z0-9-]+\.edu\.tr)$/i.test(domain)
}

export const GET = betterAuthGet
export const POST = limitedPost
