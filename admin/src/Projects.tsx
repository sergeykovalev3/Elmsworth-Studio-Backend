import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ProjectEditor, type ProjectRow } from './ProjectEditor'
import './ProjectEditor.css'
import './Projects.css'

const site = import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173'

export function Projects({ canEdit, onLocked }: { canEdit: boolean; onLocked: () => void }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<ProjectRow | null | undefined>(undefined)
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<ProjectRow[]> => {
      const res = await fetch('/api/projects', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load projects')
      return res.json()
    },
  })

  function saved() {
    setEditing(undefined)
    void queryClient.invalidateQueries({ queryKey: ['projects'] })
  }

  if (projects.isLoading) return <div className="cabinet-empty">Loading…</div>
  if (projects.isError) return <div className="cabinet-empty">Could not load projects.</div>

  if (editing !== undefined) {
    return (
      <ProjectEditor
        project={editing}
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
          Add project
        </button>
      </div>
      <div className="project-list">
        {projects.data?.map((project) => (
          <button
            key={project.id}
            type="button"
            className="project-card"
            onClick={() => setEditing(project)}
          >
            <img src={`${site}${project.cover}`} alt="" />
            <div>
              <h2>{project.title}</h2>
              <p>{project.categories.join(', ')}</p>
              <p>{project.photos.length} photos</p>
              <span className={project.published ? undefined : 'is-draft'}>
                {project.published ? 'On the site' : 'Draft'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}
