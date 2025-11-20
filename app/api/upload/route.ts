import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { processImage } from "@/utils/image-processor";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // 1. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Compress & Watermark (Server-side)
    const processedBuffer = await processImage(buffer);

    // 3. Upload to Cloudinary using a Promise wrapper (since Cloudinary SDK is callback-based/older style sometimes)
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "protirodh_evidence",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(processedBuffer);
    });

    return NextResponse.json({ 
      url: uploadResult.secure_url, 
      publicId: uploadResult.public_id 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}