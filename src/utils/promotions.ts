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
