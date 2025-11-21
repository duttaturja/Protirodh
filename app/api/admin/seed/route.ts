import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/utils/password";

export async function GET() {
  try {
    await connectDB();

    // Read from environment variables
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Protirodh Admin"; // Default fallback
    const phone = process.env.ADMIN_PHONE || "+8801000000000"; // Default fallback

    // Validate that critical env vars are present
    if (!email || !password) {
      return NextResponse.json(
        { message: "Admin email or password not configured in environment variables." },
        { status: 500 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Check if admin exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      // Update existing admin to ensure role is admin and password matches env
      existingAdmin.role = "admin";
      existingAdmin.password = hashedPassword; 
      existingAdmin.name = name;
      existingAdmin.phone = phone;
      // Admins are verified by definition
      // If you added an explicit isVerified field to the schema, set it true here.
      // Based on previous steps, 'role' being 'admin' or 'verified' handles permissions.
      await existingAdmin.save();
      
      return NextResponse.json({ message: "Admin updated successfully from environment variables." });
    }

    // Create new admin
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      phone,
      isBanned: false,
      // No OTP needed for admin seed
    });

    return NextResponse.json({ message: "Admin user created successfully from environment variables." });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}