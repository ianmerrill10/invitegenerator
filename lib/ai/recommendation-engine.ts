/**
 * AI-Powered Product Recommendation Engine
 *
 * Uses Claude 3 via AWS Bedrock to analyse event questionnaire data and
 * generate personalised product recommendations.  Falls back to static
 * recommendations when the AI service is unavailable.
 */

import { invokeModelJson } from "./bedrock-client";
import {
  SHOPIFY_STORES,
  AFFILIATE_PARTNERS,
  PRODUCT_RECOMMENDATIONS,
} from "@/lib/affiliate-config";
import type { EventQuestionnaire, AIRecommendationResponse } from "@/types/questionnaire";
import type { EventType } from "@/types";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate personalised recommendations powered by Claude 3.
 *
 * @param questionnaire  The completed event questionnaire data.
 * @param eventType      The event type (wedding, birthday, etc.).
 * @returns              AI-generated recommendation payload, or fallback if
 *                       the Bedrock call fails.
 */
export async function generateRecommendations(
  questionnaire: Partial<EventQuestionnaire>,
  eventType: EventType
): Promise<AIRecommendationResponse> {
  const shopifyStore = SHOPIFY_STORES[eventType];
  const availableCategories = shopifyStore?.categories ?? [];

  const prompt = `
Analyze the following event questionnaire data and provide personalized product recommendations for the host.
The goal is to help them plan their event while suggesting products they can buy.

EVENT TYPE: ${eventType}
QUESTIONNAIRE DATA:
${JSON.stringify(questionnaire, null, 2)}

AVAILABLE PRODUCT CATEGORIES:
${JSON.stringify(availableCategories, null, 2)}

AVAILABLE AFFILIATE PARTNERS:
${AFFILIATE_PARTNERS.map((p) => `${p.name} (${p.type})`).join(", ")}

TASK:
1. Identify the overall theme and style of the event based on the data.
2. Suggest 3-5 specific product categories that would be most helpful.
3. For each category, suggest 2-3 specific products with search terms.
4. Provide brief style advice for the host.

FORMAT:
Return a JSON object with the following structure:
{
  "eventTheme": "string",
  "styleAdvice": "string",
  "recommendations": [
    {
      "category": "string",
      "reasoning": "string",
      "suggestedProducts": [
        {
          "name": "string",
          "description": "string",
          "estimatedPrice": "string",
          "priority": "high|medium|low",
          "searchTerms": ["string", "string"]
        }
      ]
    }
  ]
}
  `.trim();

  try {
    const result = await invokeModelJson<AIRecommendationResponse>(prompt, {
      temperature: 0.5,
    });

    console.log("[RecommendationEngine] AI recommendations generated", {
      invitationId: questionnaire.invitationId,
      recommendationCount: result.recommendations?.length ?? 0,
    });

    return result;
  } catch (error) {
    console.error("[RecommendationEngine] AI generation failed, using fallback", error);
    return getFallbackRecommendations(eventType);
  }
}

// ---------------------------------------------------------------------------
// Fallback (static) recommendations
// ---------------------------------------------------------------------------

/**
 * Provide sensible default recommendations when the AI service is unavailable.
 * Draws from the static PRODUCT_RECOMMENDATIONS config.
 */
export function getFallbackRecommendations(
  eventType: EventType
): AIRecommendationResponse {
  const staticCategories = PRODUCT_RECOMMENDATIONS[eventType] ?? PRODUCT_RECOMMENDATIONS["birthday"] ?? [];

  const recommendations = staticCategories.slice(0, 5).map((cat) => ({
    category: cat.category,
    reasoning: `Essential ${cat.category.toLowerCase()} items for any ${eventType.replace(/_/g, " ")} event.`,
    suggestedProducts: cat.products.slice(0, 3).map((product) => ({
      name: product
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      description: `Quality ${product.replace(/-/g, " ")} for your ${eventType.replace(/_/g, " ")}.`,
      estimatedPrice: undefined as string | undefined,
      priority: "medium" as const,
      searchTerms: [`${eventType.replace(/_/g, " ")} ${product.replace(/-/g, " ")}`, product.replace(/-/g, " ")],
    })),
  }));

  return {
    eventTheme: "Classic Celebration",
    styleAdvice: "Keep it elegant and consistent with your chosen template.",
    recommendations,
  };
}
