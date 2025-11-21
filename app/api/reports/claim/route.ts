import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CrimeReport from "@/models/CrimeReport";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { reportId } = await req.json();

    const report = await CrimeReport.findById(reportId);
    if (!report) return NextResponse.json({ message: "Report not found" }, { status: 404 });

    // Verify ownership
    if (report.author.toString() !== session.user.id) {
      return NextResponse.json({ message: "You are not the author of this report." }, { status: 403 });
    }

    // Verify it is currently anonymous
    if (!report.isAnonymous) {
      return NextResponse.json({ message: "Report is already public." }, { status: 400 });
    }

    // Reveal Identity
    report.isAnonymous = false;
    await report.save();

    return NextResponse.json({ success: true, message: "Identity revealed successfully." });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}