import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import './test-env.ts'
import { checkAccount } from './accounts.ts'
import { app } from './app.ts'
import { resetRequestMemory } from './db/requests.ts'
import { resetSessions } from './session.ts'

const admin = { email: 'ada@studio.test', password: 'studio-admin-test' }
const viewer = { email: 'lee@studio.test', password: 'studio-viewer-test' }

beforeEach(() => {
  resetRequestMemory()
  resetSessions()
})

async function login(account: { email: string; password: string }) {
  const res = await app.request('/api/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(account),
  })
  assert.equal(res.status, 200)
  const cookie = res.headers.get('set-cookie')?.split(';')[0]
  assert.ok(cookie)
  return cookie
}

function json(body: unknown, cookie?: string) {
  return {
    method: 'POST' as const,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  }
}

test('checkAccount accepts the studio logins', () => {
  assert.equal(checkAccount('Ada@studio.test', admin.password), 'admin')
  assert.equal(checkAccount(viewer.email, viewer.password), 'viewer')
  assert.equal(checkAccount(admin.email, 'nope'), null)
  assert.equal(checkAccount('nobody@studio.test', admin.password), null)
})

test('a request needs a name, an email, and a message', async () => {
  const empty = await app.request('/api/requests', json({}))
  assert.equal(empty.status, 400)
  const blank = await app.request(
    '/api/requests',
    json({ name: '  ', email: 'ada@studio.test', message: 'Hello' }),
  )
  assert.equal(blank.status, 400)
  const listed = await app.request('/api/requests', {
    headers: { cookie: await login(admin) },
  })
  assert.deepEqual(await listed.json(), [])
})

test('a submitted request is visible only to admins', async () => {
  const created = await app.request(
    '/api/requests',
    json({
      name: 'Ada Voss',
      email: 'ada@studio.test',
      phone: '5715550148',
      isDemo: true,
      message: 'Property: 410 Elm Street',
    }),
  )
  assert.equal(created.status, 201)
  const row = await created.json()
  assert.equal(row.status, 'new')
  assert.equal(row.name, 'Ada Voss')

  const hidden = await app.request('/api/requests')
  assert.equal(hidden.status, 401)

  const listed = await app.request('/api/requests', {
    headers: { cookie: await login(admin) },
  })
  assert.equal(listed.status, 200)
  const rows = await listed.json()
  assert.equal(rows.length, 1)
  assert.equal(rows[0].id, row.id)

  const demo = await app.request('/api/requests', {
    headers: { cookie: await login(viewer) },
  })
  assert.equal(demo.status, 200)
  assert.deepEqual(await demo.json(), [])
})

test('status changes stay inside the known set and need an admin', async () => {
  const created = await app.request(
    '/api/requests',
    json({ name: 'Ada Voss', email: 'ada@studio.test', message: 'A court in Millvale' }),
  )
  const row = await created.json()
  const path = `/api/requests/${row.id}`

  const stranger = await app.request(path, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'contacted' }),
  })
  assert.equal(stranger.status, 401)

  const reader = await app.request(path, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      cookie: await login(viewer),
    },
    body: JSON.stringify({ status: 'contacted' }),
  })
  assert.equal(reader.status, 403)

  const adminCookie = await login(admin)
  const bad = await app.request(path, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({ status: 'won' }),
  })
  assert.equal(bad.status, 400)

  const updated = await app.request(path, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({ status: 'contacted' }),
  })
  assert.equal(updated.status, 200)
  assert.equal((await updated.json()).status, 'contacted')

  const missing = await app.request('/api/requests/missing', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({ status: 'closed' }),
  })
  assert.equal(missing.status, 404)
})

test('projects and notes cannot be changed without a session', async () => {
  const project = await app.request('/api/projects', { method: 'POST' })
  assert.equal(project.status, 401)
  const post = await app.request('/api/posts/lawn-after-rain', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Changed' }),
  })
  assert.equal(post.status, 401)
})

test('viewer cannot send any cabinet mutation', async () => {
  const cookie = await login(viewer)
  for (const resource of ['requests', 'projects', 'posts']) {
    const created = await app.request(`/api/${resource}`, json({}, cookie))
    assert.equal(created.status, 403)
    for (const method of ['PATCH', 'DELETE']) {
      const response = await app.request(`/api/${resource}/example`, {
        method,
        headers: { cookie },
      })
      assert.equal(response.status, 403)
    }
  }
})

test('public JSON endpoints reject large or malformed field values', async () => {
  const large = await app.request('/api/requests', json({ message: 'x'.repeat(17_000) }))
  assert.equal(large.status, 413)
  const invalid = await app.request('/api/requests', json({ name: 123 }))
  assert.equal(invalid.status, 400)
  const login = await app.request('/api/session', json({ email: [] }))
  assert.equal(login.status, 401)
})
