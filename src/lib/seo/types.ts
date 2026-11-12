// Shared types for the SEO audit engine.
// Methodology adapted from the MIT-licensed claude-seo project (github.com/AgriciDaniel/claude-seo).

export type CheckStatus = 'pass' | 'warn' | 'fail' | 'na';

export interface CheckResult {
  id: string;
  label: string;
  status: CheckStatus;
  detail?: string;
}

export type CategoryKey = 'technical' | 'content' | 'ai' | 'local' | 'performance';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Effort = 'quick' | 'medium' | 'project';

export interface Finding {
  code: string;
  category: CategoryKey;
  severity: Severity;
  title: string;
  evidence: string[];
  explanation: string;
  action: string;
  impact: string;
  effort: Effort;
}

export interface CategoryScore {
  key: CategoryKey;
  label: string;
  score: number;
  checks: CheckResult[];
}

export type Confidence = 'High' | 'Medium' | 'Low';

export interface SavingsOpportunity {
  id: string;
  title: string;
  problem: string;
  evidence: string[];
  cost: string;
  fix: string;
  savingsMin: number;
  savingsMax: number;
  basis: string;
  assumptions: string[];
  confidence: Confidence;
  nextStep: string;
}

export interface PageSummary {
  url: string;
  status: number | null;
  title: string;
  words: number;
  ok: boolean;
}

export interface AiCrawlerPolicy {
  name: string;
  policy: 'allowed' | 'blocked' | 'not-mentioned';
  detail?: string;
}

export interface AuditReport {
  version: string;
  engine: string;
  generatedAt: string;
  url: string;
  finalUrl: string;
  host: string;
  businessName?: string;
  industry?: string;
  location?: string;
  homeTitle?: string;
  homeDescription?: string;
  homeH1?: string;
  /** 'full' = homepage crawl succeeded. 'limited' = the site blocked our crawler;
   *  everything measured below comes from what was still verifiable (robots.txt,
   *  response headers, redirects, sitemap). Never faked. */
  mode?: 'full' | 'limited';
  /** Why this run is limited (present only when mode === 'limited'). */
  limitedReason?: string;
  /** Categories that could not be measured in this run; their scores are 0 and
   *  must be displayed as N/A, never as a real zero. */
  unmeasured?: CategoryKey[];
  scores: {
    overall: number;
    technical: number;
    content: number;
    ai: number;
    local: number;
    performance: number;
  };
  grade: string;
  categories: CategoryScore[];
  findings: Finding[];
  topProblems: Finding[];
  quickWins: Finding[];
  savings: SavingsOpportunity[];
  actionPlan: { today: string[]; week: string[]; month: string[] };
  aiReadiness: {
    llmsTxt: { found: boolean; bytes: number };
    crawlers: AiCrawlerPolicy[];
    schemaTypes: string[];
    questionHeadings: number;
    answerFormatSignals: string[];
    verdict: string;
  };
  performance: {
    ttfbMs: number | null;
    htmlBytes: number;
    externalScripts: number;
    marketingScripts: string[];
    stylesheets: number;
    images: number;
    imagesNoLazy: number;
    imagesNoDimensions: number;
    renderBlockingHead: number;
    compression: string | null;
    dataNotes: string;
  };
  pages: PageSummary[];
  contentIdeas: string[];
  comparison?: {
    previousRunAt: string;
    previousOverall: number;
    deltas: {
      overall: number;
      technical: number;
      content: number;
      ai: number;
      local: number;
      performance: number;
    };
    fixedFindings: string[];
    newFindings: string[];
  };
  robotsTxt: { found: boolean; sitemapDeclared: boolean; aiCrawlers: AiCrawlerPolicy[] };
  sitemap: { found: boolean; urlCount: number | null };
  redirectChain: string[];
  notes: string[];
}

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};
