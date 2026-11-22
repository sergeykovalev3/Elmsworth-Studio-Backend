import { useState, type FormEvent } from 'react'
import { RichText } from './ProjectEditor'
import './ProjectEditor.css'

const site = 'http://localhost:5173'

export type PostRow = {
  id: string
  title: string
  excerpt: string
  cover: string
  body: string
  postedOn: string
  author: string
  published: boolean
}

type TextBlock = { type: 'text'; html: string }
type PhotoBlock = { type: 'photos'; images: string[]; files: File[] }
type Block = TextBlock | PhotoBlock

function readBlocks(body: string): Block[] {
  try {
    const parsed = JSON.parse(body) as Array<{ type?: string; html?: string; images?: string[] }>
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((block) =>
        block.type === 'photos'
          ? { type: 'photos', images: block.images ?? [], files: [] }
          : { type: 'text', html: block.html ?? '' },
      )
    }
  } catch {
    /* plain text */
  }
  return [{ type: 'text', html: body ? `<p>${body}</p>` : '' }]
}

export function BlogEditor({
  post,
  canEdit,
  onLocked,
  onClose,
  onSaved,
}: {
  post: PostRow | null
  canEdit: boolean
  onLocked: () => void
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [postedOn, setPostedOn] = useState(post?.postedOn ?? '')
  const [author, setAuthor] = useState(post?.author ?? 'Mara Voss')
  const [blocks, setBlocks] = useState<Block[]>(() => readBlocks(post?.body ?? ''))
  const [published, setPublished] = useState(post?.published ?? true)
  const [coverPath, setCoverPath] = useState(post?.cover ?? '')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function update(index: number, next: Block) {
    setBlocks((current) => current.map((block, i) => (i === index ? next : block)))
  }

  function move(index: number, direction: -1 | 1) {
    setBlocks((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const copy = [...current]
      const [item] = copy.splice(index, 1)
      copy.splice(target, 0, item)
      return copy
    })
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!canEdit) {
      onLocked()
      return
    }
    if (saving) return
    if (!title.trim() || (!coverPath && !coverFile)) {
      setError('Add a title and a cover.')
      return
    }
    setSaving(true)
    setError('')
    const form = new FormData()
    form.set('title', title.trim())
    form.set('excerpt', excerpt.trim())
    form.set('postedOn', postedOn.trim())
    form.set('author', author.trim())
    form.set('published', String(published))
    form.set('coverPath', coverPath)
    form.set(
      'body',
      JSON.stringify(
        blocks.map((block) =>
          block.type === 'text'
            ? block
            : { type: 'photos', images: block.images, pending: block.files.length },
        ),
      ),
    )
    if (coverFile) form.set('cover', coverFile)
    blocks.forEach((block) => {
      if (block.type === 'photos') block.files.forEach((file) => form.append('uploads', file))
    })
    const res = await fetch(post ? `/api/posts/${post.id}` : '/api/posts', {
      method: post ? 'PATCH' : 'POST',
      credentials: 'include',
      body: form,
    })
    setSaving(false)
    if (!res.ok) {
      setError('Could not save this post.')
      return
    }
    onSaved()
  }

  async function remove() {
    if (!canEdit) {
      onLocked()
      return
    }
    if (!post || saving) return
    setSaving(true)
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE', credentials: 'include' })
    setSaving(false)
    if (res.ok || res.status === 204) onSaved()
  }

  const coverPreview = coverFile ? URL.createObjectURL(coverFile) : coverPath ? `${site}${coverPath}` : ''

  return (
    <form className="project-editor-page" onSubmit={submit}>
      <div className="project-editor-head">
        <button type="button" className="project-back" onClick={onClose}>
          <i className="ti ti-arrow-left" />
          Blog
        </button>
        <div className="project-editor-actions">
          {post ? (
            <button type="button" className="project-delete" onClick={() => void remove()}>
              Delete
            </button>
          ) : null}
          <button type="submit" className="project-save" disabled={saving}>
            Save
          </button>
        </div>
      </div>
      <label>
        Title
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        Date
        <input value={postedOn} onChange={(event) => setPostedOn(event.target.value)} placeholder="April 18, 2026" />
      </label>
      <label>
        Author
        <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Mara Voss" />
      </label>
      <label>
        Summary
        <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={3} />
      </label>
      <div className="project-blocks">
      {blocks.map((block, index) => (
        <section key={index} className="project-block">
          <div className="project-block-bar">
            <span>{block.type === 'text' ? 'Text' : 'Photos'}</span>
            <div className="project-block-actions">
              <button type="button" onClick={() => move(index, -1)} aria-label="Move up">
                <i className="ti ti-arrow-up" />
              </button>
              <button type="button" onClick={() => move(index, 1)} aria-label="Move down">
                <i className="ti ti-arrow-down" />
              </button>
              <button
                type="button"
                onClick={() => setBlocks((current) => current.filter((_, i) => i !== index))}
                aria-label="Remove block"
              >
                <i className="ti ti-trash" />
              </button>
            </div>
          </div>
          {block.type === 'text' ? (
            <RichText html={block.html} onChange={(html) => update(index, { type: 'text', html })} />
          ) : (
            <div className="project-editor-photos">
              {block.images.map((src) => (
                <div key={src} className="project-photo-tile">
                  <img src={`${site}${src}`} alt="" />
                  <button
                    type="button"
                    className="project-photo-remove"
                    aria-label="Remove photo"
                    onClick={() =>
                      update(index, { ...block, images: block.images.filter((item) => item !== src) })
                    }
                  >
                    <i className="ti ti-x" />
                  </button>
                </div>
              ))}
              {block.files.map((file, fileIndex) => (
                <div key={`${file.name}-${file.size}-${fileIndex}`} className="project-photo-tile">
                  <img src={URL.createObjectURL(file)} alt="" />
                  <button
                    type="button"
                    className="project-photo-remove"
                    aria-label="Remove photo"
                    onClick={() =>
                      update(index, { ...block, files: block.files.filter((_, i) => i !== fileIndex) })
                    }
                  >
                    <i className="ti ti-x" />
                  </button>
                </div>
              ))}
              <label className="project-photo-add">
                <i className="ti ti-plus" />
                Add photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    const picked = [...(event.target.files ?? [])]
                    update(index, { ...block, files: [...block.files, ...picked] })
                    event.target.value = ''
                  }}
                />
              </label>
            </div>
          )}
        </section>
      ))}
      <div className="project-block-add">
        <button type="button" onClick={() => setBlocks((current) => [...current, { type: 'text', html: '' }])}>
          Add text
        </button>
        <button
          type="button"
          onClick={() => setBlocks((current) => [...current, { type: 'photos', images: [], files: [] }])}
        >
          Add photos
        </button>
      </div>
      </div>
      <label className="project-check">
        <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
        Show on the site
      </label>
      <div className="project-cover-field">
        <span>Cover</span>
        <label className="project-photo-add is-cover">
          <i className="ti ti-photo" />
          {coverFile ? coverFile.name : 'Choose cover'}
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {coverPreview ? (
        <div className="project-photo-tile">
          <img className="project-editor-cover" src={coverPreview} alt="" />
          <button
            type="button"
            className="project-photo-remove"
            aria-label="Remove cover"
            onClick={() => {
              setCoverFile(null)
              setCoverPath('')
            }}
          >
            <i className="ti ti-x" />
          </button>
        </div>
      ) : null}
      {error ? <p className="project-error">{error}</p> : null}
    </form>
  )
}
