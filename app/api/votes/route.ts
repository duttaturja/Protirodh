// app/api/votes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CrimeReport from "@/models/CrimeReport";
import User from "@/models/User";
import Notification from "@/models/Notification"; // Import Notification model
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id);
    
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role === "unverified") {
      return NextResponse.json({ message: "Verify account to vote." }, { status: 403 });
    }

    const { reportId, type } = await req.json(); 

    const report = await CrimeReport.findById(reportId);
    if (!report) return NextResponse.json({ message: "Report not found" }, { status: 404 });

    const userIdStr = session.user.id;
    const userIdObj = new mongoose.Types.ObjectId(userIdStr);

    // Check if user already voted
    const isUpvoted = report.upvotes.some((id: any) => id.toString() === userIdStr);
    const isDownvoted = report.downvotes.some((id: any) => id.toString() === userIdStr);

    const reportAny = report as any; // Cast to any to use Mongoose array methods like .pull() safely

    if (type === "upvote") {
      if (isUpvoted) {
        // Remove upvote
        reportAny.upvotes.pull(userIdObj);
        report.verificationScore -= 1;
      } else {
        // Add upvote
        reportAny.upvotes.push(userIdObj);
        report.verificationScore += 1;
        
        // Remove downvote if exists (Switching vote)
        if (isDownvoted) {
          reportAny.downvotes.pull(userIdObj);
          report.verificationScore += 1; 
        }

        // --- NOTIFICATION LOGIC (Only on Upvote) ---
        // Don't notify if user upvotes their own post
        if (report.author.toString() !== userIdStr) {
            // Check if notification already exists to prevent spamming (optional but good practice)
            const existingNotif = await Notification.findOne({
                recipient: report.author,
                sender: userIdObj,
                type: "upvote",
                reportId: report._id
            });

            if (!existingNotif) {
                await Notification.create({
                    recipient: report.author,
                    sender: userIdObj,
                    type: "upvote",
                    reportId: report._id,
                    message: "Someone upvoted your report.",
                    read: false
                });
            }
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

    // Verification Badge Logic (Hackathon Feature)
    // If score > 10, auto-verify the report
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