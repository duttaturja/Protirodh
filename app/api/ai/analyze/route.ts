// app/api/ai/analyze/route.ts
import { NextResponse } from "next/server";
import { generateImageDescription, analyzeReportAuthenticity } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, imageUrl, title, description, location } = body;

    if (type === "vision" && imageUrl) {
      const result = await generateImageDescription(imageUrl);
      return NextResponse.json({ description: result });
    }

    if (type === "fake-detection" && title && description) {
      const result = await analyzeReportAuthenticity(title, description, location || "Unknown");
      return NextResponse.json(result);
    }

    return NextResponse.json({ message: "Invalid request parameters" }, { status: 400 });

  } catch (error: any) {
    console.error("AI Processing Error:", error);
    return NextResponse.json({ message: error.message || "AI Processing Failed" }, { status: 500 });
  }
}