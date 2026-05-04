'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Try to log in immediately (if email confirmation is disabled in Supabase)
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (!loginError) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setSuccess(true)
        setLoading(false)
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative',
    }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: '60px 60px', opacity: 0.3,
      }} />
      <div style={{
        position: 'fixed', top: '-100px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(124,106,240,0.15) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', justifyContent: 'center' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '9px',
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>📚</div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>StudyAI</span>
        </Link>

        <div className="glass" style={{ padding: '40px' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Check your email</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
              </p>
              <Link href="/login" style={{
                display: 'inline-block', marginTop: '24px',
                color: 'var(--accent-bright)', textDecoration: 'none', fontSize: '14px', fontWeight: '600',
              }}>Back to login →</Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Create account
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
                Start planning smarter with AI
              </p>

              <form onSubmit={handleSignup}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="label">Full Name</label>
                  <input className="input-field" type="text" placeholder="Alex Johnson"
                    value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="label">Email</label>
                  <input className="input-field" type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label className="label">Password</label>
                  <input className="input-field" type="password" placeholder="Min. 6 characters"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                </div>

                {error && (
                  <div style={{
                    padding: '12px 16px', borderRadius: '8px',
                    background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                    color: 'var(--danger)', fontSize: '13px', marginBottom: '20px',
                  }}>{error}</div>
                )}

                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--accent-bright)', textDecoration: 'none', fontWeight: '600' }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
