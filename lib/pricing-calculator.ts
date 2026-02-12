// =============================================================================
// PACKAGE PRICING CALCULATOR SERVICE
// InviteGenerator.com
// =============================================================================

import {
  InvitationPackage,
  PackageItem,
  PriceBreakdown,
  ShippingEstimate,
  PaperType,
  PriceCalculationRequest,
  PriceCalculationResponse,
  SelectedItemDetail
} from '@/types/packages';

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

const PAPER_UPGRADE_COSTS: Record<PaperType, number> = {
  [PaperType.STANDARD]: 0,
  [PaperType.PREMIUM]: 0.05,      // Per invitation
  [PaperType.CARDSTOCK]: 0.08,
  [PaperType.LINEN]: 0.12,
  [PaperType.COTTON]: 0.15
};

const SHIPPING_RATES = {
  standard: {
    base: 5.99,
    perItem: 0.50,
    maxItems: 20,
    estimatedDays: 7
  },
  express: {
    base: 12.99,
    perItem: 0.75,
    maxItems: 20,
    estimatedDays: 3
  },
  priority: {
    base: 19.99,
    perItem: 1.00,
    maxItems: 20,
    estimatedDays: 1
  }
};

const TAX_RATE = 0.0825; // Default tax rate (will vary by state)

const AMAZON_COMMISSION_RATES: Record<string, number> = {
  'home_kitchen': 0.03,
  'toys_games': 0.03,
  'office_products': 0.04,
  'arts_crafts': 0.05,
  'handmade': 0.05,
  'default': 0.04
};

// -----------------------------------------------------------------------------
// MAIN PRICING CALCULATOR CLASS
// -----------------------------------------------------------------------------

export class PackagePricingCalculator {
  private package: InvitationPackage;
  private selectedItemIds: Set<string>;
  private invitationQuantity: number;
  private paperUpgrade: PaperType;

  constructor(
    packageData: InvitationPackage,
    selectedItemIds: string[],
    invitationQuantity?: number,
    paperUpgrade?: PaperType
  ) {
    this.package = packageData;
    this.selectedItemIds = new Set(selectedItemIds);
    this.invitationQuantity = invitationQuantity ?? packageData.invitationConfig.quantity;
    this.paperUpgrade = paperUpgrade ?? packageData.invitationConfig.paperType;
  }

  // ---------------------------------------------------------------------------
  // MAIN CALCULATION METHOD
  // ---------------------------------------------------------------------------

  public calculate(): PriceBreakdown {
    const invitationsCost = this.calculateInvitationsCost();
    const selectedItemsTotal = this.calculateSelectedItemsTotal();
    const curationFee = this.calculateProportionalCurationFee();
    const paperUpgradeCost = this.calculatePaperUpgradeCost();
    const additionalQuantityCost = this.calculateAdditionalQuantityCost();

    const subtotal =
      invitationsCost +
      selectedItemsTotal +
      curationFee +
      paperUpgradeCost +
      additionalQuantityCost;

    const estimatedShipping = this.calculateShipping('standard');
    const tax = this.calculateTax(subtotal);
    const total = subtotal + estimatedShipping + tax;

    const { savings, savingsPercentage } = this.calculateSavings(subtotal);
    const affiliateValue = this.calculateAffiliateValue();

    return {
      invitationsCost: this.round(invitationsCost),
      selectedItemsTotal: this.round(selectedItemsTotal),
      curationFee: this.round(curationFee),
      paperUpgradeCost: this.round(paperUpgradeCost),
      additionalQuantityCost: this.round(additionalQuantityCost),
      subtotal: this.round(subtotal),
      estimatedShipping: this.round(estimatedShipping),
      tax: this.round(tax),
      total: this.round(total),
      savings: this.round(savings),
      savingsPercentage: this.round(savingsPercentage),
      affiliateValue: this.round(affiliateValue)
    };
  }

  // ---------------------------------------------------------------------------
  // INDIVIDUAL CALCULATION METHODS
  // ---------------------------------------------------------------------------

  /**
   * Calculate base invitation cost
   */
  private calculateInvitationsCost(): number {
    return this.invitationQuantity * this.package.invitationConfig.costPerUnit;
  }

  /**
   * Calculate total for selected items only
   */
  private calculateSelectedItemsTotal(): number {
    return this.getSelectedItems().reduce(
      (sum, item) => sum + item.basePrice,
      0
    );
  }

  /**
   * Calculate proportional curation fee based on selected items
   * If user deselects items, they pay less curation fee
   */
  private calculateProportionalCurationFee(): number {
    const allItems = this.package.items;
    const selectedItems = this.getSelectedItems();

    if (allItems.length === 0) return 0;

    // Calculate total weight of all items
    const totalWeight = allItems.reduce((sum, item) => sum + item.weight, 0);

    // Calculate weight of selected items
    const selectedWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);

    // Proportional curation fee
    const ratio = totalWeight > 0 ? selectedWeight / totalWeight : 0;
    return this.package.curationFee * ratio;
  }

  /**
   * Calculate cost of paper upgrade
   */
  private calculatePaperUpgradeCost(): number {
    const basePaperType = this.package.invitationConfig.paperType;
    const baseCost = PAPER_UPGRADE_COSTS[basePaperType];
    const upgradeCost = PAPER_UPGRADE_COSTS[this.paperUpgrade];

    const costDifference = upgradeCost - baseCost;
    return Math.max(0, costDifference * this.invitationQuantity);
  }

  /**
   * Calculate cost for additional invitations beyond base quantity
   */
  private calculateAdditionalQuantityCost(): number {
    const baseQuantity = this.package.invitationConfig.quantity;
    const additionalQuantity = Math.max(0, this.invitationQuantity - baseQuantity);

    // Additional invitations cost slightly more (no bulk discount)
    const additionalCostPerUnit = this.package.invitationConfig.costPerUnit * 1.1;
    return additionalQuantity * additionalCostPerUnit;
  }

  /**
   * Calculate shipping cost
   */
  private calculateShipping(method: 'standard' | 'express' | 'priority'): number {
    const rates = SHIPPING_RATES[method];
    const itemCount = this.getSelectedItems().length;

    // Base shipping + per-item cost
    let shippingCost = rates.base + (Math.min(itemCount, rates.maxItems) * rates.perItem);

    // Add for large invitation quantities
    if (this.invitationQuantity > 50) {
      shippingCost += 2.00;
    }
    if (this.invitationQuantity > 100) {
      shippingCost += 3.00;
    }

    return shippingCost;
  }

  /**
   * Calculate tax
   */
  private calculateTax(subtotal: number): number {
    // Note: In production, use actual tax calculation service
    return subtotal * TAX_RATE;
  }

  /**
   * Calculate savings compared to buying items separately
   */
  private calculateSavings(currentSubtotal: number): { savings: number; savingsPercentage: number } {
    // Calculate what it would cost to buy everything separately
    const separateInvitationsCost = this.invitationQuantity * (this.package.invitationConfig.costPerUnit * 1.2); // 20% markup
    const separateItemsCost = this.getSelectedItems().reduce(
      (sum, item) => sum + (item.basePrice * 1.15), // 15% markup for individual purchase
      0
    );

    const separateTotal = separateInvitationsCost + separateItemsCost;
    const savings = Math.max(0, separateTotal - currentSubtotal);
    const savingsPercentage = separateTotal > 0 ? (savings / separateTotal) * 100 : 0;

    return { savings, savingsPercentage };
  }

  /**
   * Calculate estimated affiliate earnings (internal tracking)
   */
  private calculateAffiliateValue(): number {
    return this.getSelectedItems().reduce((sum, item) => {
      const commissionRate = AMAZON_COMMISSION_RATES[item.amazonCategory] || AMAZON_COMMISSION_RATES.default;
      return sum + (item.basePrice * commissionRate);
    }, 0);
  }

  // ---------------------------------------------------------------------------
  // HELPER METHODS
  // ---------------------------------------------------------------------------

  /**
   * Get all selected items
   */
  private getSelectedItems(): PackageItem[] {
    return this.package.items.filter(item =>
      this.selectedItemIds.has(item.id) || item.isRequired
    );
  }

  /**
   * Round to 2 decimal places
   */
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  // ---------------------------------------------------------------------------
  // PUBLIC UTILITY METHODS
  // ---------------------------------------------------------------------------

  /**
   * Get all shipping options with calculated costs
   */
  public getShippingOptions(): ShippingEstimate[] {
    return [
      {
        method: 'standard',
        carrier: 'USPS',
        estimatedDays: SHIPPING_RATES.standard.estimatedDays,
        cost: this.round(this.calculateShipping('standard')),
        trackingAvailable: true
      },
      {
        method: 'express',
        carrier: 'UPS',
        estimatedDays: SHIPPING_RATES.express.estimatedDays,
        cost: this.round(this.calculateShipping('express')),
        trackingAvailable: true
      },
      {
        method: 'priority',
        carrier: 'FedEx',
        estimatedDays: SHIPPING_RATES.priority.estimatedDays,
        cost: this.round(this.calculateShipping('priority')),
        trackingAvailable: true
      }
    ];
  }

  /**
   * Get detailed breakdown of each item's price impact
   */
  public getItemDetails(): SelectedItemDetail[] {
    const totalWeight = this.package.items.reduce((sum, item) => sum + item.weight, 0);

    return this.package.items.map(item => {
      const isIncluded = this.selectedItemIds.has(item.id) || item.isRequired;
      const curationFeeImpact = totalWeight > 0
        ? (item.weight / totalWeight) * this.package.curationFee
        : 0;

      return {
        item,
        isIncluded,
        priceImpact: isIncluded ? item.basePrice : 0,
        curationFeeImpact: isIncluded ? this.round(curationFeeImpact) : 0
      };
    });
  }

  /**
   * Calculate price if specific item is toggled
   */
  public calculateWithItemToggled(itemId: string): PriceBreakdown {
    const newSelectedIds = new Set(this.selectedItemIds);

    if (newSelectedIds.has(itemId)) {
      newSelectedIds.delete(itemId);
    } else {
      newSelectedIds.add(itemId);
    }

    const calculator = new PackagePricingCalculator(
      this.package,
      Array.from(newSelectedIds),
      this.invitationQuantity,
      this.paperUpgrade
    );

    return calculator.calculate();
  }

  /**
   * Get minimum price (only required items)
   */
  public getMinimumPrice(): PriceBreakdown {
    const requiredItemIds = this.package.items
      .filter(item => item.isRequired)
      .map(item => item.id);

    const calculator = new PackagePricingCalculator(
      this.package,
      requiredItemIds,
      this.package.invitationConfig.quantity,
      this.package.invitationConfig.paperType
    );

    return calculator.calculate();
  }

  /**
   * Get maximum price (all items selected)
   */
  public getMaximumPrice(): PriceBreakdown {
    const allItemIds = this.package.items.map(item => item.id);

    const calculator = new PackagePricingCalculator(
      this.package,
      allItemIds,
      this.invitationQuantity,
      this.paperUpgrade
    );

    return calculator.calculate();
  }
}

// -----------------------------------------------------------------------------
// STANDALONE FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Quick price calculation without instantiating class
 */
export function calculatePackagePrice(
  packageData: InvitationPackage,
  selectedItemIds: string[],
  invitationQuantity?: number,
  paperUpgrade?: PaperType
): PriceBreakdown {
  const calculator = new PackagePricingCalculator(
    packageData,
    selectedItemIds,
    invitationQuantity,
    paperUpgrade
  );
  return calculator.calculate();
}

/**
 * Full price calculation response for API
 */
export function calculateFullPriceResponse(
  request: PriceCalculationRequest,
  packageData: InvitationPackage
): PriceCalculationResponse {
  const calculator = new PackagePricingCalculator(
    packageData,
    request.selectedItemIds,
    request.invitationQuantity,
    request.paperUpgrade
  );

  return {
    breakdown: calculator.calculate(),
    shippingOptions: calculator.getShippingOptions(),
    itemDetails: calculator.getItemDetails()
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Calculate savings display text
 */
export function getSavingsDisplay(breakdown: PriceBreakdown): string {
  if (breakdown.savings <= 0) return '';
  return `Save ${formatPrice(breakdown.savings)} (${breakdown.savingsPercentage.toFixed(0)}% off)`;
}
