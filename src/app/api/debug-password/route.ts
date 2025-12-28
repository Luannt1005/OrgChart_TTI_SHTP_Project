import { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
    const body = await req.json();
    const { password, hash } = body;

    try {
        // If only password provided, generate hash
        if (password && !hash) {
            const hashed = await hashPassword(password);
            return NextResponse.json({
                success: true,
                password: password,
                hash: hashed,
                message: "Hash generated successfully"
            });
        }

        // If both password and hash provided, verify
        if (password && hash) {
            const isValid = await verifyPassword(password, hash);
            return NextResponse.json({
                success: true,
                password: password,
                hash: hash,
                isValid: isValid,
                message: isValid ? "Password matches hash" : "Password does NOT match hash"
            });
        }

        return NextResponse.json({
            success: false,
            message: "Please provide 'password' or both 'password' and 'hash'"
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error)
        });
    }
}
