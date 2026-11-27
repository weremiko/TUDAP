'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { getMathChallenge } from '@/app/actions/security'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailConfirmation, setEmailConfirmation] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [challenge, setChallenge] = useState<{ challenge: string; question: string; signature: string } | null>(null)
  const [challengeAnswer, setChallengeAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false);   const [googleLoading, setGoogleLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  useEffect(() => {
    getMathChallenge().then(setChallenge).catch(() => setError('İnsan doğrulaması yüklenemedi.'))
  }, [])

  const handleGoogleSignIn = async () => { setError(null); if (isSignUp && !termsAccepted) { setError('Kayıt olmak için Kullanım Koşulları’nı kabul etmelisiniz.'); return; } setGoogleLoading(true); const { error: googleError } = await authClient.signIn.social({ provider: 'google', callbackURL: '/' }); setGoogleLoading(false); if (googleError) setError(googleError.message ?? 'Google ile giriş yapılamadı.'); }; const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const allowedEmail = /@(gmail\.com|googlemail\.com|yahoo\.com|outlook\.com|hotmail\.com|proton\.me|protonmail\.com|dilbilim\.org\.tr|[a-z0-9-]+\.edu\.tr)$/i.test(email.trim())
    if (isSignUp && email.trim().toLowerCase() !== emailConfirmation.trim().toLowerCase()) {
      setError('E-posta adresleri eşleşmiyor.')
      return
    }
    if (isSignUp && !allowedEmail) {
      setError('Yalnızca bilinen e-posta sağlayıcıları ve edu.tr adresleriyle kayıt olunabilir.')
      return
    }
    if (isSignUp && password !== passwordConfirmation) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (isSignUp && !termsAccepted) {
      setError('Kayıt olmak için Kullanım Koşulları’nı kabul etmelisiniz.')
      return
    }
    if (!challenge || !challengeAnswer.trim()) {
      setError('Lütfen matematik sorusunu yanıtlayın.')
      return
    }
    setLoading(true)

    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name, emailConfirmation, passwordConfirmation, acceptTerms: termsAccepted, challenge: challenge.challenge, challengeSignature: challenge.signature, challengeAnswer } as never)
      : await authClient.signIn.email({ email, password, challenge: challenge.challenge, challengeSignature: challenge.signature, challengeAnswer } as never)

    setLoading(false)

    if (error) {
      setError(error.message ?? 'Bir hata oluştu.')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">TÜDAP</span>
            <span className="block text-xs text-muted-foreground mt-0.5">dilbilim.org.tr</span>
          </Link>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <h1 className="font-serif text-xl font-semibold text-foreground">
              {isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp
                ? 'TÜDAP platformuna üye olmak için formu doldurun.'
                : 'Hesabınıza giriş yapın.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Adınızı girin"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="ornek@eposta.com"
              />
            </div>
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emailConfirmation">E-posta tekrar</Label>
                <Input id="emailConfirmation" type="email" value={emailConfirmation} onChange={(e) => setEmailConfirmation(e.target.value)} required autoComplete="email" placeholder="E-posta adresinizi tekrar girin" />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="En az 8 karakter"
              />
            </div>
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="passwordConfirmation">Şifre tekrar</Label>
                <Input id="passwordConfirmation" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required minLength={8} autoComplete="new-password" placeholder="Şifrenizi tekrar girin" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Label htmlFor="challengeAnswer" className="whitespace-nowrap">{challenge?.question ?? 'Soru yükleniyor…'}</Label>
              <Input id="challengeAnswer" type="text" inputMode="numeric" value={challengeAnswer} onChange={(e) => setChallengeAnswer(e.target.value)} required placeholder="Cevap" className="max-w-24" />
            </div>

            {isSignUp && (
              <label htmlFor="termsAccepted" className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
                <input
                  id="termsAccepted"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="mt-1 size-4 shrink-0 accent-primary"
                />
                <span>
                  <Link href="/kullanim-kosullari" target="_blank" className="text-foreground underline underline-offset-4">Kullanım Koşulları</Link>
                  ’nı kabul ediyorum. <Link href="/gizlilik-politikasi" target="_blank" className="text-foreground underline underline-offset-4">Gizlilik Politikası</Link>
                  kişisel verilerin işlenmesi hakkında bilgi verir.
                </span>
              </label>
            )}

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-1">
              {loading ? 'Lütfen bekleyin…' : isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">             <div className="h-px flex-1 bg-border" />             <span className="text-xs text-muted-foreground">veya</span>             <div className="h-px flex-1 bg-border" />           </div>            <Button             type="button"             variant="outline"             className="w-full"             disabled={googleLoading}             onClick={handleGoogleSignIn}           >             <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">               <path d="M21.35 12.18c0-.64-.06-1.26-.17-1.85H12v3.5h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.19 2.91-7.03Z" fill="#4285F4" />               <path d="M12 21.72c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.71-5.46-4.02H3.31v2.51A9.72 9.72 0 0 0 12 21.72Z" fill="#34A853" />               <path d="M6.54 13.84A5.84 5.84 0 0 1 6.23 12c0-.64.11-1.26.31-1.84V7.65H3.31A9.72 9.72 0 0 0 2.28 12c0 1.57.38 3.05 1.03 4.35l3.23-2.51Z" fill="#FBBC05" />               <path d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.35 9.35 0 0 0 12 2.28a9.72 9.72 0 0 0-8.69 5.37l3.23 2.51C7.31 7.85 9.46 6.14 12 6.14Z" fill="#EA4335" />             </svg>             {googleLoading ? 'Google ile bağlanılıyor…' : 'Google ile devam et'}           </Button>            <p className="text-sm text-muted-foreground text-center mt-5">
            {isSignUp ? 'Zaten hesabınız var mı? ' : 'Hesabınız yok mu? '}
            <Link
              href={isSignUp ? '/sign-in' : '/sign-up'}
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              {isSignUp ? 'Giriş Yap' : 'Kayıt Ol'}
            </Link>
          </p>
        </Card>
      </div>
    </main>
  )
}
