'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { submitBlogApplication } from '@/app/actions/blog'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Send } from 'lucide-react'

export default function BlogApplicationPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await submitBlogApplication({ title, excerpt, content, tags })
      setStatus('Başvurunuz alındı. Editör veya admin incelemesinden sonra yayımlanacaktır.')
      setTitle(''); setExcerpt(''); setContent(''); setTags('')
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Başvuru gönderilemedi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-10 md:py-14 flex-1">
        <Link href="/profil" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-7"><ArrowLeft className="h-4 w-4" />Profile dön</Link>
        <div className="mb-8"><p className="text-xs uppercase tracking-[0.2em] text-accent font-medium">TÜDAP Blog</p><h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2">Blog yazısı gönder</h1><p className="text-sm text-muted-foreground mt-2">Yazınız editör veya admin onayından geçmeden yayımlanmaz.</p></div>
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2"><Label htmlFor="title">Başlık</Label><Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={180} /></div>
            <div className="space-y-2"><Label htmlFor="excerpt">Kısa özet</Label><Textarea id="excerpt" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={3} maxLength={400} /></div>
            <div className="space-y-2"><Label htmlFor="content">Yazı</Label><Textarea id="content" value={content} onChange={(event) => setContent(event.target.value)} rows={14} required /></div>
            <div className="space-y-2"><Label htmlFor="tags">Etiketler</Label><Input id="tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="sesbilim, Türkçe, fonetik" /></div>
            {status && <p className="text-sm text-muted-foreground" role="status">{status}</p>}
            <div className="flex justify-end"><Button type="submit" disabled={saving} className="gap-2"><Send className="h-4 w-4" />{saving ? 'Gönderiliyor…' : 'Başvuruyu gönder'}</Button></div>
          </form>
        </Card>
      </main>
      <SiteFooter />
    </div>
  )
}