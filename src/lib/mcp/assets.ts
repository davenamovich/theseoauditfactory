// Maps content-studio asset types to REAL Plunder & Riffle MCP tool calls.
// Tool names/parameters come from the live tools/list discovery (18 tools).
// Nothing here invents capabilities: if a call fails, the failure is surfaced.

import type { AuditReport } from '@/lib/seo/types';

export type AssetType =
  | 'meme'
  | 'promo-meme'
  | 'carousel'
  | 'social-graphic'
  | 'before-pitch'
  | 'stick-figure-video'
  | 'video-show'
  | 'captions-pack'
  | 'repurpose-pack'
  | 'site-roast';

export interface AssetTypeDef {
  label: string;
  blurb: string;
  tool: string;
  async: boolean;
  jobKind?: string;
  creditsNote: string;
  icon: string;
}

export const ASSET_TYPES: Record<AssetType, AssetTypeDef> = {
  meme: {
    label: 'Business Meme',
    blurb: 'A single shareable meme built from your audit insights and services.',
    tool: 'generate_ad_creative',
    async: false,
    creditsNote: 'P&R list price: format-based. Under BYOK, every MCP call is 1 credit ($0.01); first 100 calls/month free.',
    icon: 'Laugh',
  },
  'promo-meme': {
    label: 'Promo Hot-Take Meme',
    blurb: 'A hot-take promo meme that sells your main offer with attitude.',
    tool: 'generate_ad_creative',
    async: false,
    creditsNote: 'P&R list price: format-based. Under BYOK, every MCP call is 1 credit ($0.01).',
    icon: 'Flame',
  },
  carousel: {
    label: 'Carousel / Slideshow',
    blurb: 'A multi-slide promotional slideshow for feeds.',
    tool: 'generate_ad_creative',
    async: false,
    creditsNote: 'P&R list price: carousel format. BYOK: 1 credit ($0.01) per MCP call.',
    icon: 'GalleryHorizontal',
  },
  'social-graphic': {
    label: 'Social Graphic Pack',
    blurb: 'Square, feed and story PNG graphics with post copy.',
    tool: 'generate_ad_creative',
    async: false,
    creditsNote: 'P&R list price: image format. BYOK: 1 credit ($0.01) per MCP call.',
    icon: 'Image',
  },
  'before-pitch': {
    label: 'Your Free /BEFORE',
    blurb: "Joe's welcome + five custom examples built from your own website - the honest before shot.",
    tool: 'create_before_pitch',
    async: true,
    jobKind: 'demo_pack',
    creditsNote: 'Complimentary for you: one free /before per audit, covered by the operator. P&R list price: 50 credits ($0.50; BYOK $0.01).',
    icon: 'Camera',
  },
  'stick-figure-video': {
    label: 'Stick-Figure Video',
    blurb: 'A stick-figure marketing video built from your own website page.',
    tool: 'create_funnel',
    async: true,
    jobKind: 'funnel',
    creditsNote: 'P&R list price: 10 credits to read + 25 for stickfigures (BYOK: $0.01/call). Refunded on failure.',
    icon: 'PenTool',
  },
  'video-show': {
    label: 'Short-Form Marketing Video',
    blurb: 'A short voiced marketing presentation about your business.',
    tool: 'create_present',
    async: true,
    jobKind: 'sitdown',
    creditsNote: 'P&R list price: 25 credits ($0.25; BYOK: $0.01).',
    icon: 'Video',
  },
  'captions-pack': {
    label: 'Captions & Copy Pack',
    blurb: 'Ready-to-post captions and promo copy generated from your page.',
    tool: 'create_funnel',
    async: true,
    jobKind: 'funnel',
    creditsNote: 'P&R list price: 10 credits to read + 25 for captions (BYOK: $0.01/call).',
    icon: 'Type',
  },
  'repurpose-pack': {
    label: 'Website-to-Social Repurpose',
    blurb: 'Researches your brand voice, then generates a creative in that voice.',
    tool: 'research_brand + generate_ad_creative',
    async: false,
    creditsNote: 'research_brand is free; the creative call is 1 credit ($0.01) under BYOK.',
    icon: 'RefreshCw',
  },
  'site-roast': {
    label: 'Jobless Joe Website Roast',
    blurb: 'A 30-second comedy episode where Joe roasts your website (based on the real audit).',
    tool: 'create_ridiculous',
    async: true,
    jobKind: 'sitdown',
    creditsNote: 'P&R list price: 25 credits ($0.25; BYOK: $0.01). Refunded on failure.',
    icon: 'Mic',
  },
};

export interface BuildContext {
  website: string;
  businessName?: string;
  industry?: string;
  location?: string;
  report?: AuditReport | null;
  topic?: string;
}

function briefContext(ctx: BuildContext): string {
  const parts: string[] = [];
  parts.push(`Business: ${ctx.businessName || ctx.website}`);
  if (ctx.industry) parts.push(`Industry: ${ctx.industry}`);
  if (ctx.location) parts.push(`Location/serves: ${ctx.location}`);
  parts.push(`Website: ${ctx.website}`);
  const report = ctx.report;
  if (report) {
    const topics = report.contentIdeas?.slice(0, 3) ?? [];
    if (topics.length) parts.push(`Content angles from our audit: ${topics.join(' | ')}`);
    if (report.scores) parts.push(`SEO audit scores - overall ${report.scores.overall}/100, AI search readiness ${report.scores.ai}/100.`);
    const topProblem = report.topProblems?.[0]?.title;
    if (topProblem) parts.push(`Top audit finding: ${topProblem}`);
  }
  if (ctx.topic) parts.push(`Requested focus: ${ctx.topic}`);
  return parts.join('\n');
}

export interface PlannedCall {
  tool: string;
  args: Record<string, unknown>;
  async: boolean;
  jobKind?: string;
  steps: string[];
}

export function planAssetCall(assetType: AssetType, ctx: BuildContext): PlannedCall {
  const context = briefContext(ctx);
  const audience = ctx.industry ? `${ctx.industry} customers${ctx.location ? ` in ${ctx.location}` : ''}` : 'local customers';
  const brand = ctx.businessName || ctx.website;

  switch (assetType) {
    case 'meme':
      return {
        tool: 'generate_ad_creative',
        args: {
          brief: `${context}\nMake a single relatable marketing meme for ${brand}. Ground it in what the business actually does.`,
          audience,
          brandProfile: { name: brand },
        },
        async: false,
        steps: ['Composing brief from audit data', 'Calling P&R generate_ad_creative'],
      };
    case 'promo-meme':
      return {
        tool: 'generate_ad_creative',
        args: {
          brief: `${context}\nMake a hot-take promo meme selling ${brand}'s main service. Punchy, honest, no hype.`,
          format: 'hottake',
          audience,
          brandProfile: { name: brand },
        },
        async: false,
        steps: ['Composing brief from audit data', 'Calling P&R generate_ad_creative (hottake format)'],
      };
    case 'carousel':
      return {
        tool: 'generate_ad_creative',
        args: {
          brief: `${context}\nMake a promotional carousel/slideshow about ${brand}'s services, slide by slide.`,
          format: 'carousel',
          audience,
          brandProfile: { name: brand },
        },
        async: false,
        steps: ['Composing brief from audit data', 'Calling P&R generate_ad_creative (carousel format)'],
      };
    case 'social-graphic':
      return {
        tool: 'generate_ad_creative',
        args: {
          brief: `${context}\nCreate square, feed and story promotional graphics for ${brand} with post copy.`,
          format: 'image',
          includeAssets: true,
          sizes: ['square', 'feed', 'story'],
          audience,
          brandProfile: { name: brand },
        },
        async: false,
        steps: ['Composing brief from audit data', 'Calling P&R generate_ad_creative (image + all sizes)'],
      };
    case 'before-pitch':
      return {
        tool: 'create_before_pitch',
        args: {
          // Real /before semantics: ONE prospect, described by their website.
          // No feed/offer flags -> the full demo_pack (Joe welcome + five
          // custom examples, iMessage thread included), polled as demo_pack.
          input: ctx.website.slice(0, 1500),
        },
        async: true,
        jobKind: 'demo_pack',
        steps: ['Sending your website to the P&R /before engine', "Joe records the welcome + five custom examples from your site", 'Polling demo_pack job status'],
      };
    case 'stick-figure-video':
      return {
        tool: 'create_funnel',
        args: {
          url: ctx.website,
          format: 'stickfigures',
          description: context,
          audience,
          tone: 'playful but credible',
        },
        async: true,
        jobKind: 'funnel',
        steps: ['Reading your website via P&R funnel', 'Generating stick-figure story', 'Polling job status'],
      };
    case 'video-show':
      return {
        tool: 'create_present',
        args: {
          topic: ctx.topic
            ? `${ctx.topic} - ${brand}`
            : `${brand}: ${ctx.industry || 'local business'}${ctx.location ? ` in ${ctx.location}` : ''}. Key services and why customers choose them.`,
          template: 'marketing',
          game: 'conversion',
        },
        async: true,
        jobKind: 'sitdown',
        steps: ['Briefing the show from audit data', 'Generating presentation video', 'Polling job status'],
      };
    case 'captions-pack':
      return {
        tool: 'create_funnel',
        args: {
          url: ctx.website,
          format: 'captions',
          description: context,
          audience,
          tone: 'friendly, direct',
        },
        async: true,
        jobKind: 'funnel',
        steps: ['Reading your website via P&R funnel', 'Writing caption pack', 'Polling job status'],
      };
    case 'repurpose-pack':
      return {
        tool: 'research_brand + generate_ad_creative',
        args: {},
        async: false,
        steps: ['Researching brand voice (free call)', 'Generating creative in researched voice'],
      };
    case 'site-roast':
      return {
        tool: 'create_ridiculous',
        args: {
          topic: ctx.website,
          language: 'English',
        },
        async: true,
        jobKind: 'sitdown',
        steps: ['Sending your site to Jobless Joe', 'Producing the roast episode', 'Polling job status'],
      };
  }
}
