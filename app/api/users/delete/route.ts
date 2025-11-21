import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import CrimeReport from "@/models/CrimeReport";
import Comment from "@/models/Comment";
import Notification from "@/models/Notification";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const userId = session.user.id;

    // 1. Delete User's Reports
    await CrimeReport.deleteMany({ author: userId });

    // 2. Delete User's Comments
    await Comment.deleteMany({ author: userId });

    // 3. Delete Notifications (both received and sent)
    await Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] });

    // 4. Remove User from Followers/Following lists of others
    await User.updateMany(
        { $or: [{ followers: userId }, { following: userId }] },
        { $pull: { followers: userId, following: userId } }
    );

    // 5. Delete the User Profile
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, message: "Account deleted successfully." });

  } catch (error: any) {
    console.error("Delete Account Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}