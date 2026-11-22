import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { cors } from 'hono/cors'
import { checkAccount } from './accounts.ts'
import { createPost, deletePost, listPosts, updatePost } from './db/posts.ts'
import { createProject, deleteProject, listProjects, updateProject } from './db/projects.ts'
import { asFiles, asText, saveImage } from './uploads.ts'
import { endSession, readSession, startSession } from './session.ts'
import {
  createRequest,
  deleteRequest,
  isRequestStatus,
  listRequests,
  updateRequestStatus,
} from './db/requests.ts'

export const app = new Hono()

app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  }),
)

app.get('/api/health', (c) => c.json({ ok: true }))

app.get('/api/session', (c) => {
  const session = readSession(c)
  if (!session) return c.json({ error: 'unauthorized' }, 401)
  return c.json(session)
})

app.post('/api/session', async (c) => {
  let body: { email?: string; password?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'invalid JSON' }, 400)
  }
  const role = checkAccount(body.email ?? '', body.password ?? '')
  if (!role || !body.email) return c.json({ error: 'invalid login' }, 401)
  startSession(c, { email: body.email.trim(), role })
  return c.json({ email: body.email.trim(), role })
})

app.delete('/api/session', (c) => {
  endSession(c)
  return c.body(null, 204)
})

async function guardRequests(c: Context, next: Next) {
  if (c.req.method === 'POST' && c.req.path === '/api/requests') return next()
  if (c.req.method === 'GET' && c.req.path.startsWith('/api/projects')) return next()
  if (c.req.method === 'GET' && c.req.path.startsWith('/api/posts')) return next()
  const session = readSession(c)
  if (!session) return c.json({ error: 'unauthorized' }, 401)
  if (c.req.method !== 'GET' && session.role !== 'admin') {
    return c.json({ error: 'view only' }, 403)
  }
  return next()
}

app.use('/api/requests', guardRequests)
app.use('/api/requests/*', guardRequests)
app.use('/api/projects', guardRequests)
app.use('/api/projects/*', guardRequests)
app.use('/api/posts', guardRequests)
app.use('/api/posts/*', guardRequests)

app.get('/api/projects', async (c) => {
  const rows = await listProjects()
  if (readSession(c)) return c.json(rows)
  return c.json(rows.filter((row) => row.published))
})

const projectCategories = [
  'Landscapes',
  'Hardscapes',
  'Lighting',
  'Pools & Water Features',
  'Commercial',
]

async function readProjectForm(c: Context) {
  const body = await c.req.parseBody({ all: true })
  const title = asText(body.title).trim()
  const categories = asText(body.categories)
    .split(',')
    .map((item) => item.trim())
    .filter((item) => projectCategories.includes(item))
  const published = asText(body.published) === 'true'
  const story = asText(body.body).trim()
  const video = asText(body.video).trim()
  const coverFile = asFiles(body.cover)[0]
  const cover = coverFile ? await saveImage(coverFile) : asText(body.coverPath).trim()
  const uploads = asFiles(body.uploads)
  let cursor = 0
  let blocks: Array<{ type: string; html?: string; images?: string[] }> = []
  try {
    const parsed = JSON.parse(story || '[]')
    if (Array.isArray(parsed)) blocks = parsed
  } catch {
    blocks = story ? [{ type: 'text', html: `<p>${story}</p>` }] : []
  }
  const nextBlocks = blocks.map((block) => {
    if (block.type !== 'photos') return block
    const images = [...(block.images ?? [])]
    const pending = Number((block as { pending?: number }).pending ?? 0)
    for (let i = 0; i < pending; i += 1) {
      const file = uploads[cursor]
      cursor += 1
      if (file) images.push('__file__')
    }
    return { ...block, images }
  })
  const saved: string[] = []
  for (const file of uploads) saved.push(await saveImage(file))
  let used = 0
  const finalBlocks = nextBlocks.map((block) => {
    if (block.type !== 'photos' || !block.images) return block
    return {
      type: 'photos',
      images: block.images.map((src) => (src === '__file__' ? saved[used++] ?? '' : src)).filter(Boolean),
    }
  })
  return {
    title,
    categories,
    published,
    body: JSON.stringify(finalBlocks),
    video,
    photos: finalBlocks.flatMap((block) => (block.type === 'photos' ? block.images ?? [] : [])),
    cover,
  }
}

app.post('/api/projects', async (c) => {
  const input = await readProjectForm(c)
  if (!input.title || !input.cover || input.categories.length === 0) {
    return c.json({ error: 'title, cover, and a category are required' }, 400)
  }
  const id = `${input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'project'}-${crypto.randomUUID().slice(0, 6)}`
  const photos = input.photos.length > 0 ? input.photos : [input.cover]
  return c.json(
    await createProject({ ...input, id, photos }),
    201,
  )
})

app.patch('/api/projects/:id', async (c) => {
  const input = await readProjectForm(c)
  if (!input.title || !input.cover || input.categories.length === 0) {
    return c.json({ error: 'title, cover, and a category are required' }, 400)
  }
  const photos = input.photos.length > 0 ? input.photos : [input.cover]
  const row = await updateProject(c.req.param('id'), { ...input, photos })
  if (!row) return c.json({ error: 'not found' }, 404)
  return c.json(row)
})

async function readPostForm(c: Context) {
  const body = await c.req.parseBody({ all: true })
  const title = asText(body.title).trim()
  const excerpt = asText(body.excerpt).trim()
  const postedOn = asText(body.postedOn).trim()
  const author = asText(body.author).trim()
  const published = asText(body.published) === 'true'
  const story = asText(body.body).trim()
  const coverFile = asFiles(body.cover)[0]
  const cover = coverFile ? await saveImage(coverFile) : asText(body.coverPath).trim()
  const uploads = asFiles(body.uploads)
  let blocks: Array<{ type: string; html?: string; images?: string[]; pending?: number }> = []
  try {
    const parsed = JSON.parse(story || '[]')
    if (Array.isArray(parsed)) blocks = parsed
  } catch {
    blocks = story ? [{ type: 'text', html: `<p>${story}</p>` }] : []
  }
  const saved: string[] = []
  for (const file of uploads) saved.push(await saveImage(file))
  let used = 0
  const finalBlocks = blocks.map((block) => {
    if (block.type !== 'photos') return { type: 'text', html: block.html ?? '' }
    const images = [...(block.images ?? [])]
    const pending = Number(block.pending ?? 0)
    for (let i = 0; i < pending; i += 1) {
      const src = saved[used++]
      if (src) images.push(src)
    }
    return { type: 'photos', images: images.filter((src) => src && src !== '__file__') }
  })
  return { title, excerpt, postedOn, author, published, cover, body: JSON.stringify(finalBlocks) }
}

app.get('/api/posts', async (c) => {
  const rows = await listPosts()
  if (readSession(c)) return c.json(rows)
  return c.json(rows.filter((row) => row.published))
})

app.post('/api/posts', async (c) => {
  const input = await readPostForm(c)
  if (!input.title || !input.cover) return c.json({ error: 'title and cover are required' }, 400)
  const id = `${input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'post'}-${crypto.randomUUID().slice(0, 6)}`
  return c.json(await createPost({ ...input, id }), 201)
})

app.patch('/api/posts/:id', async (c) => {
  const input = await readPostForm(c)
  if (!input.title || !input.cover) return c.json({ error: 'title and cover are required' }, 400)
  const row = await updatePost(c.req.param('id'), input)
  if (!row) return c.json({ error: 'not found' }, 404)
  return c.json(row)
})

app.delete('/api/posts/:id', async (c) => {
  const removed = await deletePost(c.req.param('id'))
  if (!removed) return c.json({ error: 'not found' }, 404)
  return c.body(null, 204)
})

app.delete('/api/projects/:id', async (c) => {
  const removed = await deleteProject(c.req.param('id'))
  if (!removed) return c.json({ error: 'not found' }, 404)
  return c.body(null, 204)
})

app.get('/api/requests', async (c) => {
  return c.json(await listRequests())
})

app.post('/api/requests', async (c) => {
  let body: {
    name?: string
    email?: string
    phone?: string
    message?: string
  }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'invalid JSON' }, 400)
  }
  if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
    return c.json({ error: 'name, email, and message are required' }, 400)
  }
  const row = await createRequest({
    name: body.name,
    email: body.email,
    phone: body.phone,
    message: body.message,
  })
  return c.json(row, 201)
})

app.patch('/api/requests/:id', async (c) => {
  let body: { status?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'invalid JSON' }, 400)
  }
  if (!body.status || !isRequestStatus(body.status)) {
    return c.json({ error: 'status must be new, contacted, or closed' }, 400)
  }
  const row = await updateRequestStatus(c.req.param('id'), body.status)
  if (!row) return c.json({ error: 'not found' }, 404)
  return c.json(row)
})

app.delete('/api/requests/:id', async (c) => {
  const removed = await deleteRequest(c.req.param('id'))
  if (!removed) return c.json({ error: 'not found' }, 404)
  return c.body(null, 204)
})
