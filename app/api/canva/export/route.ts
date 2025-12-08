import { NextRequest, NextResponse } from "next/server";
import { CanvaClient } from "@/lib/canva/client";
import { cookies } from "next/headers";

/**
 * POST /api/canva/export
 * Export an InviteGenerator invitation to Canva
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
    const { invitationId, title, imageUrl } = body;

    if (!invitationId || !title) {
      return NextResponse.json(
        { error: { message: "Missing required fields" } },
        { status: 400 }
      );
    }

    const client = new CanvaClient(accessToken);

    // If we have an image URL, upload it as an asset first
    let assetId: string | undefined;

    if (imageUrl) {
      // Fetch the image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to fetch invitation image");
      }

      const imageBlob = await imageResponse.blob();
      const fileName = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;

      // Upload to Canva
      const uploadResult = await client.uploadAsset({
        name: fileName,
        mimeType: "image/png",
        data: imageBlob,
        tags: ["invitegenerator", "invitation"],
      });

      assetId = uploadResult.asset.id;
    }

    // Create a new design in Canva
    const design = await client.createDesign({
      title: `InviteGenerator - ${title}`,
      asset_id: assetId,
    });

    return NextResponse.json({
      data: {
        design: design.design,
        editUrl: design.design.urls.edit_url,
        message: "Successfully exported to Canva",
      },
    });
  } catch (error) {
    console.error("Error exporting to Canva:", error);
    return NextResponse.json(
      { error: { message: "Failed to export to Canva" } },
      { status: 500 }
    );
  }
}
