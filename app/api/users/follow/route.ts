// app/api/users/follow/route.ts
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
    const { targetUserId } = await req.json();
    const currentUserId = session.user.id;

    if (targetUserId === currentUserId) {
      return NextResponse.json({ message: "Cannot follow yourself" }, { status: 400 });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return NextResponse.json({ message: "Target user not found" }, { status: 404 });
    
    // FIX: Strict null check for TypeScript
    if (!currentUser) {
        return NextResponse.json({ message: "Current user account not found" }, { status: 404 });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUserId, { $push: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $push: { followers: currentUserId } });
    }

    return NextResponse.json({ success: true, isFollowing: !isFollowing });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}