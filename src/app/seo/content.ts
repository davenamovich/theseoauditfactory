export type ArticleDraft = {
  slug: string;
  title: string;
  description: string;
  updated: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  sources: { label: string; url: string }[];
};

export const ARTICLES: ArticleDraft[] = [
  {
    slug: 'seo-audit-tool-vs-ongoing-workflow',
    title: 'SEO Audit Tool vs. Ongoing Marketing Workflow: What Does a Small Business Need?',
    description: 'A practical comparison of one-time SEO audits and ongoing marketing workflows: what each does, where it stops, and how to choose without buying more than you need.',
    updated: 'November 2026',
    sections: [
      { heading: 'The short answer', paragraphs: ['An SEO audit tool identifies observable issues on a website. An ongoing marketing workflow helps a business decide what to do, create or improve material, review it, and check what happened. They solve related but different jobs: diagnosis is not implementation, and publishing more is not automatically a strategy.', 'Start with an audit when you do not know what is broken. Choose an ongoing workflow when the business has a clear audience and offer but struggles to turn its expertise into useful, consistent marketing. Many small businesses need a little of both, in that order.'] },
      { heading: 'What an audit tool is good at', paragraphs: ['A crawler or audit product can check a site for technical and on-page signals at a speed that is useful for triage. Depending on the actual product, it may flag status codes, titles, headings, links, mobile issues, or performance opportunities. Verify the live feature list before you buy: tools differ, and a scan cannot infer every business goal from HTML.', 'A useful report ties each finding to evidence, scope, priority, and a concrete next step. A single score without methodology is not enough to decide what to fix.'] },
      { heading: 'What a workflow adds—and what it cannot promise', paragraphs: ['A workflow connects research, owner expertise, drafting, fact-checking, approval, distribution, and measurement. Agents can assist with repeatable research and first drafts; the owner still supplies business context, checks accuracy, and decides what represents the company. A content engine or bot team is not a substitute for evidence, a good offer, or customer service.', 'No audit or workflow can guarantee rankings, traffic, leads, or AI citations. Search engines and answer systems choose what to crawl, index, rank, and cite. Treat any guaranteed outcome claim cautiously.'] },
      { heading: 'Compare the actual job, not the category label', paragraphs: ['Before comparing vendors, write down the job you need done and check each option against the same criteria. Confirm current features and terms from the vendor itself; do not rely on an old review or a competitor’s comparison page.'] , bullets: ['Diagnosis: does it show the URL, page, and evidence behind each issue?', 'Implementation: does it only recommend changes, or help your team carry them out?', 'Editorial control: can a person review and edit outputs before they leave the draft stage?', 'Data and access: what site, analytics, or provider access is required, and who controls it?', 'Cost and time: include subscriptions, implementation, review time, and any provider/API charges.', 'Measurement: can you verify the change and compare it with a real baseline?'] },
      { heading: 'A low-risk way to choose', paragraphs: ['Run one bounded test before committing to a large package. For an audit, pick a few important pages and verify findings manually. For a workflow, use one real customer question to create a reviewed draft, then assess its accuracy, usefulness, owner effort, and ease of editing. Do not publish or grant broad access just to test a promise.', 'If the audit reveals blocking technical problems, fix those first. If the site is technically accessible but the business cannot maintain useful communication, then evaluate an ongoing workflow. A small business may also reasonably choose a freelancer, agency, or DIY process instead of software.'] },
      { heading: 'Bottom line', paragraphs: ['Use an audit to learn what is wrong; use an ongoing workflow to make and maintain improvements. Compare specific products only after checking what they actually do today, what data they need, and what the owner still has to do. The right choice is the smallest one that solves the business’s real bottleneck.'] },
    ],
    sources: [
      { label: 'Google Search Central: AI features and your website', url: 'https://developers.google.com/search/docs/appearance/ai-features' },
      { label: 'Google Search Central: helpful, reliable, people-first content', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content' },
      { label: 'Google Search Central: evaluating SEO advice', url: 'https://developers.google.com/search/docs/fundamentals/third-party-seo' },
    ],
  },
  {
    slug: 'ai-writing-tool-vs-agent-team-vs-agency',
    title: 'AI Writing Tool vs. Agent Team vs. Agency: A Fair Small-Business Comparison',
    description: 'Compare AI writing software, agent-assisted workflows, freelancers, and agencies by control, expertise, time, and responsibility—not by hype.',
    updated: 'November 2026',
    sections: [
      { heading: 'Start with the work you need done', paragraphs: ['“AI marketing” can mean a blank-page writing assistant, software that automates a narrow task, a coordinated set of agents, a freelancer, or a full-service agency. These are not interchangeable products. Compare the work and responsibility included, not just the labels.', 'This guide is a decision framework, not a vendor ranking. Product features, pricing, data handling, and service scope change; verify each option against current primary sources before deciding.'] },
      { heading: 'The main options', paragraphs: ['A writing assistant can help brainstorm, outline, or edit. It usually needs a human to supply context, verify claims, shape the final message, and publish it.', 'An agent workflow can coordinate multiple bounded tasks—such as research, outlining, drafting, and quality checks—if the tools and integrations actually support those steps. An owner still needs to review important facts and approve external actions.', 'A freelancer brings a person’s focused expertise and may be flexible for a defined assignment. Scope and availability vary by individual.', 'An agency can provide strategy, production, implementation, and account support, depending on the contract and team. It may be a fit when the business needs expert services beyond what internal staff can manage.'] },
      { heading: 'A decision matrix', paragraphs: ['Score each candidate with your own requirements. “High” and “low” below describe typical trade-offs, not a guarantee about every vendor or provider.'] , bullets: ['Owner control: DIY tools and agent drafts can keep editing close to the business; delegated services may reduce hands-on work but require clear approvals.', 'Expert judgment: depends on the people involved. A human label does not guarantee expertise; ask who does the work and how it is reviewed.', 'Setup effort: software can require configuration and integration; a service may require onboarding and ongoing collaboration.', 'Breadth: writing tools focus on text; an agent system may connect tasks; agencies may cover wider implementation. Inspect the exact scope.', 'Best fit: choose based on workload, budget, risk, privacy needs, and the skill the business lacks—not on a universal “best” badge.'] },
      { heading: 'Questions to ask before granting access', paragraphs: ['Ask what data is collected, where it is processed, which model or service providers receive it, how credentials are stored, and whether the business can revoke access. Do not paste customer records, passwords, or API keys into a prompt. Check the provider’s current privacy and retention terms.', 'For any workflow that can email, publish, spend, or change production systems, require a human approval step for the exact action. A preview or draft is not permission to send it.'] },
      { heading: 'How to run a fair pilot', paragraphs: ['Choose one small, reversible task with a clear quality bar. Provide non-sensitive business context, ask for a draft, and have someone who knows the business review it. Record the time spent, corrections required, accuracy, and total cost—including the owner’s review time and any API or service charges. Keep the same task and criteria when comparing alternatives.', 'Do not treat one trial as proof of future search performance, sales, or savings. It only tells you how well that specific task worked under those conditions.'] },
      { heading: 'Bottom line', paragraphs: ['Use a writing tool for writing assistance, an agent workflow when coordination of repeatable tasks is the bottleneck, and a freelancer or agency when the business needs human expertise or implementation capacity. These can also work together. Keep the owner in control of facts, brand voice, private data, and the final decision to publish.'] },
    ],
    sources: [
      { label: 'Google Search Central: guidance on generative AI content', url: 'https://developers.google.com/search/docs/fundamentals/using-gen-ai-content' },
      { label: 'Google Search Central: spam policies', url: 'https://developers.google.com/search/docs/essentials/spam-policies' },
      { label: 'FTC: advertising and marketing basics', url: 'https://www.ftc.gov/business-guidance/advertising-marketing' },
    ],
  },
];

export const AGENT_PROMPT = `You are my evidence-first Small Business Search & Answer Visibility Agent. Help real customers find and understand my business in ordinary search and AI-generated answers. Work for people first. Do not promise rankings, traffic, leads, citations, or recommendations.

BUSINESS CONTEXT
- Business name: [NAME]
- Website: [CANONICAL URL]
- Location/service area: [LOCATION]
- Main products/services: [LIST]
- Ideal customers and their real questions: [DETAILS]
- My firsthand expertise, proof, examples, and boundaries: [DETAILS]
- Competitors I want compared (optional): [LIST]

RULES
1. Inspect only the public website and materials I explicitly provide. Separate observed facts, independently verified facts, my supplied claims, and assumptions. Cite exact source URLs and review dates. Label unverifiable details unknown.
2. Audit crawlability and discoverability: status/redirects, robots/noindex, canonical, sitemap, internal links, mobile rendering, page titles/headings, structured data accuracy, and whether key content is visible as text. State what access/tools you lack. Never invent measurements or call simulated data live.
3. Map the few important customer intents to existing pages. Identify true gaps and duplicate topics. Recommend only useful new pages—not one thin page per keyword, town, phrasing, or AI query variation.
4. Prioritize findings. For each give observed evidence, customer benefit, suggested change, affected URL, effort (S/M/L), confidence, and a test or measurement that would confirm progress. Separate technical fixes from editorial ideas.
5. Draft original useful copy only where it adds first-hand knowledge, a clear process, real examples, meaningful comparisons, or a better answer. Use clear headings, direct answers, context, caveats, and credible links. Never keyword-stuff, spin competitors' copy, invent case studies/reviews/prices, or imply endorsement.
6. For comparisons, verify current features, prices, eligibility, and limits from each vendor's own sources on the review date. Use equivalent criteria, explain who each option suits, disclose missing data, and include limitations. Do not call my business best/cheapest without strong current evidence.
7. Keep structured data faithful to visible content. No fake reviews, hidden text, irrelevant schema, or special LLM markup as a ranking hack. Make no website, CMS, DNS, config, or file changes unless I approve the exact change. Return proposed edits as drafts.
8. Never submit forms, contact prospects, publish, spend money, create accounts, or send data to a new service without my explicit approval of that exact action. Never expose secrets or customer data.
9. Return evidence/citations, top five priorities, copy-ready drafts/patches, assumptions/unknowns, and a simple baseline/measurement plan. Label all work DRAFT until I approve it.`;
