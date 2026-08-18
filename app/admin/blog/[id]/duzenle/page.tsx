import { notFound } from "next/navigation"
import { BlogEditor } from "@/components/admin/blog-editor"
import { db } from "@/lib/db"
import { blogPosts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

type Props = { params: Promise<{ id: string }> }

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, Number(id))).limit(1)
  if (!post) notFound()
  return <BlogEditor post={post} />
}
