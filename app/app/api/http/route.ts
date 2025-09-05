import { NextResponse } from "next/server";
import { publishHttp } from "@/lib/http/publish";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const host = String(form.get("host") ?? "");
    const port = Number(form.get("port") ?? "");
    const key = String(form.get("key") ?? "");

    const valueList = form.getAll("value[]").map((v) => String(v));
    const dataList = form.getAll("data[]").map((v) => String(v));

    const message = Object.fromEntries(
      dataList.map((d, i) => [d.toLowerCase(), String(valueList[i] ?? "")]),
    );

    await publishHttp(host, String(port), key, message);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 },
    );
  }
}
