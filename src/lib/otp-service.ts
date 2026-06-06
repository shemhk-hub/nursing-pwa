import { supabase } from '@/lib/supabase';

/**
 * OTP Service - Handles OTP generation, verification, and authentication
 * - Students: email or phone OTP
 * - Admins: email OTP (optional 2FA with TOTP)
 */

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10; // 10 minutes for students, admin may vary
const MAX_OTP_ATTEMPTS = 5;

export async function generateOTP(length: number = OTP_LENGTH): Promise<string> {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  userRole: 'student' | 'admin'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Call Next.js API route which invokes the Edge Function
    const response = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userRole }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return { success: true };
  } catch (err) {
    console.error('Error sending OTP email:', err);
    return { success: false, error: (err as Error).message };
  }
}

export async function sendOTPSMS(
  phone: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Call Next.js API route which invokes the Edge Function
    const response = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, userRole: 'student' }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return { success: true };
  } catch (err) {
    console.error('Error sending OTP SMS:', err);
    return { success: false, error: (err as Error).message };
  }
}

interface OTPRequest {
  email?: string;
  phone?: string;
  userRole: 'student' | 'admin';
}

export async function requestOTP(
  request: OTPRequest
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const otp = await generateOTP();

    // Determine which contact method to use
    if (request.email) {
      const result = await sendOTPEmail(request.email, otp, request.userRole);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Store OTP temporarily (in real implementation, use secure temporary storage)
      // For now, we'll return sessionId that client will use with the OTP
      // Production: store in Redis with TTL
      const sessionId = crypto.randomUUID();

      // Store in Supabase temp table or cache
      // This is a placeholder - real implementation would use Redis or similar

      return { success: true, sessionId };
    }

    if (request.phone) {
      const result = await sendOTPSMS(request.phone, otp);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      const sessionId = crypto.randomUUID();
      return { success: true, sessionId };
    }

    return { success: false, error: 'Email or phone required' };
  } catch (err) {
    console.error('Error requesting OTP:', err);
    return { success: false, error: (err as Error).message };
  }
}

interface VerifyOTPRequest {
  email?: string;
  phone?: string;
  otp: string;
  sessionId: string;
  userRole?: 'student' | 'admin';
}

export async function verifyOTP(
  request: VerifyOTPRequest
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // In production: Verify OTP from secure storage, check expiry
    // For now, validate format
    if (!request.otp || request.otp.length !== OTP_LENGTH) {
      return { success: false, error: 'Invalid OTP format' };
    }

    // Look up user by email or phone
    let query = supabase.from('users').select('*');

    if (request.email) {
      query = query.eq('email', request.email);
    } else if (request.phone) {
      query = query.eq('phone', request.phone);
    } else {
      return { success: false, error: 'Email or phone required' };
    }

    const { data: users, error: lookupError } = await query;

    if (lookupError) {
      return { success: false, error: lookupError.message };
    }

    if (!users || users.length === 0) {
      return { success: false, error: 'User not found. Please sign up.' };
    }

    const user = users[0];

    // Verify role if requested
    if (request.userRole && user.role !== request.userRole) {
      return {
        success: false,
        error: `User is registered as ${user.role}, not ${request.userRole}`
      };
    }

    // Mark OTP as verified for this user
    // In production: update verified status in secure storage

    // Log successful OTP verification
    await logActivity({
      user_id: user.id,
      action: 'otp_verified',
      entity_type: 'auth',
      details: {
        contact_method: request.email ? 'email' : 'phone',
        role: user.role,
      },
    });

    return { success: true, user };
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return { success: false, error: (err as Error).message };
  }
}

interface SignUpRequest {
  fullName: string;
  email?: string;
  phone?: string;
  password?: string; // Optional for OTP-only auth
  role: 'student' | 'admin';
}

export async function signUpWithOTP(
  request: SignUpRequest
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: request.email || `${request.phone}@nursing-pwa.local`,
      password: request.password || crypto.randomUUID(), // Random password if OTP-only
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'User creation failed' };
    }

    // Create user record in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: request.email,
          phone: request.phone,
          full_name: request.fullName,
          role: request.role,
          subscription_status: request.role === 'student' ? 'free' : 'premium',
        },
      ])
      .select()
      .single();

    if (userError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: userError.message };
    }

    // Create initial subscription for student
    if (request.role === 'student') {
      await supabase.from('subscriptions').insert([
        {
          user_id: authData.user.id,
          plan_type: 'free',
          status: 'active',
        },
      ]);
    }

    // Log signup
    await logActivity({
      user_id: authData.user.id,
      action: 'user_signup',
      entity_type: 'user',
      entity_id: authData.user.id,
      details: {
        role: request.role,
        contact_method: request.email ? 'email' : 'phone',
      },
    });

    return { success: true, user: userData };
  } catch (err) {
    console.error('Error signing up with OTP:', err);
    return { success: false, error: (err as Error).message };
  }
}

interface LogActivityRequest {
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
}

export async function logActivity(request: LogActivityRequest): Promise<void> {
  try {
    await supabase.from('activity_log').insert([
      {
        user_id: request.user_id,
        action: request.action,
        entity_type: request.entity_type,
        entity_id: request.entity_id,
        details: request.details,
        // IP and user_agent would be added in API route
      },
    ]);
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

/**
 * Utility function to verify TOTP (Time-based One-Time Password)
 * Used for admin 2FA optional feature
 */
export async function verifyTOTP(secret: string, token: string): Promise<boolean> {
  try {
    // Implementation would use speakeasy or similar library
    // For now, placeholder
    return token.length === 6; // Basic validation
  } catch (err) {
    console.error('Error verifying TOTP:', err);
    return false;
  }
}
