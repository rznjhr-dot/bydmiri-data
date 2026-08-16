import { promotions, type PromotionOption } from "@/data";

export type { PromotionOption };

export function getRebate(model: string, variantName: string): number | null {
  const modelRebates = promotions.rebates[model];
  if (modelRebates) {
    const rebate = modelRebates[variantName];
    if (rebate !== undefined) return rebate;
  }
  return null;
}

export function getCspRebate(model: string): number {
  return promotions.cspRebate.overrides[model] ?? promotions.cspRebate.default;
}

export function getCspReplacement(model: string): string | null {
  if (!promotions.cspReplacements) return null;
  return promotions.cspReplacements[model] ?? null;
}

export function getInterestRate(): number {
  return promotions.interestRate;
}

export function getFreebies(): string[] {
  return promotions.freebies;
}

export function getPromotionPeriod(): string {
  return promotions.period;
}

export function getPromotionOptions(model: string, variantName: string): PromotionOption[] | null {
  const options = promotions.promotionOptions?.[model]?.[variantName];
  if (options && options.length > 0) return options;
  return null;
}

export function getDefaultPromotion(model: string, variantName: string): PromotionOption | null {
  const options = getPromotionOptions(model, variantName);
  if (!options) return null;
  const defaultOption = options.find((o) => o.default);
  if (defaultOption) return defaultOption;
  // No default specified — auto-select the option with the highest cash rebate
  return [...options].sort((a, b) => b.rebate - a.rebate)[0] ?? null;
}
