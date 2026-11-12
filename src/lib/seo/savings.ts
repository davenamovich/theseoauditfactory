// Agent 5 — Money-Saving Analyst.
// Translates audit evidence into five business-economics opportunities.
// RULES: no invented invoices, no guaranteed revenue. Every number is an
// illustrative scenario with stated assumptions the user can edit.
import type { SavingsOpportunity, Finding } from './types';
import type { AnalyzeContext, AnalyzerOutput } from './analyzers';

const BASIS =
  'Illustrative scenario, not a quote. We cannot see your invoices or contracts; edit the assumptions in the calculator below.';

export function buildSavings(ctx: AnalyzeContext, outputs: AnalyzerOutput[]): SavingsOpportunity[] {
  const p = ctx.homepage;
  const findings: Finding[] = outputs.flatMap((o) => o.findings);
  const byCode = (code: string) => findings.some((f) => f.code === code);

  // --- 1. Overlapping marketing tools --------------------------------------
  const tools = p.marketingScripts;
  const redundancySuspected = tools.filter((t) =>
    /Clarity|Hotjar|Crazy Egg|Lucky Orange|Google Analytics|Google Tag Manager|Meta \(Facebook\) Pixel|TikTok Pixel|LinkedIn Insight|X \(Twitter\) Pixel|Pinterest/i.test(t)
  );
  const toolCount = tools.length;
  const toolConfidence = redundancySuspected.length >= 3 ? 'Medium' : 'Low';
  const savings1: SavingsOpportunity = {
    id: 'tool-stack',
    title: '1. Stop paying for marketing tools you do not need',
    problem:
      'Marketing tags stack up over the years. We detected ' +
      (toolCount === 0
        ? 'no obvious marketing tools in your page code (either none, or they load elsewhere).'
        : `${toolCount} third-party marketing/analytics tool(s) running on your homepage${redundancySuspected.length ? ', including ' + redundancySuspected.slice(0, 3).join(', ') : ''}.`) +
      ' Multiple analytics or heatmap tools often measure the same thing, and multiple ad pixels often duplicate tracking.',
    evidence:
      toolCount === 0
        ? ['No recognized analytics/chat/ad scripts found in homepage HTML', 'Verify your stack in your CMS or tag manager']
        : [
            ...tools.slice(0, 8).map((t) => `Detected: ${t}`),
            `${toolCount} tools total on the homepage alone`,
          ],
    cost:
      'Analytics, heatmap, chat and automation subscriptions typically run $15-$120 per month each. Duplicate tools are pure waste; even necessary ones often sit on tiers you have outgrown or never needed.',
    fix:
      'Inventory your stack this week: keep one analytics tool (Google Analytics is free), one chat tool at most, and the ad pixels you actually advertise with. Cancel the rest. Check renewal dates before canceling to avoid paying twice.',
    savingsMin: toolCount >= 4 ? 240 : 0,
    savingsMax: toolCount >= 4 ? 1440 : toolCount >= 2 ? 480 : 240,
    basis: BASIS,
    assumptions: [
      'Assumes $20-$60/month for each redundant subscription',
      'Assumes 1-3 tools are removable without losing data you use',
    ],
    confidence: toolConfidence,
    nextStep: 'List every marketing subscription you pay for and mark which reports you actually read.',
  };

  // --- 2. Slow website ------------------------------------------------------
  const ttfb = ctx.ttfbMs ?? 0;
  const slowEvidence: string[] = [];
  let slowScore = 0;
  if (ttfb > 900) {
    slowEvidence.push(`Server response ${ttfb}ms (target: under 800ms)`);
    slowScore += 2;
  } else if (ttfb > 500) {
    slowEvidence.push(`Server response ${ttfb}ms (could be faster)`);
    slowScore += 1;
  }
  const noLazy = p.images.filter((i) => !i.lazy).length;
  if (noLazy > 8) {
    slowEvidence.push(`${noLazy} images load eagerly (no lazy loading)`);
    slowScore += 2;
  }
  if (p.scriptSrcs.length > 15) {
    slowEvidence.push(`${p.scriptSrcs.length} external scripts loading`);
    slowScore += 1;
  }
  const htmlKb = Math.round(ctx.htmlBytes / 1024);
  if (htmlKb > 300) {
    slowEvidence.push(`HTML document is ${htmlKb} KB`);
    slowScore += 1;
  }
  if (byCode('no-compression')) {
    slowEvidence.push('No text compression enabled');
    slowScore += 1;
  }
  const savings2: SavingsOpportunity = {
    id: 'speed-waste',
    title: '2. Stop wasting money on a slow website',
    problem:
      slowScore >= 2
        ? 'Your site has measurable speed problems: ' + slowEvidence.slice(0, 3).join('; ') + '. Every slow visit raises hosting/CDN bills and quietly lowers the conversion rate of the traffic you already paid for.'
        : 'Your site is not badly slow, but there are easy wins: ' + (slowEvidence.join('; ') || 'minor optimization opportunities in images and scripts') + '.',
    evidence: slowEvidence.length ? slowEvidence : [`Server response ${ttfb || 'n/a'}ms`, `${p.images.length} images, ${p.scriptSrcs.length} scripts`],
    cost:
      'Slow sites cost money twice: bigger hosting/CDN bills to serve bloated pages, and lost conversions from visitors who give up. Speed fixes are also cheaper than buying more traffic.',
    fix: 'Compress and resize images, add lazy loading, remove unused scripts, enable caching/compression, and review whether your hosting plan matches your traffic.',
    savingsMin: slowScore >= 3 ? 240 : 120,
    savingsMax: slowScore >= 3 ? 960 : 480,
    basis: BASIS,
    assumptions: [
      'Assumes a hosting/CDN upgrade-or-downgrade decision worth $10-$80/month',
      'Excludes conversion upside, which is tracked separately in the calculator',
    ],
    confidence: slowScore >= 3 ? 'High' : slowScore >= 1 ? 'Medium' : 'Low',
    nextStep: 'Run your URL through PageSpeed Insights (free) and fix the image issues first; they are usually the biggest.',
  };

  // --- 3. Convert existing traffic -----------------------------------------
  const ctaCount = p.ctaLinks.length;
  const weakCta = ctaCount < 3;
  const noForms = p.formCount === 0;
  const noTel = p.telLinks === 0;
  const convEvidence: string[] = [];
  if (weakCta) convEvidence.push(`Only ${ctaCount} clear call-to-action link(s) found on the homepage`);
  else convEvidence.push(`${ctaCount} call-to-action style links found`);
  if (noForms) convEvidence.push('No contact/quote forms detected on the homepage');
  if (noTel) convEvidence.push('Phone number is not click-to-call');
  if (byCode('thin-home')) convEvidence.push(`Homepage has only ${p.wordCount} words of persuasive text`);
  const convConfidence: SavingsOpportunity['confidence'] = weakCta || noForms ? 'Medium' : 'Low';
  const savings3: SavingsOpportunity = {
    id: 'convert-first',
    title: '3. Get more out of the traffic you already have',
    problem:
      'Before spending another dollar on ads or SEO, make sure your website converts the visitors it already gets. ' +
      (weakCta || noForms
        ? 'Right now the path from visitor to lead looks weak: ' + convEvidence.slice(0, 2).join('; ') + '.'
        : 'Your conversion path looks reasonable; small wording and placement tests can still lift it.'),
    evidence: convEvidence,
    cost:
      'Every visitor you fail to convert is marketing money already spent. If you buy traffic, a weak conversion path multiplies that waste on every click.',
    fix: 'Put one primary call to action above the fold, add a short contact/quote form on every key page, make the phone number tappable, and state your offer in the first screen.',
    savingsMin: weakCta || noForms ? 300 : 120,
    savingsMax: weakCta || noForms ? 2400 : 960,
    basis: BASIS,
    assumptions: [
      'Scenario assumes a $100-$400/month ad or marketing budget and a 20-50% relative improvement in conversion rate',
      'Illustrative only: real gains depend on your offer, pricing and traffic quality',
    ],
    confidence: convConfidence,
    nextStep: 'Open your homepage on a phone and ask: within 5 seconds, could a stranger tell what you do and how to contact you?',
  };

  // --- 4. Automate repetitive work ------------------------------------------
  const staleEvidence: string[] = [];
  if (p.recentYear !== null && new Date().getFullYear() - p.recentYear > 2)
    staleEvidence.push(`Most recent year mentioned on homepage: ${p.recentYear}`);
  if (byCode('thin-pages')) staleEvidence.push('Multiple sampled pages are thin on content');
  if (byCode('no-llms-txt')) staleEvidence.push('No llms.txt (nobody has tended to AI search setup)');
  if (byCode('little-schema')) staleEvidence.push('Structured data has not been set up');
  const automationConfidence: SavingsOpportunity['confidence'] = staleEvidence.length >= 2 ? 'Medium' : 'Low';
  const savings4: SavingsOpportunity = {
    id: 'automate-repetitive',
    title: '4. Replace repetitive agency and content chores with automation',
    problem:
      'Routine marketing work — monthly reports, social posts, content updates, SEO housekeeping — is where small businesses quietly burn hours or retainers. ' +
      (staleEvidence.length
        ? 'Signals from your site suggest this maintenance is drifting: ' + staleEvidence.slice(0, 2).join('; ') + '.'
        : 'Your site is well kept; the opportunity is keeping it that way for less effort.'),
    evidence: staleEvidence.length ? staleEvidence : ['Site structure is maintainable; recurring work (reports, posts, monitoring) can be templated'],
    cost:
      'If outsourced, content updates, posting and reporting commonly run $200-$1,000/month on retainer. If done in-house, it is hours you could bill elsewhere.',
    fix: 'Template the repeatables: a one-page monthly report, a batch of social posts per service, an SEO checklist run quarterly. Automate drafting with AI and keep human review.',
    savingsMin: 600,
    savingsMax: 3600,
    basis: BASIS,
    assumptions: [
      'Assumes 2-8 hours/month of repetitive work at a $25-$75/hour effective rate',
      'Assumes automation covers half to three quarters of that work',
    ],
    confidence: automationConfidence,
    nextStep: 'Write down what you (or your agency) do every month. Circle anything a template or a scheduled audit could do.',
  };

  // --- 5. Content engine via P&R -------------------------------------------
  const topics = p.h2s.filter((h) => h.length > 8).slice(0, 4);
  const ideas = buildContentIdeas(ctx);
  const savings5: SavingsOpportunity = {
    id: 'content-engine',
    title: '5. Create more marketing content without hiring a production team',
    problem:
      'You already have the raw material: services, photos, reviews, FAQs' +
      (topics.length ? `, and sections like "${topics[0]}"` : '') +
      '. Turning that into memes, graphics and short videos is the part most businesses never get to.',
    evidence: ideas.slice(0, 3),
    cost:
      'Agencies commonly charge $300-$1,500/month for social content packages. The Plunder & Riffle engine integrated into this app generates meme creatives, social copy, slideshows and stick-figure videos from your own site, with preview-before-publish.',
    fix: 'Use the free content studio in this app: it reads your audit, drafts the briefs, and calls the live Plunder & Riffle MCP to generate real creatives you can preview and download.',
    savingsMin: 600,
    savingsMax: 4800,
    basis: BASIS,
    assumptions: [
      'Assumes replacing part of a $50-$150/month social content package, or 4-10 hours/month of DIY design work',
      'P&R list pricing is per-generation (see the content studio); first tier of calls each month is free under P&R BYOK pricing',
    ],
    confidence: 'Medium',
    nextStep: 'Scroll to the content studio below and generate your first free sample.',
  };

  return [savings1, savings2, savings3, savings4, savings5];
}

export function buildContentIdeas(ctx: AnalyzeContext): string[] {
  const p = ctx.homepage;
  const name = ctx.businessName || ctx.host;
  const industry = ctx.industry || 'business';
  const topics = p.h2s.filter((h) => h.length > 6 && h.length < 80).slice(0, 6);
  const ideas: string[] = [];
  ideas.push(`Meme: the "before you called ${name} vs after" transformation, built from your homepage story`);
  ideas.push(`Promo graphic: "${p.h1s[0] || `${industry} done right`}" with your phone number and a strong hook`);
  if (topics[0]) ideas.push(`Short video: answer "${topics[0]}" in 30 seconds, captions on screen`);
  if (topics[1]) ideas.push(`Carousel slideshow: 5 slides walking through "${topics[1]}"`);
  ideas.push(`Stick-figure skit: a customer's day ruined by a slow website, fixed by ${name}`);
  ideas.push('Caption pack: 10 ready-to-post lines about your services and service area');
  if (topics[2]) ideas.push(`Meme series: common myths about "${topics[2]}"`);
  ideas.push('Best-of reel: your best photos/screens assembled into a countdown video');
  return ideas;
}

export function buildActionPlan(findings: Finding[], savings: SavingsOpportunity[]): { today: string[]; week: string[]; month: string[] } {
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...findings].sort((a, b) => order[a.severity] - order[b.severity]);

  const today = sorted
    .filter((f) => f.effort === 'quick' && (f.severity === 'critical' || f.severity === 'high'))
    .slice(0, 5)
    .map((f) => f.action);
  const todayExtra = sorted
    .filter((f) => f.effort === 'quick' && f.severity === 'medium')
    .slice(0, 2)
    .map((f) => f.action);

  const week = [
    ...sorted.filter((f) => f.effort === 'medium' || (f.effort === 'quick' && f.severity !== 'high' && f.severity !== 'critical')).slice(0, 4).map((f) => f.action),
    savings[2]?.nextStep,
  ].filter(Boolean) as string[];

  const month = [
    savings[0]?.nextStep,
    savings[3]?.nextStep,
    savings[4]?.nextStep,
    'Set up Google Search Console if you have not yet, submit your sitemap, and re-run this audit in 30 days to compare.',
    'Claim and complete your Google Business Profile; keep hours, services and photos current.',
  ].filter(Boolean) as string[];

  return {
    today: [...new Set([...today, ...todayExtra])].slice(0, 6),
    week: [...new Set(week)].slice(0, 5),
    month: [...new Set(month)].slice(0, 5),
  };
}
