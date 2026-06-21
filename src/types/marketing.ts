/* ─── Marketing AI Types ────────────────────────────────────── */

export interface MarketingEvent {
  name: string;
  date: string;
  type: string;
  opportunity: string;
  leadTime: string;
}

export interface EventCategory {
  id: string;
  label: string;
  events: MarketingEvent[];
}

export interface EventsData {
  description: string;
  lastUpdated: string;
  categories: EventCategory[];
}

export interface CampaignType {
  id: string;
  name: string;
  description: string;
  assets: string[];
  defaultTimeline: string;
  objectives: string[];
  suggestedCTA: string[];
}

export interface AssetFormat {
  dimensions?: string;
  format?: string;
  type?: string;
  platforms: string[];
}

export interface CampaignsData {
  description: string;
  lastUpdated: string;
  campaignTypes: CampaignType[];
  assetFormats: Record<string, AssetFormat>;
}

export interface PromptTool {
  id: string;
  name: string;
  description: string;
  model: string;
  bestFor: string[];
  templatePrefix: string;
  parameters: string[];
}

export interface PromptEnhancer {
  id: string;
  label: string;
  options: string[];
}

export interface PromptsData {
  description: string;
  lastUpdated: string;
  tools: PromptTool[];
  promptEnhancers: PromptEnhancer[];
}

export interface PsychologyPersona {
  id: string;
  name: string;
  description: string;
  priorities: string[];
  tone: string;
  suggestedHeadline: string;
  suggestedCTA: string;
  buyingTriggers: string[];
  visualDirection: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  bestFor: string[];
}

export interface PsychologyData {
  description: string;
  lastUpdated: string;
  personas: PsychologyPersona[];
  strategies: Strategy[];
}

export interface BrandRule {
  id: string;
  rule: string;
  severity: string;
}

export interface BrandingData {
  description: string;
  lastUpdated: string;
  brandIdentity: {
    colors: Record<string, string>;
    typography: Record<string, string>;
    tone: Record<string, string>;
  };
  rules: BrandRule[];
  rejectionReasons: string[];
}

export interface ScoringLevel {
  score: number;
  label: string;
  description: string;
}

export interface ScoringCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
  levels: ScoringLevel[];
}

export interface ScoringRange {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface ScoringData {
  description: string;
  lastUpdated: string;
  criteria: ScoringCriterion[];
  scoringRanges: ScoringRange[];
}

export interface TemplateDesign {
  id: string;
  name: string;
  type: string;
  description: string;
  layout: string;
  elements: string[];
}

export interface TemplatesData {
  description: string;
  lastUpdated: string;
  templates: TemplateDesign[];
}

export interface ContentMix {
  type: string;
  percentage: number;
}

export interface PlatformSchedule {
  id: string;
  name: string;
  recommendedFrequency: string;
  bestTimes: string[];
  contentMix: ContentMix[];
}

export interface SchedulesData {
  description: string;
  lastUpdated: string;
  platforms: PlatformSchedule[];
}

export interface VisualReference {
  brand: string;
  principle: string;
  takeaway: string;
}

export interface Moodboard {
  colour_palette: string[];
  vibe: string;
}

export interface CreativeData {
  description: string;
  lastUpdated: string;
  designPrinciples: string[];
  visualReferences: VisualReference[];
  do: string[];
  dont: string[];
  moodboards: Record<string, Moodboard>;
}

export interface TimelinePhase {
  week: number;
  phase: string;
  activities: string[];
  assets: string[];
}

export interface TimelineData {
  description: string;
  lastUpdated: string;
  timelines: {
    id: string;
    name: string;
    description: string;
    phases: TimelinePhase[];
  }[];
  postingFrequency: Record<string, string>;
}

/* ─── Module Configuration ─────────────────────────────────── */

export interface ModuleInfo {
  id: string;
  title: string;
  description: string;
  href: string;
  status: "active" | "coming_soon" | "beta";
  capabilities: string[];
  icon: string;
}
