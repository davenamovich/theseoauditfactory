// Agent orchestration — the audit pipeline.
// Agents: 1 Website Investigator, 2 Technical SEO Auditor, 3 Content Strategist,
// 4 AI Search Specialist, 4b Local SEO, 4c Performance, 5 Money-Saving Analyst,
// 6 P&R Content Creator (content studio), 7 Report Writer.
import { db } from '@/lib/db';
import { politeFetch, normalizeUrl, type FetchResult } from './fetch';
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
import type { AuditReport, Finding } from './types';

const ENGINE = 'SEO Audit Factory engine 1.0 (methodology adapted from claude-seo, MIT)';

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
  return { found: false, text: '', sitemaps: [], aiCrawlers: [] as never[] };
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
    if ((!home.ok || !home.body) && home.status !== 403 && home.status !== 401 && home.status !== 429) {
      // One retry with/without www
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
      const reason =
        home.status === 403 || home.status === 401
          ? 'The site refused our audit bot (403). Many hosts block automated crawlers; we cannot fake results, so the audit cannot run against this site from our network.'
          : home.status === 429
            ? 'The site rate-limited our crawler (429). Try again in a few minutes.'
            : home.error ?? `The site did not respond (status ${home.status ?? 'unknown'})`;
      await failAudit(auditId, reason);
      return;
    }
    const finalUrl = home.finalUrl;
    const host = safeHost(finalUrl);
    const homepage: ParsedPage = parsePage(home.body, finalUrl);
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

    const outputs: AnalyzerOutput[] = [
      analyzeTechnical(ctx),
      analyzeContent(ctx),
      analyzeAi(ctx),
      analyzeLocal(ctx),
      analyzePerformance(ctx),
    ];
    const categories = computeCategoryScores(outputs);
    const overall = computeOverall(categories);
    await db.audit
      .update({
        where: { id: auditId },
        data: {
          technicalScore: categories.find((c) => c.key === 'technical')?.score ?? null,
          contentScore: categories.find((c) => c.key === 'content')?.score ?? null,
          aiScore: categories.find((c) => c.key === 'ai')?.score ?? null,
          localScore: categories.find((c) => c.key === 'local')?.score ?? null,
          performanceScore: categories.find((c) => c.key === 'performance')?.score ?? null,
          overallScore: overall,
        },
      })
      .catch(() => undefined);

    // Stage 6 — Agent 5: Money-Saving Analyst
    await setStage(auditId, 'Agent 5 · Money-Saving Analyst: building five opportunities', 84);
    const savings = buildSavings(ctx, outputs);
    const findings: Finding[] = outputs.flatMap((o) => o.findings);
    const actionPlan = buildActionPlan(findings, savings);

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

    const report: AuditReport = {
      version: '1.0',
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
      contentIdeas: buildContentIdeas(ctx),
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
