import { useEffect, useRef, useState, type FormEvent } from 'react'
import './ProjectEditor.css'

const site = import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173'

export const projectCategories = [
  'Landscapes',
  'Hardscapes',
  'Lighting',
  'Pools & Water Features',
  'Commercial',
]

export type ProjectRow = {
  id: string
  title: string
  cover: string
  photos: string[]
  categories: string[]
  body: string
  video: string
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
    /* older plain text */
  }
  return body ? [{ type: 'text', html: `<p>${body}</p>` }] : [{ type: 'text', html: '' }]
}

export function RichText({
  html,
  onChange,
}: {
  html: string
  onChange: (html: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html
  }, [html])

  return (
    <div className="project-rich-wrap">
      <div className="project-tools">
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => document.execCommand('bold')}>
          Bold
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => document.execCommand('italic')}>
          Italic
        </button>
        <button
          type="button"
          className="is-h1"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => document.execCommand('formatBlock', false, 'h1')}
        >
          Main heading
        </button>
        <button
          type="button"
          className="is-h2"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => document.execCommand('formatBlock', false, 'h2')}
        >
          Section
        </button>
        <button
          type="button"
          className="is-h3"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => document.execCommand('formatBlock', false, 'h3')}
        >
          Small heading
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => document.execCommand('formatBlock', false, 'p')}
        >
          Text
        </button>
      </div>
      <div
        ref={ref}
        className="project-rich"
        contentEditable
        role="textbox"
        aria-multiline
        onBlur={() => onChange(ref.current?.innerHTML ?? '')}
      />
    </div>
  )
}

export function ProjectEditor({
  project,
  canEdit,
  onLocked,
  onClose,
  onSaved,
}: {
  project: ProjectRow | null
  canEdit: boolean
  onLocked: () => void
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(project?.title ?? '')
  const [video, setVideo] = useState(project?.video ?? '')
  const [blocks, setBlocks] = useState<Block[]>(() => readBlocks(project?.body ?? ''))
  const [categories, setCategories] = useState<string[]>(project?.categories ?? [])
  const [published, setPublished] = useState(project?.published ?? true)
  const [coverPath, setCoverPath] = useState(project?.cover ?? '')
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
    if (!title.trim() || categories.length === 0 || (!coverPath && !coverFile)) {
      setError('Add a title, a cover, and at least one category.')
      return
    }
    setSaving(true)
    setError('')
    const form = new FormData()
    form.set('title', title.trim())
    form.set('video', video.trim())
    form.set('categories', categories.join(','))
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
    const res = await fetch(project ? `/api/projects/${project.id}` : '/api/projects', {
      method: project ? 'PATCH' : 'POST',
      credentials: 'include',
      body: form,
    })
    setSaving(false)
    if (!res.ok) {
      setError('Could not save this project.')
      return
    }
    onSaved()
  }

  async function remove() {
    if (!canEdit) {
      onLocked()
      return
    }
    if (!project || saving) return
    setSaving(true)
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    setSaving(false)
    if (res.ok || res.status === 204) onSaved()
  }

  const coverPreview = coverFile ? URL.createObjectURL(coverFile) : coverPath ? `${site}${coverPath}` : ''

  return (
    <form className="project-editor-page" onSubmit={submit}>
      <div className="project-editor-head">
        <button type="button" className="project-back" onClick={onClose}>
          <i className="ti ti-arrow-left" />
          Projects
        </button>
        <div className="project-editor-actions">
          {project ? (
            <button type="button" className="is-delete" onClick={() => void remove()}>
              Delete
            </button>
          ) : null}
          <button type="submit" className={saving ? 'is-sending' : undefined}>
            Save
          </button>
        </div>
      </div>
      <h2>{project ? 'Edit project' : 'New project'}</h2>
      <label>
        Title
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        Video link
        <input
          value={video}
          placeholder="YouTube link, or leave empty"
          onChange={(event) => setVideo(event.target.value)}
        />
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
                  onClick={() => setBlocks(blocks.filter((_, i) => i !== index))}
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
                        update(index, {
                          ...block,
                          images: block.images.filter((item) => item !== src),
                        })
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
                        update(index, {
                          ...block,
                          files: block.files.filter((_, i) => i !== fileIndex),
                        })
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
          <button type="button" onClick={() => setBlocks([...blocks, { type: 'text', html: '' }])}>
            Add text
          </button>
          <button
            type="button"
            onClick={() => setBlocks([...blocks, { type: 'photos', images: [], files: [] }])}
          >
            Add photos
          </button>
        </div>
      </div>
      <fieldset>
        <legend>Categories</legend>
        <div className="project-checks">
          {projectCategories.map((label) => (
            <label key={label} className="project-check">
              <input
                type="checkbox"
                checked={categories.includes(label)}
                onChange={() =>
                  setCategories((current) =>
                    current.includes(label)
                      ? current.filter((item) => item !== label)
                      : [...current, label],
                  )
                }
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="project-check">
        <input
          type="checkbox"
          checked={published}
          onChange={(event) => setPublished(event.target.checked)}
        />
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
      {error ? <p className="project-editor-error">{error}</p> : null}
    </form>
  )
}
