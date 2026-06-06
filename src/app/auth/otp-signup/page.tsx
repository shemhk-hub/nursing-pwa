'use client';

import React, { useState } from 'react';
import { signUpWithOTP, requestOTP, verifyOTP } from '@/lib/otp-service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Step = 'info' | 'otp' | 'success';

export default function OTPSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('info');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole] = useState<'student' | 'admin'>('student');

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!contact.trim()) {
      setError(`${contactMethod === 'email' ? 'Email' : 'Phone'} is required`);
      setLoading(false);
      return;
    }

    try {
      // Request OTP
      const result = await requestOTP({
        [contactMethod]: contact,
        userRole,
      });

      if (result.success && result.sessionId) {
        setSessionId(result.sessionId);
        setStep('otp');
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify OTP first
      const verifyResult = await verifyOTP({
        [contactMethod]: contact,
        otp,
        sessionId,
      });

      if (!verifyResult.success) {
        setError(verifyResult.error || 'Invalid OTP');
        setLoading(false);
        return;
      }

      // Then create the user
      const signupResult = await signUpWithOTP({
        fullName,
        [contactMethod]: contact,
        role: userRole,
      });

      if (signupResult.success) {
        setStep('success');
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/app/home');
        }, 2000);
      } else {
        setError(signupResult.error || 'Signup failed');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-teal-600 mb-2">Nursing PWA</h1>
        <p className="text-gray-600 mb-6">Create your account</p>

        {step === 'info' && (
          <form onSubmit={handleSubmitInfo}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Method
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="email"
                    checked={contactMethod === 'email'}
                    onChange={(e) => setContactMethod(e.target.value as 'email' | 'phone')}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="phone"
                    checked={contactMethod === 'phone'}
                    onChange={(e) => setContactMethod(e.target.value as 'email' | 'phone')}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Phone</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <input
                type={contactMethod === 'email' ? 'email' : 'tel'}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={contactMethod === 'email' ? 'you@example.com' : '+91 98765 43210'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyAndSignUp}>
            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit OTP sent to your {contactMethod}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Password
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-2xl tracking-widest"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Verify & Sign Up'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('info');
                setOtp('');
                setError('');
              }}
              className="w-full mt-2 text-teal-600 py-2 rounded-lg hover:bg-teal-50 transition"
            >
              Change Contact
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">Welcome {fullName}! Redirecting to your dashboard...</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{' '}
            <Link href="/auth/otp-login" className="text-teal-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="block text-center text-sm text-gray-600 hover:text-gray-800 mt-4"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
