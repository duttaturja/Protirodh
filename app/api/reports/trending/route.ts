import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CrimeReport from "@/models/CrimeReport";

export async function GET() {
  try {
    await connectDB();
    // Aggregate reports by District
    const stats = await CrimeReport.aggregate([
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}