'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Session = {
  id: string
  topic: string
  duration_minutes: number
  scheduled_date: string
  completed: boolean
  subjects: { name: string; color: string }
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function getThisWeekDate(dayName: string) {
  const now = new Date()
  const dayIndex = DAYS.indexOf(dayName)
  const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1 // Mon=0
  const diff = dayIndex - currentDay
  const target = new Date(now)
  target.setDate(now.getDate() + diff)
  return target.toISOString().split('T')[0]
}

export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('study_sessions')
      .select('*, subjects(name, color)')
      .eq('user_id', user!.id)
      .order('scheduled_date')
    setSessions((data || []) as any)
    setLoading(false)
  }

  useEffect(() => { fetchSessions() }, [])

  const generateSchedule = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/generate-schedule', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      await fetchSessions()
    } catch (e: any) {
      setError(e.message)
    }
    setGenerating(false)
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    await supabase.from('study_sessions').update({ completed: !completed }).eq('id', id)
    setSessions(prev => prev.map(s => s.id === id ? { ...s, completed: !completed } : s))
  }

  const clearSchedule = async () => {
    if (!confirm('Clear all sessions and generate a new schedule?')) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('study_sessions').delete().eq('user_id', user!.id)
    setSessions([])
  }

  const sessionsByDay: Record<string, Session[]> = {}
  DAYS.forEach(d => { sessionsByDay[d] = [] })
  sessions.forEach(s => {
    const date = new Date(s.scheduled_date + 'T00:00:00')
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
    const dayName = DAYS[dayIndex]
    if (sessionsByDay[dayName]) sessionsByDay[dayName].push(s)
  })

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '6px' }}>Study Schedule</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Your AI-generated weekly plan</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {sessions.length > 0 && (
            <button className="btn-secondary" style={{ width: 'auto' }} onClick={clearSchedule}>
              🗑 Clear
            </button>
          )}
          <button
            onClick={generateSchedule}
            disabled={generating}
            style={{
              padding: '11px 24px', borderRadius: '10px', border: 'none',
              background: generating ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--accent), #a855f7)',
              color: generating ? 'var(--text-muted)' : 'white',
              fontSize: '14px', fontWeight: '700', cursor: generating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {generating ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                Generating...
              </>
            ) : '🤖 Generate AI Schedule'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '14px 18px', borderRadius: '10px', marginBottom: '24px',
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          color: 'var(--danger)', fontSize: '14px',
        }}>
          ⚠️ {error}
          {error.includes('subjects') && <a href="/dashboard/subjects" style={{ color: 'var(--accent-bright)', marginLeft: '8px' }}>Add subjects →</a>}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
          {DAYS.map(d => <div key={d} className="skeleton" style={{ height: '200px' }} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass" style={{ padding: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>🤖</div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>No schedule yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
            Add your subjects first, then click "Generate AI Schedule" to create your personalized weekly plan.
          </p>
          <a href="/dashboard/subjects" style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '700',
          }}>Add Subjects First →</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', overflowX: 'auto' }}>
          {DAYS.map(day => (
            <div key={day}>
              <div style={{
                fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '10px',
                textAlign: 'center',
              }}>{day.slice(0, 3)}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sessionsByDay[day].length === 0 ? (
                  <div style={{
                    padding: '16px 8px', borderRadius: '10px', textAlign: 'center',
                    background: 'var(--bg-card)', border: '1px dashed var(--border)',
                    color: 'var(--text-muted)', fontSize: '12px',
                  }}>Rest day</div>
                ) : sessionsByDay[day].map(s => (
                  <div
                    key={s.id}
                    onClick={() => toggleComplete(s.id, s.completed)}
                    style={{
                      padding: '10px', borderRadius: '10px', cursor: 'pointer',
                      background: s.completed ? 'rgba(52,211,153,0.08)' : 'var(--bg-card)',
                      border: `1px solid ${s.completed ? 'rgba(52,211,153,0.3)' : 'var(--border)'}`,
                      transition: 'all 0.15s', opacity: s.completed ? 0.7 : 1,
                      borderLeft: `3px solid ${(s.subjects as any)?.color || 'var(--accent)'}`,
                    }}
                  >
                    {s.completed && <div style={{ fontSize: '12px', color: 'var(--success)', marginBottom: '4px' }}>✓ Done</div>}
                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.3',
                      textDecoration: s.completed ? 'line-through' : 'none', color: s.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}>{s.topic}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {(s.subjects as any)?.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      ⏱ {s.duration_minutes}m
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
