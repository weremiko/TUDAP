"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Plus, Pencil, Trash2, Globe, EyeOff, ExternalLink, RefreshCw, FileText } from "lucide-react"
import { getAdminBlogPosts, deleteBlogPost, toggleBlogPostPublished } from "@/app/actions/blog"

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  authorName: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
  const { toast } = useToast()

  const load = async () => {
    setIsLoading(true)
    try {
      const result = await getAdminBlogPosts(1, 100)
      setPosts(result.posts as Post[])
      setTotal(result.total)
    } catch {
      toast({ title: "Yüklenemedi", variant: "destructive" })
    }
    setIsLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteBlogPost(deleteTarget.id)
      toast({ title: "Silindi", description: `"${deleteTarget.title}" silindi.`, variant: "destructive" })
      setDeleteTarget(null)
      load()
    })
  }

  const handleTogglePublish = (post: Post) => {
    startTransition(async () => {
      await toggleBlogPostPublished(post.id, !post.published)
      toast({
        title: post.published ? "Taslağa alındı" : "Yayımlandı",
        description: `"${post.title}" ${post.published ? "taslağa alındı" : "yayımlandı"}.`,
      })
      load()
    })
  }

  const wordCount = (content: string) =>
    content.split(/\s+/).filter(Boolean).length

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Blog Yönetimi</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total} yazı — {posts.filter(p => p.published).length} yayımda,{" "}
              {posts.filter(p => !p.published).length} taslak
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={isLoading} className="bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button size="sm" onClick={() => router.push("/admin/blog/yeni")}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Yazı
            </Button>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">Yükleniyor...</div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">Henüz blog yazısı yok.</p>
            <Button onClick={() => router.push("/admin/blog/yeni")} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              İlk yazıyı ekle
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold text-foreground">{post.title}</h2>
                      <Badge variant={post.published ? "default" : "secondary"} className="text-xs shrink-0">
                        {post.published ? "Yayımda" : "Taslak"}
                      </Badge>
                    </div>
                    {post.excerpt && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{post.excerpt}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{post.authorName}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString("tr-TR")}</span>
                      <span>{wordCount(post.content)} kelime</span>
                      <span>~{Math.ceil(wordCount(post.content) / 200)} dk</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {post.published && (
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="Siteye git">
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleTogglePublish(post)}
                      disabled={isPending}
                      title={post.published ? "Taslağa al" : "Yayımla"}
                    >
                      {post.published
                        ? <EyeOff className="h-3.5 w-3.5" />
                        : <Globe className="h-3.5 w-3.5" />
                      }
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => router.push(`/admin/blog/${post.id}/duzenle`)}
                      title="Düzenle"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(post)}
                      title="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yazıyı sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.title}&quot; yazısı kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </AdminShell>
  )
}
