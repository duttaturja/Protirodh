import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();

    const notifications = await Notification.find({ recipient: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Count unread
    const unreadCount = await Notification.countDocuments({ recipient: session.user.id, read: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Mark as read
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    await Notification.updateMany(
        { recipient: session.user.id, read: false },
        { $set: { read: true } }
    );

    return NextResponse.json({ success: true });
}