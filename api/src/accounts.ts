import { timingSafeEqual } from 'node:crypto'

export type Role = 'admin' | 'viewer'

type Account = {
  email: string
  password: string
  role: Role
}

function required(name: string) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Set ${name} in api/.env`)
  }
  return value
}

export function accounts(): Account[] {
  return [
    {
      email: required('ADMIN_EMAIL'),
      password: required('ADMIN_PASSWORD'),
      role: 'admin',
    },
    {
      email: required('VIEWER_EMAIL'),
      password: required('VIEWER_PASSWORD'),
      role: 'viewer',
    },
  ]
}

export function checkAccount(email: string, password: string): Role | null {
  const found = accounts().find(
    (account) => account.email.toLowerCase() === email.trim().toLowerCase(),
  )
  if (!found) return null
  const left = Buffer.from(found.password)
  const right = Buffer.from(password)
  if (left.length !== right.length) return null
  return timingSafeEqual(left, right) ? found.role : null
}
