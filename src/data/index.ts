/* ─── Typed data loaders with light runtime shape validation ───
 *
 * Single import surface for all JSON data. Importing raw JSON and
 * casting with `as` everywhere hid data-shape errors until render
 * time. These loaders assert the expected top-level shape once at
 * module load, so a malformed or restructured JSON file fails loudly
 * (in dev console / build prerender) instead of silently rendering
 * undefined.
 */
import vehiclesJson from "./vehicles.json";
import promotionsJson from "./promotions.json";
import financeJson from "./finance.json";
import companyJson from "./company.json";
import chargingJson from "./charging.json";
import warrantyJson from "./warranty.json";
import salesRulesJson from "./sales_rules.json";
import changelogJson from "./changelog.json";
import competitorsJson from "./competitors.json";
import evNewsJson from "./ev-news.json";
import rjeosJson from "./rjeos.json";
import rebatesJson from "./rebates.json";
import pricingJson from "./pricing.json";
import contentRulesJson from "./content_rules.json";
import websiteRulesJson from "./website_rules.json";
import marketingEventsJson from "./marketing/events.json";
import marketingSchedulesJson from "./marketing/schedules.json";
import marketingCampaignsJson from "./marketing/campaigns.json";
import marketingTimelineJson from "./marketing/timeline.json";
import marketingPromptsJson from "./marketing/prompts.json";
import marketingPsychologyJson from "./marketing/psychology.json";
import marketingBrandingJson from "./marketing/branding.json";
import marketingScoringJson from "./marketing/scoring.json";
import psTemplatesJson from "./prompt-studio/templates.json";
import psBlocksJson from "./prompt-studio/blocks.json";
import psRulesJson from "./prompt-studio/rules.json";
import psLibraryJson from "./prompt-studio/library.json";

import type {
  EventsData,
  SchedulesData,
  CampaignsData,
  TimelineData,
  PromptsData,
  PsychologyData,
  BrandingData,
  ScoringData,
} from "@/types/marketing";
import type {
  GeneratorTemplate,
  BlocksData,
  RulesData,
  LibraryData,
} from "@/types/prompt-studio";
import type {
  CompetitorsData,
  EVNewsData,
  CompetitorBrand,
} from "@/types/ev-market";
import type { RJEOSData } from "@/types/rjeos";

export interface VehicleVariant {
  name: string;
  otr: number;
  otrWithoutInsurance: number;
  rrp?: number;
  roadTax?: number;
  sumInsured?: number;
  rebate: number;
  bookingFee?: number;
  registrationFee?: number;
  b2InspectionFee?: number;
  evPlateFee?: number;
  range: number;
  rangeNedc?: number;
  battery: number | null;
  chargeCost?: number;
  motorPower?: number;
  torque?: number;
  zeroToHundred?: string;
  drive?: string;
  acCharging?: string;
  maxChargePower?: string;
}

export interface VehicleModel {
  model: string;
  segment?: string;
  variants: VehicleVariant[];
}

export interface PromotionOption {
  title: string;
  rebate: number;
  default: boolean;
  free_gift?: string;
  description?: string;
}

export interface PromotionsData {
  campaign: string;
  status: string;
  period: string;
  validFrom: string;
  validTo: string;
  lastUpdated: string;
  promotionOptions?: Record<string, Record<string, PromotionOption[]>>;
  rebates: Record<string, Record<string, number>>;
  cspRebate: {
    default: number;
    overrides: Record<string, number>;
    label: string;
  };
  cspReplacements?: Record<string, string>;
  freebies: string[];
  interestRate: number;
  notes: string;
  variantPromotions?: Record<string, Record<string, string[]>>;
}

export interface FinanceData {
  interestRate: number;
  interestRateUnit: string;
  loanMargin: number;
  loanMarginUnit: string;
  defaultTenure: number;
  defaultTenureUnit: string;
  availableTenures: number[];
  tenureUnit: string;
  additionalRebate: {
    default: number;
    overrides: Record<string, number>;
    label: string;
  };
  disclaimer: string;
}

export interface CompanyData {
  name: string;
  version: string;
  databaseVersion: string;
  campaignVersion: string;
  company: string;
  branch: string;
  salesConsultant: string;
  phone: string;
  address: string;
  mapsUrl: string;
  status: string;
  lastUpdated: string;
  rebatePeriod: string;
  pricingSource: string;
  specificationSource: string;
  promotionSource: string;
}

export interface ChargingProfile {
  id: string;
  name: string;
  rate: number;
  unit: string;
  type: "ac" | "dc";
  estimated: boolean;
  description: string;
}

export interface ChargingStation {
  location: string;
  power: string;
  provider: string;
}

export interface ChargingCity {
  city: string;
  stations: ChargingStation[];
}

export interface ChargingData {
  lastUpdated: string;
  disclaimer: string;
  chargingProfiles: ChargingProfile[];
  cities: ChargingCity[];
}

export interface WarrantyCategory {
  title: string;
  years: string;
  mileage: string;
  items: string[];
}

export interface WarrantyData {
  categories: WarrantyCategory[];
  disclaimer: string;
}

export interface SalesRulesData {
  doNotSell: string[];
  sell: string[];
  ridzuanRule: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface RebatesMeta {
  description: string;
  currency: string;
  disclaimer: string;
}

export interface ContentRulesData {
  [key: string]: unknown;
}

function assertShape<T>(label: string, data: unknown, check: (v: unknown) => boolean): T {
  if (!check(data)) {
    throw new Error(
      `[data] ${label} failed shape validation — check the JSON file. Got: ${JSON.stringify(data).slice(0, 120)}`
    );
  }
  return data as unknown as T;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isRecordArray = (v: unknown): v is Record<string, unknown>[] =>
  Array.isArray(v) && v.every(isRecord);

/* ─── Vehicles ─── */
export const vehicles = assertShape<VehicleModel[]>(
  "vehicles.json",
  vehiclesJson,
  (v) =>
    Array.isArray(v) &&
    v.every(
      (m) =>
        isRecord(m) &&
        typeof m.model === "string" &&
        Array.isArray(m.variants) &&
        m.variants.every(
          (va) =>
            isRecord(va) &&
            typeof va.name === "string" &&
            typeof va.otr === "number" &&
            typeof va.rebate === "number"
        )
    )
);

/* ─── Promotions ─── */
export const promotions = assertShape<PromotionsData>(
  "promotions.json",
  promotionsJson,
  (v) => isRecord(v) && isRecord((v as unknown as PromotionsData).rebates) && isRecord((v as unknown as PromotionsData).cspRebate)
);

/* ─── Finance ─── */
export const finance = assertShape<FinanceData>(
  "finance.json",
  financeJson,
  (v) => isRecord(v) && typeof (v as unknown as FinanceData).interestRate === "number" && typeof (v as unknown as FinanceData).defaultTenure === "number"
);

/* ─── Company ─── */
export const company = assertShape<CompanyData>(
  "company.json",
  companyJson,
  (v) => isRecord(v) && typeof (v as unknown as CompanyData).company === "string" && typeof (v as unknown as CompanyData).rebatePeriod === "string"
);

/* ─── Charging ─── */
export const charging = assertShape<ChargingData>(
  "charging.json",
  chargingJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as ChargingData).chargingProfiles) && isRecordArray((v as unknown as ChargingData).cities)
);

/* ─── Warranty ─── */
export const warranty = assertShape<WarrantyData>(
  "warranty.json",
  warrantyJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as WarrantyData).categories)
);

/* ─── Sales rules ─── */
export const salesRules = assertShape<SalesRulesData>(
  "sales_rules.json",
  salesRulesJson,
  (v) => isRecord(v) && Array.isArray((v as unknown as SalesRulesData).doNotSell) && Array.isArray((v as unknown as SalesRulesData).sell)
);

/* ─── Changelog ─── */
export const changelog = assertShape<ChangelogEntry[]>(
  "changelog.json",
  changelogJson,
  (v) =>
    Array.isArray(v) &&
    v.every(
      (e) => isRecord(e) && typeof e.version === "string" && Array.isArray(e.changes)
    )
);

/* ─── Competitors ─── */
export const competitors = assertShape<CompetitorsData>(
  "competitors.json",
  competitorsJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as CompetitorsData).brands)
);

export const competitorBrands: CompetitorBrand[] = competitors.brands;

/* ─── EV news ─── */
export const evNews = assertShape<EVNewsData>(
  "ev-news.json",
  evNewsJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as EVNewsData).items)
);

/* ─── RJEOS ─── */
export const rjeos = assertShape<RJEOSData>(
  "rjeos.json",
  rjeosJson,
  (v) => isRecord(v) && isRecord((v as unknown as RJEOSData).constitution)
);

/* ─── Rebates metadata ─── */
export const rebatesMeta = assertShape<RebatesMeta>(
  "rebates.json",
  rebatesJson,
  (v) => isRecord(v) && typeof (v as unknown as RebatesMeta).disclaimer === "string"
);

/* ─── Pricing metadata ─── */
export const pricingMeta = pricingJson as ContentRulesData;

/* ─── Content / website rules ─── */
export const contentRules = contentRulesJson as ContentRulesData;
export const websiteRules = websiteRulesJson as ContentRulesData;

/* ─── Marketing ─── */
export const marketingEvents = assertShape<EventsData>(
  "marketing/events.json",
  marketingEventsJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as EventsData).categories)
);

export const marketingSchedules = assertShape<SchedulesData>(
  "marketing/schedules.json",
  marketingSchedulesJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as SchedulesData).platforms)
);

export const marketingCampaigns = assertShape<CampaignsData>(
  "marketing/campaigns.json",
  marketingCampaignsJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as CampaignsData).campaignTypes)
);

export const marketingTimeline = assertShape<TimelineData>(
  "marketing/timeline.json",
  marketingTimelineJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as TimelineData).timelines)
);

export const marketingPrompts = assertShape<PromptsData>(
  "marketing/prompts.json",
  marketingPromptsJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as PromptsData).tools)
);

export const marketingPsychology = assertShape<PsychologyData>(
  "marketing/psychology.json",
  marketingPsychologyJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as PsychologyData).personas)
);

export const marketingBranding = assertShape<BrandingData>(
  "marketing/branding.json",
  marketingBrandingJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as BrandingData).rules)
);

export const marketingScoring = assertShape<ScoringData>(
  "marketing/scoring.json",
  marketingScoringJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as ScoringData).criteria)
);

/* ─── Prompt Studio ─── */
export const psTemplates = assertShape<{ description: string; version: string; lastUpdated: string; templates: GeneratorTemplate[] }>(
  "prompt-studio/templates.json",
  psTemplatesJson,
  (v) => isRecord(v) && isRecordArray((v as { templates: GeneratorTemplate[] }).templates)
);

export const psBlocks = assertShape<BlocksData>(
  "prompt-studio/blocks.json",
  psBlocksJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as BlocksData).blocks)
);

export const psRules = assertShape<RulesData>(
  "prompt-studio/rules.json",
  psRulesJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as RulesData).categories)
);

export const psLibrary = assertShape<LibraryData>(
  "prompt-studio/library.json",
  psLibraryJson,
  (v) => isRecord(v) && isRecordArray((v as unknown as LibraryData).entries)
);
