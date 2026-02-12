// ============================================
// AFFILIATE SERVICE
// Handles all affiliate program operations
// ============================================

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import {
  Affiliate,
  AffiliateStatus,
  AffiliateTier,
  AffiliateTierConfig,
  AffiliateStats,
  AffiliateApplication,
  Referral,
  ReferralStatus,
  AffiliateCommission,
  CommissionType,
  AffiliatePayout,
  PayoutMethod,
  AffiliateLeaderboard,
  LeaderboardEntry,
} from "@/types";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const AFFILIATES_TABLE = process.env.DYNAMODB_AFFILIATES_TABLE || "InviteGenerator-Affiliates-production";
const REFERRALS_TABLE = process.env.DYNAMODB_AFFILIATE_REFERRALS_TABLE || "InviteGenerator-AffiliateReferrals-production";
const COMMISSIONS_TABLE = process.env.DYNAMODB_AFFILIATE_COMMISSIONS_TABLE || "InviteGenerator-AffiliateCommissions-production";
const PAYOUTS_TABLE = process.env.DYNAMODB_PAYOUTS_TABLE || "InviteGenerator-Payouts-production";
const APPLICATIONS_TABLE = process.env.DYNAMODB_AFFILIATE_APPLICATIONS_TABLE || "InviteGenerator-AffiliateApplications-production";

// ==================== TIER CONFIGURATION ====================
// LARGER THAN AVERAGE REVENUE SHARE as requested
export const AFFILIATE_TIERS: AffiliateTierConfig[] = [
  {
    tier: "bronze",
    name: "Bronze Partner",
    minReferrals: 0,
    commissionRate: 30, // 30% - higher than industry average of 15-25%
    recurringCommission: true,
    recurringMonths: 12,
    bonuses: [
      { type: "signup", amount: 25, description: "$25 signup bonus after first conversion" },
    ],
  },
  {
    tier: "silver",
    name: "Silver Partner",
    minReferrals: 10,
    commissionRate: 35, // 35%
    recurringCommission: true,
    recurringMonths: 12,
    bonuses: [
      { type: "signup", amount: 25, description: "$25 signup bonus" },
      { type: "milestone", amount: 100, description: "$100 at 10 referrals", requirement: 10 },
    ],
  },
  {
    tier: "gold",
    name: "Gold Partner",
    minReferrals: 25,
    commissionRate: 40, // 40%
    recurringCommission: true,
    recurringMonths: 18,
    bonuses: [
      { type: "signup", amount: 50, description: "$50 signup bonus" },
      { type: "milestone", amount: 250, description: "$250 at 25 referrals", requirement: 25 },
    ],
  },
  {
    tier: "platinum",
    name: "Platinum Partner",
    minReferrals: 50,
    commissionRate: 45, // 45%
    recurringCommission: true,
    recurringMonths: 24,
    bonuses: [
      { type: "signup", amount: 75, description: "$75 signup bonus" },
      { type: "milestone", amount: 500, description: "$500 at 50 referrals", requirement: 50 },
      { type: "performance", amount: 1000, description: "$1,000 quarterly bonus for top 3 performers" },
    ],
  },
  {
    tier: "diamond",
    name: "Diamond Partner",
    minReferrals: 100,
    commissionRate: 50, // 50% - exceptional rate
    recurringCommission: true,
    recurringMonths: 36, // 3 years of recurring
    bonuses: [
      { type: "signup", amount: 100, description: "$100 signup bonus" },
      { type: "milestone", amount: 1000, description: "$1,000 at 100 referrals", requirement: 100 },
      { type: "performance", amount: 2500, description: "$2,500 quarterly bonus for #1 performer" },
    ],
  },
];

// ==================== AFFILIATE OPERATIONS ====================

export class AffiliateService {
  // Generate a unique referral code
  static generateReferralCode(name: string): string {
    const cleanName = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${cleanName}${random}`;
  }

  // Get affiliate by ID
  static async getAffiliate(affiliateId: string): Promise<Affiliate | null> {
    try {
      const command = new GetCommand({
        TableName: AFFILIATES_TABLE,
        Key: { id: affiliateId },
      });
      const result = await docClient.send(command);
      return (result.Item as Affiliate) || null;
    } catch (error) {
      console.error("Error getting affiliate:", error);
      return null;
    }
  }

  // Get affiliate by user ID
  static async getAffiliateByUserId(userId: string): Promise<Affiliate | null> {
    try {
      const command = new QueryCommand({
        TableName: AFFILIATES_TABLE,
        IndexName: "userId-index",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
      });
      const result = await docClient.send(command);
      return (result.Items?.[0] as Affiliate) || null;
    } catch (error) {
      console.error("Error getting affiliate by user ID:", error);
      return null;
    }
  }

  // Get affiliate by referral code
  static async getAffiliateByCode(code: string): Promise<Affiliate | null> {
    try {
      const command = new QueryCommand({
        TableName: AFFILIATES_TABLE,
        IndexName: "code-index",
        KeyConditionExpression: "code = :code",
        ExpressionAttributeValues: { ":code": code.toUpperCase() },
      });
      const result = await docClient.send(command);
      return (result.Items?.[0] as Affiliate) || null;
    } catch (error) {
      console.error("Error getting affiliate by code:", error);
      return null;
    }
  }

  // Create new affiliate
  static async createAffiliate(
    userId: string,
    name: string,
    payoutMethod: PayoutMethod = "paypal"
  ): Promise<Affiliate | null> {
    const now = new Date().toISOString();
    const code = this.generateReferralCode(name);

    const affiliate: Affiliate = {
      id: uuidv4(),
      userId,
      code,
      status: "active", // Auto-approve for now
      tier: "bronze",
      payoutMethod,
      payoutDetails: {},
      stats: {
        totalClicks: 0,
        totalSignups: 0,
        totalConversions: 0,
        conversionRate: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
        currentMonthEarnings: 0,
        lifetimeValue: 0,
      },
      createdAt: now,
      updatedAt: now,
      approvedAt: now,
    };

    try {
      const command = new PutCommand({
        TableName: AFFILIATES_TABLE,
        Item: affiliate,
        ConditionExpression: "attribute_not_exists(id)",
      });
      await docClient.send(command);
      return affiliate;
    } catch (error) {
      console.error("Error creating affiliate:", error);
      return null;
    }
  }

  // Update affiliate tier based on performance
  static async updateAffiliateTier(affiliateId: string): Promise<AffiliateTier> {
    const affiliate = await this.getAffiliate(affiliateId);
    if (!affiliate) return "bronze";

    const referrals = affiliate.stats.totalConversions;
    let newTier: AffiliateTier = "bronze";

    for (const tierConfig of AFFILIATE_TIERS) {
      if (referrals >= tierConfig.minReferrals) {
        newTier = tierConfig.tier;
      }
    }

    if (newTier !== affiliate.tier) {
      await this.updateAffiliate(affiliateId, { tier: newTier });
    }

    return newTier;
  }

  // Update affiliate
  static async updateAffiliate(
    affiliateId: string,
    updates: Partial<Affiliate>
  ): Promise<boolean> {
    try {
      const updateParts: string[] = [];
      const expressionValues: Record<string, unknown> = {};
      const expressionNames: Record<string, string> = {};

      Object.entries(updates).forEach(([key, value], index) => {
        if (key !== "id" && value !== undefined) {
          updateParts.push(`#field${index} = :val${index}`);
          expressionNames[`#field${index}`] = key;
          expressionValues[`:val${index}`] = value;
        }
      });

      if (updateParts.length === 0) return true;

      expressionValues[":updatedAt"] = new Date().toISOString();
      updateParts.push("updatedAt = :updatedAt");

      const command = new UpdateCommand({
        TableName: AFFILIATES_TABLE,
        Key: { id: affiliateId },
        UpdateExpression: `SET ${updateParts.join(", ")}`,
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues,
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error("Error updating affiliate:", error);
      return false;
    }
  }

  // ==================== REFERRAL OPERATIONS ====================

  // Track a referral click
  static async trackClick(
    affiliateCode: string,
    source: string,
    landingPage: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Referral | null> {
    const affiliate = await this.getAffiliateByCode(affiliateCode);
    if (!affiliate || affiliate.status !== "active") return null;

    const referral: Referral = {
      id: uuidv4(),
      affiliateId: affiliate.id,
      referredUserId: "",
      referredEmail: "",
      status: "clicked",
      source,
      landingPage,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
      totalRevenue: 0,
      totalCommission: 0,
    };

    try {
      const command = new PutCommand({
        TableName: REFERRALS_TABLE,
        Item: referral,
      });
      await docClient.send(command);

      // Update click stats
      await this.incrementAffiliateStats(affiliate.id, { totalClicks: 1 });

      return referral;
    } catch (error) {
      console.error("Error tracking click:", error);
      return null;
    }
  }

  // Convert referral to signup
  static async convertToSignup(
    referralId: string,
    userId: string,
    email: string
  ): Promise<boolean> {
    try {
      const command = new UpdateCommand({
        TableName: REFERRALS_TABLE,
        Key: { id: referralId },
        UpdateExpression: "SET #status = :status, referredUserId = :userId, referredEmail = :email",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":status": "signed_up",
          ":userId": userId,
          ":email": email,
        },
      });
      await docClient.send(command);

      // Get referral to find affiliate
      const getReferral = new GetCommand({
        TableName: REFERRALS_TABLE,
        Key: { id: referralId },
      });
      const referral = (await docClient.send(getReferral)).Item as Referral;

      if (referral) {
        await this.incrementAffiliateStats(referral.affiliateId, { totalSignups: 1 });
      }

      return true;
    } catch (error) {
      console.error("Error converting to signup:", error);
      return false;
    }
  }

  // Convert referral to paid customer
  static async convertToPaid(
    referralId: string,
    purchaseAmount: number
  ): Promise<AffiliateCommission | null> {
    try {
      const getReferral = new GetCommand({
        TableName: REFERRALS_TABLE,
        Key: { id: referralId },
      });
      const referral = (await docClient.send(getReferral)).Item as Referral;
      if (!referral) return null;

      const affiliate = await this.getAffiliate(referral.affiliateId);
      if (!affiliate) return null;

      const tierConfig = AFFILIATE_TIERS.find((t) => t.tier === affiliate.tier);
      if (!tierConfig) return null;

      const commissionAmount = (purchaseAmount * tierConfig.commissionRate) / 100;

      // Update referral status
      await docClient.send(
        new UpdateCommand({
          TableName: REFERRALS_TABLE,
          Key: { id: referralId },
          UpdateExpression:
            "SET #status = :status, convertedAt = :convertedAt, firstPurchaseAt = :purchaseAt, totalRevenue = totalRevenue + :amount",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":status": "converted",
            ":convertedAt": new Date().toISOString(),
            ":purchaseAt": new Date().toISOString(),
            ":amount": purchaseAmount,
          },
        })
      );

      // Create commission
      const commission = await this.createCommission(
        affiliate.id,
        referralId,
        "first_sale",
        commissionAmount,
        tierConfig.commissionRate,
        purchaseAmount,
        `${tierConfig.commissionRate}% commission on $${purchaseAmount.toFixed(2)} sale`
      );

      // Update affiliate stats
      await this.incrementAffiliateStats(affiliate.id, {
        totalConversions: 1,
        totalEarnings: commissionAmount,
        pendingEarnings: commissionAmount,
        currentMonthEarnings: commissionAmount,
        lifetimeValue: purchaseAmount,
      });

      // Check for tier upgrade
      await this.updateAffiliateTier(affiliate.id);

      return commission;
    } catch (error) {
      console.error("Error converting to paid:", error);
      return null;
    }
  }

  // Get referrals for affiliate
  static async getReferrals(
    affiliateId: string,
    status?: ReferralStatus
  ): Promise<Referral[]> {
    try {
      const command = new QueryCommand({
        TableName: REFERRALS_TABLE,
        IndexName: "affiliateId-createdAt-index",
        KeyConditionExpression: "affiliateId = :affiliateId",
        ExpressionAttributeValues: {
          ":affiliateId": affiliateId,
          ...(status && { ":status": status }),
        },
        ...(status && {
          FilterExpression: "#status = :status",
          ExpressionAttributeNames: { "#status": "status" },
        }),
        ScanIndexForward: false,
      });
      const result = await docClient.send(command);
      return (result.Items as Referral[]) || [];
    } catch (error) {
      console.error("Error getting referrals:", error);
      return [];
    }
  }

  // ==================== COMMISSION OPERATIONS ====================

  // Create a commission
  static async createCommission(
    affiliateId: string,
    referralId: string,
    type: CommissionType,
    amount: number,
    percentage: number,
    baseAmount: number,
    description: string
  ): Promise<AffiliateCommission | null> {
    const commission: AffiliateCommission = {
      id: uuidv4(),
      affiliateId,
      referralId,
      type,
      amount,
      percentage,
      baseAmount,
      status: "pending",
      description,
      createdAt: new Date().toISOString(),
    };

    try {
      const command = new PutCommand({
        TableName: COMMISSIONS_TABLE,
        Item: commission,
      });
      await docClient.send(command);
      return commission;
    } catch (error) {
      console.error("Error creating commission:", error);
      return null;
    }
  }

  // Get commissions for affiliate
  static async getCommissions(affiliateId: string): Promise<AffiliateCommission[]> {
    try {
      const command = new QueryCommand({
        TableName: COMMISSIONS_TABLE,
        IndexName: "affiliateId-createdAt-index",
        KeyConditionExpression: "affiliateId = :affiliateId",
        ExpressionAttributeValues: { ":affiliateId": affiliateId },
        ScanIndexForward: false,
      });
      const result = await docClient.send(command);
      return (result.Items as AffiliateCommission[]) || [];
    } catch (error) {
      console.error("Error getting commissions:", error);
      return [];
    }
  }

  // ==================== PAYOUT OPERATIONS ====================

  // Request payout
  static async requestPayout(affiliateId: string): Promise<AffiliatePayout | null> {
    const affiliate = await this.getAffiliate(affiliateId);
    if (!affiliate || affiliate.stats.pendingEarnings < 50) {
      // $50 minimum payout
      return null;
    }

    // Get pending commissions
    const commissions = await this.getCommissions(affiliateId);
    const pendingCommissions = commissions.filter((c) => c.status === "approved");
    const totalAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);

    if (totalAmount < 50) return null;

    const payout: AffiliatePayout = {
      id: uuidv4(),
      affiliateId,
      amount: totalAmount,
      method: affiliate.payoutMethod,
      status: "pending",
      commissionIds: pendingCommissions.map((c) => c.id),
      createdAt: new Date().toISOString(),
    };

    try {
      const command = new PutCommand({
        TableName: PAYOUTS_TABLE,
        Item: payout,
      });
      await docClient.send(command);
      return payout;
    } catch (error) {
      console.error("Error requesting payout:", error);
      return null;
    }
  }

  // Get payouts for affiliate
  static async getPayouts(affiliateId: string): Promise<AffiliatePayout[]> {
    try {
      const command = new QueryCommand({
        TableName: PAYOUTS_TABLE,
        IndexName: "affiliateId-createdAt-index",
        KeyConditionExpression: "affiliateId = :affiliateId",
        ExpressionAttributeValues: { ":affiliateId": affiliateId },
        ScanIndexForward: false,
      });
      const result = await docClient.send(command);
      return (result.Items as AffiliatePayout[]) || [];
    } catch (error) {
      console.error("Error getting payouts:", error);
      return [];
    }
  }

  // ==================== APPLICATION OPERATIONS ====================

  // Submit affiliate application
  static async submitApplication(
    data: Omit<AffiliateApplication, "id" | "status" | "createdAt">
  ): Promise<AffiliateApplication | null> {
    const application: AffiliateApplication = {
      ...data,
      id: uuidv4(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const command = new PutCommand({
        TableName: APPLICATIONS_TABLE,
        Item: application,
      });
      await docClient.send(command);
      return application;
    } catch (error) {
      console.error("Error submitting application:", error);
      return null;
    }
  }

  // Get pending applications (admin)
  static async getPendingApplications(): Promise<AffiliateApplication[]> {
    try {
      const command = new ScanCommand({
        TableName: APPLICATIONS_TABLE,
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "pending" },
      });
      const result = await docClient.send(command);
      return (result.Items as AffiliateApplication[]) || [];
    } catch (error) {
      console.error("Error getting applications:", error);
      return [];
    }
  }

  // ==================== STATS OPERATIONS ====================

  // Increment affiliate stats
  static async incrementAffiliateStats(
    affiliateId: string,
    increments: Partial<AffiliateStats>
  ): Promise<boolean> {
    try {
      const updateParts: string[] = [];
      const expressionValues: Record<string, unknown> = {};

      Object.entries(increments).forEach(([key, value]) => {
        if (value !== undefined) {
          updateParts.push(`stats.${key} = stats.${key} + :${key}`);
          expressionValues[`:${key}`] = value;
        }
      });

      if (updateParts.length === 0) return true;

      // Also update conversion rate
      const affiliate = await this.getAffiliate(affiliateId);
      if (affiliate) {
        const newSignups = affiliate.stats.totalSignups + (increments.totalSignups || 0);
        const newConversions = affiliate.stats.totalConversions + (increments.totalConversions || 0);
        const conversionRate = newSignups > 0 ? (newConversions / newSignups) * 100 : 0;
        updateParts.push("stats.conversionRate = :conversionRate");
        expressionValues[":conversionRate"] = conversionRate;
      }

      expressionValues[":updatedAt"] = new Date().toISOString();
      updateParts.push("updatedAt = :updatedAt");

      const command = new UpdateCommand({
        TableName: AFFILIATES_TABLE,
        Key: { id: affiliateId },
        UpdateExpression: `SET ${updateParts.join(", ")}`,
        ExpressionAttributeValues: expressionValues,
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error("Error incrementing stats:", error);
      return false;
    }
  }

  // Get leaderboard
  static async getLeaderboard(
    period: "weekly" | "monthly" | "all_time" = "monthly"
  ): Promise<AffiliateLeaderboard> {
    try {
      const command = new ScanCommand({
        TableName: AFFILIATES_TABLE,
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "active" },
      });
      const result = await docClient.send(command);
      const affiliates = (result.Items as Affiliate[]) || [];

      // Sort by earnings and create leaderboard
      const sorted = affiliates
        .sort((a, b) => {
          const earningsA = period === "all_time" ? a.stats.totalEarnings : a.stats.currentMonthEarnings;
          const earningsB = period === "all_time" ? b.stats.totalEarnings : b.stats.currentMonthEarnings;
          return earningsB - earningsA;
        })
        .slice(0, 100);

      const entries: LeaderboardEntry[] = sorted.map((affiliate, index) => ({
        rank: index + 1,
        affiliateId: affiliate.id,
        affiliateName: affiliate.code, // Using code as display name for privacy
        tier: affiliate.tier,
        referrals: affiliate.stats.totalConversions,
        earnings: period === "all_time" ? affiliate.stats.totalEarnings : affiliate.stats.currentMonthEarnings,
        badge: index < 3 ? ["gold", "silver", "bronze"][index] : undefined,
      }));

      return {
        period,
        entries,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return { period, entries: [], lastUpdated: new Date().toISOString() };
    }
  }

  // ==================== LINK GENERATION ====================

  // Generate affiliate link
  static generateAffiliateLink(
    affiliateCode: string,
    campaign?: string,
    source?: string
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com";
    const url = new URL(baseUrl);
    url.searchParams.set("ref", affiliateCode);
    if (campaign) url.searchParams.set("utm_campaign", campaign);
    if (source) url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", "affiliate");
    return url.toString();
  }
}
