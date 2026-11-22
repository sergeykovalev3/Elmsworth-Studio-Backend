import { useState } from 'react'
import './RequestCard.css'

export type RequestStatus = 'new' | 'contacted' | 'closed'

export type RequestRow = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  status: RequestStatus
  createdAt: string
}

export const statusLabel: Record<RequestStatus, string> = {
  new: 'New',
  contacted: 'In touch',
  closed: 'Closed',
}

export function RequestCard({
  row,
  onClose,
  onStatus,
  onDelete,
}: {
  row: RequestRow
  onClose: () => void
  onStatus: (status: RequestStatus) => void
  onDelete: () => void
}) {
  const [leaving, setLeaving] = useState(false)

  function close() {
    if (leaving) return
    setLeaving(true)
    window.setTimeout(onClose, 520)
  }

  return (
    <div className={leaving ? 'cabinet-drawer is-leaving' : 'cabinet-drawer'}>
      <button type="button" className="cabinet-drawer-shade" aria-label="Close" onClick={close} />
      <aside className="cabinet-drawer-panel" role="dialog" aria-label={row.name}>
        <header>
          <h2>{row.name}</h2>
          <button type="button" className="cabinet-icon-btn" aria-label="Close" onClick={close}>
            <i className="ti ti-x" />
          </button>
        </header>
        <p className="cabinet-drawer-meta">{new Date(row.createdAt).toLocaleString()}</p>
        <dl>
          <div>
            <dt>Email</dt>
            <dd>{row.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{row.phone ?? '—'}</dd>
          </div>
          <div>
            <dt>Note</dt>
            <dd className="cabinet-message">{row.message}</dd>
          </div>
        </dl>
        <div className="cabinet-status">
          {(Object.keys(statusLabel) as RequestStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              className={row.status === status ? 'is-current' : undefined}
              onClick={() => onStatus(status)}
            >
              {statusLabel[status]}
            </button>
          ))}
        </div>
        <button type="button" className="cabinet-delete" onClick={onDelete}>
          Delete
        </button>
      </aside>
    </div>
  )
}

export function ViewOnlyNotice({ onClose }: { onClose: () => void }) {
  return (
    <div className="cabinet-confirm">
      <button type="button" className="cabinet-confirm-shade" aria-label="Close" onClick={onClose} />
      <div className="cabinet-confirm-panel" role="dialog" aria-labelledby="view-only-title">
        <h2 id="view-only-title">View only</h2>
        <p>
          You were given access to look, not to change anything. Want a site like this? Order one
          at{' '}
          <a href="https://skovalev.com/" target="_blank" rel="noreferrer">
            skovalev.com
          </a>
          .
        </p>
        <div className="cabinet-confirm-actions">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function DeleteConfirm({
  name,
  onCancel,
  onConfirm,
}: {
  name: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="cabinet-confirm">
      <button type="button" className="cabinet-confirm-shade" aria-label="Cancel" onClick={onCancel} />
      <div className="cabinet-confirm-panel" role="dialog" aria-labelledby="delete-request-title">
        <h2 id="delete-request-title">Delete this request?</h2>
        <p>{name} will be removed from the list.</p>
        <div className="cabinet-confirm-actions">
          <button type="button" onClick={onCancel}>
            Keep
          </button>
          <button type="button" className="cabinet-delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
