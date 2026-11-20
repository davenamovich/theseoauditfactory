import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildMusePack, MUSE_GATES } from './muse-prompts.ts';
import {
  assertInviteCopy,
  buildInvite,
  inviteHref,
  resolveRef,
  BANNED_PHRASES,
  INVITE_BASE,
  INVITE_COPY,
  INVITE_REF_OK,
} from './invite.ts';
import type { AuditReport, Finding } from './types.ts';

const finding = (over: Partial<Finding>): Finding => ({
  code: 'x',
  category: 'technical',
  severity: 'high',
  title: 'Missing canonical tag',
  evidence: ['<head> has no rel="canonical"'],
  explanation: 'Duplicate content risk.',
  action: 'Add a rel="canonical" pointing at the preferred URL.',
  impact: 'Consolidates ranking signals.',
  effort: 'quick',
  ...over,
});

const report = (over: Partial<AuditReport> = {}): AuditReport =>
  ({
    version: '1',
    engine: 'test',
    generatedAt: '2026-01-01T00:00:00.000Z',
    url: 'https://example.com',
    finalUrl: 'https://example.com',
    host: 'example.com',
    businessName: 'Example Co',
    scores: { overall: 61, technical: 55, content: 60, ai: 40, local: 50, performance: 70 },
    grade: 'C',
    categories: [],
    findings: [finding({})],
    topProblems: [finding({})],
    quickWins: [],
    savings: [],
    actionPlan: { today: [], week: [], month: [] },
    aiReadiness: {
      llmsTxt: { found: false, bytes: 0 },
      crawlers: [],
      schemaTypes: [],
      questionHeadings: 0,
      answerFormatSignals: [],
      verdict: '',
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
      dataNotes: '',
    },
    pages: [],
    contentIdeas: [],
    robotsTxt: { found: true, sitemapDeclared: true, aiCrawlers: [] },
    sitemap: { found: true, urlCount: 10 },
    redirectChain: [],
    notes: [],
    ...over,
  }) as AuditReport;

test('the fix prompt carries the measured score, the fix and both gates', () => {
  const pack = buildMusePack(report());
  const fix = pack.prompts.find((p) => p.id === 'fix-top-three');
  assert.ok(fix, 'a technical finding must produce the fix prompt');
  assert.match(fix!.prompt, /https:\/\/example\.com/);
  assert.match(fix!.prompt, /61\/100/);
  assert.match(fix!.prompt, /rel="canonical"/);
  for (const gate of MUSE_GATES) assert.ok(fix!.prompt.includes(gate), `missing gate: ${gate}`);
});

test('no technical findings, no fix prompt — the pack describes this site, not a generic one', () => {
  const contentOnly = finding({ category: 'content', title: 'Thin homepage copy' });
  const pack = buildMusePack(report({ findings: [contentOnly], topProblems: [contentOnly] }));
  assert.equal(pack.prompts.some((p) => p.id === 'fix-top-three'), false);
  assert.equal(pack.prompts.some((p) => p.id === 'content-week'), true);
});

test('llms.txt and question-heading prompts appear only when the audit says they are missing', () => {
  const missing = buildMusePack(report()).prompts.map((p) => p.id);
  assert.ok(missing.includes('llms-txt'));
  assert.ok(missing.includes('answer-sections'));

  const present = buildMusePack(
    report({
      aiReadiness: {
        llmsTxt: { found: true, bytes: 900 },
        crawlers: [],
        schemaTypes: ['Organization'],
        questionHeadings: 4,
        answerFormatSignals: [],
        verdict: '',
      },
    })
  ).prompts.map((p) => p.id);
  assert.equal(present.includes('llms-txt'), false);
  assert.equal(present.includes('answer-sections'), false);
});

test('content ideas from the audit become the angles, not invented ones', () => {
  const pack = buildMusePack(report({ contentIdeas: ['Pricing explained plainly', 'What a site audit covers'] }));
  const content = pack.prompts.find((p) => p.id === 'content-week');
  assert.ok(content);
  assert.match(content!.prompt, /Pricing explained plainly/);
  assert.match(content!.prompt, /What a site audit covers/);
});

test('same report in, same pack out', () => {
  assert.deepEqual(buildMusePack(report()), buildMusePack(report()));
});

test('with no ref the invite still works — attribution is the bonus, not the requirement', () => {
  const invite = buildInvite();
  assert.equal(invite.enabled, true);
  assert.equal(invite.href, 'https://whop.plunderandriffle.com/');
  assert.equal(invite.ref, null);
  assert.equal(invite.refRejected, false);
});

test('a sharer\'s ref rides on the link, which is the whole point', () => {
  const invite = buildInvite('745596535');
  assert.equal(invite.href, 'https://whop.plunderandriffle.com/?ref=745596535');
  assert.equal(invite.ref, '745596535');
  assert.equal(invite.refRejected, false);
});

test('a bad ref is dropped, never pasted through, and the drop is visible', () => {
  for (const bad of ['a b', '../../etc', 'ref=1&x=2', 'x'.repeat(65), '']) {
    const invite = buildInvite(bad);
    assert.equal(invite.enabled, true, `still a working link for ${JSON.stringify(bad)}`);
    assert.equal(invite.href, 'https://whop.plunderandriffle.com/');
    assert.equal(invite.ref, null);
  }
  const rejected = buildInvite('a b');
  assert.equal(rejected.refRejected, true, 'callers must be able to see the code was not used');
  assert.equal(buildInvite('').refRejected, false, 'no code at all is not a rejection');
});

test('the base and the code pattern match the engine, where Dave settled them', () => {
  // bot/src/lib/gift-cta.ts: GIFT_SITE and REF_OK. Copied, not re-derived.
  assert.equal(INVITE_BASE, 'https://whop.plunderandriffle.com');
  assert.equal(INVITE_REF_OK.source, /^[A-Za-z0-9._-]{1,64}$/.source);
  assert.equal(INVITE_REF_OK.test('49YNE2'), true);
  assert.equal(INVITE_REF_OK.test('a.b_c-d'), true);
});

test('ref precedence: what the caller said beats what the URL said, and the basis is named', () => {
  assert.deepEqual(resolveRef({ argument: '745596535', url: '999' }), { ref: '745596535', basis: 'argument' });
  assert.deepEqual(resolveRef({ argument: 'bad code', url: '999' }), { ref: '999', basis: 'url' });
  assert.deepEqual(resolveRef({}), { ref: null, basis: 'none' });
  assert.deepEqual(resolveRef({ argument: '  ', url: null }), { ref: null, basis: 'none' });
});

test('every P&R link variant keeps the ref — none of them loses the sharer', () => {
  assert.match(inviteHref('ABC'), /\?ref=ABC$/);
  assert.equal(inviteHref('', 'https://whop.plunderandriffle.com'), 'https://whop.plunderandriffle.com/');
  assert.match(inviteHref('ABC', 'https://whop.plunderandriffle.com/checkout?x=1'), /x=1&ref=ABC$/);
});

test('the shipped copy makes no promise we cannot keep', () => {
  for (const value of Object.values(INVITE_COPY)) assert.doesNotThrow(() => assertInviteCopy(value));
});

test('the guard actually bites on every banned phrase', () => {
  for (const bad of BANNED_PHRASES) {
    assert.throws(() => assertInviteCopy(`This is ${bad} for your site.`), /promise we cannot keep/);
  }
});
