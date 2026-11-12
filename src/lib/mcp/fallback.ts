// Built-in fallback generator. Used ONLY when the P&R MCP has no API key configured.
// Every asset produced here is clearly labeled "built-in AI engine" in the UI
// so it is never mistaken for a Plunder & Riffle generation.
import ZAI from 'z-ai-web-dev-sdk';
import type { BuildContext } from './assets';

export interface FallbackResult {
  kind: 'image' | 'text';
  base64?: string;
  mime?: string;
  text?: string;
  caption?: string;
  postCopy?: string;
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

export async function generateFallback(assetType: string, ctx: BuildContext): Promise<FallbackResult> {
  const zai = await ZAI.create();
  const context = contextText(ctx);
  const brand = ctx.businessName || ctx.website;

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
