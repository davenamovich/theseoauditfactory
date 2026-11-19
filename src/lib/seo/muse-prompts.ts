// Prompts for MUSE — the member's P&R assistant — built from a report the
// crawler actually measured.
//
// `agent-prompt.ts` answers "hand this to whatever agent I use". This file
// answers a narrower question: what do I say to Muse, specifically, so it
// makes content and fixes out of these exact findings. Same rule as there:
// every number, URL and evidence line comes from the report. Nothing is
// invented, and nothing is estimated.
//
// The gates travel inside every prompt (rule: a gate that only exists in prose
// is decoration). They are short on purpose — a prompt a member will not paste
// protects nothing.

import type { AuditReport, Finding } from './types';

export interface MusePrompt {
  id: string;
  title: string;
  /** One line on when to reach for this one. */
  when: string;
  prompt: string;
}

export interface MusePack {
  siteUrl: string;
  businessName?: string;
  prompts: MusePrompt[];
}

const MAX_FINDINGS = 3;
const CLAMP = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** The rules that must appear in every prompt we hand a member. */
export const MUSE_GATES = [
  'Do not invent numbers, reviews, customers or results. If you need a figure I have not given you, ask me.',
  'Show me a preview before anything is published. I approve each one.',
];

function gates(): string {
  return `RULES:\n${MUSE_GATES.map((g) => `- ${g}`).join('\n')}`;
}

function identity(report: AuditReport): string {
  const bits = [`Site: ${report.finalUrl}`];
  if (report.businessName) bits.push(`Business: ${report.businessName}`);
  if (report.industry) bits.push(`Industry: ${report.industry}`);
  if (report.location) bits.push(`Serves: ${report.location}`);
  return bits.join('\n');
}

function findingLines(findings: Finding[]): string {
  return findings
    .slice(0, MAX_FINDINGS)
    .map((f, i) => {
      const ev = f.evidence.length ? `\n   What the crawler found: ${CLAMP(f.evidence[0], 160)}` : '';
      return `${i + 1}. ${f.title}\n   Fix: ${CLAMP(f.action, 200)}${ev}`;
    })
    .join('\n');
}

/**
 * Deterministic: same report in, same pack out. The report page and any MCP
 * caller must show the same words, so nothing here reads a clock or a random.
 */
export function buildMusePack(report: AuditReport): MusePack {
  const prompts: MusePrompt[] = [];
  const problems = report.topProblems.length ? report.topProblems : report.findings;

  const technical = problems.filter((f) => f.category === 'technical' || f.category === 'performance');
  if (technical.length) {
    prompts.push({
      id: 'fix-top-three',
      title: 'Fix the top three issues on my site',
      when: 'When you want the site corrected before making anything new.',
      prompt: [
        identity(report),
        `I ran an audit and it scored ${report.scores.overall}/100 (grade ${report.grade}). These are the three it flagged hardest:`,
        findingLines(technical),
        'Work through them in this order, one at a time, and after each one tell me what changed and where.',
        gates(),
      ].join('\n\n'),
    });
  }

  const ideas = report.contentIdeas.slice(0, 5);
  if (ideas.length || problems.some((f) => f.category === 'content')) {
    const angles = ideas.length
      ? `Angles the audit says are missing:\n${ideas.map((i) => `- ${CLAMP(i, 140)}`).join('\n')}`
      : findingLines(problems.filter((f) => f.category === 'content'));
    prompts.push({
      id: 'content-week',
      title: 'Turn this audit into a week of posts',
      when: 'When the site is fine and the problem is nobody has heard of it.',
      prompt: [
        identity(report),
        angles,
        'Write five short posts for this business, one per angle. Under 120 words each, first line does the work, no hashtag soup, no "in today\'s fast-paced world".',
        'Each post ends by pointing at the page it belongs to on the site.',
        gates(),
      ].join('\n\n'),
    });
  }

  if (!report.aiReadiness.llmsTxt.found) {
    prompts.push({
      id: 'llms-txt',
      title: 'Write my /llms.txt',
      when: 'When you want assistants to be able to describe the business correctly.',
      prompt: [
        identity(report),
        'Write an /llms.txt for this site: one short paragraph on what the business does and who for, then a bullet list of the five most important pages with one line each.',
        'Use only what is on the site. If a page is unclear, leave it out rather than describe it from assumption.',
        'Return the file contents only, ready to save at /llms.txt.',
        gates(),
      ].join('\n\n'),
    });
  }

  if (report.aiReadiness.questionHeadings === 0) {
    prompts.push({
      id: 'answer-sections',
      title: 'Add the questions customers actually ask',
      when: 'When the pages are written for peers instead of buyers.',
      prompt: [
        identity(report),
        'The audit found no question-style headings on the site, which is what an assistant reads to answer "who does X near me".',
        'Suggest three questions a real customer would ask before buying, and draft a two-paragraph answer for each, using only facts already on the site.',
        gates(),
      ].join('\n\n'),
    });
  }

  return {
    siteUrl: report.finalUrl,
    businessName: report.businessName,
    prompts,
  };
}
