// app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { name, bio, image } = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { name, bio, image },
      { new: true }
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}