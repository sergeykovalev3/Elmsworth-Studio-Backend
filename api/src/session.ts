import { randomBytes } from 'node:crypto'
import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Role } from './accounts.ts'

const cookie = 'cabinet_session'

type Session = {
  email: string
  role: Role
}

const sessions = new Map<string, Session>()

export function resetSessions() {
  sessions.clear()
}

export function startSession(c: Context, session: Session) {
  const token = randomBytes(24).toString('hex')
  sessions.set(token, session)
  setCookie(c, cookie, token, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
  })
}

export function readSession(c: Context): Session | null {
  const token = getCookie(c, cookie)
  if (!token) return null
  return sessions.get(token) ?? null
}

export function endSession(c: Context) {
  const token = getCookie(c, cookie)
  if (token) sessions.delete(token)
  deleteCookie(c, cookie, { path: '/' })
}
