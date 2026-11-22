import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  DeleteConfirm,
  ViewOnlyNotice,
  RequestCard,
  statusLabel,
  type RequestRow,
  type RequestStatus,
} from './RequestCard'
import { Login } from './Login'
import { Blog } from './Blog'
import { Projects } from './Projects'
import './Cabinet.css'

type Section = 'requests' | 'projects' | 'blog'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Cabinet() {
  const queryClient = useQueryClient()
  const [section, setSection] = useState<Section>('requests')
  const [openId, setOpenId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [viewOnly, setViewOnly] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const session = useQuery({
    queryKey: ['session'],
    queryFn: async (): Promise<{ email: string; role: 'admin' | 'viewer' } | null> => {
      const res = await fetch('/api/session', { credentials: 'include' })
      if (res.status === 401) return null
      if (!res.ok) throw new Error('Failed to load session')
      return res.json()
    },
  })
  const canEdit = session.data?.role === 'admin'
  const requests = useQuery({
    queryKey: ['requests'],
    enabled: Boolean(session.data),
    queryFn: async (): Promise<RequestRow[]> => {
      const res = await fetch('/api/requests', { credentials: 'include' })
      if (!res.ok) {
        throw new Error('Failed to load requests')
      }
      return res.json()
    },
    refetchInterval: 4000,
  })

  const rows = requests.data ?? []
  const today = new Date().toDateString()
  const todayCount = rows.filter(
    (row) => new Date(row.createdAt).toDateString() === today,
  ).length
  const stillNew = rows.filter((row) => row.status === 'new').length
  const open = rows.find((row) => row.id === openId) ?? null
  const pending = rows.find((row) => row.id === pendingDeleteId) ?? null

  async function setStatus(id: string, status: RequestStatus) {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) return
    await queryClient.invalidateQueries({ queryKey: ['requests'] })
  }

  async function remove(id: string) {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok && res.status !== 204) return
    setOpenId(null)
    setPendingDeleteId(null)
    await queryClient.invalidateQueries({ queryKey: ['requests'] })
  }

  async function logout() {
    await fetch('/api/session', { method: 'DELETE', credentials: 'include' })
    setOpenId(null)
    await queryClient.invalidateQueries({ queryKey: ['session'] })
  }

  if (session.isLoading) {
    return <div className="cabinet" />
  }

  if (!session.data) {
    return (
      <Login
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ['session'] })
        }}
      />
    )
  }

  return (
    <div className={navOpen ? 'cabinet is-nav' : 'cabinet'}>
      <div className="cabinet-shell">
        <button
          type="button"
          className="cabinet-shade"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
        <aside className="cabinet-side">
          <div className="cabinet-brand">
            <span className="cabinet-mark">
              <i className="ti ti-leaf" />
            </span>
            Elmsworth
          </div>
          <nav className="cabinet-nav">
            <button
              type="button"
              className={section === 'requests' ? 'is-current' : undefined}
              onClick={() => {
                setSection('requests')
                setNavOpen(false)
              }}
            >
              <i className="ti ti-inbox" />
              Requests
            </button>
            <button
              type="button"
              className={section === 'projects' ? 'is-current' : undefined}
              onClick={() => {
                setSection('projects')
                setNavOpen(false)
              }}
            >
              <i className="ti ti-photo" />
              Projects
            </button>
            <button
              type="button"
              className={section === 'blog' ? 'is-current' : undefined}
              onClick={() => {
                setSection('blog')
                setNavOpen(false)
              }}
            >
              <i className="ti ti-news" />
              Blog
            </button>
          </nav>
          <div className="cabinet-side-foot">
            <a href={import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173'}>
              <i className="ti ti-arrow-left" />
              Back to site
            </a>
            <div className="cabinet-account">
              <span className="cabinet-account-email">{session.data.email}</span>
              <div className="cabinet-account-row">
                <span className={canEdit ? 'cabinet-role is-full' : 'cabinet-role'}>
                  {canEdit ? 'Full access' : 'View only'}
                </span>
                <button
                  type="button"
                  className="cabinet-signout"
                  aria-label="Sign out"
                  onClick={() => void logout()}
                >
                  <i className="ti ti-logout" />
                </button>
              </div>
            </div>
          </div>
        </aside>
        <div className="cabinet-main">
          <header className="cabinet-top">
            <button
              type="button"
              className="cabinet-menu"
              aria-label="Open menu"
              onClick={() => setNavOpen(true)}
            >
              <i className="ti ti-menu-2" />
            </button>
            <h1>{section === 'requests' ? 'Requests' : section === 'blog' ? 'Blog' : 'Projects'}</h1>
          </header>
          <div className={section === 'requests' ? 'cabinet-body' : 'cabinet-body is-split'}>
            {section === 'projects' ? <Projects canEdit={canEdit} onLocked={() => setViewOnly(true)} /> : null}
            {section === 'blog' ? <Blog canEdit={canEdit} onLocked={() => setViewOnly(true)} /> : null}
            {section === 'requests' ? (
            <>
            <div className="cabinet-stats">
              <div className="cabinet-stat">
                <span className="cabinet-stat-icon">
                  <i className="ti ti-inbox" />
                </span>
                <div>
                  <strong>{requests.isSuccess ? rows.length : '—'}</strong>
                  <span>All requests</span>
                </div>
              </div>
              <div className="cabinet-stat">
                <span className="cabinet-stat-icon">
                  <i className="ti ti-calendar" />
                </span>
                <div>
                  <strong>{requests.isSuccess ? todayCount : '—'}</strong>
                  <span>Arrived today</span>
                </div>
              </div>
              <div className="cabinet-stat">
                <span className="cabinet-stat-icon">
                  <i className="ti ti-phone" />
                </span>
                <div>
                  <strong>{requests.isSuccess ? stillNew : '—'}</strong>
                  <span>Still new</span>
                </div>
              </div>
            </div>
            <div className="cabinet-table">
              <div className="card">
                <div className="table-responsive">
                  <table className="table table-vcenter card-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Note</th>
                        <th>Status</th>
                        <th>Received</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {requests.isLoading ? (
                        <tr>
                          <td colSpan={6}>
                            <div className="cabinet-empty">Loading…</div>
                          </td>
                        </tr>
                      ) : null}
                      {requests.isError ? (
                        <tr>
                          <td colSpan={6}>
                            <div className="cabinet-empty">
                              Could not load requests. The API should be on port 3001.
                            </div>
                          </td>
                        </tr>
                      ) : null}
                      {requests.data?.length === 0 ? (
                        <tr>
                          <td colSpan={6}>
                            <div className="cabinet-empty">
                              <i className="ti ti-plant" />
                              <div>No requests yet.</div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td data-label="Name">
                            <div className="cabinet-person">
                              <span className="cabinet-avatar">{initials(row.name)}</span>
                              <span>{row.name}</span>
                            </div>
                          </td>
                          <td data-label="Contact">
                            <div>{row.email}</div>
                            <div className="text-secondary">{row.phone ?? '—'}</div>
                          </td>
                          <td data-label="Note">
                            <div className="cabinet-message">{row.message}</div>
                          </td>
                          <td data-label="Status">
                            <span className={`cabinet-pill is-${row.status}`}>
                              {statusLabel[row.status]}
                            </span>
                          </td>
                          <td className="text-secondary" data-label="Received">
                            {new Date(row.createdAt).toLocaleString()}
                          </td>
                          <td data-label="">
                            <div className="cabinet-row-actions">
                              <button type="button" onClick={() => setOpenId(row.id)}>
                                Open
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!canEdit) {
                                    setViewOnly(true)
                                    return
                                  }
                                  setPendingDeleteId(row.id)
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            </>
            ) : null}
          </div>
        </div>
      </div>
      {open ? (
        <RequestCard
          row={open}
          onClose={() => setOpenId(null)}
          onStatus={(status) => {
            if (!canEdit) {
              setViewOnly(true)
              return
            }
            void setStatus(open.id, status)
          }}
          onDelete={() => {
            if (!canEdit) {
              setViewOnly(true)
              return
            }
            setPendingDeleteId(open.id)
          }}
        />
      ) : null}
      {viewOnly ? <ViewOnlyNotice onClose={() => setViewOnly(false)} /> : null}
      {pending ? (
        <DeleteConfirm
          name={pending.name}
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => remove(pending.id)}
        />
      ) : null}
    </div>
  )
}
