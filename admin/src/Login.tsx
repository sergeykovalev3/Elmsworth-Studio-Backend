import { useState, type FormEvent } from 'react'
import './Login.css'

export function Login({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [failed, setFailed] = useState(false)
  const [sending, setSending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (sending) return
    setSending(true)
    setFailed(false)
    const res = await fetch('/api/session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    setSending(false)
    if (!res.ok) {
      setFailed(true)
      return
    }
    onSuccess()
  }

  return (
    <div className="cabinet-login">
      <form onSubmit={submit}>
        <h1>Elmsworth cabinet</h1>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {failed ? <p>That login was not recognized.</p> : null}
        <button type="submit" className={sending ? 'is-sending' : undefined}>
          Sign in
        </button>
      </form>
    </div>
  )
}
