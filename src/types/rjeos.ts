/* ─── RJEOS™ — Ridzuan Jahari Editorial Operating System Types ─── */

export type RJEOSOutputSize = "1:1" | "4:5" | "9:16";
export type RJEOSDesignDirection = "executive" | "luxury" | "performance" | "lifestyle" | "oem-social";
export type RJEOSScene = "studio" | "architecture" | "showroom";
export type RJEOSSalesAdvisor = "portrait" | "signature" | "hidden";

export interface RJEOSArticle {
  number: number;
  title: string;
  content: string;
}

export interface RJEOSConstitution {
  version: string;
  status: string;
  articles: RJEOSArticle[];
}

export interface RJEOSDesignDirectionDef {
  id: RJEOSDesignDirection;
  name: string;
  description: string;
  visualLanguage: string;
}

export interface RJEOSSceneDef {
  id: RJEOSScene;
  name: string;
  description: string;
  environmentDescription: string;
}

export interface RJEOSOutputSizeDef {
  id: RJEOSOutputSize;
  name: string;
  dimensions: string;
}

export interface RJEOSSalesAdvisorDef {
  id: RJEOSSalesAdvisor;
  name: string;
  description: string;
}

export interface RJEOSTypography {
  modelName: string;
  headline: string;
  price: string;
  features: string;
  signature: string;
}

export interface RJEOSVisualHierarchy {
  order: string[];
}

export interface RJEOSData {
  version: string;
  lastUpdated: string;
  constitution: RJEOSConstitution;
  outputSizes: RJEOSOutputSizeDef[];
  designDirections: RJEOSDesignDirectionDef[];
  scenes: RJEOSSceneDef[];
  salesAdvisorModes: RJEOSSalesAdvisorDef[];
  forbiddenWords: string[];
  typography: RJEOSTypography;
  hierarchy: RJEOSVisualHierarchy;
  signature: {
    name: string;
    dealership: string;
    tracking: string;
  };
}

export interface RJEOSSelections {
  outputSize: RJEOSOutputSize;
  modelIdx: number;
  variantIdx: number;
  scene: RJEOSScene;
  designDirection: RJEOSDesignDirection;
  headline: string;
  talkingPoint: string;
  showPrice: boolean;
  showFeatures: boolean;
  showCTA: boolean;
  showLogo: boolean;
  salesAdvisor: RJEOSSalesAdvisor;
}

export const DEFAULT_RJEOS_SELECTIONS: RJEOSSelections = {
  outputSize: "4:5",
  modelIdx: 0,
  variantIdx: 0,
  scene: "studio",
  designDirection: "luxury",
  headline: "",
  talkingPoint: "",
  showPrice: true,
  showFeatures: true,
  showCTA: false,
  showLogo: true,
  salesAdvisor: "portrait",
};
