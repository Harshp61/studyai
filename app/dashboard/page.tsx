import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('*, subjects(name, color)')
    .eq('user_id', user!.id)
    .order('scheduled_date', { ascending: true })

  const today = new Date().toISOString().split('T')[0]
  const todaySessions = sessions?.filter(s => s.scheduled_date === today) || []
  const completedSessions = sessions?.filter(s => s.completed) || []
  const upcomingSessions = sessions?.filter(s => s.scheduled_date >= today && !s.completed).slice(0, 5) || []

  const totalMinutes = completedSessions.reduce((acc, s) => acc + s.duration_minutes, 0)

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          Dashboard 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Here's your study overview
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Subjects', value: subjects?.length || 0, icon: '📚', color: '#7c6af0' },
          { label: "Today's Sessions", value: todaySessions.length, icon: '📅', color: '#34d399' },
          { label: 'Completed', value: completedSessions.length, icon: '✅', color: '#fbbf24' },
          { label: 'Hours Studied', value: `${Math.round(totalMinutes / 60)}h`, icon: '⏱️', color: '#f87171' },
        ].map(stat => (
          <div key={stat.label} className="glass" style={{ padding: '24px' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: stat.color, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Upcoming sessions */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Upcoming Sessions</h2>
            <Link href="/dashboard/schedule" style={{ fontSize: '13px', color: 'var(--accent-bright)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗓️</div>
              <p style={{ fontSize: '14px' }}>No upcoming sessions</p>
              <Link href="/dashboard/schedule" style={{
                display: 'inline-block', marginTop: '12px',
                color: 'var(--accent-bright)', textDecoration: 'none', fontSize: '13px', fontWeight: '600',
              }}>Generate a schedule →</Link>
            </div>
          ) : upcomingSessions.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px', borderRadius: '10px',
              background: 'var(--bg)', marginBottom: '8px',
            }}>
              <div style={{
                width: '4px', height: '40px', borderRadius: '2px',
                background: (s.subjects as any)?.color || 'var(--accent)',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{s.topic}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {(s.subjects as any)?.name} · {s.duration_minutes}min · {s.scheduled_date}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subjects */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Your Subjects</h2>
            <Link href="/dashboard/subjects" style={{ fontSize: '13px', color: 'var(--accent-bright)', textDecoration: 'none' }}>Manage →</Link>
          </div>
          {!subjects || subjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📖</div>
              <p style={{ fontSize: '14px' }}>No subjects yet</p>
              <Link href="/dashboard/subjects" style={{
                display: 'inline-block', marginTop: '12px',
                color: 'var(--accent-bright)', textDecoration: 'none', fontSize: '13px', fontWeight: '600',
              }}>Add your first subject →</Link>
            </div>
          ) : subjects.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px', borderRadius: '10px',
              background: 'var(--bg)', marginBottom: '8px',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: s.color + '22', border: `1px solid ${s.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
              }}>📚</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{s.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {s.hours_per_week}h/week
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      {(!subjects || subjects.length === 0) && (
        <div style={{
          marginTop: '24px', padding: '28px', borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(124,106,240,0.1), rgba(168,85,247,0.1))',
          border: '1px solid rgba(124,106,240,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
          flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>🚀 Get started</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Add your subjects, then generate an AI study schedule</p>
          </div>
          <Link href="/dashboard/subjects" style={{
            padding: '12px 24px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            color: 'white', textDecoration: 'none',
            fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap',
          }}>Add Subjects →</Link>
        </div>
      )}
    </div>
  )
}
