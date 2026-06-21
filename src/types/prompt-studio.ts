/* ─── AI Prompt Studio Types ───────────────────────────────── */

export interface BlockOption {
  id: string;
  name: string;
  selected?: boolean;
  content: string;
}

export interface PromptBlock {
  id: string;
  name: string;
  order: number;
  description: string;
  options: BlockOption[];
}

export interface BlocksData {
  description: string;
  version: string;
  lastUpdated: string;
  blocks: PromptBlock[];
  promptStructure: string[];
}

export interface TemplateBlockSelection {
  blockId: string;
  selectedOptionId: string;
}

export interface TaglineOption {
  id: string;
  text: string;
  selected?: boolean;
}

export interface GeneratorTemplate {
  id: string;
  name: string;
  description: string;
  purpose: string;
  platform: string;
  aspectRatio: string;
  bestFor: string[];
  blocks: TemplateBlockSelection[];
  taglines?: TaglineOption[];
}

export interface TemplatesData {
  description: string;
  version: string;
  lastUpdated: string;
  templates: GeneratorTemplate[];
}

export interface RuleCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  dos: string[];
  donts: string[];
}

export interface RulesData {
  description: string;
  version: string;
  lastUpdated: string;
  categories: RuleCategory[];
}

export interface LibraryEntry {
  id: string;
  name: string;
  description: string;
  folder: string;
  version: string;
  created: string;
  tags: string[];
  status: "published" | "draft" | "archived";
  prompt: string;
  selections: TemplateBlockSelection[];
}

export interface LibraryData {
  description: string;
  version: string;
  lastUpdated: string;
  folders: {
    id: string;
    name: string;
    description: string;
  }[];
  entries: LibraryEntry[];
}

export interface SavedPrompt {
  id: string;
  name: string;
  category: string;
  version: string;
  created: string;
  lastEdited: string;
  tags: string[];
  status: "active" | "draft" | "archived";
  notes: string;
  prompt: string;
  selections: TemplateBlockSelection[];
  favorite: boolean;
}

export interface PromptHistoryItem {
  id: string;
  name: string;
  prompt: string;
  created: string;
  action: "generated" | "copied" | "saved" | "shared";
  generator: string;
  favorite: boolean;
}

export interface PromptStudioStats {
  totalGenerators: number;
  totalLibraryEntries: number;
  totalSavedPrompts: number;
  totalRules: number;
  promptVersion: string;
}
