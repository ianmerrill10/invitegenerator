import { NextRequest, NextResponse } from "next/server";
import { CanvaClient } from "@/lib/canva/client";
import { cookies } from "next/headers";

/**
 * POST /api/canva/create-design
 * Create a new Canva design and return the edit URL
 *
 * This is the main integration point for "Edit in Canva" functionality.
 * Users can create a design based on their invitation, then edit it in Canva's
 * full editor, and export the finished design back.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("canva_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: { message: "Not connected to Canva. Please connect your account first." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, assetId, designType } = body;

    if (!title) {
      return NextResponse.json(
        { error: { message: "Design title is required" } },
        { status: 400 }
      );
    }

    const client = new CanvaClient(accessToken);

    // Create a new design in Canva
    // The API returns an edit_url that opens Canva's editor
    const result = await client.createDesign({
      title: title,
      design_type: designType || undefined,
      asset_id: assetId || undefined,
    });

    // The edit_url is valid for 30 days and takes the user to Canva's editor
    return NextResponse.json({
      data: {
        design: result.design,
        editUrl: result.design.urls.edit_url,
        viewUrl: result.design.urls.view_url,
        message: "Design created! Click the edit URL to customize in Canva.",
      },
    });
  } catch (error) {
    console.error("Error creating Canva design:", error);
    return NextResponse.json(
      { error: { message: "Failed to create Canva design" } },
      { status: 500 }
    );
  }
}
