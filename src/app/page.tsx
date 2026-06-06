'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function Home() {
  const { user } = useAuth()

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: '#00897B',
          fontSize: '32px',
          marginBottom: '10px'
        }}>
          🎓 Nursing PWA
        </h1>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          marginBottom: '30px'
        }}>
          INC BSc Nursing Course Materials
        </p>

        <p style={{
          color: '#999',
          fontSize: '14px',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Access comprehensive nursing course materials, study notes, and resources anytime, anywhere.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {user ? (
            <>
              <Link href="/dashboard" style={{
                backgroundColor: '#00897B',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'inline-block'
              }}>
                Go to App
              </Link>
              <Link href="/admin/dashboard" style={{
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'inline-block'
              }}>
                Admin Panel
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/otp-login" style={{
                backgroundColor: '#00897B',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'inline-block'
              }}>
                Login with OTP
              </Link>
              <Link href="/auth/otp-signup" style={{
                backgroundColor: '#666',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'inline-block'
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />

        <p style={{
          color: '#999',
          fontSize: '12px'
        }}>
          Secure • Fast • Offline Ready
        </p>
      </div>
    </div>
  )
}
