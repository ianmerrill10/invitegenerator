import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { applyRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";
import {
  generateRecommendations,
  getFallbackRecommendations,
} from "@/lib/ai/recommendation-engine";
import type { EventType } from "@/types";
import type { EventQuestionnaire, AIRecommendationResponse } from "@/types/questionnaire";

// ---------------------------------------------------------------------------
// Allowed values for validation
// ---------------------------------------------------------------------------

const ALLOWED_EVENT_TYPES: ReadonlySet<string> = new Set([
  "wedding",
  "birthday",
  "baby_shower",
  "bridal_shower",
  "anniversary",
  "graduation",
  "corporate",
  "holiday",
  "dinner_party",
  "cocktail_party",
  "retirement",
  "memorial",
  "religious",
  "fundraiser",
  "other",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code: "RECOMMENDATION_ERROR", message },
    },
    { status }
  );
}

// ---------------------------------------------------------------------------
// POST /api/recommendations
//
// Body:
//   {
//     eventType: EventType;
//     guestCount?: number;
//     questionnaire: Partial<EventQuestionnaire>;
//     useFallback?: boolean;   // force static recommendations
//   }
//
// Returns:
//   { success: true, data: AIRecommendationResponse }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Rate-limit
  const rateLimit = applyRateLimit(request, API_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: rateLimit.error.message } },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    // Authenticate
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const {
      eventType,
      guestCount,
      questionnaire,
      useFallback,
    } = body as {
      eventType?: string;
      guestCount?: number;
      questionnaire?: Partial<EventQuestionnaire>;
      useFallback?: boolean;
    };

    // Validate eventType
    if (!eventType || !ALLOWED_EVENT_TYPES.has(eventType)) {
      return errorResponse("Invalid or missing eventType");
    }

    const safeEventType = eventType as EventType;

    // Build the questionnaire payload for the engine
    const questionnaireData: Partial<EventQuestionnaire> = {
      ...(questionnaire ?? {}),
      eventType: safeEventType,
      userId: auth.userId,
    };

    if (typeof guestCount === "number" && guestCount > 0) {
      questionnaireData.guestCount = Math.round(guestCount);
    }

    let data: AIRecommendationResponse;

    if (useFallback) {
      // Caller explicitly wants static recommendations (no AI call)
      data = getFallbackRecommendations(safeEventType);
    } else {
      // Try AI-powered recommendations; the engine itself falls back on error
      data = await generateRecommendations(questionnaireData, safeEventType);
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return errorResponse("Failed to generate recommendations", 500);
  }
}
