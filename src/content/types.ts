export type ArticleCategory =
  | 'Fundamentals'
  | 'Technical SEO'
  | 'Local SEO'
  | 'AI Search'
  | 'Performance'
  | 'Money'
  | 'Industries';

export interface ArticleSection {
  heading: string;
  level?: 2 | 3;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  callout?: string;
}

export interface ArticleFaq {
  q: string;
  a: string;
}

export interface ArticleSource {
  label: string;
  url: string;
}

export interface KnowledgeArticle {
  slug: string;
  title: string;
  category: ArticleCategory;
  /** Meta-style description, 140-165 characters. */
  description: string;
  readMinutes: number;
  /** Review date shown to readers, e.g. "November 2026". */
  updated: string;
  /** 2-3 sentences that directly answer the page's core question. */
  intro: string;
  keyTakeaways: string[];
  sections: ArticleSection[]; // 5-8 sections
  faqs: ArticleFaq[]; // 4-6
  /** Real, authoritative primary sources only. Never fabricate. */
  sources: ArticleSource[];
  /** Slugs of related articles rendered as internal links. */
  related: string[];
}

export interface GlossaryTerm {
  term: string;
  slug: string;
  category: string;
  definition: string;
}

export interface ResourceLink {
  name: string;
  url: string;
  description: string;
  category: string;
  free: boolean;
}

export const ALL_CATEGORIES: ArticleCategory[] = [
  'Fundamentals',
  'Technical SEO',
  'Local SEO',
  'AI Search',
  'Performance',
  'Money',
  'Industries',
];

export const CATEGORY_DESCRIPTIONS: Record<ArticleCategory, string> = {
  Fundamentals: 'Core concepts every business owner should understand before spending a dollar.',
  'Technical SEO': 'Crawlability, indexability, structured data and the plumbing that makes rankings possible.',
  'Local SEO': 'Map packs, reviews and location pages for businesses that serve a geographic area.',
  'AI Search': 'How ChatGPT, Perplexity, Gemini and Google AI Overviews decide what to cite.',
  Performance: 'Speed, Core Web Vitals and the infrastructure choices that affect both rankings and bills.',
  Money: 'Where SEO budgets are commonly wasted, and how to keep more of yours.',
  Industries: 'Playbooks for contractors, restaurants and local service businesses.',
};
