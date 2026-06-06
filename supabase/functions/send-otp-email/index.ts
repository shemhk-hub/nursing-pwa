import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { sendEmail } from "../_shared/email.ts"

interface OTPEmailRequest {
  email: string
  otp: string
  userRole: "student" | "admin"
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 })
    }

    const { email, otp, userRole }: OTPEmailRequest = await req.json()

    if (!email || !otp || !userRole) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      )
    }

    // Email template
    const subject = userRole === "admin"
      ? "Your Nursing PWA Admin Login Code"
      : "Your Nursing PWA Sign In Code"

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
            <p>Use this code to complete your ${userRole === "admin" ? "admin login" : "sign up"}:</p>
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
    `

    const textContent = `
Your One-Time Password (OTP)

Use this code to complete your ${userRole === "admin" ? "admin login" : "sign up"}:

${otp}

This code expires in 10 minutes.

If you didn't request this code, please ignore this email.

Nursing PWA Support
support@nursing-pwa.com
    `

    // Send email using SendGrid
    const result = await sendEmail({
      to: email,
      subject,
      htmlContent,
      textContent,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP email sent successfully",
        email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    )
  } catch (error) {
    console.error("Error sending OTP email:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to send OTP email"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
})
