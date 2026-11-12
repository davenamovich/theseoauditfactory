// Specialist analyzers — methodology adapted from the MIT-licensed claude-seo project.
// Each analyzer returns category checks + human findings with real evidence.
import type {
  AiCrawlerPolicy,
  CategoryScore,
  CheckResult,
  Finding,
  PageSummary,
} from './types';
import type { ParsedPage, LinkInfo } from './parse';
import { safeHost } from './parse';

export interface RobotsInfo {
  found: boolean;
  text: string;
  sitemaps: string[];
  aiCrawlers: AiCrawlerPolicy[];
}

export interface SitemapInfo {
  found: boolean;
  urlCount: number | null;
  isIndex: boolean;
}

export interface SampledPage {
  url: string;
  status: number | null;
  ok: boolean;
  words: number;
  title: string;
  parsed: ParsedPage | null;
}

export interface LinkCheck {
  url: string;
  status: number | null;
  ok: boolean;
  internal: boolean;
}

export interface AnalyzeContext {
  url: string;
  finalUrl: string;
  host: string;
  status: number | null;
  headers: Record<string, string>;
  ttfbMs: number | null;
  htmlBytes: number;
  redirectChain: string[];
  homepage: ParsedPage;
  robots: RobotsInfo;
  sitemap: SitemapInfo;
  llms: { found: boolean; bytes: number };
  pages: SampledPage[];
  linkChecks: LinkCheck[];
  businessName?: string;
  industry?: string;
  location?: string;
}

interface AnalyzerOutput {
  key: 'technical' | 'content' | 'ai' | 'local' | 'performance';
  label: string;
  checks: CheckResult[];
  findings: Finding[];
}

const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
  'Applebot-Extended',
  'Bytespider',
];

export function parseRobots(text: string): RobotsInfo {
  const sitemaps: string[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  for (const line of lines) {
    const m = line.match(/^sitemap:\s*(\S+)/i);
    if (m) sitemaps.push(m[1]);
  }

  // Build user-agent groups per RFC 9309: rules belong to the nearest
  // preceding user-agent line(s); consecutive UA lines share one group.
  interface Group {
    agents: string[];
    disallows: string[];
    allows: string[];
  }
  const groups: Group[] = [];
  let current: Group | null = null;
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const ua = line.match(/^user-agent:\s*(.*)$/i);
    if (ua) {
      const agent = ua[1].trim().toLowerCase();
      if (current && current.disallows.length === 0 && current.allows.length === 0) {
        current.agents.push(agent); // consecutive UA lines share a group
      } else {
        current = { agents: [agent], disallows: [], allows: [] };
        groups.push(current);
      }
      continue;
    }
    const dis = line.match(/^disallow:\s*(.*)$/i);
    if (dis && current) {
      current.disallows.push(dis[1].trim());
      continue;
    }
    const allow = line.match(/^allow:\s*(.*)$/i);
    if (allow && current) current.allows.push(allow[1].trim());
  }

  const aiCrawlers: AiCrawlerPolicy[] = AI_CRAWLERS.map((name) => {
    const lower = name.toLowerCase();
    const group = groups.find((g) => g.agents.includes(lower));
    if (!group) return { name, policy: 'not-mentioned' as const };
    const blockedAll = group.disallows.some((d) => d === '/');
    const hasSpecificRules = group.disallows.length > 0 || group.allows.length > 0;
    if (blockedAll) return { name, policy: 'blocked' as const, detail: 'Disallow: / in robots.txt' };
    if (hasSpecificRules) return { name, policy: 'allowed' as const, detail: 'Has specific rules (partial access)' };
    return { name, policy: 'not-mentioned' as const };
  });
  return { found: true, text, sitemaps, aiCrawlers };
}

function finding(
  code: string,
  category: Finding['category'],
  severity: Finding['severity'],
  title: string,
  evidence: string[],
  explanation: string,
  action: string,
  impact: string,
  effort: Finding['effort']
): Finding {
  return { code, category, severity, title, evidence, explanation, action, impact, effort };
}

// ---------------------------------------------------------------------------
// 1. Technical SEO Auditor
// ---------------------------------------------------------------------------
export function analyzeTechnical(ctx: AnalyzeContext): AnalyzerOutput {
  const checks: CheckResult[] = [];
  const findings: Finding[] = [];
  const p = ctx.homepage;

  const https = ctx.finalUrl.startsWith('https://');
  checks.push({
    id: 'https',
    label: 'HTTPS secure connection',
    status: https ? 'pass' : 'fail',
    detail: https ? 'Site served over HTTPS' : 'Site served over plain HTTP',
  });
  if (!https)
    findings.push(
      finding(
        'no-https',
        'technical',
        'critical',
        'Website is not served over HTTPS',
        [`Final URL after redirects: ${ctx.finalUrl}`],
        'Browsers label HTTP sites "Not secure," and Google uses HTTPS as a ranking signal. Many customers will not fill in a form on an unsecured page.',
        'Install a TLS certificate (free with Let\u2019s Encrypt on most hosts) and redirect all HTTP traffic to HTTPS.',
        'Trust, conversions, and rankings',
        'quick'
      )
    );

  const hops = ctx.redirectChain.length;
  checks.push({
    id: 'redirect-chain',
    label: 'Redirect chain',
    status: hops === 0 ? 'pass' : hops <= 2 ? 'pass' : hops <= 3 ? 'warn' : 'fail',
    detail: hops === 0 ? 'Loads directly, no redirects' : `${hops} redirect hop(s) before the final page`,
  });
  if (hops >= 3)
    findings.push(
      finding(
        'redirect-chain',
        'technical',
        'medium',
        `Long redirect chain (${hops} hops)`,
        [...ctx.redirectChain, ctx.finalUrl],
        'Every extra redirect adds delay for visitors and wastes crawl budget for search engines.',
        'Point links and redirects at the final URL directly so a single hop gets there.',
        'Speed and crawl efficiency',
        'quick'
      )
    );

  // --- Header-level AI blocks (X-Robots-Tag noai / scraping-policy headers).
  // Invisible to robots.txt audits - this is the "hidden" layer of AI blocking.
  const xrt = (ctx.headers['x-robots-tag'] ?? '').toLowerCase();
  const aiBlockHeaders: string[] = [];
  if (/noai/.test(xrt)) aiBlockHeaders.push('X-Robots-Tag: noai');
  if (/noimageai/.test(xrt)) aiBlockHeaders.push('X-Robots-Tag: noimageai');
  if (ctx.headers['x-ai-agent-directive']) aiBlockHeaders.push('X-AI-Agent-Directive');
  if (ctx.headers['x-scraping-policy']) aiBlockHeaders.push('X-Scraping-Policy');
  checks.push({
    id: 'ai-block-headers',
    label: 'No header-level AI blocks',
    status: aiBlockHeaders.length === 0 ? 'pass' : 'warn',
    detail:
      aiBlockHeaders.length === 0
        ? 'No X-Robots-Tag noai/noimageai or scraping-policy headers detected'
        : `Header blocks found: ${aiBlockHeaders.join('; ')}`,
  });
  if (aiBlockHeaders.length > 0)
    findings.push(
      finding(
        'ai-block-headers',
        'ai',
        'medium',
        'HTTP headers block AI reuse of your content',
        aiBlockHeaders,
        'These headers tell AI systems not to read or reuse your content - they apply site-wide and are invisible in robots.txt audits. If they were set deliberately (e.g. by a privacy tool or host default), fine; if not, assistants may refuse to quote your pages even when robots.txt allows them.',
        'Remove the noai/noimageai directives from your X-Robots-Tag header (or scope them to the pages you actually want protected), then re-run this audit.',
        'AI search visibility',
        'quick'
      )
    );

  checks.push({
    id: 'robots-txt',
    label: 'robots.txt present',
    status: ctx.robots.found ? 'pass' : 'warn',
    detail: ctx.robots.found ? 'Found at /robots.txt' : 'No robots.txt found (servers usually default to allow-all)',
  });
  if (!ctx.robots.found)
    findings.push(
      finding(
        'no-robots',
        'technical',
        'low',
        'No robots.txt file',
        ['Request to /robots.txt returned no valid file'],
        'robots.txt tells search engines (and AI crawlers) what to crawl. Its absence is usually safe but removes your control.',
        'Add a simple robots.txt that references your sitemap. See the Technical SEO Checklist in our resource center.',
        'Crawl control',
        'quick'
      )
    );

  checks.push({
    id: 'robots-sitemap',
    label: 'Sitemap declared in robots.txt',
    status: ctx.robots.sitemaps.length > 0 ? 'pass' : 'warn',
    detail: ctx.robots.sitemaps.length ? ctx.robots.sitemaps.slice(0, 2).join(', ') : 'No Sitemap: line in robots.txt',
  });

  checks.push({
    id: 'xml-sitemap',
    label: 'XML sitemap exists',
    status: ctx.sitemap.found && (ctx.sitemap.urlCount ?? 0) > 0 ? 'pass' : ctx.sitemap.found ? 'pass' : 'fail',
    detail:
      ctx.sitemap.found && ctx.sitemap.urlCount
        ? `${ctx.sitemap.urlCount} URLs listed`
        : ctx.sitemap.found
          ? ctx.sitemap.isIndex
            ? 'Sitemap index found (references child sitemaps)'
            : 'Sitemap found'
          : 'No sitemap found at common locations or in robots.txt',
  });
  if (!ctx.sitemap.found || (ctx.sitemap.urlCount ?? 0) === 0)
    findings.push(
      finding(
        'no-sitemap',
        'technical',
        'high',
        'XML sitemap missing or empty',
        ['No valid sitemap.xml found at /sitemap.xml or declared in robots.txt'],
        'A sitemap is how you hand Google a complete list of your pages. Without one, new and important pages can be discovered late or never.',
        'Generate a sitemap (most CMSs and plugins do this with one toggle) and reference it in robots.txt and Search Console.',
        'Faster, more complete indexing',
        'quick'
      )
    );

  const noindex = /noindex/i.test(p.metaRobots);
  checks.push({
    id: 'indexable',
    label: 'Homepage indexable',
    status: noindex ? 'fail' : 'pass',
    detail: noindex ? 'meta robots contains noindex' : 'No noindex directive found',
  });
  if (noindex)
    findings.push(
      finding(
        'noindex',
        'technical',
        'critical',
        'Homepage is marked noindex',
        [`<meta name="robots" content="${p.metaRobots}">`],
        'A noindex tag asks Google to keep this page out of search results entirely. On a homepage this is usually a staging setting that leaked to production.',
        'Remove noindex from the homepage meta robots tag and request indexing in Google Search Console.',
        'Entire search visibility',
        'quick'
      )
    );

  checks.push({
    id: 'canonical',
    label: 'Canonical tag',
    status: p.canonical ? 'pass' : 'warn',
    detail: p.canonical ? p.canonical : 'No rel=canonical on homepage',
  });
  if (!p.canonical)
    findings.push(
      finding(
        'no-canonical',
        'technical',
        'low',
        'No canonical tag on the homepage',
        ['No <link rel="canonical"> found'],
        'Canonical tags prevent duplicate-URL confusion (e.g., http/https, with/without trailing slash). Most templates include one; yours does not.',
        'Add a self-referencing canonical link tag to the homepage template.',
        'Duplicate-content hygiene',
        'quick'
      )
    );

  checks.push({
    id: 'viewport',
    label: 'Mobile viewport tag',
    status: p.viewport ? 'pass' : 'fail',
    detail: p.viewport ?? 'No <meta name="viewport"> found',
  });
  if (!p.viewport)
    findings.push(
      finding(
        'no-viewport',
        'technical',
        'high',
        'Page is not mobile-ready (no viewport tag)',
        ['Missing <meta name="viewport"> tag'],
        'Without a viewport tag, mobile browsers render the desktop layout zoomed out. Google indexes mobile-first, so this hurts every ranking.',
        'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the page template.',
        'All mobile rankings',
        'quick'
      )
    );

  const securityHeaders = ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'content-security-policy'].filter(
    (h) => ctx.headers[h]
  );
  checks.push({
    id: 'security-headers',
    label: 'Security headers',
    status: securityHeaders.length >= 3 ? 'pass' : securityHeaders.length >= 1 ? 'warn' : 'warn',
    detail:
      securityHeaders.length > 0
        ? `Found: ${securityHeaders.join(', ')}`
        : 'No HSTS, X-Content-Type-Options, X-Frame-Options or CSP headers found',
  });

  const brokenInternal = ctx.linkChecks.filter((l) => l.internal && !l.ok);
  const brokenExternal = ctx.linkChecks.filter((l) => !l.internal && !l.ok);
  const sampledCount = ctx.linkChecks.length;
  const brokenStatus: CheckResult['status'] =
    brokenInternal.length === 0 ? 'pass' : brokenInternal.length <= 2 ? 'warn' : 'fail';
  checks.push({
    id: 'broken-links',
    label: `Broken links (sample of ${sampledCount})`,
    status: sampledCount < 4 ? 'na' : brokenStatus,
    detail:
      sampledCount < 4
        ? 'Not enough links found to test'
        : `${brokenInternal.length} internal and ${brokenExternal.length} external broken of ${sampledCount} tested`,
  });
  if (sampledCount >= 4 && brokenInternal.length > 0)
    findings.push(
      finding(
        'broken-links',
        'technical',
        brokenInternal.length > 2 ? 'high' : 'medium',
        `${brokenInternal.length} broken internal link(s) found`,
        brokenInternal.slice(0, 5).map((l) => `${l.url} returned ${l.status ?? 'an error'}`),
        'Dead links frustrate customers and waste crawl budget. They also signal neglect to search engines.',
        'Fix or remove the broken links listed in the evidence.',
        'User trust and crawl efficiency',
        'quick'
      )
    );

  const encoding = ctx.headers['content-encoding'] ?? null;
  checks.push({
    id: 'compression',
    label: 'Text compression (gzip/brotli)',
    status: encoding ? 'pass' : 'warn',
    detail: encoding ? `Served with ${encoding}` : 'No Content-Encoding header on HTML response',
  });
  if (!encoding)
    findings.push(
      finding(
        'no-compression',
        'technical',
        'medium',
        'HTML served without compression',
        ['No Content-Encoding header on the homepage response'],
        'Uncompressed HTML can be 3-5x larger than it needs to be, slowing every visit.',
        'Enable gzip or brotli compression in your server or CDN config.',
        'Load time on every page',
        'quick'
      )
    );

  checks.push({ id: 'favicon', label: 'Favicon', status: p.favicon ? 'pass' : 'warn', detail: p.favicon ? 'Icon link found' : 'No favicon link found' });
  checks.push({
    id: 'lang',
    label: 'Language declared',
    status: p.lang ? 'pass' : 'warn',
    detail: p.lang ? `html lang="${p.lang}"` : 'No lang attribute on <html>',
  });

  return { key: 'technical', label: 'Technical SEO', checks, findings };
}

// ---------------------------------------------------------------------------
// 2. Content Strategist
// ---------------------------------------------------------------------------
export function analyzeContent(ctx: AnalyzeContext): AnalyzerOutput {
  const checks: CheckResult[] = [];
  const findings: Finding[] = [];
  const p = ctx.homepage;

  const title = p.title;
  const titleLen = title.length;
  checks.push({
    id: 'title',
    label: 'Title tag',
    status: titleLen === 0 ? 'fail' : titleLen >= 15 && titleLen <= 65 ? 'pass' : 'warn',
    detail: titleLen === 0 ? 'Missing <title>' : `${titleLen} characters: "${title}"`,
  });
  if (titleLen === 0)
    findings.push(
      finding(
        'no-title',
        'content',
        'critical',
        'Homepage has no title tag',
        ['<title> element is empty or missing'],
        'The title tag is still the single strongest on-page signal and is what users click in search results.',
        'Write a 50-60 character title: what you do + where you do it + brand.',
        'Rankings and click-through rate',
        'quick'
      )
    );
  else if (titleLen < 15 || titleLen > 65)
    findings.push(
      finding(
        'title-length',
        'content',
        'medium',
        titleLen < 15 ? 'Title tag is too short' : 'Title tag is too long',
        [`Current title (${titleLen} chars): "${title}"`],
        titleLen < 15
          ? 'Short titles waste the most valuable on-page space you have.'
          : 'Long titles get cut off in search results, hiding your differentiators.',
        titleLen < 15
          ? 'Expand it to describe your main service and location.'
          : 'Tighten it to under about 60 characters with the important words first.',
        'Click-through rate and keyword relevance',
        'quick'
      )
    );

  const descLen = p.metaDescription.length;
  checks.push({
    id: 'meta-description',
    label: 'Meta description',
    status: descLen === 0 ? 'warn' : descLen >= 50 && descLen <= 165 ? 'pass' : 'warn',
    detail: descLen === 0 ? 'Missing meta description' : `${descLen} characters`,
  });
  if (descLen === 0)
    findings.push(
      finding(
        'no-meta-description',
        'content',
        'medium',
        'Homepage has no meta description',
        ['<meta name="description"> is missing'],
        'Without a description, Google invents its own snippet from page text, which rarely sells your business as well as you could.',
        'Write a 140-160 character description with your main service, area, and a reason to click.',
        'Click-through rate',
        'quick'
      )
    );

  checks.push({
    id: 'h1',
    label: 'H1 heading',
    status: p.h1s.length === 1 ? 'pass' : p.h1s.length === 0 ? 'fail' : 'warn',
    detail: p.h1s.length === 0 ? 'No H1 found' : `${p.h1s.length} H1(s): ${p.h1s.slice(0, 2).join(' | ')}`,
  });
  if (p.h1s.length === 0)
    findings.push(
      finding(
        'no-h1',
        'content',
        'high',
        'Homepage has no H1 heading',
        ['Zero <h1> elements found'],
        'The H1 tells both visitors and search engines what the page is about in one line.',
        'Add one clear H1 near the top stating your primary offer.',
        'Relevance clarity',
        'quick'
      )
    );

  checks.push({
    id: 'heading-structure',
    label: 'Subheading structure (H2s)',
    status: p.h2s.length >= 2 ? 'pass' : p.h2s.length === 1 ? 'warn' : 'warn',
    detail: `${p.h2s.length} H2, ${p.h3s.length} H3`,
  });
  if (p.h2s.length < 2)
    findings.push(
      finding(
        'few-h2',
        'content',
        'low',
        'Very few subheadings on the homepage',
        [`${p.h2s.length} H2 heading(s) found`],
        'Subheadings organize the page for readers and give search engines context about your services.',
        'Break the homepage into scannable sections with descriptive H2s (services, areas served, why us, proof).',
        'Scannability and topical relevance',
        'medium'
      )
    );

  const withAlt = p.images.filter((i) => (i.alt ?? '').length > 0).length;
  const altPct = p.images.length ? Math.round((withAlt / p.images.length) * 100) : 100;
  checks.push({
    id: 'alt-coverage',
    label: 'Image alt text coverage',
    status: p.images.length === 0 ? 'na' : altPct >= 90 ? 'pass' : altPct >= 50 ? 'warn' : 'fail',
    detail: p.images.length === 0 ? 'No images found' : `${withAlt}/${p.images.length} images have alt text (${altPct}%)`,
  });
  if (p.images.length > 0 && altPct < 90)
    findings.push(
      finding(
        'alt-text',
        'content',
        altPct < 50 ? 'medium' : 'low',
        `${p.images.length - withAlt} images missing alt text`,
        [
          `${withAlt} of ${p.images.length} images have alt text (${altPct}%)`,
          ...p.images.filter((i) => !i.alt).slice(0, 3).map((i) => i.src.split('/').slice(-1)[0].slice(0, 60)),
        ],
        'Alt text makes images accessible to screen readers and tells search engines what pictures show. It is also required for image search visibility.',
        'Describe each meaningful image in a short alt attribute (what it shows, in context).',
        'Accessibility and image search',
        'quick'
      )
    );

  checks.push({
    id: 'internal-links',
    label: 'Internal linking',
    status: p.internalLinkCount >= 5 ? 'pass' : p.internalLinkCount >= 1 ? 'warn' : 'fail',
    detail: `${p.internalLinkCount} internal links on homepage`,
  });
  if (p.internalLinkCount < 5)
    findings.push(
      finding(
        'internal-links',
        'content',
        'medium',
        'Very few internal links',
        [`${p.internalLinkCount} internal links found on the homepage`],
        'Internal links spread authority to your service and location pages and guide visitors to the next step.',
        'Link prominently to your main service pages, location pages, and contact page from the homepage.',
        'Page authority distribution',
        'medium'
      )
    );

  checks.push({
    id: 'home-word-count',
    label: 'Homepage content depth',
    status: p.wordCount >= 400 ? 'pass' : p.wordCount >= 150 ? 'warn' : 'fail',
    detail: `${p.wordCount} words of visible text`,
  });
  if (p.wordCount < 400)
    findings.push(
      finding(
        'thin-home',
        'content',
        p.wordCount < 150 ? 'high' : 'medium',
        'Homepage has very little text',
        [`${p.wordCount} words of visible text found`],
        'Pages with almost no text give search engines nothing to rank and customers nothing to be convinced by.',
        'Add the content customers actually search for: services, areas served, proof, FAQs.',
        'Relevance and conversion',
        'medium'
      )
    );

  const thinPages = ctx.pages.filter((pg) => pg.ok && pg.words < 300);
  const thinRatio = ctx.pages.length ? thinPages.length / ctx.pages.length : 0;
  checks.push({
    id: 'thin-pages',
    label: 'Thin pages (sampled)',
    status: ctx.pages.length === 0 ? 'na' : thinRatio > 0.34 ? 'warn' : thinRatio > 0 ? 'warn' : 'pass',
    detail: ctx.pages.length === 0 ? 'No internal pages sampled' : `${thinPages.length} of ${ctx.pages.length} sampled pages under 300 words`,
  });
  if (thinPages.length > 0 && thinRatio > 0.34)
    findings.push(
      finding(
        'thin-pages',
        'content',
        'medium',
        `${thinPages.length} of ${ctx.pages.length} sampled pages are thin`,
        thinPages.slice(0, 4).map((pg) => `${pg.url} (${pg.words} words)`),
        'Thin pages dilute your site quality. Google judges the whole site, not just the homepage.',
        'Either expand these pages with genuinely useful content or consolidate/redirect them.',
        'Site-wide quality signals',
        'medium'
      )
    );

  const sampledTitles = [title, ...ctx.pages.map((pg) => pg.title)].filter(Boolean);
  const uniqueTitles = new Set(sampledTitles.map((t) => t.toLowerCase()));
  checks.push({
    id: 'title-uniqueness',
    label: 'Unique titles (sampled pages)',
    status: sampledTitles.length <= 1 ? 'na' : uniqueTitles.size === sampledTitles.length ? 'pass' : 'warn',
    detail: `${uniqueTitles.size} unique titles across ${sampledTitles.length} pages checked`,
  });
  if (sampledTitles.length > 1 && uniqueTitles.size !== sampledTitles.length)
    findings.push(
      finding(
        'duplicate-titles',
        'content',
        'medium',
        'Duplicate or missing page titles',
        sampledTitles
          .map((t) => t)
          .filter((t, i, arr) => arr.findIndex((x) => x.toLowerCase() === t.toLowerCase()) !== i || t === '')
          .slice(0, 3)
          .map((t) => `"${t}" appears more than once`),
        'When every page has the same title, search engines struggle to know which page to show for which query.',
        'Give every page its own descriptive title.',
        'Query-level relevance',
        'quick'
      )
    );

  const ogComplete = p.ogTags.title && p.ogTags.image;
  checks.push({
    id: 'og-tags',
    label: 'Open Graph tags (social previews)',
    status: ogComplete ? 'pass' : p.ogTags.title ? 'warn' : 'warn',
    detail: ogComplete ? 'og:title and og:image present' : 'og:title/og:image incomplete',
  });
  if (!ogComplete)
    findings.push(
      finding(
        'og-tags',
        'content',
        'low',
        'Social preview cards incomplete',
        [`og:title: ${p.ogTags.title}, og:image: ${p.ogTags.image}`],
        'When your pages are shared on social or messaging apps, missing Open Graph tags produce a bare, unclickable-looking card.',
        'Add og:title, og:description and og:image to your template.',
        'Social click-through',
        'quick'
      )
    );

  const now = new Date().getFullYear();
  const fresh = p.timeElements > 0 || (p.recentYear !== null && now - p.recentYear <= 2);
  checks.push({
    id: 'freshness-signals',
    label: 'Freshness signals',
    status: fresh ? 'pass' : p.recentYear ? 'warn' : 'na',
    detail:
      p.timeElements > 0
        ? `${p.timeElements} <time> elements found`
        : p.recentYear
          ? `Most recent year found in text: ${p.recentYear}`
          : 'No dates or <time> elements found on homepage',
  });

  return { key: 'content', label: 'Content & On-Page', checks, findings };
}

// ---------------------------------------------------------------------------
// 3. AI Search / GEO / AEO Specialist
// ---------------------------------------------------------------------------
export function analyzeAi(ctx: AnalyzeContext): AnalyzerOutput {
  const checks: CheckResult[] = [];
  const findings: Finding[] = [];
  const p = ctx.homepage;

  checks.push({
    id: 'llms-txt',
    label: 'llms.txt file',
    status: ctx.llms.found ? 'pass' : 'warn',
    detail: ctx.llms.found ? `Found (${ctx.llms.bytes} bytes)` : 'No /llms.txt found (optional per the llmstxt.org proposal)',
  });
  if (!ctx.llms.found)
    findings.push(
      finding(
        'no-llms-txt',
        'ai',
        'low',
        'No llms.txt file',
        ['Request to /llms.txt returned no content'],
        'llms.txt is a young proposal for giving AI assistants a curated map of your site. It is optional today, cheap to add, and impossible to use if it does not exist.',
        'Create a simple /llms.txt listing your key pages with one-line descriptions. Guide: "How to Create an llms.txt File" in our resource center.',
        'AI assistant discoverability',
        'quick'
      )
    );

  const blocked = ctx.robots.aiCrawlers.filter((c) => c.policy === 'blocked');
  const mentionedAllowed = ctx.robots.aiCrawlers.filter((c) => c.policy === 'allowed');
  const crawlerStatus: CheckResult['status'] = blocked.length > 0 ? 'fail' : 'pass';
  checks.push({
    id: 'ai-crawler-access',
    label: 'AI crawler access (robots.txt)',
    status: !ctx.robots.found ? 'warn' : crawlerStatus,
    detail: !ctx.robots.found
      ? 'No robots.txt: AI crawlers default to allowed'
      : blocked.length
        ? `Blocked: ${blocked.map((b) => b.name).join(', ')}`
        : mentionedAllowed.length
          ? `Specific rules for: ${mentionedAllowed.map((b) => b.name).join(', ')} (not fully blocked)`
          : 'No AI crawler blocks found (default: allowed)',
  });
  if (blocked.length)
    findings.push(
      finding(
        'ai-crawlers-blocked',
        'ai',
        'high',
        'AI crawlers are blocked in robots.txt',
        blocked.map((b) => `${b.name}: ${b.detail ?? 'Disallow: /'}`),
        'You are actively telling AI search systems not to read your site. If that was intentional (e.g., staging), fine; if not, you are invisible to AI answers.',
        'Remove or narrow the Disallow rules for the AI crawlers you want reading your site.',
        'AI search visibility',
        'quick'
      )
    );

  const valuable = new Set(['Organization', 'LocalBusiness', 'WebSite', 'FAQPage', 'Article', 'BlogPosting', 'BreadcrumbList', 'Product', 'Service', 'ProfessionalService', 'Restaurant', 'HomeAndConstructionBusiness']);
  const foundTypes = p.jsonLdTypes.filter((t) => valuable.has(t));
  const uniqueTypes = [...new Set(foundTypes)];
  checks.push({
    id: 'structured-data',
    label: 'Structured data (JSON-LD)',
    status: uniqueTypes.length >= 3 ? 'pass' : uniqueTypes.length >= 1 ? 'warn' : 'fail',
    detail: uniqueTypes.length ? `Found: ${uniqueTypes.join(', ')}` : 'No JSON-LD structured data found on homepage',
  });
  if (uniqueTypes.length < 3)
    findings.push(
      finding(
        'little-schema',
        'ai',
        uniqueTypes.length === 0 ? 'high' : 'medium',
        uniqueTypes.length === 0 ? 'No structured data found' : 'Minimal structured data',
        uniqueTypes.length ? [`JSON-LD types present: ${uniqueTypes.join(', ')}`] : ['Zero application/ld+json blocks on the homepage'],
        'Structured data is machine-readable labeling that helps search engines and AI systems understand who you are, what you offer, and where you operate.',
        'Add Organization + WebSite schema sitewide, LocalBusiness schema if you serve a local area, and FAQPage where FAQs exist. See "Schema Markup Explained".',
        'Rich results and machine comprehension',
        'medium'
      )
    );

  checks.push({
    id: 'question-content',
    label: 'Question-based headings',
    status: p.questionHeadings >= 3 ? 'pass' : p.questionHeadings >= 1 ? 'warn' : 'warn',
    detail: `${p.questionHeadings} question-shaped H2/H3 headings on homepage`,
  });
  if (p.questionHeadings < 3)
    findings.push(
      finding(
        'few-question-headings',
        'ai',
        'medium',
        'Few question-shaped headings',
        [`${p.questionHeadings} question-form H2/H3 found on homepage`],
        'AI assistants gravitate to content that mirrors how people ask: "How much does X cost?", "Do you offer Y?". Question headings with a direct answer underneath are the most quotable format.',
        'Add an FAQ or Q&A section: real customer questions as headings, 2-4 sentence answers underneath.',
        'AI citation likelihood',
        'medium'
      )
    );

  const answerSignals: string[] = [];
  if (p.hasLists) answerSignals.push('bullet/numbered lists');
  if (p.hasTables) answerSignals.push('tables');
  if (p.avgParagraphWords > 0 && p.avgParagraphWords <= 90) answerSignals.push('short paragraphs');
  const answerStatus: CheckResult['status'] = answerSignals.length >= 2 ? 'pass' : answerSignals.length === 1 ? 'warn' : 'warn';
  checks.push({
    id: 'answer-format',
    label: 'Answer-friendly formatting',
    status: answerStatus,
    detail: answerSignals.length ? `Signals: ${answerSignals.join(', ')}` : 'No lists, tables, or scannable formatting detected',
  });

  const machineContact = p.telLinks > 0 || p.mailtoLinks > 0;
  checks.push({
    id: 'machine-contact',
    label: 'Machine-readable contact info',
    status: machineContact ? 'pass' : 'warn',
    detail: `${p.telLinks} tel: link(s), ${p.mailtoLinks} mailto: link(s)`,
  });
  if (!machineContact)
    findings.push(
      finding(
        'machine-contact',
        'ai',
        'low',
        'No click-to-call or email links',
        ['No tel: or mailto: links found on the homepage'],
        'Plain-text contact details are easy for humans and fragile for machines. Clickable links make your contact info unambiguous to assistants and crawlers.',
        'Use tel: and mailto: links for phone and email.',
        'Contact clarity for humans and AI',
        'quick'
      )
    );

  checks.push({
    id: 'og-ai-meta',
    label: 'Descriptive meta tags for AI summaries',
    status: p.ogTags.title && p.ogTags.description ? 'pass' : 'warn',
    detail: 'AI systems often reuse title/description/og text when describing your business',
  });

  // --- First-hand proof signals (adapted from the First-Hand Proof KB methodology,
  //     MIT-licensed Illyism/seo-skills) --------------------------------------
  const t = p.textSample;
  const proofSignals: string[] = [];
  const firstPersonTest = /we (tested|measured|benchmarked|analyzed|audited|ran|compared)|our (tests?|benchmarks?|measurements?|data|research|study|experiments?|results?)|in (our|the) lab|hands-on/i.test(t);
  if (firstPersonTest) proofSignals.push('first-person test language');
  const customerOutcomes = /case stud(y|ies)|customer (results|story|stories|success)|migrated|switched to|saved \$|\$[\d,]+ (saved|cut|reduced)|reduced .{0,30}by \d+%/i.test(t);
  if (customerOutcomes) proofSignals.push('customer outcomes / case studies');
  const aggregateNumbers = /\b\d[\d,.]*\s*(k\+|m\+|\+)?\s*(customers|users|clients|deploys|installs|projects|sites|websites|businesses|reviews|requests|events|pages)\b/i.test(t);
  if (aggregateNumbers) proofSignals.push('aggregate usage numbers');
  const benchmarks = /\b\d+(\.\d+)?\s?(ms|seconds?|fps|x faster|p9[59])\b/i.test(t);
  if (benchmarks) proofSignals.push('concrete benchmark numbers');
  const authorAttribution = p.jsonLdTypes.includes('Person') || p.jsonLdTypes.includes('Article') || p.jsonLdTypes.includes('BlogPosting');
  if (authorAttribution) proofSignals.push('author/attribution schema');

  const proofStatus: CheckResult['status'] = proofSignals.length >= 3 ? 'pass' : proofSignals.length >= 1 ? 'warn' : p.wordCount >= 300 ? 'fail' : 'na';
  checks.push({
    id: 'first-hand-proof',
    label: 'First-hand proof signals',
    status: proofStatus,
    detail: proofSignals.length
      ? `Found: ${proofSignals.join(', ')}`
      : p.wordCount >= 300
        ? `No test language, customer outcomes, benchmark numbers or author attribution on ${p.wordCount} words of content`
        : 'Not enough homepage text to evaluate',
  });
  if (proofStatus === 'fail')
    findings.push(
      finding(
        'no-first-hand-proof',
        'ai',
        'medium',
        'No first-hand proof on the homepage',
        [`${p.wordCount} words of content with zero proof signals`],
        'Pages that hold rankings and get cited by AI assistants open with concrete receipts: exact test counts, latency deltas, dollar figures, real customer outcomes. FAQ schema, fresh dates and author bios are copied by every competitor in seconds; first-hand proof is not. Pages with zero proof signals read as commodity copy to buyers and retrieval models alike.',
        'Add one concrete, verifiable claim in the first two sentences (a test result, a customer number, a price delta with a real figure) and stack 3-4 proof types across the page: benchmarks, customer outcomes, aggregate numbers, author attribution.',
        'Trust, conversion and AI citation likelihood',
        'medium'
      )
    );

  // --- AI-slop language check (adapted from the unslop-seo slop table, MIT) --
  if (p.wordCount >= 120) {
    const emDashCount = (t.match(/[\u2013\u2014]/g) ?? []).length;
    const contrastFrames = (t.match(/not just .{2,40}, (?:it'?s|but) |it'?s not .{2,40}, it'?s /gi) ?? []).length;
    const slopWords = [
      'delve', 'pivotal', 'tapestry', 'testament', 'underscore', 'seamless', 'game-changing',
      'revolutionary', 'cutting-edge', 'groundbreaking', 'next-generation', 'world-class',
      'blazing-fast', 'utilize', 'leverage the', 'in today\'s fast-paced',
    ];
    const vocabHits = slopWords.filter((w) => new RegExp(`\\b${w.replace(/ /g, '\\s+')}\\b`, 'i').test(t));
    const chatbotArtifacts = (t.match(/in this (article|post|guide), we|let'?s dive in|i hope this helps|as we have seen/gi) ?? []).length;
    const strongSignals =
      (emDashCount >= 5 ? 1 : 0) +
      (contrastFrames >= 1 ? 1 : 0) +
      (vocabHits.length >= 4 ? 1 : 0) +
      (chatbotArtifacts >= 1 ? 1 : 0);
    const slopStatus: CheckResult['status'] = strongSignals === 0 ? 'pass' : strongSignals >= 2 ? 'fail' : 'warn';
    checks.push({
      id: 'ai-slop-language',
      label: 'AI-slop language tells',
      status: slopStatus,
      detail:
        strongSignals === 0
          ? 'Copy reads human: no em-dash clusters, contrast frames, slop vocabulary or chatbot artifacts'
          : `Em/en dashes: ${emDashCount}, contrast frames: ${contrastFrames}, slop vocabulary: ${vocabHits.length ? vocabHits.slice(0, 4).join(', ') : '0'}, chatbot artifacts: ${chatbotArtifacts}`,
    });
    if (slopStatus === 'fail')
      findings.push(
        finding(
          'ai-slop-language',
          'content',
          'medium',
          'Homepage copy shows AI-generated language tells',
          [
            `Em/en dashes: ${emDashCount}`,
            contrastFrames ? `Contrast frames ("not just X, but Y"): ${contrastFrames}` : null,
            vocabHits.length ? `AI vocabulary: ${vocabHits.join(', ')}` : null,
            chatbotArtifacts ? `Chatbot artifacts: ${chatbotArtifacts}` : null,
          ].filter(Boolean) as string[],
          'Buyers and editors recognize AI filler instantly and leave; answer engines also under-quote generic prose. Em-dash clusters, "not just X, but Y" frames, puffery vocabulary ("seamless", "cutting-edge", "game-changing") and chatbot artifacts ("In this article, we\'ll explore") are the most frequent LLM punctuation and wording tells.',
          'Rewrite the flagged lines: state the fact plainly, replace puffery with numbers or mechanisms, break contrast frames, and prefer periods over em dashes. One editing pass is usually enough.',
          'Reader trust and AI quotation quality',
          'medium'
        )
      );
  }

  return { key: 'ai', label: 'AI Search Readiness', checks, findings };
}

// ---------------------------------------------------------------------------
// 4. Local SEO Specialist
// ---------------------------------------------------------------------------
export function analyzeLocal(ctx: AnalyzeContext): AnalyzerOutput {
  const checks: CheckResult[] = [];
  const findings: Finding[] = [];
  const p = ctx.homepage;

  const localTypes = p.jsonLdTypes.filter((t) =>
    /LocalBusiness|Organization|ProfessionalService|Restaurant|HomeAndConstructionBusiness|Store|HealthAndBeautyBusiness|AutomotiveBusiness/i.test(t)
  );
  const hasLocalSchema = localTypes.length > 0;
  checks.push({
    id: 'localbusiness-schema',
    label: 'LocalBusiness / Organization schema',
    status: hasLocalSchema ? 'pass' : 'warn',
    detail: hasLocalSchema ? `Found: ${[...new Set(localTypes)].join(', ')}` : 'No LocalBusiness or Organization schema on homepage',
  });
  if (!hasLocalSchema)
    findings.push(
      finding(
        'no-local-schema',
        'local',
        'medium',
        'No LocalBusiness schema markup',
        ['No LocalBusiness/Organization JSON-LD found'],
        'LocalBusiness schema spells out your name, address, phone, hours and services in a format search engines parse reliably.',
        'Add LocalBusiness JSON-LD with NAP, hours and geo coordinates. See "Schema Markup Explained".',
        'Local and AI visibility',
        'medium'
      )
    );

  checks.push({
    id: 'tel-link',
    label: 'Click-to-call link',
    status: p.telLinks > 0 ? 'pass' : 'warn',
    detail: p.telLinks > 0 ? `${p.telLinks} tel: link(s)` : 'No tel: links found',
  });
  if (p.telLinks === 0)
    findings.push(
      finding(
        'no-tel-link',
        'local',
        'medium',
        'Phone number is not click-to-call',
        ['No tel: links on the homepage'],
        'More than half of local-intent searches happen on a phone. If the number is not tappable, you lose the hottest leads.',
        'Wrap the phone number in <a href="tel:...">.',
        'Mobile lead conversion',
        'quick'
      )
    );

  checks.push({
    id: 'address-visible',
    label: 'Address visible on site',
    status: p.addressInText || p.geoMeta ? 'pass' : 'warn',
    detail: p.addressInText ? 'Street-address pattern found in page text' : p.geoMeta ? 'Geo meta tags found' : 'No street address or geo meta detected on homepage',
  });
  if (!p.addressInText && !p.geoMeta)
    findings.push(
      finding(
        'no-address',
        'local',
        'low',
        'No address found on the homepage',
        ['No street-address pattern or geo meta tags detected'],
        'Consistent NAP (name, address, phone) on your site underpins local rankings. If you are a service-area business that hides its address, make sure your service areas are stated clearly instead.',
        'Display your address (or service areas) clearly on the homepage and contact page.',
        'Local relevance signals',
        'quick'
      )
    );

  const contactPage = ctx.pages.find((pg) => /contact|about|location/i.test(pg.url));
  if (contactPage?.parsed) {
    const homepagePhone = p.telLinks > 0;
    checks.push({
      id: 'nap-consistency',
      label: 'Contact info on contact/about page',
      status: contactPage.parsed.telLinks > 0 || contactPage.parsed.phoneInText ? 'pass' : 'warn',
      detail: homepagePhone ? 'Homepage has tel link; contact page checked' : 'Contact page checked for phone presence',
    });
  } else {
    checks.push({ id: 'nap-consistency', label: 'Contact page check', status: 'na', detail: 'No contact/about page found in navigation sample' });
  }

  const locationProvided = Boolean(ctx.location);
  const locationInTitle = locationProvided ? p.title.toLowerCase().includes((ctx.location ?? '').toLowerCase().split(',')[0]) : false;
  checks.push({
    id: 'location-in-title',
    label: 'Location in title tag',
    status: !locationProvided ? 'na' : locationInTitle ? 'pass' : 'warn',
    detail: !locationProvided ? 'No location provided for this audit' : locationInTitle ? `"${ctx.location}" appears in the title` : `Title does not mention "${ctx.location}"`,
  });
  if (locationProvided && !locationInTitle)
    findings.push(
      finding(
        'location-title',
        'local',
        'medium',
        'Target location missing from homepage title',
        [`Title: "${p.title}"`, `Provided location: ${ctx.location}`],
        'For local searches, city/area names in titles remain one of the strongest relevance signals.',
        'Work your city or service area into the homepage title naturally.',
        'Local pack eligibility',
        'quick'
      )
    );

  checks.push({
    id: 'map-embed',
    label: 'Map embed / geo signals',
    status: p.mapEmbeds > 0 || p.geoMeta ? 'pass' : 'warn',
    detail: `${p.mapEmbeds} map embed(s), geo meta: ${p.geoMeta}`,
  });

  const hasReviewsSchema = p.jsonLdTypes.some((t) => /AggregateRating|Review/i.test(t));
  checks.push({
    id: 'review-signals',
    label: 'Review markup',
    status: hasReviewsSchema ? 'pass' : 'na',
    detail: hasReviewsSchema ? 'AggregateRating/Review schema found' : 'No review markup on homepage (only add markup for real, on-page reviews)',
  });

  const hasHours = /open (mon|tue|wed|thu|fri|sat|sun)|hours:/i.test(JSON.stringify(p.jsonLdRaw).slice(0, 20000)) || /mon(?:day)?[-–to ]{1,4}(?:fri|sat)/i.test('');
  checks.push({
    id: 'hours',
    label: 'Business hours',
    status: hasHours ? 'pass' : 'warn',
    detail: hasHours ? 'Hours found in structured data' : 'No opening hours detected in structured data',
  });
  if (!hasHours)
    findings.push(
      finding(
        'no-hours',
        'local',
        'low',
        'Business hours not machine-readable',
        ['No openingHours specification found'],
        'Hours in structured data (and on your Google Business Profile) feed "open now" searches, which convert extremely well.',
        'Add opening hours to your LocalBusiness schema and keep your Google Business Profile hours current.',
        '"Open now" visibility',
        'quick'
      )
    );

  return { key: 'local', label: 'Local SEO', checks, findings };
}

// ---------------------------------------------------------------------------
// 5. Performance Specialist
// ---------------------------------------------------------------------------
export function analyzePerformance(ctx: AnalyzeContext): AnalyzerOutput {
  const checks: CheckResult[] = [];
  const findings: Finding[] = [];
  const p = ctx.homepage;

  const ttfb = ctx.ttfbMs;
  checks.push({
    id: 'ttfb',
    label: 'Server response time (TTFB)',
    status: ttfb === null ? 'na' : ttfb <= 400 ? 'pass' : ttfb <= 900 ? 'warn' : 'fail',
    detail: ttfb === null ? 'Not measurable this run' : `${ttfb}ms to first byte from our crawler`,
  });
  if (ttfb !== null && ttfb > 900)
    findings.push(
      finding(
        'slow-ttfb',
        'performance',
        'high',
        `Slow server response (${ttfb}ms)`,
        [`Time to first byte: ${ttfb}ms`],
        'Everything else on the page waits for the server. A slow first byte drags down every metric Google measures, including Core Web Vitals.',
        'Add page caching, check your hosting plan, or move to a host/CDN with edge caching.',
        'Every Core Web Vital',
        'medium'
      )
    );

  const kb = Math.round(ctx.htmlBytes / 1024);
  checks.push({
    id: 'html-size',
    label: 'HTML document size',
    status: kb <= 120 ? 'pass' : kb <= 300 ? 'warn' : 'fail',
    detail: `${kb} KB of HTML ${''}`,
  });
  if (kb > 300)
    findings.push(
      finding(
        'html-bloat',
        'performance',
        'medium',
        `Large HTML document (${kb} KB)`,
        [`Homepage HTML: ${kb} KB`],
        'Oversized HTML usually means builder bloat, inline everything, or rendering the whole site into one page. Mobile users on slow connections pay for every KB.',
        'Trim unused markup, move styles to compressed external files, and audit page-builder output.',
        'Load time, especially mobile',
        'medium'
      )
    );

  const scripts = p.scriptSrcs.length;
  checks.push({
    id: 'script-count',
    label: 'External scripts',
    status: scripts <= 10 ? 'pass' : scripts <= 20 ? 'warn' : 'fail',
    detail: `${scripts} external scripts, ${p.inlineScriptCount} inline blocks`,
  });
  if (scripts > 15)
    findings.push(
      finding(
        'script-bloat',
        'performance',
        scripts > 25 ? 'high' : 'medium',
        `${scripts} external scripts loading`,
        [...p.marketingScripts.slice(0, 8), `${scripts} total external script files`],
        'Every script is a network request that can block rendering. Marketing tags stack up over the years and nobody ever removes them.',
        'Audit your tag stack: remove tools you no longer use, consolidate overlapping ones, and load the rest deferred.',
        'Load time and mobile performance',
        'medium'
      )
    );

  const headBlocking = p.scriptSrcs.length; // approximate: count of scripts (defer/async not parsed per-tag)
  checks.push({
    id: 'render-blocking',
    label: 'Render-blocking resources (approx.)',
    status: headBlocking <= 8 && p.stylesheets <= 4 ? 'pass' : headBlocking <= 16 ? 'warn' : 'fail',
    detail: `${headBlocking} scripts + ${p.stylesheets} stylesheets`,
  });

  const noLazy = p.images.filter((i) => !i.lazy);
  checks.push({
    id: 'lazy-images',
    label: 'Image lazy loading',
    status: p.images.length === 0 ? 'na' : noLazy.length <= 3 ? 'pass' : noLazy.length <= 8 ? 'warn' : 'fail',
    detail: p.images.length === 0 ? 'No images' : `${noLazy.length} of ${p.images.length} images not lazy-loaded`,
  });
  if (noLazy.length > 8)
    findings.push(
      finding(
        'no-lazy-loading',
        'performance',
        'medium',
        `${noLazy.length} images load eagerly`,
        [`${noLazy.length} of ${p.images.length} images lack loading="lazy"`],
        'Browsers download non-lazy images immediately, even ones far below the fold. On image-heavy sites this is often the single biggest fix.',
        'Add loading="lazy" to images below the fold (most CMSs can do this site-wide).',
        'Initial load time',
        'quick'
      )
    );

  const noDims = p.images.filter((i) => !i.hasDimensions);
  checks.push({
    id: 'image-dimensions',
    label: 'Image dimensions set',
    status: p.images.length === 0 ? 'na' : noDims.length / p.images.length < 0.3 ? 'pass' : 'warn',
    detail: `${noDims.length} of ${p.images.length} images missing width/height`,
  });

  const compression = ctx.headers['content-encoding'] ?? null;
  checks.push({
    id: 'perf-compression',
    label: 'Compression enabled',
    status: compression ? 'pass' : 'warn',
    detail: compression ?? 'No Content-Encoding on HTML',
  });

  checks.push({
    id: 'cache-headers',
    label: 'Cache headers',
    status: ctx.headers['cache-control'] ? 'pass' : 'warn',
    detail: ctx.headers['cache-control'] ?? 'No Cache-Control header on HTML response',
  });

  return { key: 'performance', label: 'Performance', checks, findings };
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------
export function computeCategoryScores(outputs: AnalyzerOutput[]): CategoryScore[] {
  return outputs.map((o) => {
    const counted = o.checks.filter((c) => c.status !== 'na');
    const points = counted.reduce((n, c) => n + (c.status === 'pass' ? 1 : c.status === 'warn' ? 0.5 : 0), 0);
    const score = counted.length ? Math.round((points / counted.length) * 100) : 0;
    return { key: o.key, label: o.label, score, checks: o.checks };
  });
}

export function computeOverall(scores: CategoryScore[]): number {
  const byKey = Object.fromEntries(scores.map((s) => [s.key, s.score]));
  const localNa = scores.find((s) => s.key === 'local');
  const localIsWeakData = localNa && localNa.checks.filter((c) => c.status === 'na').length >= 3;
  const weights = localIsWeakData
    ? { technical: 0.28, content: 0.28, ai: 0.23, performance: 0.21 }
    : { technical: 0.24, content: 0.24, ai: 0.2, performance: 0.18, local: 0.14 };
  let total = 0;
  let weightSum = 0;
  for (const [key, w] of Object.entries(weights)) {
    const v = (byKey as Record<string, number>)[key];
    if (typeof v === 'number') {
      total += v * w;
      weightSum += w;
    }
  }
  return weightSum ? Math.round(total / weightSum) : 0;
}

export function gradeFor(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 55) return 'D';
  return 'F';
}

export function collectPages(ctx: AnalyzeContext): PageSummary[] {
  return ctx.pages.map((pg) => ({
    url: pg.url,
    status: pg.status,
    title: pg.title,
    words: pg.words,
    ok: pg.ok,
  }));
}
