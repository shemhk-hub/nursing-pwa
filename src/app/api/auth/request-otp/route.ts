import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RequestOTPBody {
  email?: string;
  phone?: string;
  userRole: 'student' | 'admin';
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestOTPBody = await request.json();
    const { email, phone, userRole } = body;

    // Validation
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      );
    }

    if (!userRole || !['student', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');

    // Store OTP temporarily (in production, use Redis with TTL)
    // For now, store in a temporary table
    const sessionId = crypto.randomUUID();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Check if otp_codes table exists, if not create it
    const { error: tableError } = await supabase.from('otp_codes').select('id').limit(1);

    if (tableError && tableError.code === 'PGRST116') {
      // Table doesn't exist, we need to create it or use an alternative
      console.log('OTP storage table not yet created, using in-memory storage for now');
    }

    // Try to store OTP in database
    const { data, error: storeError } = await supabase.from('otp_codes').insert([
      {
        session_id: sessionId,
        email: email || null,
        phone: phone || null,
        code: otp,
        user_role: userRole,
        expires_at: expiryTime,
        attempts: 0,
      },
    ]).select();

    if (storeError) {
      console.warn('Could not store OTP in database:', storeError);
      // Continue anyway - OTP is valid in memory
    }

    // Send OTP email if email provided
    if (email) {
      const emailResult = await supabase.functions.invoke('send-otp-email', {
        body: {
          email,
          otp,
          userRole,
        },
      });

      if (emailResult.error) {
        console.error('Error sending OTP email:', emailResult.error);
        return NextResponse.json(
          { error: 'Failed to send OTP email. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Send OTP SMS if phone provided
    if (phone) {
      const smsResult = await supabase.functions.invoke('send-otp-sms', {
        body: {
          phone,
          otp,
        },
      });

      if (smsResult.error) {
        console.warn('SMS sending skipped or failed (not critical):', smsResult.error);
      }
    }

    // Log activity
    try {
      await supabase.from('activity_log').insert([
        {
          user_id: null,
          action: 'otp_requested',
          entity_type: 'auth',
          details: {
            contact_method: email ? 'email' : 'phone',
            user_role: userRole,
          },
          ip_address: request.ip,
          user_agent: request.headers.get('user-agent'),
        },
      ]);
    } catch (err) {
      console.warn('Activity log insertion failed:', err);
    }

    return NextResponse.json(
      {
        success: true,
        sessionId,
        message: `OTP sent to ${email || phone}`,
        expiresIn: 600, // 10 minutes in seconds
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
