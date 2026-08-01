import promotions from "@/data/promotions.json";

type RebatesMap = {
  [model: string]: {
    [variant: string]: number;
  };
};

type CspOverridesMap = {
  [model: string]: number;
};

type CspReplacementsMap = {
  [model: string]: string;
};

const rebates = promotions.rebates as unknown as RebatesMap;
const cspOverrides = promotions.cspRebate.overrides as unknown as CspOverridesMap;
const cspReplacements = promotions.cspReplacements as unknown as CspReplacementsMap | undefined;

export function getRebate(model: string, variantName: string): number | null {
  const modelRebates = rebates[model];
  if (modelRebates) {
    const rebate = modelRebates[variantName];
    if (rebate !== undefined) return rebate;
  }
  return null;
}

export function getCspRebate(model: string): number {
  return cspOverrides[model] ?? promotions.cspRebate.default;
}

export function getCspReplacement(model: string): string | null {
  if (!cspReplacements) return null;
  return cspReplacements[model] ?? null;
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

export type PromotionOption = {
  title: string;
  rebate: number;
  default: boolean;
  free_gift?: string;
  description?: string;
};

type PromotionOptionsMap = {
  [model: string]: {
    [variant: string]: PromotionOption[];
  };
};

const promotionOptions = promotions.promotionOptions as unknown as PromotionOptionsMap | undefined;

export function getPromotionOptions(model: string, variantName: string): PromotionOption[] | null {
  if (!promotionOptions) return null;
  const modelOptions = promotionOptions[model];
  if (modelOptions) {
    const options = modelOptions[variantName];
    if (options && options.length > 0) return options;
  }
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
