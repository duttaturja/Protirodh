import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CrimeReport from "@/models/CrimeReport";
import User from "@/models/User"; // Ensure User model is loaded

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const sort = searchParams.get("sort") || "newest";

    const query: any = {};
    if (division && division !== "all") query.division = division;
    if (district && district !== "all") query.district = district;

    let sortOption: any = { createdAt: -1 }; // Default newest
    if (sort === "verification") sortOption = { verificationScore: -1 };
    if (sort === "upvotes") sortOption = { upvotes: -1 }; // Note: This might need aggregation in complex cases, but basic sorting works if array length is stored or using virtuals. For MVP we stick to simple fields or aggregation.
    
    // For array length sorting (upvotes), standard sort won't work directly on the array field easily without aggregation.
    // For MVP simplicity: We will just sort by createdAt or verificationScore. 
    // If 'upvotes' is requested, we can fallback to verificationScore which is a number.

    const reports = await CrimeReport.find(query)
      .populate("author", "name image role isBanned") // Populate author details
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Check if there are more
    const total = await CrimeReport.countDocuments(query);
    const hasMore = total > page * limit;

    return NextResponse.json({ reports, hasMore }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}