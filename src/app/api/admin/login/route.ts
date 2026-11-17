import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { password?: string };
    if (!body.password || body.password.length > 200 || !verifyAdminPassword(body.password)) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }
    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });
  }
}
