import { desc, eq } from 'drizzle-orm'
import { db } from './index.ts'
import { requests } from './schema.ts'

export type RequestRow = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  status: 'new' | 'contacted' | 'closed'
  createdAt: string
}

const statuses = ['new', 'contacted', 'closed'] as const

export function isRequestStatus(value: string): value is RequestRow['status'] {
  return statuses.some((status) => status === value)
}

const memory: RequestRow[] = []

export function resetRequestMemory() {
  memory.length = 0
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value
}

export async function listRequests(): Promise<RequestRow[]> {
  if (!db) {
    return [...memory].reverse()
  }
  const rows = await db.select().from(requests).orderBy(desc(requests.createdAt))
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: isRequestStatus(row.status) ? row.status : 'new',
    createdAt: toIso(row.createdAt),
  }))
}

export async function createRequest(input: {
  name: string
  email: string
  phone?: string
  message: string
}): Promise<RequestRow> {
  const row: RequestRow = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    message: input.message.trim(),
    status: 'new',
    createdAt: new Date().toISOString(),
  }

  if (!db) {
    memory.push(row)
    return row
  }

  await db.insert(requests).values({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
  })
  return row
}

export async function updateRequestStatus(
  id: string,
  status: RequestRow['status'],
): Promise<RequestRow | null> {
  if (!db) {
    const row = memory.find((item) => item.id === id)
    if (!row) return null
    row.status = status
    return row
  }
  const [row] = await db
    .update(requests)
    .set({ status })
    .where(eq(requests.id, id))
    .returning()
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: isRequestStatus(row.status) ? row.status : 'new',
    createdAt: toIso(row.createdAt),
  }
}

export async function deleteRequest(id: string): Promise<boolean> {
  if (!db) {
    const index = memory.findIndex((item) => item.id === id)
    if (index < 0) return false
    memory.splice(index, 1)
    return true
  }
  const removed = await db.delete(requests).where(eq(requests.id, id)).returning()
  return removed.length > 0
}
