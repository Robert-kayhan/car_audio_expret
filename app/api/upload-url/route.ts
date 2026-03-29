import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fileName = body?.fileName;
    const fileType = body?.fileType;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { success: false, message: "fileName and fileType are required" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type" },
        { status: 400 }
      );
    }

    const cleanName = sanitizeFileName(fileName);
    const key = `products/${Date.now()}-${cleanName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60,
    });

    const fileUrl = `${process.env.AWS_BUCKET_URL}/${key}`;

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        fileUrl,
        key,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to generate upload url",
      },
      { status: 500 }
    );
  }
}