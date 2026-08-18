import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getBlogPostBySlug } from "@/app/actions/blog"

type Props = { params: Promise<{ slug: string }> }

const BASE = "https://dilbilim.org.tr"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return { title: "Yazı Bulunamadı" }

  const description = post.excerpt || post.content.replace(/<[^>]+>/g, "").slice(0, 155) + "…"
  const canonical = `${BASE}/blog/${slug}`

  const tags = (post as any).tags
    ? (post as any).tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : []

  return {
    title: post.title,
    description,
    keywords: ["dilbilim", "TÜDAP", "akademik", ...tags],
    alternates: { canonical },
    authors: [{ name: post.authorName }],
    openGraph: {
      type: "article",
      url: canonical,
      title: post.title,
      description,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorName],
      siteName: "TÜDAP",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  }
}

function renderMarkdown(text: string): string {
  return text
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered list items — wrap consecutive ones in <ul>
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)(\n(?!<li>)|$)/g, '<ul>$1</ul>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr/>')
    // Double newline = paragraph break
    .split(/\n\n+/)
    .map(block => {
      block = block.trim()
      if (!block) return ''
      // Don't wrap already-tagged blocks
      if (/^<(h[1-3]|ul|blockquote|hr)/.test(block)) return block
      return `<p>${block.replace(/\n/g, '<br/>')}</p>`
    })
    .join('\n')
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post || !post.published) notFound()

  const wordCount = post.content.split(/\s+/).filter(Boolean).length
  const readTime = Math.ceil(wordCount / 200)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.content.slice(0, 155),
    author: { "@type": "Person", name: post.authorName },
    publisher: { "@type": "Organization", name: "TÜDAP", url: BASE },
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: `${BASE}/blog/${slug}`,
    inLanguage: "tr",
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 flex-1">
        {/* Back link */}
        <Link
          href="/blog"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-10"
        >
          ← Blog
        </Link>

        {/* Header */}
        <header className="mb-10 pb-8 border-b border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-wider mb-3">
            <time>
              {new Date(post.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{readTime} dk okuma</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight text-balance">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <p className="text-xs text-muted-foreground">
              Yazar: <span className="font-medium text-foreground">{post.authorName}</span>
            </p>
            {(post as any).tags && (
              <div className="flex gap-1.5 flex-wrap">
                {(post as any).tags.split(',').map((t: string) => t.trim()).filter(Boolean).map((tag: string) => (
                  <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div
          className="
            prose prose-sm max-w-none
            prose-headings:font-serif prose-headings:text-foreground
            prose-p:text-foreground prose-p:leading-relaxed
            prose-strong:text-foreground prose-em:text-foreground
            prose-blockquote:border-accent prose-blockquote:text-muted-foreground prose-blockquote:not-italic
            prose-li:text-foreground prose-li:leading-relaxed
            prose-hr:border-border
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          "
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
