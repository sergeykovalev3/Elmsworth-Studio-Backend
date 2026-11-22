import { randomBytes } from 'node:crypto'
import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Role } from './accounts.ts'

const cookie = 'cabinet_session'

type Session = {
  email: string
  role: Role
}

const maxAge = 8 * 60 * 60
const sessions = new Map<string, Session & { expiresAt: number }>()
const tokensByRole = {
  admin: new Set<string>(),
  viewer: new Set<string>(),
}

function removeSession(token: string) {
  const session = sessions.get(token)
  if (session) tokensByRole[session.role].delete(token)
  sessions.delete(token)
}

export function resetSessions() {
  sessions.clear()
  tokensByRole.admin.clear()
  tokensByRole.viewer.clear()
}

export function startSession(c: Context, session: Session) {
  const token = randomBytes(24).toString('hex')
  const previous = getCookie(c, cookie)
  if (previous) removeSession(previous)
  const tokens = tokensByRole[session.role]
  const limit = session.role === 'admin' ? 32 : 2048
  if (tokens.size >= limit) {
    const oldest = tokens.values().next().value
    if (oldest) removeSession(oldest)
  }
  tokens.add(token)
  sessions.set(token, { ...session, expiresAt: Date.now() + maxAge * 1000 })
  setCookie(c, cookie, token, {
    httpOnly: true,
    maxAge,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
  })
}

export function readSession(c: Context): Session | null {
  const token = getCookie(c, cookie)
  if (!token) return null
  const session = sessions.get(token)
  if (!session) return null
  if (session.expiresAt <= Date.now()) {
    removeSession(token)
    return null
  }
  return { email: session.email, role: session.role }
}

export function endSession(c: Context) {
  const token = getCookie(c, cookie)
  if (token) removeSession(token)
  deleteCookie(c, cookie, { path: '/' })
}
