// lib/sms.ts
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Sends an OTP to the user's phone number.
 * @param to - The recipient's phone number (must include country code, e.g., +880...)
 * @param otp - The 6-digit OTP code
 */
export async function sendSMS(to: string, otp: string) {
  try {
    // Production check: Ensure variables exist
    if (!accountSid || !authToken || !fromPhoneNumber) {
      throw new Error("Twilio credentials are missing in environment variables.");
    }

    const message = await client.messages.create({
      body: `Your Protirodh verification code is: ${otp}. This code expires in 10 minutes.`,
      from: fromPhoneNumber,
      to: to,
    });

    console.log(`[SMS SENT] Message SID: ${message.sid}`);
    return { success: true, sid: message.sid };
    
  } catch (error: any) {
    console.error("[SMS FAILED] Error sending OTP:", error.message);
    // In production, you might want to throw this or log it to a monitoring service like Sentry
    throw new Error("Failed to send SMS verification code.");
  }
}