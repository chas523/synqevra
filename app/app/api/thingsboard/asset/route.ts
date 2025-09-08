import { NextRequest, NextResponse } from "next/server";
import { createAsset } from "@/app/api/thingsboard/actions";

export async function POST(request: NextRequest) {
  console.log(request);
  try {
    const data = await request.json();
    // Convert the request data to FormData
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    console.log(formData);
    const result = await createAsset(formData);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
