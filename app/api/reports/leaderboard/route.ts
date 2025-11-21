import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import CrimeReport from "@/models/CrimeReport"; // Ensure models are loaded

export async function GET() {
  try {
    await connectDB();
    
    // Basic Leaderboard logic: Users with most verified posts/high score
    // Ideally, you'd have a 'score' field on User model updated via cron jobs or triggers.
    // For MVP, we'll just fetch users with 'verified' role and maybe mock score or fetch top posters.
    // A simple aggregation to count posts per user:
    const leaderboard = await CrimeReport.aggregate([
        { $group: { _id: "$author", totalScore: { $sum: "$verificationScore" }, postCount: { $sum: 1 } } },
        { $sort: { totalScore: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { "user.name": 1, "user.image": 1, "user._id": 1, totalScore: 1 } }
    ]);

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}