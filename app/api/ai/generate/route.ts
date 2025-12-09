import { NextRequest, NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getAuthenticatedUser } from "@/lib/auth";
import { checkRateLimit, rateLimitResponse, rateLimiters } from "@/lib/rate-limit";

// Initialize AWS clients
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || "us-east-1",
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Helper to create error response
function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code: "AI_ERROR", message },
    },
    { status }
  );
}

// Color palettes by scheme
const colorPalettes = {
  warm: ["#FF6B47", "#FCD34D", "#F59E0B", "#FAFAF9"],
  cool: ["#3B82F6", "#06B6D4", "#8B5CF6", "#F0F9FF"],
  neutral: ["#1C1917", "#78716C", "#A8A29E", "#FAFAF9"],
  vibrant: ["#EC4899", "#8B5CF6", "#06B6D4", "#FFFFFF"],
  pastel: ["#FBCFE8", "#DDD6FE", "#A5F3FC", "#FFFFFF"],
  monochrome: ["#18181B", "#3F3F46", "#71717A", "#FAFAF9"],
};

// Font pairs by aesthetic
const fontPairs = {
  modern: { heading: "Outfit", body: "Inter" },
  classic: { heading: "Playfair Display", body: "Source Serif Pro" },
  playful: { heading: "Fredoka One", body: "Nunito" },
  elegant: { heading: "Cormorant Garamond", body: "Montserrat" },
  minimalist: { heading: "DM Sans", body: "DM Sans" },
  bold: { heading: "Bebas Neue", body: "Open Sans" },
  rustic: { heading: "Amatic SC", body: "Josefin Sans" },
  whimsical: { heading: "Pacifico", body: "Quicksand" },
};

export async function POST(request: NextRequest) {
  // Apply rate limiting for AI generation (expensive operation)
  const rateLimitResult = checkRateLimit(request, rateLimiters.ai);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult, rateLimiters.ai.message);
  }

  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult.success) {
      return errorResponse(authResult.error.message, 401);
    }
    const userId = authResult.user.userId;

    // Get user to check credits
    const getUserCommand = new GetCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Key: { id: userId },
    });

    const userResult = await docClient.send(getUserCommand);
    const user = userResult.Item;

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if ((user.creditsRemaining || 0) <= 0) {
      return errorResponse(
        "You've used all your AI credits for this month. Upgrade for more.",
        403
      );
    }

    const body = await request.json();
    const { eventType, eventDetails, style, additionalInstructions } = body;

    // Build the prompt for Claude
    const prompt = `You are a creative invitation designer. Generate design suggestions for an invitation based on these details:

Event Type: ${eventType}
Event Title: ${eventDetails.title || "Celebration"}
Event Date: ${eventDetails.date || "TBD"}
Host: ${eventDetails.hostName || "The Host"}
Location: ${eventDetails.location || "TBD"}
Description: ${eventDetails.description || "Join us for a special celebration"}

Style Preferences:
- Aesthetic: ${style.aesthetic}
- Formality: ${style.formality}
- Color Scheme: ${style.colorScheme}

${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ""}

Generate a creative invitation design by providing:
1. A compelling headline text (short and elegant)
2. A subheadline or tagline
3. The main invitation body text (warm and inviting)
4. A call-to-action phrase for RSVP
5. Any decorative element suggestions (like icons or patterns)

Format your response as JSON with these fields:
{
  "headline": "...",
  "subheadline": "...",
  "bodyText": "...",
  "ctaText": "...",
  "decorativeElements": ["..."],
  "moodKeywords": ["..."]
}`;

    // Call Bedrock (Claude)
    const invokeCommand = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    let aiResponse;
    try {
      const response = await bedrockClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const textContent = responseBody.content?.[0]?.text || "";
      
      // Parse the JSON from the response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid AI response format");
      }
    } catch (aiError) {
      console.error("Bedrock error:", aiError);
      
      // Fallback to default content
      aiResponse = {
        headline: `You're Invited!`,
        subheadline: `Join us for a special ${eventType.replace("_", " ")}`,
        bodyText: `We would be honored to have you celebrate with us. Please join us for ${eventDetails.title || "this special occasion"}.`,
        ctaText: "RSVP Now",
        decorativeElements: ["hearts", "sparkles"],
        moodKeywords: [style.aesthetic, style.formality],
      };
    }

    // Get colors and fonts based on style
    const colors = colorPalettes[style.colorScheme as keyof typeof colorPalettes] || colorPalettes.warm;
    const fonts = fontPairs[style.aesthetic as keyof typeof fontPairs] || fontPairs.modern;

    // Build design data
    const designData = {
      templateId: "ai-generated",
      backgroundColor: colors[3],
      primaryColor: colors[0],
      secondaryColor: colors[1],
      accentColor: colors[2],
      fontFamily: fonts.body,
      headingFont: fonts.heading,
      fontSize: 16,
      textColor: style.colorScheme === "monochrome" ? colors[0] : "#1C1917",
      layout: style.aesthetic === "minimalist" ? "minimal" : "classic",
      elements: [],
      width: 800,
      height: 1120,
    };

    // Deduct AI credit
    const updateCommand = new UpdateCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: "SET creditsRemaining = creditsRemaining - :dec, updatedAt = :now",
      ExpressionAttributeValues: {
        ":dec": 1,
        ":now": new Date().toISOString(),
      },
      ReturnValues: "UPDATED_NEW",
    });

    await docClient.send(updateCommand);

    return NextResponse.json({
      success: true,
      data: {
        content: aiResponse,
        designData,
        suggestions: [
          {
            type: "layout",
            content: `Try a ${style.aesthetic} layout for best results`,
            confidence: 0.85,
          },
          {
            type: "color",
            content: `${style.colorScheme} tones work well for ${eventType.replace("_", " ")} invitations`,
            confidence: 0.9,
          },
        ],
      },
      creditsUsed: 1,
      creditsRemaining: (user.creditsRemaining || 1) - 1,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return errorResponse("AI generation failed. Please try again.", 500);
  }
}
