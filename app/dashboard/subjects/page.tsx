'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const COLORS = ['#7c6af0', '#34d399', '#f87171', '#fbbf24', '#60a5fa', '#f472b6', '#a78bfa', '#2dd4bf']

type Subject = {
  id: string
  name: string
  goal: string
  hours_per_week: number
  color: string
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', goal: '', hours_per_week: 5, color: COLORS[0] })
  const supabase = createClient()

  const fetchSubjects = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('subjects').select('*').eq('user_id', user!.id).order('created_at')
    setSubjects(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchSubjects() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('subjects').insert({ ...form, user_id: user!.id })
    setForm({ name: '', goal: '', hours_per_week: 5, color: COLORS[0] })
    setShowForm(false)
    await fetchSubjects()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('subjects').delete().eq('id', id)
    await fetchSubjects()
    setDeleting(null)
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '6px' }}>Subjects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Add subjects and set your weekly study goals</p>
        </div>
        <button
          className="btn-secondary"
          style={{ width: 'auto', whiteSpace: 'nowrap' }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Subject'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '24px' }}>New Subject</h2>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="label">Subject Name</label>
                <input className="input-field" placeholder="e.g. Mathematics"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Hours per Week</label>
                <input className="input-field" type="number" min="1" max="40"
                  value={form.hours_per_week}
                  onChange={e => setForm({ ...form, hours_per_week: parseInt(e.target.value) })} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="label">Study Goal</label>
              <input className="input-field" placeholder="e.g. Master calculus for final exam"
                value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} required />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="label">Color</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: c, border: form.color === c ? '3px solid white' : '3px solid transparent',
                      cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none',
                      outlineOffset: '2px', transition: 'outline 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={saving} style={{ width: 'auto', padding: '12px 32px' }}>
              {saving ? 'Adding...' : 'Add Subject'}
            </button>
          </form>
        </div>
      )}

      {/* Subjects list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '88px' }} />)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No subjects yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Add your first subject to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {subjects.map(s => (
            <div key={s.id} className="glass" style={{
              padding: '20px 24px', display: 'flex',
              alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                background: s.color + '22', border: `2px solid ${s.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: s.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{s.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.goal}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="badge badge-purple">{s.hours_per_week}h/week</div>
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                disabled={deleting === s.id}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: '18px', padding: '4px', lineHeight: 1,
                  transition: 'color 0.2s',
                }}
              >
                {deleting === s.id ? '...' : '×'}
              </button>
            </div>
          ))}
        </div>
      )}

      {subjects.length > 0 && (
        <div style={{
          marginTop: '24px', padding: '16px 20px', borderRadius: '12px',
          background: 'rgba(124,106,240,0.08)', border: '1px solid rgba(124,106,240,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Ready to generate your AI study schedule?
          </p>
          <a href="/dashboard/schedule" style={{
            padding: '8px 18px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            color: 'white', textDecoration: 'none', fontSize: '13px', fontWeight: '700',
          }}>Generate Schedule →</a>
        </div>
      )}
    </div>
  )
}
