import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import CrimeReport from "@/models/CrimeReport";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ users: [], reports: [] });
    }

    const regex = { $regex: query, $options: "i" };

    // Search Users
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }],
      role: { $ne: "admin" } // Optional: hide admins
    }).select("name image role followers").limit(5).lean();

    // Search Reports
    const reports = await CrimeReport.find({
      $or: [{ title: regex }, { description: regex }, { district: regex }]
    })
    .populate("author", "name image role")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    return NextResponse.json({ users, reports });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}