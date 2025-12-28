import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encrypt } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbyhiTwcOfP6G2Ys2xzFp7Wx7DCTRFfOgFAWvW-Rz9LgqdAUPhSbupQUcyAVm0-tF5cb/exec",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  const data = await res.json();

  if (data.success) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ user: data.user, expires });

    (await cookies()).set("auth", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
  }

  return NextResponse.json(data);
}
