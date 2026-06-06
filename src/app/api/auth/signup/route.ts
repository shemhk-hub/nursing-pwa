import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface SignupBody {
  fullName: string;
  email?: string;
  phone?: string;
  otp: string;
  sessionId: string;
  userRole: 'student' | 'admin';
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupBody = await request.json();
    const { fullName, email, phone, otp, sessionId, userRole } = body;

    // Validation
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Full name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      );
    }

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    if (!userRole || !['student', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }

    // Verify OTP one more time
    const { data: otpRecords, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('session_id', sessionId)
      .eq('code', otp)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .single();

    if (otpError) {
      console.warn('OTP verification failed during signup:', otpError);
      // In development, allow anyway
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: 'Invalid or expired OTP' },
          { status: 401 }
        );
      }
    }

    // Check if user already exists
    let existingUser = null;
    if (email) {
      const { data: emailUsers } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1);
      if (emailUsers && emailUsers.length > 0) {
        existingUser = emailUsers[0];
      }
    }

    if (phone && !existingUser) {
      const { data: phoneUsers } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .limit(1);
      if (phoneUsers && phoneUsers.length > 0) {
        existingUser = phoneUsers[0];
      }
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Account already exists with this email or phone' },
        { status: 409 }
      );
    }

    // Create Supabase Auth user
    const authEmail = email || `${phone}@nursing-pwa.local`;
    const tempPassword = crypto.randomUUID();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password: tempPassword,
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Failed to create account' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email || null,
          phone: phone || null,
          full_name: fullName,
          role: userRole,
          subscription_status: userRole === 'student' ? 'free' : 'premium',
          otp_email_verified: email ? true : false,
          otp_phone_verified: phone ? true : false,
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Create initial subscription for students
    if (userRole === 'student') {
      const { error: subError } = await supabase.from('subscriptions').insert([
        {
          user_id: authData.user.id,
          plan_type: 'free',
          status: 'active',
        },
      ]);

      if (subError) {
        console.warn('Subscription creation warning:', subError);
        // Don't fail signup if subscription fails
      }
    }

    // Mark OTP as used
    if (otpRecords) {
      await supabase
        .from('otp_codes')
        .update({ attempts: 5 })
        .eq('session_id', sessionId);
    }

    // Log signup
    try {
      await supabase.from('activity_log').insert([
        {
          user_id: authData.user.id,
          action: 'user_signup',
          entity_type: 'user',
          entity_id: authData.user.id,
          details: {
            role: userRole,
            contact_method: email ? 'email' : 'phone',
          },
          ip_address: request.ip,
          user_agent: request.headers.get('user-agent'),
        },
      ]);
    } catch (err) {
      console.warn('Activity log failed:', err);
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          phone: userProfile.phone,
          fullName: userProfile.full_name,
          role: userProfile.role,
          subscriptionStatus: userProfile.subscription_status,
        },
        message: 'Account created successfully!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
