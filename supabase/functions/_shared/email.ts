/**
 * Shared email utility for Supabase Edge Functions
 * Sends emails via SendGrid
 */

interface EmailPayload {
  to: string
  subject: string
  htmlContent: string
  textContent: string
  fromEmail?: string
  fromName?: string
}

export async function sendEmail(payload: EmailPayload): Promise<any> {
  const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY")
  const fromEmail = payload.fromEmail || Deno.env.get("SENDGRID_FROM_EMAIL") || "noreply@nursing-pwa.com"
  const fromName = payload.fromName || Deno.env.get("SENDGRID_FROM_NAME") || "Nursing PWA"

  if (!sendgridApiKey) {
    throw new Error("SENDGRID_API_KEY not configured")
  }

  const mailData = {
    personalizations: [
      {
        to: [{ email: payload.to }],
        subject: payload.subject,
      },
    ],
    from: {
      email: fromEmail,
      name: fromName,
    },
    content: [
      {
        type: "text/plain",
        value: payload.textContent,
      },
      {
        type: "text/html",
        value: payload.htmlContent,
      },
    ],
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mailData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid API error: ${response.status} - ${error}`)
  }

  return { success: true, messageId: response.headers.get("x-message-id") }
}

/**
 * Store OTP in Supabase for later verification
 * Uses a temporary OTP storage table with automatic cleanup
 */
export async function storeOTP(
  email: string,
  otp: string,
  expiryMinutes: number = 10
): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration missing")
  }

  const expiryTime = new Date(Date.now() + expiryMinutes * 60000).toISOString()

  const response = await fetch(`${supabaseUrl}/rest/v1/otp_codes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      email,
      code: otp,
      expires_at: expiryTime,
      attempts: 0,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to store OTP: ${error}`)
  }

  const data = await response.json()
  return data[0]?.id || "stored"
}
