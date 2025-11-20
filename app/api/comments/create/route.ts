import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Comment from "@/models/Comment";
import CrimeReport from "@/models/CrimeReport";
import User from "@/models/User";
import Notification from "@/models/Notification";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id);

    // Fix: Handle null user case explicitly
    if (!user) {
        return NextResponse.json({ message: "User account not found." }, { status: 404 });
    }

    // Enforce: Only verified users can comment
    if (user.role === "unverified") {
      return NextResponse.json({ message: "Verify your account to comment." }, { status: 403 });
    }

    const { reportId, content, proofImage, isAnonymous } = await req.json();

    // Enforce: Mandatory Proof
    if (!proofImage) {
      return NextResponse.json({ message: "Proof (image) is required to comment." }, { status: 400 });
    }

    const newComment = await Comment.create({
      content,
      proofImage,
      author: session.user.id,
      reportId,
      isAnonymous: isAnonymous || false, // Ensure this field exists in your Comment model schema
    });

    // --- NOTIFICATION LOGIC ---
    // Notify the post author
    const report = await CrimeReport.findById(reportId);
    if (report && report.author.toString() !== session.user.id) {
      await Notification.create({
        recipient: report.author,
        sender: isAnonymous ? null : session.user.id, // Hide sender ID if anon
        type: "comment",
        reportId: report._id,
        message: isAnonymous 
          ? "Someone commented on your report with proof." 
          : `${user.name} commented on your report with proof.`, // Safe to access user.name now
        read: false,
      });
    }

    return NextResponse.json({ success: true, comment: newComment }, { status: 201 });

  } catch (error: any) {
    console.error("Comment Create Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}