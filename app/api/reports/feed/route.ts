import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CrimeReport from "@/models/CrimeReport";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    const type = searchParams.get("type") || "foryou"; // 'foryou' | 'trending'
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;

    let query: any = {};
    let sortOption: any = { createdAt: -1 };

    if (type === "trending") {
       // Trending: High verification score, recent
       sortOption = { verificationScore: -1, createdAt: -1 };
       // Optional: Only show posts from last 7 days for trending
    } else if (type === "foryou") {
       // For You: Posts from people I follow + My own posts
       if (session) {
           const currentUser = await User.findById(session.user.id);
           const followingIds = currentUser?.following || [];
           query = {
               $or: [
                   { author: { $in: [...followingIds, session.user.id] } }, // Followed users + Self
                   { verificationScore: { $gt: 20 } } // Mix in very high quality posts
               ]
           };
       }
       // If not logged in, 'For You' falls back to standard feed
    }

    const reports = await CrimeReport.find(query)
      .populate("author", "name image role")
      .populate({
         path: "sharedFrom",
         populate: { path: "author", select: "name image role" } // Nested populate for shares
      })
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ reports }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}