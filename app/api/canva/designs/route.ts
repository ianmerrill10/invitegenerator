import { NextRequest, NextResponse } from "next/server";
import { CanvaClient } from "@/lib/canva/client";
import { cookies } from "next/headers";

/**
 * GET /api/canva/designs
 * List user's Canva designs
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("canva_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: { message: "Not connected to Canva" } },
        { status: 401 }
      );
    }

    const client = new CanvaClient(accessToken);
    const searchParams = request.nextUrl.searchParams;

    const designs = await client.listDesigns({
      query: searchParams.get("query") || undefined,
      continuation: searchParams.get("continuation") || undefined,
      ownership: (searchParams.get("ownership") as "owned" | "shared") || "owned",
    });

    return NextResponse.json({ data: designs });
  } catch (error) {
    console.error("Error listing Canva designs:", error);
    return NextResponse.json(
      { error: { message: "Failed to fetch Canva designs" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/canva/designs
 * Create a new Canva design
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("canva_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: { message: "Not connected to Canva" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, design_type, asset_id } = body;

    const client = new CanvaClient(accessToken);
    const result = await client.createDesign({
      title,
      design_type,
      asset_id,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error creating Canva design:", error);
    return NextResponse.json(
      { error: { message: "Failed to create Canva design" } },
      { status: 500 }
    );
  }
}
