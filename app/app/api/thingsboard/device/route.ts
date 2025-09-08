import { NextResponse } from "next/server";
import { createDevice } from "@/app/api/thingsboard/actions";

export async function POST(request: Request) {
  try {
    const form: FormData = await request.formData();

    console.log(form);

    const result = await createDevice(form);

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
