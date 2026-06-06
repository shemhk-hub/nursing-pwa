'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('shemhk@gmail.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStatus('')
    setLoading(true)

    try {
      setStatus('Signing in...')
      const res = await fetch('/api/auth/password-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      setStatus('Login successful! Redirecting...')

      // Use window.location for hard redirect to bypass any middleware issues
      window.location.href = '/admin'

    } catch (err: any) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0fdf4',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '420px',
        width: '100%'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px',
            backgroundColor: '#00897B',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '12px'
          }}>🎓</div>
          <h1 style={{ color: '#00897B', fontSize: '26px', margin: '0 0 4px', fontWeight: '700' }}>
            Nursing PWA
          </h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Admin Login
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Status */}
        {status && !error && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#16a34a',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ✅ {status}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', marginBottom: '6px',
              color: '#374151', fontWeight: '600', fontSize: '14px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '11px 14px',
                border: '1.5px solid #d1d5db',
                borderRadius: '8px', fontSize: '15px',
                boxSizing: 'border-box', outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="admin@example.com"
              onFocus={e => e.target.style.borderColor = '#00897B'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block', marginBottom: '6px',
              color: '#374151', fontWeight: '600', fontSize: '14px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '11px 14px',
                border: '1.5px solid #d1d5db',
                borderRadius: '8px', fontSize: '15px',
                boxSizing: 'border-box', outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter your password"
              onFocus={e => e.target.style.borderColor = '#00897B'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              backgroundColor: loading ? '#9ca3af' : '#00897B',
              color: 'white', border: 'none',
              borderRadius: '8px', fontSize: '16px',
              fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? '⏳ Signing in...' : '→ Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#9ca3af', fontSize: '12px' }}>
          <a href="/" style={{ color: '#00897B', textDecoration: 'none' }}>← Back to home</a>
        </p>
      </div>
    </div>
  )
}
