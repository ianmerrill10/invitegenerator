/**
 * Tests for Prodigi Print-on-Demand Service
 * Task #11: Write unit tests for prodigi-service.ts
 */

import {
  getSKUForSize,
  getPricePerUnit,
  calculateRetailPrice,
  estimateShipping,
  PRODIGI_PRODUCTS,
  PRINT_PRICING,
  SHIPPING_ESTIMATES,
} from "@/lib/services/prodigi-service";

describe("Prodigi Service", () => {
  describe("getSKUForSize", () => {
    it("returns correct SKU for flat 4x6", () => {
      expect(getSKUForSize("4x6", "flat")).toBe(PRODIGI_PRODUCTS.FLAT_CARD_4X6);
    });

    it("returns correct SKU for flat 5x7", () => {
      expect(getSKUForSize("5x7", "flat")).toBe(PRODIGI_PRODUCTS.FLAT_CARD_5X7);
    });

    it("returns correct SKU for folded 5x7", () => {
      expect(getSKUForSize("5x7", "folded")).toBe(PRODIGI_PRODUCTS.FOLDED_CARD_5X7);
    });

    it("returns correct SKU for premium 5x7", () => {
      expect(getSKUForSize("5x7", "premium")).toBe(PRODIGI_PRODUCTS.PREMIUM_CARD_5X7);
    });

    it("returns correct SKU for postcard 4x6", () => {
      expect(getSKUForSize("4x6", "postcard")).toBe(PRODIGI_PRODUCTS.POSTCARD_4X6);
    });

    it("returns default SKU for unknown size", () => {
      expect(getSKUForSize("unknown", "flat")).toBe(PRODIGI_PRODUCTS.FLAT_CARD_5X7);
    });

    it("handles case insensitive sizes", () => {
      expect(getSKUForSize("A6", "flat")).toBe(PRODIGI_PRODUCTS.FLAT_CARD_A6);
      expect(getSKUForSize("a6", "flat")).toBe(PRODIGI_PRODUCTS.FLAT_CARD_A6);
    });
  });

  describe("getPricePerUnit", () => {
    it("returns base price for quantity under 25", () => {
      expect(getPricePerUnit("flat-5x7", 10)).toBe(PRINT_PRICING["flat-5x7"].base);
      expect(getPricePerUnit("flat-5x7", 24)).toBe(PRINT_PRICING["flat-5x7"].base);
    });

    it("returns bulk25 price for quantity 25-49", () => {
      expect(getPricePerUnit("flat-5x7", 25)).toBe(PRINT_PRICING["flat-5x7"].bulk25);
      expect(getPricePerUnit("flat-5x7", 49)).toBe(PRINT_PRICING["flat-5x7"].bulk25);
    });

    it("returns bulk50 price for quantity 50-99", () => {
      expect(getPricePerUnit("flat-5x7", 50)).toBe(PRINT_PRICING["flat-5x7"].bulk50);
      expect(getPricePerUnit("flat-5x7", 99)).toBe(PRINT_PRICING["flat-5x7"].bulk50);
    });

    it("returns bulk100 price for quantity 100+", () => {
      expect(getPricePerUnit("flat-5x7", 100)).toBe(PRINT_PRICING["flat-5x7"].bulk100);
      expect(getPricePerUnit("flat-5x7", 500)).toBe(PRINT_PRICING["flat-5x7"].bulk100);
    });

    it("returns default price for unknown product", () => {
      expect(getPricePerUnit("unknown" as any, 10)).toBe(2.99);
    });
  });

  describe("calculateRetailPrice", () => {
    it("calculates 40% margin correctly", () => {
      // wholesale / (1 - 0.40) = retail
      // 6 / 0.6 = 10
      expect(calculateRetailPrice(6, 40)).toBe(10);
    });

    it("calculates 30% margin correctly", () => {
      // 7 / 0.7 = 10
      expect(calculateRetailPrice(7, 30)).toBe(10);
    });

    it("rounds up to nearest cent", () => {
      // 5 / 0.6 = 8.333... → 8.34
      expect(calculateRetailPrice(5, 40)).toBe(8.34);
    });

    it("uses default 40% margin", () => {
      expect(calculateRetailPrice(6)).toBe(10);
    });
  });

  describe("estimateShipping", () => {
    it("returns US shipping rates", () => {
      expect(estimateShipping("US", "standard")).toBe(SHIPPING_ESTIMATES.US.standard);
      expect(estimateShipping("US", "express")).toBe(SHIPPING_ESTIMATES.US.express);
      expect(estimateShipping("US", "overnight")).toBe(SHIPPING_ESTIMATES.US.overnight);
    });

    it("returns UK shipping rates", () => {
      expect(estimateShipping("GB", "standard")).toBe(SHIPPING_ESTIMATES.UK.standard);
      expect(estimateShipping("GB", "express")).toBe(SHIPPING_ESTIMATES.UK.express);
    });

    it("returns EU shipping rates for EU countries", () => {
      const euCountries = ["DE", "FR", "IT", "ES", "NL", "BE", "AT", "PL"];
      euCountries.forEach((country) => {
        expect(estimateShipping(country, "standard")).toBe(SHIPPING_ESTIMATES.EU.standard);
      });
    });

    it("returns CA shipping rates", () => {
      expect(estimateShipping("CA", "standard")).toBe(SHIPPING_ESTIMATES.CA.standard);
    });

    it("returns AU shipping rates", () => {
      expect(estimateShipping("AU", "standard")).toBe(SHIPPING_ESTIMATES.AU.standard);
    });

    it("returns international rates for other countries", () => {
      expect(estimateShipping("JP", "standard")).toBe(SHIPPING_ESTIMATES.INTL.standard);
      expect(estimateShipping("BR", "standard")).toBe(SHIPPING_ESTIMATES.INTL.standard);
    });

    it("defaults to standard shipping for unknown method", () => {
      expect(estimateShipping("US", "unknown" as any)).toBe(SHIPPING_ESTIMATES.US.standard);
    });
  });

  describe("PRODIGI_PRODUCTS", () => {
    it("has all expected product SKUs", () => {
      expect(PRODIGI_PRODUCTS.FLAT_CARD_4X6).toBeDefined();
      expect(PRODIGI_PRODUCTS.FLAT_CARD_5X7).toBeDefined();
      expect(PRODIGI_PRODUCTS.FLAT_CARD_A6).toBeDefined();
      expect(PRODIGI_PRODUCTS.FLAT_CARD_A5).toBeDefined();
      expect(PRODIGI_PRODUCTS.FOLDED_CARD_5X7).toBeDefined();
      expect(PRODIGI_PRODUCTS.FOLDED_CARD_A6).toBeDefined();
      expect(PRODIGI_PRODUCTS.POSTCARD_4X6).toBeDefined();
      expect(PRODIGI_PRODUCTS.POSTCARD_A6).toBeDefined();
      expect(PRODIGI_PRODUCTS.PREMIUM_CARD_4X6).toBeDefined();
      expect(PRODIGI_PRODUCTS.PREMIUM_CARD_5X7).toBeDefined();
    });
  });

  describe("PRINT_PRICING", () => {
    it("has bulk discounts that decrease with quantity", () => {
      Object.values(PRINT_PRICING).forEach((pricing) => {
        expect(pricing.base).toBeGreaterThan(pricing.bulk25);
        expect(pricing.bulk25).toBeGreaterThan(pricing.bulk50);
        expect(pricing.bulk50).toBeGreaterThan(pricing.bulk100);
      });
    });
  });
});
