import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, QueryCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const AFFILIATES_TABLE = process.env.DYNAMODB_AFFILIATES_TABLE || "InviteGenerator-Affiliates-production";
const REFERRALS_TABLE = process.env.DYNAMODB_AFFILIATE_REFERRALS_TABLE || "InviteGenerator-AffiliateReferrals-production";
const COMMISSIONS_TABLE = process.env.DYNAMODB_AFFILIATE_COMMISSIONS_TABLE || "InviteGenerator-AffiliateCommissions-production";
const CLICKS_TABLE = process.env.DYNAMODB_AFFILIATE_CLICKS_TABLE || "InviteGenerator-AffiliateClicks-production";

// GET /api/affiliates/stats - Get detailed affiliate statistics
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // Days
    const periodDays = parseInt(period);

    // Get affiliate record
    const affiliateResult = await dynamodb.send(
      new QueryCommand({
        TableName: AFFILIATES_TABLE,
        IndexName: "userId-index",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: marshall({ ":userId": auth.userId }),
      })
    );

    if (!affiliateResult.Items || affiliateResult.Items.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_AFFILIATE", message: "Not registered as affiliate" } },
        { status: 404 }
      );
    }

    const affiliate = unmarshall(affiliateResult.Items[0]);

    // Get referrals
    const referralsResult = await dynamodb.send(
      new QueryCommand({
        TableName: REFERRALS_TABLE,
        IndexName: "affiliateId-index",
        KeyConditionExpression: "affiliateId = :affiliateId",
        ExpressionAttributeValues: marshall({ ":affiliateId": affiliate.id }),
      })
    );

    const referrals = (referralsResult.Items || []).map((item) => unmarshall(item));

    // Get commissions
    const commissionsResult = await dynamodb.send(
      new QueryCommand({
        TableName: COMMISSIONS_TABLE,
        IndexName: "affiliateId-index",
        KeyConditionExpression: "affiliateId = :affiliateId",
        ExpressionAttributeValues: marshall({ ":affiliateId": affiliate.id }),
      })
    );

    const commissions = (commissionsResult.Items || []).map((item) => unmarshall(item));

    // Calculate date range
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);
    const periodStartISO = periodStart.toISOString();

    // Filter data for period
    const periodReferrals = referrals.filter((r) => r.createdAt >= periodStartISO);
    const periodCommissions = commissions.filter((c) => c.createdAt >= periodStartISO);

    // Calculate statistics
    const stats = {
      overview: {
        tier: affiliate.tier || "bronze",
        commissionRate: getCommissionRate(affiliate.tier),
        affiliateCode: affiliate.affiliateCode,
        memberSince: affiliate.createdAt,
      },
      lifetime: {
        totalClicks: affiliate.totalClicks || 0,
        totalSignups: referrals.filter((r) => r.status === "signed_up" || r.status === "converted").length,
        totalConversions: referrals.filter((r) => r.status === "converted").length,
        totalEarnings: commissions.reduce((sum, c) => sum + (c.amount || 0), 0),
        totalPaid: commissions.filter((c) => c.status === "paid").reduce((sum, c) => sum + (c.amount || 0), 0),
        pendingBalance: affiliate.pendingBalance || 0,
      },
      period: {
        days: periodDays,
        clicks: periodReferrals.filter((r) => r.clickedAt >= periodStartISO).length,
        signups: periodReferrals.filter((r) => r.status !== "clicked").length,
        conversions: periodReferrals.filter((r) => r.status === "converted").length,
        earnings: periodCommissions.reduce((sum, c) => sum + (c.amount || 0), 0),
      },
      conversionRates: {
        clickToSignup: calculateRate(
          referrals.filter((r) => r.status !== "clicked").length,
          affiliate.totalClicks || 1
        ),
        signupToConversion: calculateRate(
          referrals.filter((r) => r.status === "converted").length,
          referrals.filter((r) => r.status !== "clicked").length || 1
        ),
        overall: calculateRate(
          referrals.filter((r) => r.status === "converted").length,
          affiliate.totalClicks || 1
        ),
      },
      topReferrals: referrals
        .filter((r) => r.status === "converted")
        .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
        .slice(0, 10)
        .map((r) => ({
          id: r.id,
          convertedAt: r.convertedAt,
          plan: r.plan,
          totalValue: r.totalValue || 0,
          commissionsEarned: r.commissionsEarned || 0,
        })),
      monthlyTrend: calculateMonthlyTrend(referrals, commissions),
      recentActivity: [
        ...referrals.slice(0, 5).map((r) => ({
          type: "referral",
          status: r.status,
          date: r.createdAt,
        })),
        ...commissions.slice(0, 5).map((c) => ({
          type: "commission",
          amount: c.amount,
          status: c.status,
          date: c.createdAt,
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10),
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Get affiliate stats error:", error);
    return NextResponse.json(
      { success: false, error: { code: "STATS_FAILED", message: "Failed to fetch statistics" } },
      { status: 500 }
    );
  }
}

function getCommissionRate(tier: string): string {
  const rates: Record<string, string> = {
    bronze: "30%",
    silver: "35%",
    gold: "40%",
    platinum: "45%",
    diamond: "50%",
  };
  return rates[tier] || "30%";
}

function calculateRate(numerator: number, denominator: number): string {
  if (denominator === 0) return "0%";
  return ((numerator / denominator) * 100).toFixed(1) + "%";
}

function calculateMonthlyTrend(
  referrals: Record<string, unknown>[],
  commissions: Record<string, unknown>[]
): Record<string, { referrals: number; conversions: number; earnings: number }> {
  const months: Record<string, { referrals: number; conversions: number; earnings: number }> = {};

  // Last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = date.toISOString().slice(0, 7); // YYYY-MM
    months[key] = { referrals: 0, conversions: 0, earnings: 0 };
  }

  referrals.forEach((r) => {
    const key = String(r.createdAt).slice(0, 7);
    if (months[key]) {
      months[key].referrals++;
      if (r.status === "converted") {
        months[key].conversions++;
      }
    }
  });

  commissions.forEach((c) => {
    const key = String(c.createdAt).slice(0, 7);
    if (months[key]) {
      months[key].earnings += (c.amount as number) || 0;
    }
  });

  return months;
}
