import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface VerifyOTPBody {
  email?: string;
  phone?: string;
  otp: string;
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPBody = await request.json();
    const { email, phone, otp, sessionId } = body;

    // Validation
    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      );
    }

    // Verify OTP format (must be 6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    // Try to verify against stored OTP
    const { data: otpRecords, error: lookupError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('session_id', sessionId)
      .eq('code', otp)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .single();

    if (lookupError) {
      console.warn('OTP lookup failed:', lookupError);
      // In development, we'll still proceed (for testing)
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: 'Invalid OTP or OTP expired' },
          { status: 401 }
        );
      }
    }

    // Look up user by email or phone
    let query = supabase.from('users').select('*');

    if (email) {
      query = query.eq('email', email);
    } else if (phone) {
      query = query.eq('phone', phone);
    }

    const { data: users, error: userError } = await query.limit(1);

    if (userError) {
      console.error('User lookup error:', userError);
      return NextResponse.json(
        { error: 'User lookup failed' },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      // User doesn't exist - this is OK for signup flow
      // Return null user, signup will create them
      await logActivity('otp_verified_new_user', {
        contact_method: email ? 'email' : 'phone',
        contact_value: email || phone,
      });

      return NextResponse.json(
        {
          success: true,
          sessionId,
          user: null, // New user
          message: 'OTP verified. Proceed to create account.',
        },
        { status: 200 }
      );
    }

    const user = users[0];

    // Mark OTP as used (increment attempts to max)
    if (otpRecords) {
      await supabase
        .from('otp_codes')
        .update({ attempts: 5 }) // Mark as used
        .eq('session_id', sessionId);
    }

    // Log successful OTP verification
    await logActivity('otp_verified_existing_user', {
      user_id: user.id,
      contact_method: email ? 'email' : 'phone',
    });

    return NextResponse.json(
      {
        success: true,
        sessionId,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
        message: 'OTP verified. Sign in successful.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function logActivity(
  action: string,
  details: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('activity_log').insert([
      {
        user_id: details.user_id || null,
        action,
        entity_type: 'auth',
        details,
      },
    ]);
  } catch (err) {
    console.warn('Activity logging failed:', err);
  }
}
