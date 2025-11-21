import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CrimeReport from "@/models/CrimeReport";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id);
    
    // Enforce: Only verified users can share/post
    if (user?.role === "unverified") {
      return NextResponse.json({ message: "Verify account to share posts." }, { status: 403 });
    }

    const { reportId } = await req.json();

    // Create a new report entry that acts as a "Retweet"
    const originalReport = await CrimeReport.findById(reportId);
    if (!originalReport) return NextResponse.json({ message: "Original report not found" }, { status: 404 });

    // Check if already shared by this user to prevent duplicates
    const existingShare = await CrimeReport.findOne({ 
        author: session.user.id, 
        sharedFrom: reportId 
    });
    
    if (existingShare) {
        // Undo share (toggle)
        await CrimeReport.findByIdAndDelete(existingShare._id);
        return NextResponse.json({ message: "Unshared", action: "removed" }, { status: 200 });
    }

    await CrimeReport.create({
      title: "Shared Report", // Placeholder to satisfy 'required'
      description: "Shared this report.", // Placeholder to satisfy 'required'
      division: originalReport.division,
      district: originalReport.district,
      images: [], 
      author: session.user.id,
      sharedFrom: reportId, 
      isAnonymous: false,
      crimeTime: new Date(),
      verificationScore: 0,
    });

    return NextResponse.json({ message: "Shared successfully", action: "shared" }, { status: 201 });

  } catch (error: any) {
    console.error("Share Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}