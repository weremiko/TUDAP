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
  const [challenge, setChallenge] = useState<{ challenge: string; question: string; signature: string } | null>(null)
  const [challengeAnswer, setChallengeAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  useEffect(() => {
    getMathChallenge().then(setChallenge).catch(() => setError('İnsan doğrulaması yüklenemedi.'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (!challenge || !challengeAnswer.trim()) {
      setError('Lütfen matematik sorusunu yanıtlayın.')
      return
    }
    setLoading(true)

    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name, emailConfirmation, passwordConfirmation, challenge: challenge.challenge, challengeSignature: challenge.signature, challengeAnswer } as never)
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

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-1">
              {loading ? 'Lütfen bekleyin…' : isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-5">
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
