// Built-in fallback generator. Used ONLY when the P&R MCP has no API key configured.
// Every asset produced here is clearly labeled "built-in AI engine" in the UI
// so it is never mistaken for a Plunder & Riffle generation.
import ZAI from 'z-ai-web-dev-sdk';
import type { BuildContext } from './assets';
import type { ThreadMessage } from './client';

export interface FallbackResult {
  kind: 'image' | 'text';
  base64?: string;
  mime?: string;
  text?: string;
  caption?: string;
  postCopy?: string;
  /** iMessage thread so the result renders inside the beveled iPhone. */
  thread?: ThreadMessage[];
}

function contextText(ctx: BuildContext): string {
  const parts: string[] = [];
  parts.push(`Business: ${ctx.businessName || ctx.website}`);
  if (ctx.industry) parts.push(`Industry: ${ctx.industry}`);
  if (ctx.location) parts.push(`Location: ${ctx.location}`);
  if (ctx.topic) parts.push(`Focus: ${ctx.topic}`);

  // Ground everything in what the crawler actually saw. Without this the
  // copywriter invents an unrelated business (e.g. "wardrobe" for a meme engine).
  const report = ctx.report;
  if (report) {
    if (report.homeTitle) parts.push(`Website homepage title: "${report.homeTitle}"`);
    if (report.homeDescription) parts.push(`Website meta description: "${report.homeDescription}"`);
    if (report.homeH1) parts.push(`Homepage main headline: "${report.homeH1}"`);
    const pageTitles = (report.pages ?? [])
      .filter((p) => p.ok && p.title)
      .slice(0, 4)
      .map((p) => `"${p.title}" (${p.url})`);
    if (pageTitles.length) parts.push(`Real pages on the site: ${pageTitles.join('; ')}`);
    if (report.contentIdeas?.length) parts.push(`Content angles from our audit: ${report.contentIdeas.slice(0, 3).join(' | ')}`);
    const topProblem = report.topProblems?.[0]?.title;
    if (topProblem) parts.push(`Top audit finding: ${topProblem}`);
  }
  return parts.join('\n');
}

const ANTI_HALLUCINATION =
  'Work ONLY with the business context provided above. Do not invent an unrelated industry, product or offer. ' +
  'If the context is thin, write about what the website titles and pages actually describe, in generic small-business terms. ' +
  'No emojis.';

const IMAGE_TYPES = new Set(['meme', 'promo-meme', 'carousel', 'social-graphic']);

function sanitizeThread(raw: unknown): ThreadMessage[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: ThreadMessage[] = [];
  for (const item of raw.slice(0, 14)) {
    if (item === null || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const text = typeof rec.text === 'string' ? rec.text.trim().slice(0, 280) : '';
    const from = rec.from === 'me' ? 'me' : 'them';
    if (text) out.push({ from, text });
  }
  return out.length >= 2 ? out : undefined;
}

export async function generateFallback(assetType: string, ctx: BuildContext): Promise<FallbackResult> {
  const zai = await ZAI.create();
  const context = contextText(ctx);
  const brand = ctx.businessName || ctx.website;

  // The free /BEFORE, built-in-engine edition: an honest "before" photo of
  // the business grounded in what the audit actually saw, plus caption copy.
  if (assetType === 'before-pitch') {
    const industry = ctx.industry || 'small business';
    const problem = ctx.report?.topProblems?.[0]?.title;
    // Site-based, not a generic prompt: the visual must depict THIS business.
    // What they sell comes straight from the crawl of their own homepage, so
    // a pizzeria gets pizza props and a plumber gets pipe props - never an
    // arbitrary storefront that could belong to anyone.
    const sells =
      ctx.report?.homeH1 || ctx.report?.homeTitle || ctx.report?.homeDescription || ctx.topic || '';
    const visualPrompt =
      `Amateur documentary-style smartphone photo of the neglected storefront of ${brand}` +
      `, a ${industry} business` +
      (sells
        ? ` whose homepage is about "${sells.slice(0, 120)}" - the window display, shelves and props must clearly depict exactly that product or service`
        : '') +
      `, faded paint on the sign, dated window display, a taped paper notice on the door, overcast lighting. ` +
      `Realistic "before the renovation" mood, muted colors, honest and specific to this business. ` +
      (problem ? `The scene should subtly reflect this flaw: ${problem}. ` : '') +
      `Square composition, no text, no letters, no words, no logos in the image.`;
    const image = await zai.images.generations.create({ prompt: visualPrompt, size: '1024x1024' });
    const base64 = image.data?.[0]?.base64;
    if (!base64) throw new Error('Image generation returned no data');

    const copy = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You write the honest "BEFORE" half of a before/after joke. Return JSON only: ' +
            '{"caption": "one short caption under 12 words that names the before state of this website, warm and funny, no emojis", ' +
            '"postCopy": "2-3 sentences: admit the before honestly, then say the after (fresh content, memes, videos from the same site) is one free click away"}. ' +
            'No markdown fences. ' +
            ANTI_HALLUCINATION,
        },
        { role: 'user', content: `${context}\n\nWrite the BEFORE caption and post copy.` },
      ],
      thinking: { type: 'disabled' },
    });
    let caption = '';
    let postCopy = '';
    try {
      const parsed = JSON.parse(copy.choices[0]?.message?.content?.replace(/```json|```/g, '').trim() ?? '{}');
      caption = parsed.caption ?? '';
      postCopy = parsed.postCopy ?? '';
    } catch {
      caption = 'The before. We all have one.';
      postCopy = copy.choices[0]?.message?.content ?? '';
    }

    // The iMessage thread: the shareable conversation that renders inside the
    // beveled iPhone. Written from what the audit actually saw.
    let thread: ThreadMessage[] | undefined;
    try {
      const convo = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content:
              'You write short iMessage conversations used as shareable marketing assets. Return JSON only: ' +
              '{"thread":[{"from":"them","text":"..."},{"from":"me","text":"..."}]} where "them" is a skeptical friend ' +
              'and "me" is the business owner answering honestly. 8-10 messages, casual lowercase texting style, ' +
              'funny but truthful, grounded ONLY in the provided website context, no emojis, each text under 120 characters. ' +
              'The friend starts by teasing the website, the owner admits the honest before, mentions the free audit ' +
              'picked it up, and the thread ends with the friend asking how to get their own. No markdown fences. ' +
              ANTI_HALLUCINATION,
          },
          { role: 'user', content: `${context}\n\nWrite the iMessage thread.` },
        ],
        thinking: { type: 'disabled' },
      });
      const parsed = JSON.parse(
        (convo.choices[0]?.message?.content ?? '').replace(/```json|```/g, '').trim()
      );
      thread = sanitizeThread(parsed.thread);
    } catch {
      thread = undefined; // the phone falls back to caption/postCopy bubbles
    }

    return { kind: 'image', base64, mime: 'image/png', caption, postCopy, thread };
  }

  if (IMAGE_TYPES.has(assetType)) {
    const visualPrompt = `Bold promotional social media graphic for a ${ctx.industry || 'local'} business called ${brand}. Clean flat vector style, high contrast, teal and amber accent colors on dark charcoal background, no text, no letters, no words in the image, modern minimal composition, high quality`;
    const image = await zai.images.generations.create({ prompt: visualPrompt, size: '1024x1024' });
    const base64 = image.data?.[0]?.base64;
    if (!base64) throw new Error('Image generation returned no data');

    const copy = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a punchy social media copywriter. Return JSON only: {"caption": "one short meme-style caption under 12 words", "postCopy": "a ready-to-post 2-3 sentence post with a call to action"}. No markdown fences. ' +
            ANTI_HALLUCINATION,
        },
        { role: 'user', content: `${context}\n\nWrite the caption and post copy.` },
      ],
      thinking: { type: 'disabled' },
    });
    let caption = '';
    let postCopy = '';
    try {
      const parsed = JSON.parse(copy.choices[0]?.message?.content?.replace(/```json|```/g, '').trim() ?? '{}');
      caption = parsed.caption ?? '';
      postCopy = parsed.postCopy ?? '';
    } catch {
      caption = '';
      postCopy = copy.choices[0]?.message?.content ?? '';
    }
    return { kind: 'image', base64, mime: 'image/png', caption, postCopy };
  }

  // Text asset fallbacks
  const prompts: Record<string, string> = {
    'captions-pack':
      'Write a ready-to-use caption pack: 8 short social captions, 3 hooks, 2 first-comments with hashtags. Plain lines, each on its own line, no numbering prefixes like "1.".',
    'repurpose-pack':
      'Create a repurposing pack: 5 post ideas each with a one-line caption derived from the website content, then 3 meme text ideas. Plain lines.',
    'site-roast':
      'Write a short comedy roast script (5 beats) about this business website based on the details given. Keep it good-natured and end with one genuine compliment and one fix suggestion.',
    'stick-figure-video':
      'Write a stick-figure marketing video storyboard: 5 scenes, each with a visual description and one spoken line. Plain text, one scene per paragraph.',
    'video-show':
      'Write a 30-second marketing video script for this business: hook, 3 value beats, call to action. Plain text.',
  };
  const prompt = prompts[assetType] ?? 'Write ready-to-post marketing copy for this business.';
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: `You are a direct-response copywriter for small businesses. Be specific, honest and punchy. ${ANTI_HALLUCINATION}` },
      { role: 'user', content: `${context}\n\n${prompt}` },
    ],
    thinking: { type: 'disabled' },
  });
  const text = completion.choices[0]?.message?.content ?? '';
  if (!text) throw new Error('Text generation returned no content');
  return { kind: 'text', text };
}
