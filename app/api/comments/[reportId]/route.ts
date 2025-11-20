import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Comment from "@/models/Comment";
import User from "@/models/User"; // Populate needed

export async function GET(req: Request, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    await connectDB();
    const { reportId } = await params; // Await params in Next.js 16

    const comments = await Comment.find({ reportId })
      .populate("author", "name image role")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}