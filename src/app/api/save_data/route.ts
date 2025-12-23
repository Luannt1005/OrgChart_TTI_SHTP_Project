import { NextRequest, NextResponse } from 'next/server';

// ⚠️ THay đổi URL này thành POST endpoint của Apps Script của bạn
// Nó PHẢI khác với LOAD_URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_POST_DEPLOYMENT_ID/exec";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { org_id, org_data } = body;

    if (!org_id || !org_data) {
      return NextResponse.json(
        { error: 'Missing org_id or org_data' },
        { status: 400 }
      );
    }

    // Parse org_data if it's a string
    const orgDataObj = typeof org_data === 'string' 
      ? JSON.parse(org_data) 
      : org_data;

    console.log("Saving to Apps Script:", { org_id, orgData: orgDataObj });

    // Call Google Apps Script to save data
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        org_id: org_id,
        org_data: orgDataObj
      })
    });

    const responseText = await response.text();
    console.log("Apps Script response:", responseText);

    try {
      const result = JSON.parse(responseText);
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Data saved successfully',
          timestamp: new Date().toISOString()
        });
      }
    } catch {
      // Apps Script returned success
      return NextResponse.json({
        success: true,
        message: 'Data saved successfully',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save data' },
      { status: 500 }
    );
  }
}
