import { NextResponse } from "next/server";
import axios from "axios";
import { NEXT_PUBLIC_GAS_UPDATE_NODE_URL } from "@/constant/api";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required field
    if (!data.id) {
      console.warn("Missing required field in Update-Node: id");
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: id is required",
        },
        { status: 400 }
      );
    }

    // Get GAS URL from environment
    const gasUrl = NEXT_PUBLIC_GAS_UPDATE_NODE_URL;
    if (!gasUrl) {
      console.error("GAS_UPDATE_NODE_URL is not configured");
      throw new Error("Update-Node GAS URL is not configured");
    }

    console.log("Updating node via GAS:", { id: data.id });

    // Send to Google Apps Script
    const res = await axios.post(gasUrl, data, {
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = res.data || {};

    console.log("Update-Node response:", result);

    return NextResponse.json(
      {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/Update-Node failed:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to update node";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
