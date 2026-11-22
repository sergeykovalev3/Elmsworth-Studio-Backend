import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const uploadDirectory =
  process.env.UPLOAD_DIR ??
  fileURLToPath(new URL('../../frontend/public/projects/', import.meta.url))

mkdirSync(uploadDirectory, { recursive: true })

export async function saveImage(file: File) {
  const ext = file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg'
  const name = `${crypto.randomUUID()}${ext}`
  writeFileSync(join(uploadDirectory, name), Buffer.from(await file.arrayBuffer()))
  return `/api/uploads/${name}`
}

export function asFiles(value: unknown): File[] {
  const list = Array.isArray(value) ? value : value ? [value] : []
  return list.filter((item): item is File => item instanceof File && item.size > 0)
}

export function asText(value: unknown) {
  return typeof value === 'string' ? value : ''
}
