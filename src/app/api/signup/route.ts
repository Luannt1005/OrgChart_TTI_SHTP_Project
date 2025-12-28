import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  const body = await req.json();

  // Hash the password before storing
  const hashedPassword = await hashPassword(body.password);

  const res = await fetch(
    "https://script.google.com/macros/s/AKfycby8vQq4JELfF6sxi-m-oY_VqPM7d8FlvNGtw4gqCLlIZWBI6AaVi-YtGb77lhUU1Kvf/exec",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        password: hashedPassword, // Send hashed password instead of plain text
      }),
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
