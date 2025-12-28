import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encrypt } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;

  try {
    // OPTION 1: Try new getUser endpoint first (if Google Apps Script is updated)
    let res = await fetch(
      "https://script.google.com/macros/s/AKfycbyKUB1RgZvXJVCEoXV8JREC_d6w3JyvYYtphLG8D5LYLjwhY2698itD8p8gPvR3Pehc/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getUser",
          username
        })
      }
    );

    let data = await res.json();
    console.log("[Login] getUser response:", JSON.stringify(data, null, 2));

    // If getUser action is not supported, fall back to old login method
    if (!data.success || data.message?.includes("Unknown action")) {
      console.log("[Login] Falling back to old login method (plain password comparison)");

      // FALLBACK: Use old login endpoint (plain password)
      res = await fetch(
        "https://script.google.com/macros/s/AKfycbyKUB1RgZvXJVCEoXV8JREC_d6w3JyvYYtphLG8D5LYLjwhY2698itD8p8gPvR3Pehc/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        }
      );

      data = await res.json();
      console.log("[Login] Old login response:", JSON.stringify(data, null, 2));

      if (data.success) {
        // Create session for old method
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const session = await encrypt({ user: data.user, expires });

        (await cookies()).set("auth", session, {
          expires,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          sameSite: "lax",
        });

        return NextResponse.json({
          success: true,
          user: data.user
        });
      }

      return NextResponse.json({
        success: false,
        message: data.message || "Sai tài khoản hoặc mật khẩu"
      });
    }

    // NEW METHOD: User found via getUser, verify password with bcrypt
    if (!data.user) {
      return NextResponse.json({
        success: false,
        message: "Sai tài khoản hoặc mật khẩu"
      });
    }

    // Check if password is hashed (starts with $2a$ or $2b$)
    const isPasswordHashed = data.user.password?.startsWith("$2");

    if (isPasswordHashed) {
      // Verify hashed password using bcrypt
      const isPasswordValid = await verifyPassword(password, data.user.password);

      if (!isPasswordValid) {
        return NextResponse.json({
          success: false,
          message: "Sai tài khoản hoặc mật khẩu"
        });
      }
    } else {
      // Plain text password comparison (for old users)
      console.warn(`[Login] User ${username} has plain text password. Please update to hashed password.`);

      if (password !== data.user.password) {
        return NextResponse.json({
          success: false,
          message: "Sai tài khoản hoặc mật khẩu"
        });
      }
    }

    // Password is correct, create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Don't include password in session
    const { password: _, ...userWithoutPassword } = data.user;
    const session = await encrypt({ user: userWithoutPassword, expires });

    (await cookies()).set("auth", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({
      success: false,
      message: "Lỗi hệ thống. Vui lòng thử lại."
    });
  }
}
