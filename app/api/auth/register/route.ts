// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/utils/password";
import { sendSMS } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password, phone } = await req.json();

    if (!email || !password || !name || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Format Phone Number (Force BD Code)
    // Removes existing +880 or 0 prefix to standardize, then adds +880
    const cleanPhone = phone.replace(/^(\+880|0)/, ""); 
    const formattedPhone = `+880${cleanPhone}`;

    // 2. Check for existing user
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone: formattedPhone }] 
    });
    
    if (existingUser) {
      return NextResponse.json({ message: "Email or Phone already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: formattedPhone, 
      role: "unverified", // Explicitly unverified initially
      otp,
      otpExpiry,
    });

    // 3. Send OTP
    try {
      // In development, checking console is easier than setting up Twilio immediately
      console.log(`[DEV OTP] For ${formattedPhone}: ${otp}`);
      
      // Uncomment below to use real Twilio
      await sendSMS(formattedPhone, otp); 
    } catch (smsError) {
      console.error("SMS Failed:", smsError);
    }

    return NextResponse.json(
      { message: "User created. Check phone for OTP.", userId: newUser._id },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Error" }, { status: 500 });
  }
}