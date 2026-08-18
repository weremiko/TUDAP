"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  ArrowLeft, Save, Eye, EyeOff,
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Minus, Quote, Link2,
} from "lucide-react"
import { createBlogPost, updateBlogPost } from "@/app/actions/blog"
import Link from "next/link"

interface BlogEditorProps {
  post?: {
    id: number
    title: string
    slug: string
    excerpt: string
    content: string
    published: boolean
    authorName?: string
    tags?: string
  }
}

export function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [preview, setPreview] = useState(false)

  const [form, setForm] = useState({
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    published: post?.published ?? false,
    authorName: post?.authorName ?? "",
    tags: post?.tags ?? "",
  })

  // Auto-resize textarea
  useEffect(() => {
    const ta = contentRef.current
    if (!ta || preview) return
    ta.style.height = "auto"
    ta.style.height = Math.max(600, ta.scrollHeight) + "px"
  }, [form.content, preview])

  const insertFormat = (before: string, after = "", placeholder = "metin") => {
    const ta = contentRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = form.content.slice(start, end) || placeholder
    const newContent =
      form.content.slice(0, start) + before + selected + after + form.content.slice(end)
    setForm(f => ({ ...f, content: newContent }))
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  const insertLink = () => {
    const ta = contentRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = form.content.slice(start, end) || "bağlantı metni"
    const url = window.prompt("URL girin:", "https://")
    if (!url) return
    const newContent =
      form.content.slice(0, start) + `[${selected}](${url})` + form.content.slice(end)
    setForm(f => ({ ...f, content: newContent }))
    setTimeout(() => ta.focus(), 0)
  }

  const handleSave = () => {
    if (!form.title.trim()) {
      toast({ title: "Başlık gerekli", variant: "destructive" })
      return
    }
    if (!form.content.trim()) {
      toast({ title: "İçerik gerekli", variant: "destructive" })
      return
    }
    startTransition(async () => {
      try {
        if (post) {
          await updateBlogPost(post.id, form)
          toast({ title: "Kaydedildi", description: `"${form.title}" güncellendi.` })
        } else {
          await createBlogPost(form)
          toast({ title: "Oluşturuldu", description: `"${form.title}" oluşturuldu.` })
          router.push("/admin/blog")
        }
      } catch (err) {
        toast({
          title: "Hata",
          description: err instanceof Error ? err.message : "Bir hata oluştu.",
          variant: "destructive",
        })
      }
    })
  }

  const wordCount = form.content.split(/\s+/).filter(Boolean).length
  const readTime = Math.ceil(wordCount / 200) || 0

  // Markdown renderer
  const renderMarkdown = (text: string): string => {
    return text
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^\d+\. (.+)$/gm, '<li class="list-decimal">$1</li>')
      .replace(/^- (.+)$/gm, '<li class="list-disc">$1</li>')
      .replace(/(<li[\s\S]+?<\/li>)(\n(?!<li)|$)/g, '<ul>$1</ul>')
      .replace(/^---$/gm, '<hr/>')
      .split(/\n\n+/)
      .map(block => {
        block = block.trim()
        if (!block) return ''
        if (/^<(h[1-3]|ul|blockquote|hr)/.test(block)) return block
        return `<p>${block.replace(/\n/g, '<br/>')}</p>`
      })
      .join('\n')
  }

  const ToolbarBtn = ({
    onClick, title, children
  }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </button>
  )

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border -mx-4 px-4 py-3 mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin/blog">
              <Button variant="ghost" size="sm" className="gap-1.5 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Geri
              </Button>
            </Link>
            <Badge variant={form.published ? "default" : "secondary"}>
              {form.published ? "Yayımda" : "Taslak"}
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {wordCount} kelime · ~{readTime} dk okuma
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreview(p => !p)}
              className="gap-1.5 bg-transparent"
            >
              {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {preview ? "Düzenle" : "Önizle"}
            </Button>
            <div className="flex items-center gap-2 border border-border rounded-md px-2 py-1">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(v) => setForm(f => ({ ...f, published: v }))}
              />
              <Label htmlFor="published" className="text-sm cursor-pointer select-none">
                Yayımla
              </Label>
            </div>
            <Button size="sm" onClick={handleSave} disabled={isPending} className="gap-1.5">
              <Save className="h-4 w-4" />
              Kaydet
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <input
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Yazı başlığı..."
            className="w-full text-3xl md:text-4xl font-serif font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground leading-tight"
          />

          {/* Excerpt + Author row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Özet <span className="font-normal normal-case">(opsiyonel — blog listesinde görünür)</span>
              </Label>
              <Input
                value={form.excerpt}
                onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Kısa bir özet cümlesi..."
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Yazar Adı <span className="font-normal normal-case">(boş bırakılırsa hesap adı kullanılır)</span>
              </Label>
              <Input
                value={form.authorName}
                onChange={(e) => setForm(f => ({ ...f, authorName: e.target.value }))}
                placeholder="örn. Dr. Ayşe Kaya"
                className="text-sm"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Etiketler <span className="font-normal normal-case">(virgülle ayırın: sesbilim, morfoloji, sözdizimi)</span>
            </Label>
            <Input
              value={form.tags}
              onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="sesbilim, morfoloji, türkçe, fonetik..."
              className="text-sm"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Toolbar */}
          {!preview && (
            <div className="flex items-center gap-0.5 flex-wrap border border-border rounded-lg px-2 py-1.5 bg-card/60">
              <ToolbarBtn onClick={() => insertFormat("## ", "", "Başlık")} title="Başlık 2">
                <Heading2 className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => insertFormat("### ", "", "Alt Başlık")} title="Alt Başlık">
                <Heading3 className="h-4 w-4" />
              </ToolbarBtn>
              <div className="w-px h-4 bg-border mx-1" />
              <ToolbarBtn onClick={() => insertFormat("**", "**", "kalın metin")} title="Kalın">
                <Bold className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => insertFormat("*", "*", "italik metin")} title="İtalik">
                <Italic className="h-4 w-4" />
              </ToolbarBtn>
              <div className="w-px h-4 bg-border mx-1" />
              <ToolbarBtn onClick={() => insertFormat("- ", "", "liste maddesi")} title="Madde listesi">
                <List className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => insertFormat("1. ", "", "liste maddesi")} title="Numaralı liste">
                <ListOrdered className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => insertFormat("> ", "", "alıntı")} title="Alıntı">
                <Quote className="h-4 w-4" />
              </ToolbarBtn>
              <div className="w-px h-4 bg-border mx-1" />
              <ToolbarBtn onClick={insertLink} title="Bağlantı ekle">
                <Link2 className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => insertFormat("\n---\n", "", "")} title="Yatay çizgi">
                <Minus className="h-4 w-4" />
              </ToolbarBtn>
              <div className="ml-auto hidden sm:flex items-center gap-3 text-xs text-muted-foreground pr-1">
                <span>Markdown desteklenir</span>
              </div>
            </div>
          )}

          {/* Editor / Preview */}
          {preview ? (
            <article
              className="
                prose prose-sm max-w-none
                prose-headings:font-serif prose-headings:text-foreground
                prose-p:text-foreground prose-p:leading-relaxed
                prose-strong:text-foreground prose-em:text-foreground
                prose-blockquote:border-l-2 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:text-muted-foreground prose-blockquote:not-italic
                prose-li:text-foreground prose-li:leading-relaxed
                prose-hr:border-border
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                min-h-[600px] py-4
              "
              dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }}
            />
          ) : (
            <textarea
              ref={contentRef}
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder={"Yazınızı buraya yazın...\n\n## Başlık\n### Alt Başlık\n\n**kalın**, *italik*, [bağlantı](https://)\n\n- Madde listesi\n1. Numaralı liste\n\n> Alıntı\n\n---"}
              className="w-full min-h-[600px] bg-transparent border border-border rounded-lg p-4 text-sm font-mono leading-7 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              spellCheck={false}
            />
          )}
        </div>
      </div>
      <Toaster />
    </AdminShell>
  )
}
