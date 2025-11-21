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
    
    const type = searchParams.get("type") || "foryou"; // 'foryou' | 'trending' | 'explore'
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const division = searchParams.get("division");
    const search = searchParams.get("search");

    let query: any = {};
    let sortOption: any = { createdAt: -1 };

    if (type === "trending") {
       sortOption = { verificationScore: -1, createdAt: -1 };
    } else if (type === "foryou") {
       if (session) {
           const currentUser = await User.findById(session.user.id);
           const followingIds = currentUser?.following || [];
           query = {
               $or: [
                   { author: { $in: [...followingIds, session.user.id] } },
                   { verificationScore: { $gt: 20 } }
               ]
           };
       }
    } else if (type === "explore") {
        // Explore mode: Show all recent posts by default
        // Filters applied below
    }

    // Apply Filters
    if (division && division !== "all") {
        query.division = division;
    }

    // Apply Search (Basic Regex for MVP)
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { district: { $regex: search, $options: "i" } }
        ];
    }

    const reports = await CrimeReport.find(query)
      .populate("author", "name image role")
      .populate({
         path: "sharedFrom",
         populate: { path: "author", select: "name image role" }
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