'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/subjects', label: 'Subjects', icon: '📚' },
  { href: '/dashboard/schedule', label: 'Schedule', icon: '🗓️' },
]

export default function DashboardSidebar({ user }: { user: { email: string; name: string } }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside style={{
      width: '240px', flexShrink: 0,
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 16px',
      minHeight: '100vh',
      position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        textDecoration: 'none', marginBottom: '36px', padding: '0 8px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--accent), #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
        }}>📚</div>
        <span style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>StudyAI</span>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px',
                textDecoration: 'none', marginBottom: '4px',
                fontSize: '14px', fontWeight: isActive ? '600' : '400',
                color: isActive ? 'var(--accent-bright)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(124,106,240,0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(124,106,240,0.2)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: '16px 12px', borderRadius: '12px',
        background: 'var(--bg)', border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0,
          }}>
            {user.name[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '8px', borderRadius: '8px',
            background: 'none', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'var(--font-sora)',
            transition: 'border-color 0.15s, color 0.15s',
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
