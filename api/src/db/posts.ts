import { eq } from 'drizzle-orm'
import { db } from './index.ts'
import { posts } from './schema.ts'

export type PostRow = {
  id: string
  title: string
  excerpt: string
  cover: string
  body: string
  postedOn: string
  author: string
  published: boolean
}

function toRow(row: {
  id: string
  title: string
  excerpt: string
  cover: string
  body: string
  postedOn: string
  author: string
  published: boolean
}): PostRow {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt ?? '',
    cover: row.cover,
    body: row.body ?? '',
    postedOn: row.postedOn ?? '',
    author: row.author ?? '',
    published: row.published,
  }
}

export async function listPosts(): Promise<PostRow[]> {
  if (!db) return []
  const rows = await db.select().from(posts)
  return rows.map(toRow)
}

export async function createPost(input: PostRow) {
  if (!db) throw new Error('database unavailable')
  await db.insert(posts).values(input)
  return input
}

export async function updatePost(id: string, input: Omit<PostRow, 'id'>) {
  if (!db) return null
  const [row] = await db.update(posts).set(input).where(eq(posts.id, id)).returning()
  return row ? toRow(row) : null
}

export async function deletePost(id: string) {
  if (!db) return false
  const removed = await db.delete(posts).where(eq(posts.id, id)).returning()
  return removed.length > 0
}
