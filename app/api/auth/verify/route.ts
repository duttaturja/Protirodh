// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    if (user.role === "verified") return NextResponse.json({ message: "Already verified" }, { status: 200 });

    // Check OTP
    if (user.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return NextResponse.json({ message: "OTP Expired" }, { status: 400 });
    }

    // *** CRITICAL: Update Role to Verified ***
    user.role = "verified";
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: "Account verified successfully" }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}