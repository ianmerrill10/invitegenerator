import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { getUserById } from "@/services/aws/dynamodb";
import { getSubscription, PLAN_FEATURES } from "@/services/stripe";
import { applyRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production";

async function countUserInvitations(userId: string, periodStart?: string): Promise<number> {
  try {
    const expressionValues: Record<string, string> = { ":userId": userId };
    let filterExpression = "";

    if (periodStart) {
      filterExpression = " AND createdAt >= :periodStart";
      expressionValues[":periodStart"] = periodStart;
    }

    const result = await dynamodb.send(
      new QueryCommand({
        TableName: INVITATIONS_TABLE,
        IndexName: "userId-index",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: periodStart ? "createdAt >= :periodStart" : undefined,
        ExpressionAttributeValues: marshall(expressionValues),
        Select: "COUNT",
      })
    );
    return result.Count || 0;
  } catch {
    return 0;
  }
}

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = applyRateLimit(request, API_RATE_LIMIT);
  if (rateLimit.error) {
    return NextResponse.json(
      { error: rateLimit.error.message },
      { status: rateLimit.error.status, headers: rateLimit.headers }
    );
  }

  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get plan features
    const planFeatures = PLAN_FEATURES[user.plan];

    // Count actual invitation usage
    const invitationsUsed = await countUserInvitations(auth.userId);

    // If user has no Stripe subscription, return basic info
    if (!user.stripeSubscriptionId) {
      return NextResponse.json({
        success: true,
        data: {
          subscription: null,
          plan: user.plan,
          planName: planFeatures.name,
          features: planFeatures.features,
          usage: {
            invitations: {
              used: invitationsUsed,
              limit: planFeatures.invitationsPerMonth,
            },
            credits: {
              used: planFeatures.aiCreditsPerMonth - user.creditsRemaining,
              limit: planFeatures.aiCreditsPerMonth,
            },
          },
        },
      });
    }

    // Get Stripe subscription details
    const subscription = await getSubscription(user.stripeSubscriptionId);

    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: {
          subscription: null,
          plan: user.plan,
          planName: planFeatures.name,
          features: planFeatures.features,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        plan: user.plan,
        planName: planFeatures.name,
        features: planFeatures.features,
        usage: {
          invitations: {
            used: await countUserInvitations(auth.userId, new Date(subscription.current_period_start * 1000).toISOString()),
            limit: planFeatures.invitationsPerMonth,
          },
          credits: {
            used: planFeatures.aiCreditsPerMonth - user.creditsRemaining,
            limit: planFeatures.aiCreditsPerMonth,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
