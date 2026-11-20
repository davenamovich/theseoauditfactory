// The invitation at the end of a report: "build a free bot with Muse".
//
// Copy lives here as data, not inline in JSX, so the report page, the MCP
// response and any future email say the same thing and cannot soften it in one
// place and sharpen it in another.
//
// ── Attribution ─────────────────────────────────────────────────────────────
// The link carries the *sharer's* ref, so a member who runs an audit and sends
// the report to a prospect is credited when that prospect signs up. That is the
// whole lead-gen loop: the report is the asset, the ref is who to thank.
//
// The URL convention is not invented here — it is copied from the engine, where
// Dave settled it on 2026-11-17 ("Whop is the front door; ref stays on the link
// so a sharer is still attributed"):
//
//   base   https://whop.plunderandriffle.com   (bot/src/lib/gift-cta.ts GIFT_SITE)
//   param  ?ref=<code>
//   code   /^[A-Za-z0-9._-]{1,64}$/            (REF_OK, same file)
//
// Two implementations of one convention drift, and the one that drifts 404s a
// signed-up customer into an unattributed sale. So the base and the pattern are
// constants here and the test asserts them against the engine's values.
//
// ── Two rules encoded, not remembered ───────────────────────────────────────
//   No destination, no button: if the href cannot be built the block reports
//   `enabled: false` and callers hide it. No guessed links, no dead ends.
//
//   No promise we cannot keep: the banned list below is the language that turns
//   an allowance into a debt. assertInviteCopy throws on all of it, and the test
//   runs this copy through the guard, so editing these words cannot quietly
//   break the rule.

export interface InviteBlock {
  /** False when no destination could be built — hide the whole block. */
  enabled: boolean;
  title: string;
  body: string;
  cta: string;
  href: string;
  terms: string;
  /** The ref that actually made it onto the link, or null. */
  ref: string | null;
  /** True when a ref was supplied but rejected, so a caller can see the miss. */
  refRejected: boolean;
}

/** The front door. Same value as bot/src/lib/gift-cta.ts GIFT_SITE. */
export const INVITE_BASE = 'https://whop.plunderandriffle.com';

/**
 * The code charset, copied from the engine's REF_OK. Deliberately strict: this
 * value goes into a query string a stranger will click.
 */
export const INVITE_REF_OK = /^[A-Za-z0-9._-]{1,64}$/;

export const INVITE_COPY = {
  title: 'Keep going with Muse',
  body:
    'The report above is the diagnosis. Muse is our assistant: hand it the audit and it works on the site — the fixes, the pages, and the content the audit says is missing. You can build your own bot and start on the free tier.',
  cta: 'Build a free bot with Muse',
  terms:
    'Nothing gets published without your yes, and the free tier is an allowance, not a trial you have to remember to cancel. If you sign up through this link, whoever shared the report may be credited for it; that changes nothing about what you pay.',
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

/**
 * The invite link for one sharer.
 *
 * An invalid or absent ref produces the bare base rather than a broken link:
 * an unattributed signup still works, a malformed one does not.
 */
export function inviteHref(ref?: string | null, base: string = INVITE_BASE): string {
  const code = (ref ?? '').trim();
  try {
    const url = new URL(base);
    if (INVITE_REF_OK.test(code)) url.searchParams.set('ref', code);
    return url.toString();
  } catch {
    return '';
  }
}

export function buildInvite(ref?: string | null, base: string = INVITE_BASE): InviteBlock {
  const code = (ref ?? '').trim();
  const href = inviteHref(code, base);
  assertInviteCopy(`${INVITE_COPY.title}\n${INVITE_COPY.body}\n${INVITE_COPY.cta}\n${INVITE_COPY.terms}`);
  const used = INVITE_REF_OK.test(code) ? code : null;
  return {
    enabled: Boolean(href),
    title: INVITE_COPY.title,
    body: INVITE_COPY.body,
    cta: INVITE_COPY.cta,
    href,
    terms: INVITE_COPY.terms,
    ref: used,
    refRejected: code.length > 0 && used === null,
  };
}

/**
 * Where the ref came from, for the payload. Naming the basis keeps us honest:
 * "argument" is the sharer telling us, "url" is a link someone else wrote.
 */
export type RefBasis = 'argument' | 'url' | 'none';

export function resolveRef(candidates: { argument?: string | null; url?: string | null }): {
  ref: string | null;
  basis: RefBasis;
} {
  const arg = (candidates.argument ?? '').trim();
  if (INVITE_REF_OK.test(arg)) return { ref: arg, basis: 'argument' };
  const fromUrl = (candidates.url ?? '').trim();
  if (INVITE_REF_OK.test(fromUrl)) return { ref: fromUrl, basis: 'url' };
  return { ref: null, basis: 'none' };
}
