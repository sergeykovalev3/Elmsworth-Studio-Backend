import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { BlogEditor, type PostRow } from './BlogEditor'
import './ProjectEditor.css'
import './Projects.css'

const site = import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173'

export function Blog({ canEdit, onLocked }: { canEdit: boolean; onLocked: () => void }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<PostRow | null | undefined>(undefined)
  const posts = useQuery({
    queryKey: ['posts', canEdit],
    queryFn: async (): Promise<PostRow[]> => {
      const res = await fetch('/api/posts', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load posts')
      return res.json()
    },
  })

  function saved() {
    setEditing(undefined)
    void queryClient.invalidateQueries({ queryKey: ['posts'] })
  }

  if (posts.isLoading) return <div className="cabinet-empty">Loading…</div>
  if (posts.isError) return <div className="cabinet-empty">Could not load posts.</div>

  if (editing !== undefined) {
    return (
      <BlogEditor
        post={editing}
        canEdit={canEdit}
        onLocked={onLocked}
        onClose={() => setEditing(undefined)}
        onSaved={saved}
      />
    )
  }

  return (
    <>
      <div className="project-bar">
        <button
          type="button"
          className="project-add"
          onClick={() => setEditing(null)}
        >
          <i className="ti ti-plus" />
          Add post
        </button>
      </div>
      <div className="project-list">
        {posts.data?.map((post) => (
          <button
            key={post.id}
            type="button"
            className="project-card"
            onClick={() => setEditing(post)}
          >
            <img src={`${site}${post.cover}`} alt="" />
            <div>
              <h2>{post.title}</h2>
              <p>{post.postedOn}</p>
              <span className={post.published ? undefined : 'is-draft'}>
                {post.published ? 'On the site' : 'Draft'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}
