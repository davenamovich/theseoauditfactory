// Agent orchestration — the audit pipeline.
// Agents: 1 Website Investigator, 2 Technical SEO Auditor, 3 Content Strategist,
// 4 AI Search Specialist, 4b Local SEO, 4c Performance, 5 Money-Saving Analyst,
// 6 P&R Content Creator (content studio), 7 Report Writer.
import { db } from '@/lib/db';
import { politeFetch, normalizeUrl, detectBotBlock, type FetchResult, type BotBlockInfo } from './fetch';
import { parsePage, safeHost, type ParsedPage } from './parse';
import {
  analyzeTechnical,
  analyzeContent,
  analyzeAi,
  analyzeLocal,
  analyzePerformance,
  computeCategoryScores,
  computeOverall,
  gradeFor,
  parseRobots,
  collectPages,
  type AnalyzeContext,
  type SampledPage,
  type LinkCheck,
  type AnalyzerOutput,
} from './analyzers';
import { buildSavings, buildActionPlan, buildContentIdeas } from './savings';
import type { AuditReport, Finding, CheckResult, CategoryKey } from './types';

const ENGINE = 'SEO Audit Factory engine 1.2 (methodology adapted from claude-seo, MIT)';

// --- simple job queue with bounded concurrency ------------------------------
const queue: string[] = [];
const inFlight = new Set<string>();
let active = 0;
let concurrency = 2;

export function setConcurrency(n: number): void {
  concurrency = Math.max(1, Math.min(4, n));
}

export function enqueueAudit(auditId: string): void {
  if (inFlight.has(auditId)) return;
  inFlight.add(auditId);
  queue.push(auditId);
  pump();
}

function pump(): void {
  while (active < concurrency && queue.length > 0) {
    const id = queue.shift();
    if (!id) break;
    active++;
    runAudit(id)
      .catch((e) => console.error('[pipeline] audit failed', id, e))
      .finally(() => {
        active--;
        inFlight.delete(id);
        pump();
      });
  }
}

async function setStage(auditId: string, stage: string, progress: number): Promise<void> {
  await db.audit.update({ where: { id: auditId }, data: { stage, progress, status: 'running' } }).catch(() => undefined);
}

// --- auxiliary file fetchers -------------------------------------------------
async function fetchRobots(finalUrl: string) {
  try {
    const origin = new URL(finalUrl).origin;
    const res = await politeFetch(`${origin}/robots.txt`, { timeoutMs: 9000, maxBytes: 200_000, accept: 'text/plain,*/*' });
    if (res.ok && res.body && res.body.trim().length > 0 && !/^\s*</.test(res.body)) {
      return parseRobots(res.body);
    }
  } catch {
    /* ignore */
  }
  return { found: false, text: '', sitemaps: [], aiCrawlers: [], defaultDeny: false, assetBlocks: [] };
}

async function fetchSitemap(finalUrl: string, robotsSitemaps: string[]) {
  try {
    const origin = new URL(finalUrl).origin;
    const candidates = [
      ...robotsSitemaps.filter((s) => s.startsWith('http')),
      `${origin}/sitemap.xml`,
      `${origin}/sitemap_index.xml`,
    ].slice(0, 3);
    for (const candidate of candidates) {
      const res = await politeFetch(candidate, { timeoutMs: 9000, maxBytes: 1_000_000, accept: 'application/xml,text/xml,*/*' });
      if (res.ok && res.body && /<(urlset|sitemapindex)/i.test(res.body)) {
        const isIndex = /<sitemapindex/i.test(res.body);
        const urlCount = (res.body.match(/<loc>/g) ?? []).length;
        return { found: true, urlCount: urlCount || null, isIndex };
      }
    }
  } catch {
    /* ignore */
  }
  return { found: false, urlCount: null, isIndex: false };
}

async function fetchLlms(finalUrl: string) {
  try {
    const origin = new URL(finalUrl).origin;
    const res = await politeFetch(`${origin}/llms.txt`, { timeoutMs: 8000, maxBytes: 100_000, accept: 'text/plain,*/*' });
    if (res.ok && res.body && res.body.trim().length > 0 && !/^\s*</.test(res.body)) {
      return { found: true, bytes: res.body.length };
    }
  } catch {
    /* ignore */
  }
  return { found: false, bytes: 0 };
}

function pickSampleUrls(parsed: ParsedPage, finalUrl: string, max = 5): string[] {
  const host = safeHost(finalUrl);
  const scored: Array<{ url: string; score: number }> = [];
  const seen = new Set<string>();
  const consider = (url: string, score: number) => {
    if (seen.has(url)) return;
    if (safeHost(url) !== host) return;
    if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|css|js|ico|zip|mp4|mp3)(\?|$)/i.test(url)) return;
    seen.add(url);
    scored.push({ url, score });
  };
  for (const link of parsed.links) {
    if (!link.internal) continue;
    let score = 0;
    if (/\/(contact|about|services?|service-areas?|pricing|menu|products?|locations?)(\/|$|-)/i.test(link.href)) score = 10;
    else if (link.isCta) score = 6;
    else if (link.href.replace(/\/$/, '') === finalUrl.replace(/\/$/, '')) score = -1;
    else score = 2;
    if (score > 0) consider(link.href, score);
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map((s) => s.url);
}

async function checkLinks(parsed: ParsedPage, siteHost: string, max = 10): Promise<LinkCheck[]> {
  const internal = parsed.links.filter((l) => l.internal).map((l) => l.href);
  const external = parsed.links.filter((l) => !l.internal).map((l) => l.href);
  const picks: string[] = [];
  const seen = new Set<string>();
  for (const arr of [internal, external]) {
    for (const url of arr) {
      if (picks.length >= max) break;
      if (seen.has(url)) continue;
      if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|css|js|ico|zip|mp4|mp3)(\?|$)/i.test(url)) continue;
      seen.add(url);
      picks.push(url);
    }
    if (picks.length >= max) break;
  }
  const results = await Promise.all(
    picks.map(async (url): Promise<LinkCheck> => {
      try {
        const res = await politeFetch(url, { method: 'HEAD', timeoutMs: 8000, maxBytes: 2048 });
        let status = res.status;
        if (status !== null && (status === 405 || status === 501 || status === 403)) {
          const get = await politeFetch(url, { timeoutMs: 8000, maxBytes: 4096 });
          status = get.status;
        }
        const ok = status !== null && status >= 200 && status < 400;
        return { url, status, ok, internal: safeHost(url) === siteHost };
      } catch {
        return { url, status: null, ok: false, internal: safeHost(url) === siteHost };
      }
    })
  );
  return results;
}

// --- limited audit (site refused our crawler; never fail, never fake) --------

const LIMITED_UNMEASURED: CategoryKey[] = ['content', 'local', 'performance'];

function limitedFinding(
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

/**
 * Honest partial audit for sites that block automated crawlers (bot challenges,
 * 401/403/429) or return unparsable pages. robots.txt, sitemap and response
 * headers usually remain reachable, so those checks still run on real data.
 * Content/Local/Performance are marked unmeasured, never guessed.
 */
async function runLimitedAudit(
  auditId: string,
  audit: { url: string; host: string; businessName: string | null; industry: string | null; location: string | null },
  url: string,
  home: FetchResult,
  block: BotBlockInfo
): Promise<void> {
  try {
    await setStage(auditId, 'Agents 2-4 · Auditing what stays verifiable (robots.txt, sitemap, headers)', 55);

    const finalUrl = home.finalUrl || url;
    const host = safeHost(finalUrl) || safeHost(url);
    await db.audit.update({ where: { id: auditId }, data: { finalUrl } }).catch(() => undefined);

    // Aux files frequently bypass the bot protection guarding HTML pages.
    const [robots, llms] = await Promise.all([fetchRobots(finalUrl), fetchLlms(finalUrl)]);
    const sitemap = await fetchSitemap(finalUrl, robots.sitemaps ?? []);

    const https = finalUrl.startsWith('https://');
    const hops = home.redirectChain.length;
    const serverHeader = home.headers['server'] ?? null;
    const blockedCrawlers = robots.aiCrawlers.filter((c) => c.policy === 'blocked');

    const reasonText = block.blocked
      ? `${block.detail}. ${host} answers automated requests with a block page instead of content, so page content could not be audited.`
      : `The homepage was fetched but could not be parsed (${block.detail}), so content checks could not run.`;

    // --- technical checks (every value here is a real measurement) ---
    const tChecks: CheckResult[] = [
      {
        id: 'https',
        label: 'HTTPS secure connection',
        status: https ? 'pass' : 'fail',
        detail: https ? 'Site served over HTTPS' : 'Site served over plain HTTP',
      },
      {
        id: 'reachability',
        label: 'Server responds',
        status: home.status !== null ? 'pass' : 'fail',
        detail:
          home.status !== null
            ? `Server responded HTTP ${home.status} to our crawler${block.blocked ? ' (with bot protection)' : ''}`
            : home.error ?? 'No response',
      },
      {
        id: 'redirects',
        label: 'Redirect chain is short',
        status: hops <= 2 ? 'pass' : hops <= 4 ? 'warn' : 'fail',
        detail: hops === 0 ? 'No redirects before the response' : `${hops} redirect(s) before the response`,
      },
      {
        id: 'robots-txt',
        label: 'robots.txt present',
        status: robots.found ? 'pass' : 'fail',
        detail: robots.found
          ? 'robots.txt was reachable and was parsed'
          : 'robots.txt not reachable (blocked or missing)',
      },
      {
        id: 'robots-sitemap',
        label: 'Sitemap reachable',
        status: sitemap.found ? 'pass' : robots.sitemaps.length > 0 ? 'warn' : 'fail',
        detail: sitemap.found
          ? `Sitemap answered with ${sitemap.urlCount ?? 'unknown'} URLs`
          : robots.sitemaps.length > 0
            ? `robots.txt declares ${robots.sitemaps.length} sitemap URL(s) but they did not answer our request`
            : 'No sitemap declared or reachable',
      },
      {
        id: 'bot-access',
        label: 'Automated crawler access',
        status: block.blocked ? 'fail' : 'warn',
        detail: block.detail || 'Page content could not be read',
      },
    ];

    // --- AI search checks (robots policies are real; page checks unmeasured) ---
    const aChecks: CheckResult[] = [
      {
        id: 'llms-txt',
        label: 'llms.txt file',
        status: llms.found ? 'pass' : 'warn',
        detail: llms.found ? `Found (${llms.bytes} bytes)` : 'No /llms.txt reachable (blocked or missing)',
      },
      {
        id: 'ai-crawler-access',
        label: 'AI crawler access (robots.txt)',
        status: !robots.found ? 'warn' : blockedCrawlers.length > 0 ? 'fail' : 'pass',
        detail: !robots.found
          ? 'No robots.txt reachable: policies unknown'
          : blockedCrawlers.length
            ? `Blocked in robots.txt: ${blockedCrawlers.map((b) => b.name).join(', ')}`
            : 'No AI crawler blocks in robots.txt (default: allowed)',
      },
      {
        id: 'structured-data',
        label: 'Structured data (JSON-LD)',
        status: 'na',
        detail: 'Could not verify: page content was not readable',
      },
      {
        id: 'question-content',
        label: 'Question-based headings',
        status: 'na',
        detail: 'Could not verify: page content was not readable',
      },
      {
        id: 'answer-format',
        label: 'Answer-friendly formatting',
        status: 'na',
        detail: 'Could not verify: page content was not readable',
      },
    ];

    // --- findings (only from verifiable facts) ---
    const findings: Finding[] = [];

    const robotsStory = robots.found
      ? blockedCrawlers.length
        ? `robots.txt also blocks: ${blockedCrawlers.map((b) => b.name).join(', ')}`
        : 'robots.txt does not block AI crawlers - but the firewall blocks them in practice'
      : 'robots.txt was not reachable either';

    findings.push(
      limitedFinding(
        'bot-challenge',
        'ai',
        'critical',
        block.kind === 'challenge' ? 'Bot protection challenges automated crawlers' : 'Automated crawler access refused',
        [
          block.detail || 'Page content could not be read',
          `Response status: ${home.status ?? 'no response'}`,
          serverHeader ? `Server: ${serverHeader}` : 'Server header hidden',
          robotsStory,
        ],
        'Verified search-engine bots (like Googlebot) usually pass CDN bot checks, but most AI crawlers (GPTBot, ClaudeBot, PerplexityBot and friends) have no verified-bot status in many firewall setups - they hit the same wall we did. A wide bot wall can leave you invisible in AI answers and wrong in third-party SEO tools, without you ever seeing it in analytics.',
        'Ask whoever manages your hosting/CDN to allowlist known-good crawlers (search-engine verification and the major AI crawler user-agents) and review any "Bot Fight Mode" or challenge rules that apply to the whole site. Then re-run this audit - a full report unlocks once our crawler can read the page.',
        'AI search visibility and audit accuracy',
        'medium'
      )
    );

    if (!https)
      findings.push(
        limitedFinding(
          'no-https',
          'technical',
          'critical',
          'No HTTPS on the audited URL',
          [`Final URL scheme: ${finalUrl.startsWith('https://') ? 'https' : 'http'}`],
          'HTTPS is table stakes: browsers flag plain-HTTP pages as "Not secure" and search engines treat it as a ranking signal.',
          'Install a TLS certificate and redirect all HTTP traffic to HTTPS (many CDNs do this in one toggle).',
          'Trust, browser warnings, rankings',
          'quick'
        )
      );
    if (robots.defaultDeny)
      findings.push(
        limitedFinding(
          'default-deny-robots',
          'technical',
          'critical',
          'robots.txt blocks ALL crawlers',
          ['User-agent: * with Disallow: /'],
          'A wildcard Disallow: / tells every compliant crawler to go home - including Google. If this is not a deliberate staging setup, your site is opting out of search entirely.',
          'Remove the wildcard Disallow: / (or scope it to the staging host) and keep specific rules per crawler instead.',
          'Search visibility',
          'quick'
        )
      );
    if (blockedCrawlers.length)
      findings.push(
        limitedFinding(
          'ai-crawlers-blocked',
          'ai',
          'high',
          'AI crawlers are blocked in robots.txt',
          blockedCrawlers.map((b) => `${b.name}: ${b.detail ?? 'Disallow: /'}`),
          'You are actively telling AI search systems not to read your site. If that was intentional (e.g., staging), fine; if not, you are invisible to AI answers.',
          'Remove or narrow the Disallow rules for the AI crawlers you want reading your site.',
          'AI search visibility',
          'quick'
        )
      );
    if (!robots.found)
      findings.push(
        limitedFinding(
          'no-robots',
          'technical',
          'medium',
          'No reachable robots.txt',
          [`Request to ${new URL(finalUrl).origin}/robots.txt returned no parseable content`],
          'robots.txt tells search engines (and AI crawlers) what to crawl. Its absence is usually safe but removes your control.',
          'Publish a robots.txt that references your sitemap and, if you like, explicit AI-crawler rules.',
          'Crawl control',
          'quick'
        )
      );
    if (!sitemap.found && robots.sitemaps.length === 0)
      findings.push(
        limitedFinding(
          'no-sitemap',
          'technical',
          'medium',
          'No sitemap found',
          ['No sitemap declared in robots.txt; /sitemap.xml and /sitemap_index.xml did not answer'],
          'A sitemap is how you hand search engines your full list of important URLs. Without one, discovery relies on links alone.',
          'Publish an XML sitemap (most CMS platforms generate one) and declare it in robots.txt.',
          'Crawl coverage',
          'quick'
        )
      );
    else if (!sitemap.found && robots.sitemaps.length > 0)
      findings.push(
        limitedFinding(
          'no-sitemap',
          'technical',
          'medium',
          'Declared sitemap not reachable',
          [`robots.txt declares ${robots.sitemaps.length} sitemap URL(s), but the request was blocked`],
          'You declare a sitemap that crawlers cannot fetch - the declaration only helps when the file actually answers.',
          'Make sure the declared sitemap URLs are served without bot-protection challenges, then re-run this audit.',
          'Crawl coverage',
          'quick'
        )
      );
    if (!llms.found)
      findings.push(
        limitedFinding(
          'no-llms-txt',
          'ai',
          'low',
          'No llms.txt file',
          ['Request to /llms.txt returned no content'],
          'llms.txt is a young proposal for giving AI assistants a curated map of your site. It is optional today, cheap to add, and impossible to use if it does not exist.',
          'Create a simple /llms.txt listing your key pages with one-line descriptions.',
          'AI assistant discoverability',
          'quick'
        )
      );
    if (hops >= 4)
      findings.push(
        limitedFinding(
          'redirect-chain',
          'technical',
          'low',
          'Long redirect chain',
          [`${hops} redirects before the response`, ...home.redirectChain.slice(0, 5)],
          'Every hop adds latency and dilutes signals; crawlers follow a few redirects but users pay the wait.',
          'Point the original URL directly at the final destination and update internal links to skip the hops.',
          'Speed and crawl efficiency',
          'medium'
        )
      );

    const outputs: AnalyzerOutput[] = [
      { key: 'technical', label: 'Technical', checks: tChecks, findings: findings.filter((f) => f.category === 'technical') },
      { key: 'ai', label: 'AI Search', checks: aChecks, findings: findings.filter((f) => f.category === 'ai') },
    ];
    const categories = computeCategoryScores(outputs);
    const overall = computeOverall(categories);

    const scoreData: Record<string, number> = { overallScore: overall };
    for (const c of categories) scoreData[`${c.key}Score`] = c.score;

    await setStage(auditId, 'Agent 7 · Report Writer: assembling your limited report', 90);
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedFindings = [...findings].sort((a, b) => order[a.severity] - order[b.severity]);

    let actionPlan: ReturnType<typeof buildActionPlan> = { today: [], week: [], month: [] };
    try {
      actionPlan = buildActionPlan(findings, []);
    } catch (e) {
      console.error('[pipeline] limited actionPlan threw', e);
    }

    const aiVerdict = block.blocked
      ? blockedCrawlers.length
        ? `Blocked twice over: robots.txt blocks ${blockedCrawlers.map((c) => c.name).join(', ')} AND the firewall challenges crawlers. AI systems cannot read your site at all.`
        : 'Contradiction found: robots.txt invites AI crawlers, but the bot firewall blocks them in practice. AI systems likely cannot read your site.'
      : 'Page content could not be read in this run; robots-level policies were verified from real requests.';

    const report: AuditReport = {
      version: '1.2',
      engine: ENGINE,
      generatedAt: new Date().toISOString(),
      url,
      finalUrl,
      host,
      businessName: audit.businessName ?? undefined,
      industry: audit.industry ?? undefined,
      location: audit.location ?? undefined,
      mode: 'limited',
      limitedReason: reasonText,
      unmeasured: LIMITED_UNMEASURED,
      scores: {
        overall,
        technical: categories.find((c) => c.key === 'technical')?.score ?? 0,
        content: 0,
        ai: categories.find((c) => c.key === 'ai')?.score ?? 0,
        local: 0,
        performance: 0,
      },
      grade: gradeFor(overall),
      categories,
      findings: sortedFindings,
      topProblems: sortedFindings.slice(0, 5),
      quickWins: sortedFindings.filter((f) => f.effort === 'quick').slice(0, 6),
      savings: [],
      actionPlan,
      aiReadiness: {
        llmsTxt: llms,
        crawlers: robots.aiCrawlers,
        schemaTypes: [],
        questionHeadings: 0,
        answerFormatSignals: [],
        verdict: aiVerdict,
      },
      performance: {
        ttfbMs: null,
        htmlBytes: 0,
        externalScripts: 0,
        marketingScripts: [],
        stylesheets: 0,
        images: 0,
        imagesNoLazy: 0,
        imagesNoDimensions: 0,
        renderBlockingHead: 0,
        compression: null,
        dataNotes: 'Not measured in this run: the site did not let our crawler read the page.',
      },
      pages: [],
      contentIdeas: [],
      robotsTxt: { found: robots.found, sitemapDeclared: robots.sitemaps.length > 0, aiCrawlers: robots.aiCrawlers },
      sitemap: { found: sitemap.found, urlCount: sitemap.urlCount },
      redirectChain: home.redirectChain,
      notes: [
        'LIMITED AUDIT: this site blocks automated crawlers, so page content could not be read. Findings cover only what was verifiable: robots.txt, sitemap, response headers and redirects.',
        'Nothing in this report is estimated or faked. Categories marked N/A were not measurable.',
        'Re-run the audit after allowing our crawler (user-agent SeoAuditFactoryBot) and the full report unlocks automatically.',
        'This audit is based on real requests made by our crawler to your public pages at audit time.',
      ],
    };

    await db.audit.update({
      where: { id: auditId },
      data: {
        status: 'completed',
        stage: 'Limited report ready',
        progress: 100,
        completedAt: new Date(),
        ...scoreData,
        report: report as unknown as object,
        error: null,
      },
    });
    await db.auditFinding
      .createMany({
        data: sortedFindings.map((f) => ({
          auditId,
          code: f.code,
          category: f.category,
          severity: f.severity,
          title: f.title,
        })),
      })
      .catch(() => undefined);
  } catch (err) {
    console.error('[pipeline] limited audit threw', err);
    await failAudit(auditId, err instanceof Error ? err.message : 'Unexpected audit error');
  }
}

// --- main pipeline -----------------------------------------------------------
async function runAudit(auditId: string): Promise<void> {
  const audit = await db.audit.findUnique({ where: { id: auditId } });
  if (!audit || audit.status === 'completed') return;

  const usageMeta = { host: audit.host };
  try {
    await db.usageEvent.create({ data: { kind: 'audit_start', ref: auditId, meta: usageMeta } });
  } catch {
    /* ignore */
  }

  let url: string;
  try {
    url = normalizeUrl(audit.url);
  } catch (e) {
    await failAudit(auditId, e instanceof Error ? e.message : 'Invalid URL');
    return;
  }

  try {
    // Stage 1 — Agent 1: Website Investigator
    await setStage(auditId, 'Agent 1 · Website Investigator: fetching homepage', 8);
    let home: FetchResult = await politeFetch(url, { maxBytes: 2_500_000 });
    const firstBlock = detectBotBlock(home);
    if ((!home.ok || !home.body) && !firstBlock.blocked) {
      // One retry with/without www (only when not bot-blocked; a challenge or
      // refusal repeats for every host variant and just costs time)
      try {
        const u = new URL(url);
        const alt = u.hostname.startsWith('www.') ? url.replace('//www.', '//') : url.replace('//', '//www.');
        const altRes = await politeFetch(alt, { maxBytes: 2_500_000 });
        if (altRes.ok && altRes.body) home = altRes;
      } catch {
        /* ignore */
      }
    }
    if (!home.ok || !home.body) {
      const block = detectBotBlock(home);
      if (block.blocked) {
        // The site refuses automated crawlers (bot challenge, 401/403/429).
        // We never fake results - but robots.txt, sitemap and headers often
        // remain reachable, so produce an honest LIMITED audit instead of a
        // dead-end failure.
        await runLimitedAudit(auditId, audit, url, home, block);
        return;
      }
      const reason =
        home.error
          ? `We could not reach ${safeHost(url) || url}: ${home.error}`
          : `The site did not respond (status ${home.status ?? 'unknown'})`;
      await failAudit(auditId, reason);
      return;
    }
    const finalUrl = home.finalUrl;
    const host = safeHost(finalUrl);
    let homepage: ParsedPage;
    try {
      homepage = parsePage(home.body, finalUrl);
    } catch (parseErr) {
      // Malformed/unparsable HTML: degrade to a limited audit rather than fail.
      console.error('[pipeline] homepage parse failed', parseErr);
      await runLimitedAudit(auditId, audit, url, home, {
        blocked: false,
        kind: null,
        detail: 'The homepage was fetched but could not be parsed',
      });
      return;
    }
    await db.audit.update({ where: { id: auditId }, data: { finalUrl } }).catch(() => undefined);

    // Stage 2 — Agent 2: Technical scout (auxiliary files)
    await setStage(auditId, 'Agent 2 · Technical Auditor: robots.txt, sitemap, llms.txt', 24);
    const [robots, llms] = await Promise.all([fetchRobots(finalUrl), fetchLlms(finalUrl)]);
    const sitemap = await fetchSitemap(finalUrl, robots.sitemaps ?? []);

    // Stage 3 — Agent 1b: sample internal pages (parallel)
    await setStage(auditId, 'Agent 1 · Investigator: sampling internal pages', 40);
    const sampleUrls = pickSampleUrls(homepage, finalUrl, 5);
    const pages: SampledPage[] = await Promise.all(
      sampleUrls.map(async (u): Promise<SampledPage> => {
        const res = await politeFetch(u, { maxBytes: 800_000, timeoutMs: 12000 });
        if (!res.ok || !res.body) return { url: u, status: res.status, ok: false, words: 0, title: '', parsed: null };
        const parsed = parsePage(res.body, res.finalUrl);
        return { url: res.finalUrl, status: res.status, ok: true, words: parsed.wordCount, title: parsed.title, parsed };
      })
    );

    // Stage 4 — link checks
    await setStage(auditId, 'Agent 2 · Auditor: verifying sampled links', 56);
    const linkChecks = await checkLinks(homepage, host, 10);

    // Stage 5 — specialist analyzers (parallel, pure computation)
    await setStage(auditId, 'Agents 3-4 · Content + AI Search specialists analyzing', 68);
    const ctx: AnalyzeContext = {
      url,
      finalUrl,
      host,
      status: home.status,
      headers: home.headers,
      ttfbMs: home.ttfbMs,
      htmlBytes: home.bytes,
      redirectChain: home.redirectChain,
      homepage,
      robots,
      sitemap,
      llms,
      pages,
      linkChecks,
      businessName: audit.businessName ?? undefined,
      industry: audit.industry ?? undefined,
      location: audit.location ?? undefined,
    };

    // Each analyzer is independent: a throw in one must not kill the audit.
    const analyzerFns: Array<{ key: AnalyzerOutput['key']; fn: (c: AnalyzeContext) => AnalyzerOutput }> = [
      { key: 'technical', fn: analyzeTechnical },
      { key: 'content', fn: analyzeContent },
      { key: 'ai', fn: analyzeAi },
      { key: 'local', fn: analyzeLocal },
      { key: 'performance', fn: analyzePerformance },
    ];
    const outputs: AnalyzerOutput[] = [];
    const unmeasured: AnalyzerOutput['key'][] = [];
    for (const { key, fn } of analyzerFns) {
      try {
        outputs.push(fn(ctx));
      } catch (e) {
        console.error(`[pipeline] analyzer ${key} threw`, e);
        unmeasured.push(key);
      }
    }
    const categories = computeCategoryScores(outputs);
    const overall = computeOverall(categories);
    const scoreData: Record<string, number> = { overallScore: overall };
    for (const c of categories) scoreData[`${c.key}Score`] = c.score;
    await db.audit
      .update({
        where: { id: auditId },
        data: scoreData,
      })
      .catch(() => undefined);

    // Stage 6 — Agent 5: Money-Saving Analyst
    await setStage(auditId, 'Agent 5 · Money-Saving Analyst: building five opportunities', 84);
    const findings: Finding[] = outputs.flatMap((o) => o.findings);
    let savings: ReturnType<typeof buildSavings> = [];
    try {
      savings = buildSavings(ctx, outputs);
    } catch (e) {
      console.error('[pipeline] buildSavings threw', e);
    }
    let actionPlan: ReturnType<typeof buildActionPlan> = { today: [], week: [], month: [] };
    try {
      actionPlan = buildActionPlan(findings, savings);
    } catch (e) {
      console.error('[pipeline] buildActionPlan threw', e);
    }

    // Stage 7 — Agent 7: Report Writer
    await setStage(auditId, 'Agent 7 · Report Writer: assembling your report', 94);
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedFindings = [...findings].sort((a, b) => order[a.severity] - order[b.severity]);
    const quickWins = sortedFindings.filter((f) => f.effort === 'quick').slice(0, 6);

    const blockedCrawlers = robots.aiCrawlers.filter((c) => c.policy === 'blocked');
    const aiVerdict = blockedCrawlers.length
      ? `Action needed: robots.txt blocks ${blockedCrawlers.map((c) => c.name).join(', ')}.`
      : homepage.jsonLdTypes.length === 0
        ? 'Crawlers can read your site, but there is little machine-readable structure to quote from.'
        : 'Solid baseline for AI search; strengthen answer-shaped content to become the cited source.';

    const notes: string[] = [
      'This audit is based on real requests made by our crawler to your public pages at audit time.',
      'Performance numbers are lab-style measurements from our server (single run, single location), not Google field data (CrUX). Connect Google APIs for field data.',
      'We test a sample of links and pages, not the whole site.',
      'Some sites block audit bots; scores reflect what we could actually fetch.',
    ];

    let contentIdeas: string[] = [];
    try {
      contentIdeas = buildContentIdeas(ctx);
    } catch (e) {
      console.error('[pipeline] buildContentIdeas threw', e);
    }

    const report: AuditReport = {
      version: '1.2',
      engine: ENGINE,
      generatedAt: new Date().toISOString(),
      url,
      finalUrl,
      host,
      businessName: audit.businessName ?? undefined,
      industry: audit.industry ?? undefined,
      location: audit.location ?? undefined,
      homeTitle: homepage.title || undefined,
      homeDescription: homepage.metaDescription || undefined,
      homeH1: homepage.h1s[0] || undefined,
      mode: 'full',
      unmeasured: unmeasured.length ? unmeasured : undefined,
      scores: {
        overall,
        technical: categories.find((c) => c.key === 'technical')?.score ?? 0,
        content: categories.find((c) => c.key === 'content')?.score ?? 0,
        ai: categories.find((c) => c.key === 'ai')?.score ?? 0,
        local: categories.find((c) => c.key === 'local')?.score ?? 0,
        performance: categories.find((c) => c.key === 'performance')?.score ?? 0,
      },
      grade: gradeFor(overall),
      categories,
      findings: sortedFindings,
      topProblems: sortedFindings.slice(0, 5),
      quickWins,
      savings,
      actionPlan,
      aiReadiness: {
        llmsTxt: llms,
        crawlers: robots.aiCrawlers,
        schemaTypes: [...new Set(homepage.jsonLdTypes)],
        questionHeadings: homepage.questionHeadings,
        answerFormatSignals: [
          ...(homepage.hasLists ? ['lists'] : []),
          ...(homepage.hasTables ? ['tables'] : []),
          ...(homepage.formCount > 0 ? ['forms'] : []),
        ],
        verdict: aiVerdict,
      },
      performance: {
        ttfbMs: home.ttfbMs,
        htmlBytes: home.bytes,
        externalScripts: homepage.scriptSrcs.length,
        marketingScripts: homepage.marketingScripts,
        stylesheets: homepage.stylesheets,
        images: homepage.images.length,
        imagesNoLazy: homepage.images.filter((i) => !i.lazy).length,
        imagesNoDimensions: homepage.images.filter((i) => !i.hasDimensions).length,
        renderBlockingHead: homepage.scriptSrcs.length + homepage.stylesheets,
        compression: home.headers['content-encoding'] ?? null,
        dataNotes:
          'Measured from our crawler: single server, single run. Total page weight (images/video) is estimated from counts, not full asset downloads.',
      },
      pages: collectPages(ctx),
      contentIdeas,
      robotsTxt: { found: robots.found, sitemapDeclared: robots.sitemaps.length > 0, aiCrawlers: robots.aiCrawlers },
      sitemap: { found: sitemap.found, urlCount: sitemap.urlCount },
      redirectChain: home.redirectChain,
      notes,
    };

    // Progress comparison vs the previous completed audit of the same host
    // (used by the "Fix, re-run, compare" loop). Only real stored results are
    // compared - never estimated ones.
    try {
      const previous = await db.audit.findFirst({
        where: { host, status: 'completed', id: { not: auditId }, report: { not: null } },
        orderBy: { completedAt: 'desc' },
      });
      const prevReport = previous?.report as AuditReport | null;
      if (previous?.completedAt && prevReport?.scores) {
        const prevCodes = new Set((prevReport.findings ?? []).map((f) => f.code));
        const currentCodes = new Set(findings.map((f) => f.code));
        report.comparison = {
          previousRunAt: previous.completedAt.toISOString(),
          previousOverall: prevReport.scores.overall,
          deltas: {
            overall: overall - prevReport.scores.overall,
            technical: report.scores.technical - prevReport.scores.technical,
            content: report.scores.content - prevReport.scores.content,
            ai: report.scores.ai - prevReport.scores.ai,
            local: report.scores.local - prevReport.scores.local,
            performance: report.scores.performance - prevReport.scores.performance,
          },
          fixedFindings: [...prevCodes].filter((c) => !currentCodes.has(c)).slice(0, 12),
          newFindings: [...currentCodes].filter((c) => !prevCodes.has(c)).slice(0, 12),
        };
      }
    } catch {
      /* comparison is best-effort */
    }

    await db.audit.update({
      where: { id: auditId },
      data: {
        status: 'completed',
        stage: 'Report ready',
        progress: 100,
        completedAt: new Date(),
        report: report as unknown as object,
        error: null,
      },
    });
    await db.auditFinding
      .createMany({
        data: sortedFindings.map((f) => ({
          auditId,
          code: f.code,
          category: f.category,
          severity: f.severity,
          title: f.title,
        })),
      })
      .catch(() => undefined);
  } catch (err) {
    await failAudit(auditId, err instanceof Error ? err.message : 'Unexpected audit error');
  }
}

async function failAudit(auditId: string, message: string): Promise<void> {
  await db.audit
    .update({
      where: { id: auditId },
      data: { status: 'failed', stage: 'Audit failed', error: message.slice(0, 500), completedAt: new Date() },
    })
    .catch(() => undefined);
}
