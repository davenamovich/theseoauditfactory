// Personalized agent prompt, assembled 100% from the user's real audit results.
// Deterministic by design: every line comes from measured findings, scores and
// evidence in the AuditReport - nothing is invented. The user copies this and
// hands it to their own AI agent (Agent 37, ChatGPT, Claude, Cursor...).

import type { AuditReport, Finding } from './types';

const MAX_FINDINGS = 8;
const MAX_EVIDENCE = 2;
const CLAMP = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

const CATEGORY_LABEL: Record<string, string> = {
  technical: 'technical',
  content: 'content',
  ai: 'AI-search readiness',
  local: 'local SEO',
  performance: 'performance',
};

function scoreLines(report: AuditReport): string[] {
  const lines: string[] = [`OVERALL: ${report.scores.overall}/100 (grade ${report.grade})`];
  const measured = report.categories.filter(
    (c) => !(report.unmeasured ?? []).includes(c.key)
  );
  for (const c of measured) {
    lines.push(`${CATEGORY_LABEL[c.key] ?? c.key}: ${c.score}/100`);
  }
  return lines;
}

function findingBlock(f: Finding, index: number): string {
  const parts: string[] = [
    `${index + 1}. [${f.severity.toUpperCase()} · ${CATEGORY_LABEL[f.category] ?? f.category} · effort: ${f.effort}] ${f.title}`,
    `   Fix: ${CLAMP(f.action, 240)}`,
    `   Why it matters: ${CLAMP(f.impact, 200)}`,
  ];
  if (f.evidence.length) {
    parts.push(
      `   Evidence found by the crawler: ${f.evidence
        .slice(0, MAX_EVIDENCE)
        .map((e) => CLAMP(e, 160))
        .join(' | ')}`
    );
  }
  return parts.join('\n');
}

function aiGroundRules(report: AuditReport): string[] {
  const rules: string[] = [];
  const blocked = report.aiReadiness.crawlers.filter((c) => c.policy === 'blocked').map((c) => c.name);
  if (blocked.length) {
    rules.push(
      `robots.txt currently BLOCKS these AI crawlers: ${blocked.join(', ')}. Change them to allowed (except anything that must stay gated), so assistants can recommend the business.`
    );
  }
  if (!report.aiReadiness.llmsTxt.found) {
    rules.push(
      'Create /llms.txt at the site root: one short paragraph describing the business, then a bullet list of the most important pages with one-line descriptions.'
    );
  }
  if (!report.sitemap.found || !report.robotsTxt.sitemapDeclared) {
    rules.push(
      !report.sitemap.found
        ? 'Publish an XML sitemap and reference it from robots.txt.'
        : 'A sitemap exists but robots.txt does not declare it - add the Sitemap: line to robots.txt.'
    );
  }
  const schema = report.aiReadiness.schemaTypes;
  if (schema.length) {
    rules.push(`Structured data already present: ${schema.join(', ')}. Keep those blocks valid while editing.`);
  } else {
    rules.push('No structured data was detected - add JSON-LD (Organization + the relevant service/product types) to the homepage.');
  }
  return rules;
}

export function buildAgentPrompt(report: AuditReport): string {
  const findings = (report.topProblems.length ? report.topProblems : report.findings)
    .slice(0, MAX_FINDINGS);
  const target = Math.min(90, report.scores.overall + 15);

  const sections: string[] = [];

  sections.push(
    [
      'You are my web and SEO agent.',
      `Site to work on: ${report.finalUrl}`,
      report.businessName ? `Business: ${report.businessName}` : '',
      report.industry ? `Industry: ${report.industry}` : '',
      report.location ? `Serves: ${report.location}` : '',
      'I already ran a professional SEO audit on this exact site. Everything below is measured data from that audit - treat it as the source of truth and do not re-guess.',
    ]
      .filter(Boolean)
      .join('\n')
  );

  sections.push(`AUDIT RESULTS (verified):\n${scoreLines(report).map((l) => `- ${l}`).join('\n')}`);

  if (report.mode === 'limited') {
    sections.push(
      `IMPORTANT - LIMITED AUDIT: the site blocked the crawler (${CLAMP(
        report.limitedReason ?? 'bot protection',
        200
      )}). Content-level findings could not be fully verified, so check the live pages/CMS before acting on anything below.`
    );
  }

  if (findings.length) {
    sections.push(
      `PRIORITY FIXES (in this order):\n${findings.map((f, i) => findingBlock(f, i)).join('\n\n')}`
    );
  } else {
    sections.push(
      'PRIORITY FIXES: none - the audit found no open issues. Focus on the growth work below.'
    );
  }

  const wins = report.quickWins.map((f) => f.title).slice(0, 5);
  if (wins.length) {
    sections.push(`DO THESE FIRST (quick wins): ${wins.join(' · ')}`);
  }

  const plan = report.actionPlan;
  const planLines = [
    plan.today.length ? `- Today: ${plan.today.join('; ')}` : '',
    plan.week.length ? `- This week: ${plan.week.join('; ')}` : '',
    plan.month.length ? `- This month: ${plan.month.join('; ')}` : '',
  ].filter(Boolean);
  if (planLines.length) {
    sections.push(`TIMELINE from the audit:\n${planLines.join('\n')}`);
  }

  const aiRules = aiGroundRules(report);
  if (aiRules.length) {
    sections.push(`AI-SEARCH GROUND RULES (measured on this site):\n${aiRules.map((r) => `- ${r}`).join('\n')}`);
  }

  sections.push(
    [
      'HOW TO WORK:',
      '- Make changes reversibly, one change at a time; never break existing pages or redirects.',
      `- When the work is done, re-run the same free audit and compare - target ${target}+ overall (now ${report.scores.overall}).`,
      'Report back with: what you changed, where (URLs/files), and the expected score impact of each change.',
    ].join('\n')
  );

  return sections.join('\n\n');
}
