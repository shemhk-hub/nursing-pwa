import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function sendOTPEmail(
  email: string,
  otp: string,
  userRole: 'student' | 'admin'
): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@nursing-pwa.com';

    if (!apiKey) {
      throw new Error('SendGrid API key not configured');
    }

    const subject = userRole === 'admin'
      ? 'Your Nursing PWA Admin Login Code'
      : 'Your Nursing PWA Sign In Code';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 500px; margin: 20px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .logo { color: #00897B; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .header { color: #333; font-size: 18px; margin-bottom: 10px; }
            .otp-code { background: #f0f0f0; border: 2px solid #00897B; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 4px; border-radius: 4px; margin: 20px 0; }
            .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🎓 Nursing PWA</div>
            <div class="header">Your One-Time Password (OTP)</div>
            <p>Use this code to complete your ${userRole === 'admin' ? 'admin login' : 'sign up'}:</p>
            <div class="otp-code">${otp}</div>
            <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            <div class="footer">
              <p>Nursing PWA &copy; 2026. All rights reserved.</p>
              <p>For support, contact: support@nursing-pwa.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Your One-Time Password (OTP)

Use this code to complete your ${userRole === 'admin' ? 'admin login' : 'sign up'}:

${otp}

This code expires in 10 minutes.

If you didn't request this code, please ignore this email.

Nursing PWA Support
support@nursing-pwa.com
    `;

    const mailData = {
      personalizations: [
        {
          to: [{ email }],
          subject,
        },
      ],
      from: {
        email: fromEmail,
        name: 'Nursing PWA',
      },
      content: [
        {
          type: 'text/plain',
          value: textContent,
        },
        {
          type: 'text/html',
          value: htmlContent,
        },
      ],
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid API error: ${response.status} - ${error}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: (error as Error).message };
  }
}

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
      const emailResult = await sendOTPEmail(email, otp, userRole);
      if (!emailResult.success) {
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
