import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// GET: List all users
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const users = await User.find({}).select("name email role isBanned createdAt").sort({ createdAt: -1 });
  
  return NextResponse.json({ users });
}

// PATCH: Ban/Unban User
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const { userId, action } = await req.json(); // action: 'ban' | 'unban'

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  user.isBanned = action === 'ban';
  await user.save();

  return NextResponse.json({ success: true, isBanned: user.isBanned });
}