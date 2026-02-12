import { NextRequest, NextResponse } from "next/server";
import { AffiliateService } from "@/lib/services/affiliate-service";

// GET /api/affiliates/leaderboard - Get affiliate leaderboard (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") as "weekly" | "monthly" | "all_time" || "monthly";

    const leaderboard = await AffiliateService.getLeaderboard(period);

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch leaderboard" } },
      { status: 500 }
    );
  }
}
