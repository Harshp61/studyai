import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        opacity: 0.4,
      }} />

      {/* Gradient orbs */}
      <div style={{
        position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '600px',
        background: 'radial-gradient(ellipse, rgba(124,106,240,0.2) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>📚</div>
          <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>StudyAI</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user ? (
            <Link href="/dashboard" style={{
              padding: '8px 24px', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              color: 'white', textDecoration: 'none',
              fontSize: '14px', fontWeight: '600',
            }}>Go to Dashboard</Link>
          ) : (
            <>
              <Link href="/login" style={{
                padding: '8px 20px', borderRadius: '8px',
                border: '1px solid var(--border-bright)', color: 'var(--text-primary)',
                textDecoration: 'none', fontSize: '14px', fontWeight: '500',
                transition: 'border-color 0.2s',
              }}>Log in</Link>
              <Link href="/signup" style={{
                padding: '8px 20px', borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent), #a855f7)',
                color: 'white', textDecoration: 'none',
                fontSize: '14px', fontWeight: '600',
              }}>Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
      }}>
        <div className="badge badge-purple" style={{ marginBottom: '24px', fontSize: '12px' }}>
          ✨ Powered by Google Gemini AI
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 7vw, 80px)',
          fontWeight: '800',
          lineHeight: '1.05',
          letterSpacing: '-0.03em',
          maxWidth: '800px',
          marginBottom: '24px',
        }}>
          Study smarter with{' '}
          <span className="gradient-text">AI-crafted</span>
          {' '}schedules
        </h1>

        <p style={{
          fontSize: '18px', color: 'var(--text-secondary)',
          maxWidth: '520px', lineHeight: '1.7', marginBottom: '40px',
        }}>
          Tell us your subjects and goals. Our AI builds a personalized weekly study plan — then tracks your progress automatically.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href={user ? "/dashboard" : "/signup"} style={{
            padding: '14px 32px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            color: 'white', textDecoration: 'none',
            fontSize: '16px', fontWeight: '700',
            boxShadow: '0 8px 32px var(--accent-glow)',
          }}>
            {user ? "Go to Dashboard →" : "Start Planning Free →"}
          </Link>
          {!user && (
            <Link href="/login" style={{
              padding: '14px 32px', borderRadius: '12px',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-primary)', textDecoration: 'none',
              fontSize: '16px', fontWeight: '500',
            }}>
              Sign In
            </Link>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '48px', marginTop: '80px',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { num: 'AI', label: 'Generated Schedules' },
            { num: '7-Day', label: 'Personalized Plans' },
            { num: '100%', label: 'Free to Start' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-bright)' }}>{s.num}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '60px 24px 120px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <h2 style={{
          fontSize: '32px', fontWeight: '700',
          textAlign: 'center', marginBottom: '48px',
          letterSpacing: '-0.02em',
        }}>Everything you need to ace your studies</h2>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px', maxWidth: '900px', width: '100%',
        }}>
          {[
            { icon: '🔐', title: 'Secure Authentication', desc: 'Sign up and log in with email. Your data is private with Row Level Security.' },
            { icon: '🤖', title: 'AI Schedule Generator', desc: 'Google Gemini creates a tailored 7-day study plan based on your subjects and goals.' },
            { icon: '📊', title: 'Progress Dashboard', desc: 'Track completed sessions, upcoming tasks, and your overall study consistency.' },
            { icon: '🎯', title: 'Goal-Oriented Planning', desc: 'Set specific goals per subject and let the AI optimize your time accordingly.' },
            { icon: '🗄️', title: 'PostgreSQL Database', desc: 'All your data stored securely in Supabase with real-time capabilities.' },
            { icon: '⚡', title: 'Lightning Fast', desc: 'Built with Next.js 14 App Router and deployed globally on Vercel Edge.' },
          ].map(f => (
            <div key={f.title} className="glass" style={{ padding: '28px', transition: 'border-color 0.2s' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center', padding: '60px 24px 100px',
      }}>
        <div style={{
          maxWidth: '500px', margin: '0 auto',
          padding: '48px', borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(124,106,240,0.1), rgba(168,85,247,0.1))',
          border: '1px solid rgba(124,106,240,0.3)',
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Ready to study smarter?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>Join thousands of students using AI to plan their learning.</p>
          <Link href="/signup" style={{
            display: 'inline-block', padding: '14px 40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            color: 'white', textDecoration: 'none',
            fontSize: '16px', fontWeight: '700',
          }}>
            Create Free Account →
          </Link>
        </div>
      </section>
    </main>
  )
}
