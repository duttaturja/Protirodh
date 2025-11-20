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
    // We copy essential metadata for sorting but keep content empty or specific
    const originalReport = await CrimeReport.findById(reportId);
    if (!originalReport) return NextResponse.json({ message: "Original report not found" }, { status: 404 });

    // Check if already shared by this user to prevent duplicates (Optional logic)
    const existingShare = await CrimeReport.findOne({ 
        author: session.user.id, 
        sharedFrom: reportId 
    });
    
    if (existingShare) {
        // Optionally undo share (toggle)
        await CrimeReport.findByIdAndDelete(existingShare._id);
        return NextResponse.json({ message: "Unshared", action: "removed" }, { status: 200 });
    }

    await CrimeReport.create({
      title: "", // Empty for shares (or use "Shared a post")
      description: "",
      division: originalReport.division, // Inherit location for filtering
      district: originalReport.district,
      images: [], // No new images
      author: session.user.id,
      sharedFrom: reportId, // THE LINK
      isAnonymous: false, // Shares are usually public
      crimeTime: new Date(),
      verificationScore: 0,
    });

    return NextResponse.json({ message: "Shared successfully", action: "shared" }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}