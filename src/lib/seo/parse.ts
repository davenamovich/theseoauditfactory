// HTML parsing and extraction for the audit engine (cheerio-based).
import * as cheerio from 'cheerio';

export interface ImageInfo {
  src: string;
  alt: string | null;
  lazy: boolean;
  hasDimensions: boolean;
}

export interface LinkInfo {
  href: string;
  text: string;
  internal: boolean;
  nofollow: boolean;
  isCta: boolean;
}

export interface ParsedPage {
  title: string;
  metaDescription: string;
  metaRobots: string;
  canonical: string | null;
  viewport: string | null;
  lang: string | null;
  ogTags: { title: boolean; description: boolean; image: boolean };
  h1s: string[];
  h2s: string[];
  h3s: string[];
  questionHeadings: number;
  images: ImageInfo[];
  links: LinkInfo[];
  internalLinkCount: number;
  externalLinkCount: number;
  ctaLinks: string[];
  telLinks: number;
  mailtoLinks: number;
  formCount: number;
  jsonLdTypes: string[];
  jsonLdRaw: unknown[];
  scriptSrcs: string[];
  inlineScriptCount: number;
  marketingScripts: string[];
  stylesheets: number;
  inlineStyleBytes: number;
  wordCount: number;
  paragraphCount: number;
  avgParagraphWords: number;
  hasLists: boolean;
  hasTables: boolean;
  timeElements: number;
  recentYear: number | null;
  phoneInText: boolean;
  addressInText: boolean;
  geoMeta: boolean;
  hreflangCount: number;
  favicon: boolean;
  mapEmbeds: number;
  videoEmbeds: number;
  /** First ~20k chars of visible body text (scripts/styles stripped) for language checks. */
  textSample: string;
}

const MARKETING_SIGNATURES: Array<{ name: string; test: RegExp }> = [
  { name: 'Google Tag Manager', test: /googletagmanager\.com|gtm\.js/i },
  { name: 'Google Analytics (gtag)', test: /google-analytics\.com|gtag\/js|googletagmanager\.com\/gtag/i },
  { name: 'Microsoft Clarity', test: /clarity\.ms/i },
  { name: 'Hotjar', test: /hotjar\.com/i },
  { name: 'Meta (Facebook) Pixel', test: /connect\.facebook\.net|fbq\(/i },
  { name: 'HubSpot', test: /hs-scripts\.com|hubspot/i },
  { name: 'Intercom', test: /intercom/i },
  { name: 'Crisp Chat', test: /crisp\.chat/i },
  { name: 'Tawk.to', test: /tawk\.to/i },
  { name: 'Drift', test: /drift\.com/i },
  { name: 'Mailchimp', test: /chimpstatic|mailchimp/i },
  { name: 'Klaviyo', test: /klaviyo/i },
  { name: 'Segment', test: /segment\.com|segment\.io/i },
  { name: 'Mixpanel', test: /mixpanel/i },
  { name: 'Sentry', test: /sentry\.io|sentry-cdn/i },
  { name: 'Crazy Egg', test: /crazyegg/i },
  { name: 'Lucky Orange', test: /luckyorange/i },
  { name: 'TikTok Pixel', test: /tiktok\.com\/i18n\/pixel|ttq\./i },
  { name: 'LinkedIn Insight', test: /snap\.licdn\.com/i },
  { name: 'X (Twitter) Pixel', test: /static\.ads-twitter\.com/i },
  { name: 'Pinterest Tag', test: /pintrk|ct\.pirelli|connect\.facebook\.net.*pintrk/i },
  { name: 'Google Ads Remarketing', test: /googleadservices|doubleclick\.net/i },
  { name: 'Bing / UET Tag', test: /bat\.bing\.com|uetq/i },
  { name: 'Pinterest (pintrk)', test: /pintrk\(/i },
  { name: 'jQuery (legacy)', test: /jquery/i },
  { name: 'LiveChat', test: /livechat|lc\.chat/i },
  { name: 'Zendesk', test: /zendesk|zdassets/i },
  { name: 'Yelp conversion pixel', test: /yelp/i },
  { name: 'Nextdoor Ads', test: /nextdoor/i },
];

const CTA_TEXT =
  /(contact|book|quote|schedule|call now|call us|get a|free estimate|free quote|buy now|order|shop|sign up|get started|learn more|request|appointment|consultation|demo|try|subscribe|donate|reserve|order online|view menu|directions)/i;

const QUESTION_START =
  /^(what|why|how|when|where|which|who|is|are|can|do|does|did|should|will|was|were)\b|\?/i;

const PHONE_RE = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const ADDRESS_RE =
  /\d{1,5}\s+[\w.\-]+(\s+[\w.\-]+)*\s+(st|street|ave|avenue|rd|road|blvd|boulevard|ln|lane|dr|drive|ct|court|way|pkwy|parkway|hwy|highway|suite|ste|unit)\b\.?/i;

export function parsePage(html: string, baseUrl: string): ParsedPage {
  const $ = cheerio.load(html);
  const base = $('base[href]').attr('href');
  const resolve = (href: string): string | null => {
    try {
      return new URL(href, base ? new URL(base, baseUrl).toString() : baseUrl).toString();
    } catch {
      return null;
    }
  };

  const meta = (sel: string): string =>
    $(sel).first().attr('content')?.trim() ?? '';

  const h1s: string[] = [];
  const h2s: string[] = [];
  const h3s: string[] = [];
  $('h1').each((_, el) => {
    const t = $(el).text().replace(/\s+/g, ' ').trim();
    if (t && h1s.length < 12) h1s.push(t);
  });
  $('h2').each((_, el) => {
    const t = $(el).text().replace(/\s+/g, ' ').trim();
    if (t && h2s.length < 60) h2s.push(t);
  });
  $('h3').each((_, el) => {
    const t = $(el).text().replace(/\s+/g, ' ').trim();
    if (t && h3s.length < 80) h3s.push(t);
  });
  const questionHeadings = [...h2s, ...h3s].filter((h) => QUESTION_START.test(h)).length;

  const images: ImageInfo[] = [];
  $('img').each((_, el) => {
    if (images.length >= 120) return;
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    if (!src || src.startsWith('data:')) return;
    images.push({
      src: resolve(src) ?? src,
      alt: $(el).attr('alt')?.trim() ?? null,
      lazy: ($(el).attr('loading') || '').toLowerCase() === 'lazy',
      hasDimensions: Boolean($(el).attr('width') && $(el).attr('height')),
    });
  });

  const homeHost = safeHost(baseUrl);
  const links: LinkInfo[] = [];
  let telLinks = 0;
  let mailtoLinks = 0;
  const ctaLinks: string[] = [];
  let internalLinkCount = 0;
  let externalLinkCount = 0;
  $('a[href]').each((_, el) => {
    if (links.length >= 400) return;
    const raw = $(el).attr('href') ?? '';
    if (!raw || raw.startsWith('#') || raw.startsWith('javascript:')) return;
    const text = $(el).text().replace(/\s+/g, ' ').trim().slice(0, 90);
    const nofollow = ($(el).attr('rel') || '').toLowerCase().includes('nofollow');
    if (raw.toLowerCase().startsWith('tel:')) {
      telLinks++;
      ctaLinks.push('click-to-call (tel:) link');
      return;
    }
    if (raw.toLowerCase().startsWith('mailto:')) {
      mailtoLinks++;
      ctaLinks.push('email (mailto:) link');
      return;
    }
    const abs = resolve(raw);
    if (!abs) return;
    const internal = safeHost(abs) === homeHost;
    if (internal) internalLinkCount++;
    else externalLinkCount++;
    const isCta = CTA_TEXT.test(text) || CTA_TEXT.test(abs);
    if (isCta) ctaLinks.push(text || abs);
    links.push({ href: abs, text, internal, nofollow, isCta });
  });

  // Structured data
  const jsonLdTypes: string[] = [];
  const jsonLdRaw: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).contents().text();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      collectTypes(parsed, jsonLdTypes);
      jsonLdRaw.push(parsed);
    } catch {
      // Tolerate malformed blocks; try lenient repair (trailing commas).
      try {
        const parsed = JSON.parse(text.replace(/,\s*([}\]])/g, '$1'));
        collectTypes(parsed, jsonLdTypes);
        jsonLdRaw.push(parsed);
      } catch {
        /* ignore */
      }
    }
  });

  // Scripts
  const scriptSrcs: string[] = [];
  let inlineScriptCount = 0;
  $('script').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      scriptSrcs.push(src);
    } else if ($(el).contents().text().trim().length > 0) {
      inlineScriptCount++;
    }
  });
  const allScriptText = scriptSrcs.join(' ');
  const marketingScripts = MARKETING_SIGNATURES.filter((sig) => sig.test.test(allScriptText)).map(
    (s) => s.name
  );

  const stylesheets = $('link[rel="stylesheet"]').length;
  let inlineStyleBytes = 0;
  $('style').each((_, el) => {
    inlineStyleBytes += $(el).contents().text().length;
  });

  // Word count with scripts/styles removed
  const bodyClone = cheerio.load(html);
  bodyClone('script, style, noscript, svg').remove();
  const text = bodyClone('body').text().replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').filter(Boolean).length : 0;
  const paragraphCount = $('p').length;
  const avgParagraphWords = paragraphCount > 0 ? Math.round(words / paragraphCount) : 0;

  // Freshness
  const timeElements = $('time[datetime]').length;
  const years = [...text.matchAll(/\b(20[0-2]\d)\b/g)].map((m) => parseInt(m[1], 10)).filter((y) => y >= 2015 && y <= 2035);
  const recentYear = years.length ? Math.max(...years) : null;

  const hasGeo =
    $('meta[name="geo.position"], meta[name="geo.region"], meta[name="ICBM"], meta[property="place:location:latitude"]').length > 0;

  const mapEmbeds = $('iframe[src*="google.com/maps"], iframe[src*="maps.google"], iframe[title*="map" i]').length;
  const videoEmbeds = $('iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="wistia"]').length;

  return {
    title: $('title').first().text().replace(/\s+/g, ' ').trim(),
    metaDescription: meta('meta[name="description"]'),
    metaRobots: meta('meta[name="robots"]'),
    canonical: $('link[rel="canonical"]').first().attr('href')?.trim() ?? null,
    viewport: meta('meta[name="viewport"]') || null,
    lang: $('html').attr('lang')?.trim() ?? null,
    ogTags: {
      title: $('meta[property="og:title"]').length > 0,
      description: $('meta[property="og:description"]').length > 0,
      image: $('meta[property="og:image"]').length > 0,
    },
    h1s,
    h2s,
    h3s,
    questionHeadings,
    images,
    links,
    internalLinkCount,
    externalLinkCount,
    ctaLinks: [...new Set(ctaLinks)].slice(0, 12),
    telLinks,
    mailtoLinks,
    formCount: $('form').length,
    jsonLdTypes,
    jsonLdRaw,
    scriptSrcs,
    inlineScriptCount,
    marketingScripts,
    stylesheets,
    inlineStyleBytes,
    wordCount: words,
    paragraphCount,
    avgParagraphWords,
    hasLists: $('ul, ol').length > 0,
    hasTables: $('table').length > 0,
    timeElements,
    recentYear,
    phoneInText: PHONE_RE.test(text),
    addressInText: ADDRESS_RE.test(text),
    geoMeta: hasGeo,
    hreflangCount: $('link[rel="alternate"][hreflang]').length,
    favicon: $('link[rel*="icon"]').length > 0,
    mapEmbeds,
    videoEmbeds,
    textSample: text.slice(0, 20000),
  };
}

export function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function collectTypes(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    for (const child of node) collectTypes(child, out);
    return;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    const type = obj['@type'];
    if (typeof type === 'string') out.push(type);
    else if (Array.isArray(type)) for (const t of type) if (typeof t === 'string') out.push(t);
    if (obj['@graph']) collectTypes(obj['@graph'], out);
  }
}
