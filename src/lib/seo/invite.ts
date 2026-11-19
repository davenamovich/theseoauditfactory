// The invitation at the end of a report: "build a free bot with Muse".
//
// Copy lives here as data, not inline in JSX, so the report page, an MCP
// response and any future email all say the same thing and cannot soften it
// in one place and sharpen it in another.
//
// Two hard rules are encoded rather than remembered:
//
//   1. No destination, no button. A link that goes nowhere, or that we guessed,
//      is worse than no link: the member clicks it and we have spent their
//      attention on nothing. While MUSE_BUILD_URL is empty the block reports
//      `enabled: false` and every caller is expected to hide it.
//   2. No promise we cannot keep. The banned list below is the language that
//      turns a free allowance into a debt: guarantees, forever, unlimited,
//      "we will give you" something that is actually the provider's grant.
//      assertInviteCopy throws on all of it, and the test runs this copy
//      through it, so editing the words cannot quietly break the rule.

export interface InviteBlock {
  /** False when no destination is configured — hide the whole block. */
  enabled: boolean;
  title: string;
  body: string;
  cta: string;
  href: string;
  terms: string;
}

/**
 * The free-bot destination. Set by the operator; empty means "not configured
 * yet" and suppresses the block rather than shipping a dead link.
 */
export const MUSE_BUILD_URL = '';

export const INVITE_COPY = {
  title: 'Keep going with Muse',
  body:
    'The report above is the diagnosis. Muse is our assistant: hand it the audit and it works on the site — the fixes, the pages, and the content the audit says is missing. You can build your own bot and start on the free tier.',
  cta: 'Build a free bot with Muse',
  terms:
    'You bring a site and a decision; Muse does the drafting. Nothing gets published without your yes, and the free tier is an allowance, not a trial you have to remember to cancel.',
};

/** Language that turns an allowance into a promise we cannot keep. */
export const BANNED_PHRASES = [
  'guaranteed',
  'guarantee',
  'free forever',
  'unlimited',
  'we give you',
  "we'll give you",
  'rank #1',
  'instant results',
  'overnight',
  'no risk',
  'risk-free',
];

/** Throws if the copy makes a claim we cannot stand behind. Returns the text. */
export function assertInviteCopy(text: string): string {
  const haystack = text.toLowerCase();
  for (const bad of BANNED_PHRASES) {
    if (haystack.includes(bad)) {
      throw new Error(`invite copy contains a promise we cannot keep: "${bad}"`);
    }
  }
  return text;
}

export function buildInvite(url: string = MUSE_BUILD_URL): InviteBlock {
  const href = url.trim();
  const enabled = /^https?:\/\/[^\s]+$/.test(href);
  const copy = INVITE_COPY;
  assertInviteCopy(`${copy.title}\n${copy.body}\n${copy.cta}\n${copy.terms}`);
  return {
    enabled,
    title: copy.title,
    body: copy.body,
    cta: copy.cta,
    href: enabled ? href : '',
    terms: copy.terms,
  };
}
