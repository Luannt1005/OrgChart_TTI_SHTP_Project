import { NextResponse } from "next/server";
import axios from "axios";
import { NEXT_PUBLIC_GAS_DATA_URL } from "@/constant/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dept = searchParams.get("dept");

    // Use the GAS URL from env
    const gasUrl = NEXT_PUBLIC_GAS_DATA_URL;
    console.log("GAS_URL:", gasUrl);
    
    if (!gasUrl) {
      console.error("GAS_DATA_URL is not configured in environment");
      throw new Error(
        "GAS_DATA_URL is not configured. Please check .env.local file."
      );
    }

    console.log("Fetching from GAS:", gasUrl);

    // Fetch data from Google Apps Script
    const res = await axios.get(gasUrl, {
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Safely extract data with multiple fallback options
    let data = [];
    
    if (res.data) {
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data?.data)) {
        data = res.data.data;
      } else if (res.data?.data && typeof res.data.data === 'object') {
        // If it's an object but not an array, try to convert it
        console.warn("Data format unexpected, attempting to handle:", typeof res.data.data);
        data = [];
      }
    }

    // Ensure data is always an array
    if (!Array.isArray(data)) {
      console.warn("Data is not an array, received:", typeof data);
      data = [];
    }

    console.log(`Successfully fetched ${data.length} nodes from GAS`);

    // Optional: filter by department
    if (dept && dept !== "all") {
      data = data.filter((n: any) => n.dept === dept);
    }

    // Set cache headers for 60 seconds
    const response = NextResponse.json(
      {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );

    return response;
  } catch (error) {
    console.error("GET /api/get_data failed:", error);

    const errorMessage = 
      error instanceof Error ? error.message : "Failed to fetch data from GAS";

    return NextResponse.json(
      {
        data: [],
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
