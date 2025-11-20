import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CrimeReport from "@/models/CrimeReport";
import User from "@/models/User";
import { analyzeReportAuthenticity } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();

    // 1. Check User Role
    const user = await User.findById(session.user.id);
    if (!user || user.role === "unverified") {
      return NextResponse.json({ message: "Only verified users can post." }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, division, district, images, video, isAnonymous, crimeTime } = body;

    // 2. Validation
    if (!title || !description || !division || !district || !images || images.length === 0) {
      return NextResponse.json({ message: "Missing required fields or image." }, { status: 400 });
    }

    // 3. AI Fake Detection (Background Check)
    // We run this to assign an initial confidence score but don't block the post unless it's spam.
    const aiAnalysis = await analyzeReportAuthenticity(title, description, `${district}, ${division}`);
    
    // 4. Create Report
    const newReport = await CrimeReport.create({
      title,
      description,
      division,
      district,
      images,
      video,
      author: session.user.id,
      isAnonymous: isAnonymous || false,
      crimeTime: new Date(crimeTime),
      verificationScore: 0,
      aiConfidenceScore: aiAnalysis.score, // Store the AI score
    });

    return NextResponse.json({ 
      message: "Report posted successfully", 
      reportId: newReport._id,
      aiFlag: aiAnalysis.score < 30 ? "Flagged for review" : "Clean"
    }, { status: 201 });

  } catch (error: any) {
    console.error("Post Error:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}