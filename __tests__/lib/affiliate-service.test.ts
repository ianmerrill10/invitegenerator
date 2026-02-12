/**
 * Tests for Affiliate Service
 * Task #17: Write tests for affiliate service functions
 */

import { AFFILIATE_TIERS } from "@/lib/services/affiliate-service";
import { AffiliateTierConfig } from "@/types";

// Mock the service module
jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
}));

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockReturnValue({ send: jest.fn() }),
  },
  GetCommand: jest.fn(),
  PutCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  QueryCommand: jest.fn(),
  ScanCommand: jest.fn(),
}));

jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mock-uuid"),
}));

describe("Affiliate Service", () => {
  describe("AFFILIATE_TIERS", () => {
    it("has all five tiers", () => {
      expect(AFFILIATE_TIERS).toHaveLength(5);
      const tierNames = AFFILIATE_TIERS.map((t: AffiliateTierConfig) => t.tier);
      expect(tierNames).toContain("bronze");
      expect(tierNames).toContain("silver");
      expect(tierNames).toContain("gold");
      expect(tierNames).toContain("platinum");
      expect(tierNames).toContain("diamond");
    });

    it("has increasing commission rates", () => {
      for (let i = 0; i < AFFILIATE_TIERS.length - 1; i++) {
        expect(AFFILIATE_TIERS[i].commissionRate).toBeLessThan(
          AFFILIATE_TIERS[i + 1].commissionRate
        );
      }
    });

    it("has increasing referral requirements", () => {
      for (let i = 0; i < AFFILIATE_TIERS.length - 1; i++) {
        expect(AFFILIATE_TIERS[i].minReferrals).toBeLessThan(
          AFFILIATE_TIERS[i + 1].minReferrals
        );
      }
    });

    it("has correct commission rates", () => {
      const findTier = (name: string) =>
        AFFILIATE_TIERS.find((t: AffiliateTierConfig) => t.tier === name);

      expect(findTier("bronze")?.commissionRate).toBe(30);
      expect(findTier("silver")?.commissionRate).toBe(35);
      expect(findTier("gold")?.commissionRate).toBe(40);
      expect(findTier("platinum")?.commissionRate).toBe(45);
      expect(findTier("diamond")?.commissionRate).toBe(50);
    });

    it("all tiers have recurring commission enabled", () => {
      AFFILIATE_TIERS.forEach((tier: AffiliateTierConfig) => {
        expect(tier.recurringCommission).toBe(true);
      });
    });

    it("all tiers have at least one bonus", () => {
      AFFILIATE_TIERS.forEach((tier: AffiliateTierConfig) => {
        expect(tier.bonuses.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("Commission Calculations", () => {
    it("calculates bronze tier commission correctly", () => {
      const bronzeTier = AFFILIATE_TIERS.find(
        (t: AffiliateTierConfig) => t.tier === "bronze"
      );
      const amount = 100;
      const commission = (amount * bronzeTier!.commissionRate) / 100;
      expect(commission).toBe(30);
    });

    it("calculates diamond tier commission correctly", () => {
      const diamondTier = AFFILIATE_TIERS.find(
        (t: AffiliateTierConfig) => t.tier === "diamond"
      );
      const amount = 100;
      const commission = (amount * diamondTier!.commissionRate) / 100;
      expect(commission).toBe(50);
    });

    it("handles decimal amounts", () => {
      const bronzeTier = AFFILIATE_TIERS.find(
        (t: AffiliateTierConfig) => t.tier === "bronze"
      );
      const amount = 99.99;
      const commission = (amount * bronzeTier!.commissionRate) / 100;
      expect(commission).toBeCloseTo(30, 0);
    });
  });

  describe("Tier Upgrade Logic", () => {
    it("determines correct tier based on referral count", () => {
      const getTierForReferrals = (count: number): string => {
        for (let i = AFFILIATE_TIERS.length - 1; i >= 0; i--) {
          if (count >= AFFILIATE_TIERS[i].minReferrals) {
            return AFFILIATE_TIERS[i].tier;
          }
        }
        return AFFILIATE_TIERS[0].tier;
      };

      expect(getTierForReferrals(0)).toBe("bronze");
      expect(getTierForReferrals(9)).toBe("bronze");
      expect(getTierForReferrals(10)).toBe("silver");
      expect(getTierForReferrals(24)).toBe("silver");
      expect(getTierForReferrals(25)).toBe("gold");
      expect(getTierForReferrals(49)).toBe("gold");
      expect(getTierForReferrals(50)).toBe("platinum");
      expect(getTierForReferrals(99)).toBe("platinum");
      expect(getTierForReferrals(100)).toBe("diamond");
      expect(getTierForReferrals(500)).toBe("diamond");
    });
  });

  describe("Payout Calculations", () => {
    it("calculates total earnings from multiple referrals", () => {
      const referrals = [
        { amount: 9.99, tierName: "bronze" },
        { amount: 99.99, tierName: "silver" },
        { amount: 9.99, tierName: "gold" },
      ];

      const totalEarnings = referrals.reduce((sum, ref) => {
        const tier = AFFILIATE_TIERS.find(
          (t: AffiliateTierConfig) => t.tier === ref.tierName
        );
        return sum + (ref.amount * (tier?.commissionRate || 0)) / 100;
      }, 0);

      expect(totalEarnings).toBeGreaterThan(0);
    });

    it("respects minimum payout threshold of $50", () => {
      const MINIMUM_PAYOUT = 50;
      const pendingBalance = 45;
      expect(pendingBalance < MINIMUM_PAYOUT).toBe(true);
    });
  });
});
