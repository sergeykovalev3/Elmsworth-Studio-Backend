import { eq } from 'drizzle-orm'
import { db } from './index.ts'
import { projects } from './schema.ts'

export type ProjectRow = {
  id: string
  title: string
  cover: string
  photos: string[]
  categories: string[]
  body: string
  video: string
  published: boolean
}

function toRow(row: {
  id: string
  title: string
  cover: string
  photos: string
  categories: string
  body: string
  video: string
  published: boolean
}): ProjectRow {
  return {
    id: row.id,
    title: row.title,
    cover: row.cover,
    photos: row.photos.split(',').filter(Boolean),
    categories: row.categories.split(',').filter(Boolean),
    body: row.body ?? '',
    video: row.video ?? '',
    published: row.published,
  }
}

export async function listProjects(): Promise<ProjectRow[]> {
  if (!db) return []
  const rows = await db.select().from(projects)
  return rows.map(toRow)
}

export async function createProject(input: Omit<ProjectRow, 'id'> & { id: string }) {
  if (!db) throw new Error('database unavailable')
  await db.insert(projects).values({
    id: input.id,
    title: input.title,
    cover: input.cover,
    photos: input.photos.join(','),
    categories: input.categories.join(','),
    body: input.body,
    video: input.video,
    published: input.published,
  })
  return input
}

export async function updateProject(id: string, input: Omit<ProjectRow, 'id'>) {
  if (!db) return null
  const [row] = await db
    .update(projects)
    .set({
      title: input.title,
      cover: input.cover,
      photos: input.photos.join(','),
      categories: input.categories.join(','),
      body: input.body,
      video: input.video,
      published: input.published,
    })
    .where(eq(projects.id, id))
    .returning()
  return row ? toRow(row) : null
}

export async function deleteProject(id: string) {
  if (!db) return false
  const removed = await db.delete(projects).where(eq(projects.id, id)).returning()
  return removed.length > 0
}
