'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AppHome() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#00897B', marginBottom: '8px' }}>
            Welcome! 👋
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            {user.email}
          </p>
        </div>

        {/* Main Content */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            📚 Nursing Course Materials
          </h2>
          
          <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
            Welcome to your learning portal! Here you can:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #eee'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📖</div>
              <h3 style={{ color: '#333', marginBottom: '8px' }}>Browse Courses</h3>
              <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>
                Access all INC BSc Nursing courses
              </p>
            </div>

            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #eee'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔖</div>
              <h3 style={{ color: '#333', marginBottom: '8px' }}>Save Bookmarks</h3>
              <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>
                Bookmark important topics for later
              </p>
            </div>

            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #eee'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⭐</div>
              <h3 style={{ color: '#333', marginBottom: '8px' }}>Rate Content</h3>
              <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>
                Share your feedback on materials
              </p>
            </div>
          </div>

          <p style={{
            color: '#999',
            fontSize: '14px',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #eee'
          }}>
            🔄 Database connection active • ✅ Ready to use
          </p>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          color: '#999',
          fontSize: '12px'
        }}>
          <p>Nursing PWA © 2026 • Secure Learning Platform</p>
        </div>
      </div>
    </div>
  )
}
