// app/api/votes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CrimeReport from "@/models/CrimeReport";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id);
    
    if (user?.role === "unverified") {
      return NextResponse.json({ message: "Verify account to vote." }, { status: 403 });
    }

    const { reportId, type } = await req.json(); 

    const report = await CrimeReport.findById(reportId);
    if (!report) return NextResponse.json({ message: "Report not found" }, { status: 404 });

    const userIdStr = session.user.id;
    // Convert string ID to Mongoose ObjectId for proper comparison/storage
    const userIdObj = new mongoose.Types.ObjectId(userIdStr);

    // Helper to check existence (convert to string for safety)
    const isUpvoted = report.upvotes.some((id: any) => id.toString() === userIdStr);
    const isDownvoted = report.downvotes.some((id: any) => id.toString() === userIdStr);

    // Use Mongoose's cast to 'any' to access special methods like .pull() 
    // OR use standard JS filter/push logic. We will use explicit casting for safety.
    const reportAny = report as any;

    if (type === "upvote") {
      if (isUpvoted) {
        // Remove upvote
        reportAny.upvotes.pull(userIdObj);
        report.verificationScore -= 1;
      } else {
        // Add upvote
        reportAny.upvotes.push(userIdObj);
        report.verificationScore += 1;
        // Remove downvote if exists
        if (isDownvoted) {
          reportAny.downvotes.pull(userIdObj);
          report.verificationScore += 1; 
        }
      }
    } else if (type === "downvote") {
      if (isDownvoted) {
        // Remove downvote
        reportAny.downvotes.pull(userIdObj);
        report.verificationScore += 1;
      } else {
        // Add downvote
        reportAny.downvotes.push(userIdObj);
        report.verificationScore -= 1;
        // Remove upvote if exists
        if (isUpvoted) {
          reportAny.upvotes.pull(userIdObj);
          report.verificationScore -= 1; 
        }
      }
    }

    // Verification Badge Logic
    if (report.verificationScore > 10) {
      report.isVerifiedBadge = true;
    }

    await report.save();

    return NextResponse.json({ 
      success: true, 
      score: report.verificationScore,
      upvotes: report.upvotes.length,
      downvotes: report.downvotes.length
    });

  } catch (error: any) {
    console.error("Vote Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}