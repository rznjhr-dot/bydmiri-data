export interface CompetitorVariant {
  name: string;
  battery: number;
  range: number;
  rangeNedc?: number;
  motorPower: number;
  torque?: number;
  otr: number;
  otrEM?: number;
  otrAfterRebate?: number;
  rebate?: number;
  rebateNote?: string;
  acCharging: string;
  dcCharging: string;
  v2l?: string;
  warranty: string;
  drive?: string;
  zeroToHundred?: string;
  topSpeed?: number;
  notes?: string;
}

export interface CompetitorModel {
  model: string;
  type: "BEV" | "PHEV" | "EREV";
  variants: CompetitorVariant[];
  segment: string;
}

export interface CompetitorBrand {
  id: string;
  name: string;
  country: string;
  website: string;
  logo: string;
  emNote?: string;
  emMarkup?: number;
  models: CompetitorModel[];
}

export interface CompetitorsData {
  lastUpdated: string;
  brands: CompetitorBrand[];
}

export type NewsCategory = "price" | "rebate" | "launch" | "tech" | "policy" | "market" | "comparison";

export interface EVNewsItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  category: NewsCategory;
  brand?: string;
  source?: string;
  url?: string;
  highlighted?: boolean;
}

export interface EVNewsData {
  lastUpdated: string;
  items: EVNewsItem[];
}

export interface MarketStat {
  label: string;
  value: string;
  subtitle?: string;
}

export interface MarketStatsData {
  totalEVModels: number;
  totalBrands: number;
  priceRange: string;
  lastUpdated: string;
  stats: MarketStat[];
}
