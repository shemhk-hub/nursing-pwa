import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface OTPSMSRequest {
  phone: string
  otp: string
}

/**
 * Send OTP via SMS
 * Currently logs to console - can be integrated with Twilio/AWS SNS later
 * For MVP, email is the primary channel
 */
serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 })
    }

    const { phone, otp }: OTPSMSRequest = await req.json()

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      )
    }

    // Log OTP for development (in production, use Twilio/SNS)
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] OTP SMS to ${phone}: ${otp}`)

    // In production, uncomment to use Twilio:
    /*
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID")
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN")
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER")

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: phone,
          Body: `Your Nursing PWA OTP: ${otp} (Valid for 10 minutes)`,
        }).toString(),
      }
    )

    if (!response.ok) {
      throw new Error("Failed to send SMS via Twilio")
    }
    */

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP sent successfully",
        phone: phone.replace(/(.{3})(.*)(.{2})/, "$1***$3"),
        method: "sms"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    )
  } catch (error) {
    console.error("Error sending OTP SMS:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to send OTP SMS"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
})
