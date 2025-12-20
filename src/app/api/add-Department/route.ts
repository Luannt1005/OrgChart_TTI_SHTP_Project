import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.pid) {
      console.warn("Missing required fields in add-Department:", { name: !!body.name, pid: !!body.pid });
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name and pid are required",
        },
        { status: 400 }
      );
    }

    // Get GAS URL from environment
    const gasUrl = process.env.NEXT_PUBLIC_GAS_ADD_DEPT_URL;
    if (!gasUrl) {
      console.error("GAS_ADD_DEPT_URL is not configured");
      throw new Error("Add-Department GAS URL is not configured");
    }

    console.log("Adding department via GAS: ", { name: body.name, pid: body.pid, url: gasUrl });

    // Send to Google Apps Script
    const res = await axios.post(gasUrl, body, {
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = res.data || {};

    console.log("Add-Department response:", result);

    return NextResponse.json(
      {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/add-Department failed:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to add department";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
