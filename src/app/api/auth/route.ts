import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, phone, otp } = body

    if (action === 'send') {
      // Send OTP to email or phone
      const otpCode = generateOTP()
      
      // In production, send via email/SMS
      // For now, just return the OTP (dev mode)
      console.log(`OTP for ${email || phone}: ${otpCode}`)

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        // Remove this in production - only for development
        otp: process.env.NODE_ENV === 'development' ? otpCode : undefined
      })
    }

    if (action === 'verify') {
      // Verify OTP
      // In production, validate against sent OTP
      if (otp && otp.length === 6) {
        return NextResponse.json({
          success: true,
          message: 'OTP verified',
          token: 'temp-token-' + Date.now()
        })
      }

      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
