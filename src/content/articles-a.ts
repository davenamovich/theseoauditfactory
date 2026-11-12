import type { KnowledgeArticle } from './types';

export const ARTICLES_A: KnowledgeArticle[] = [
  {
    slug: 'free-seo-audit',
    title: 'Free SEO Audit: What a Good One Checks (and What It Should Cost)',
    category: 'Fundamentals',
    description:
      'A genuinely useful free SEO audit covers indexing, speed, content and AI search readiness. Here is what to expect, how to act on it, and what it costs.',
    readMinutes: 7,
    updated: 'November 2026',
    intro:
      'A genuinely useful free SEO audit tells you whether search engines and AI assistants can find, read and recommend your site, and what to fix first. It should cover indexing, technical health, on-page basics, content quality, speed, local visibility and AI search readiness, with every finding tied to a consequence in plain English. Done right, it costs you nothing and often saves you real money.',
    keyTakeaways: [
      'A real audit checks six layers: indexing, technical health, on-page basics, content, speed and AI search readiness.',
      'A website grader score is marketing. An audit is a prioritized list of problems with consequences attached.',
      'Every finding should answer two questions: what is wrong, and what it is costing you.',
      'Agencies commonly charge hundreds to thousands of dollars for audit work a good free tool can do in minutes.',
      'The SEO Audit Factory runs a complete audit free, with no signup, and translates findings into money-saving recommendations.',
      'The audit is the cheap part. Acting on it, in the right order, is where results come from.',
    ],
    sections: [
      {
        heading: 'What a good free audit actually covers',
        paragraphs: [
          'Search engines decide in layers, so a useful audit works in layers too. It starts with whether your pages can be found at all, moves through whether they can be understood, and ends with whether they deserve to win. Skipping straight to content advice while robots.txt quietly blocks half your site is like repainting a house with no front door.',
          'Coverage matters more than depth on any single item. A short audit that checks everything beats a deep dive that only looks at keywords.',
        ],
        bullets: [
          'Indexing and crawlability: can Google, Bing and AI crawlers actually reach your pages, or is something blocking them?',
          'Technical health: HTTPS, redirect chains, canonical tags, status codes, mobile viewport and XML sitemaps.',
          'On-page basics: unique titles and descriptions, one clear H1 per page, sensible headings, image alt text and internal links.',
          'Content quality: thin pages, duplicated topics, and missing answers to the questions your customers actually type.',
          'Speed and Core Web Vitals: how fast pages load and how stable they feel on a real phone, not just your office laptop.',
          'Local and AI readiness: Google Business Profile signals, plus whether assistants like ChatGPT and Perplexity can crawl and quote you.',
        ],
      },
      {
        heading: 'Audit versus website grader score',
        paragraphs: [
          'You have seen the breed: enter a URL, receive a glowing number out of 100, plus a form asking you to book a call. A score tells you nothing actionable because it hides what it measured. A 78 could mean a missing sitemap, a slow server, or a rounding error in someone else marketing funnel.',
          'A real audit is a list, not a number. Each item names the problem, shows the evidence, explains the consequence and suggests the fix. If a report will not tell you what to do first, it was built to sell you a retainer, not to help you.',
        ],
      },
      {
        heading: 'How to act on an audit without drowning',
        paragraphs: [
          'Most audits produce a list longer than any owner has patience for, and that is fine. The order you fix things in matters more than the length of the list.',
        ],
        steps: [
          'Fix anything that blocks indexing first: robots.txt mistakes, accidental noindex tags, broken redirects. Nothing else matters until Google can see you.',
          'Fix anything that blocks customers second: slow pages, broken forms, phone numbers that do not work when tapped on mobile.',
          'Improve titles, headings and content on your money pages, where the traffic and revenue actually happen.',
          'Add structured data where it maps to your business: LocalBusiness, Product, Article, FAQ.',
          'Re-run the audit in 30 days and confirm the fixes took. Websites regress when nobody is watching.',
        ],
      },
      {
        heading: 'What agencies charge for the same work',
        paragraphs: [
          'A one-off technical audit from a consultancy typically starts in the hundreds of dollars and climbs quickly with site size, sometimes into the thousands. Enterprise audits reach five figures. Some of that price buys genuine expert judgment, especially for large or unusual sites; some of it buys an automated report with a logo on the cover.',
          'The honest economics: the scanning itself is cheap and increasingly free, because crawlers are commodities. What you should pay for is interpretation, prioritization and implementation. If an agency charges mainly to generate the report, you are paying for the logo.',
          'Free audits have a reputation problem precisely because many are bait: shallow, score-obsessed and designed to scare you into a contract. That is a reason to be picky about which free audit you trust, not a reason to pay for data you can get for nothing.',
        ],
      },
      {
        heading: 'Where free audits usually cut corners',
        paragraphs: [
          'Many free tools crawl only a handful of pages, ignore mobile rendering, skip structured data entirely and say nothing about AI search readiness. Others hand you a raw crawl dump: thousands of rows, zero judgment.',
          'A good free audit should cover AI search readiness and local visibility, not just classic keywords, and it should translate findings into plain-English recommendations. That is exactly what we built The SEO Audit Factory to do: run the full check at no cost, require no signup, and hand you a report that reads like five ways you are losing money rather than a spreadsheet with anxiety built in.',
        ],
      },
      {
        heading: 'When paying for help is still worth it',
        paragraphs: [
          'A free audit finds problems; it does not fix them. If the findings involve server migrations, sitewide template rebuilds or a messy redesign, paying a competent developer or agency for implementation can be money well spent. Pay for the fix, not for the finding.',
          'Use the audit as your shopping list and your quality control. Anyone you hire should be able to explain how their work closes the specific items on it, and you can re-run the free audit afterwards to check they actually did.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is a free SEO audit actually free, or is it bait?',
        a: 'Both exist. Many free audits are lead magnets that scan a few pages and pitch a retainer, while some are genuinely complete. Judge one by its coverage and by whether it explains consequences, not by whether the word free appears.',
      },
      {
        q: 'How long does an SEO audit take?',
        a: 'The automated scan takes minutes for a small site. Reading and acting on it is the real time cost, usually a few focused hours for the quick wins and a season for the bigger items.',
      },
      {
        q: 'Can an audit hurt my rankings?',
        a: 'No. An audit reads your site the way a search engine would and changes nothing. The only risk is doing nothing about what it finds.',
      },
      {
        q: 'My site is small. Is an audit overkill?',
        a: 'Small sites benefit most, because a single blocking mistake can hide your entire business from search. Ten pages is not too few to check; it is few enough to fix in a weekend.',
      },
      {
        q: 'How often should I run an audit?',
        a: 'Quarterly is a sensible rhythm, plus after any redesign, migration or platform change. Sites drift, and audits catch the drift before customers do.',
      },
    ],
    sources: [
      { label: 'Google Search Central documentation', url: 'https://developers.google.com/search/docs' },
      { label: 'Core Web Vitals (web.dev)', url: 'https://web.dev/articles/vitals' },
      { label: 'Google: robots.txt introduction', url: 'https://developers.google.com/search/docs/crawling-indexing/robots/intro' },
      { label: 'OpenAI crawler documentation', url: 'https://platform.openai.com/docs/bots' },
    ],
    related: ['how-to-audit-a-website', 'how-to-save-money-on-seo', 'technical-seo-checklist'],
  },
  {
    slug: 'how-to-audit-a-website',
    title: 'How to Audit a Website for SEO: A Practical Walkthrough',
    category: 'Fundamentals',
    description:
      'Follow a step-by-step process to audit your own website with free tools: indexing, crawling, titles, headings, images, speed, structured data and AI readiness.',
    readMinutes: 9,
    updated: 'November 2026',
    intro:
      'You can audit most small business websites in an afternoon using only free tools, and the order below is the same one professionals use. First prove that Google can see your pages, then check the technical plumbing, then judge what each page says and how fast it loads. Work top to bottom; fixing things out of order wastes your time.',
    keyTakeaways: [
      'Start with indexing: search site:yourdomain.com on Google and Bing and compare the results to what should exist.',
      'Check robots.txt and your XML sitemap before anything else, because a blocked page cannot rank no matter how good it is.',
      'Audit pages in priority order: homepage first, then money pages, then your best blog posts.',
      'Titles, descriptions, headings and images are the cheapest fixes with the fastest payback.',
      'Speed problems usually need a developer or a hosting change, so identify them early.',
      'Finish with structured data and AI search readiness so assistants like ChatGPT can quote you accurately.',
    ],
    sections: [
      {
        heading: 'What you need before you start',
        paragraphs: [
          'This walkthrough uses free tools only: your browser, Google Search Console, Bing Webmaster Tools, PageSpeed Insights and the Rich Results Test. Budget roughly an hour for a first pass on a site under 30 pages, and longer if the site is bigger or the findings pile up.',
          'Open a spreadsheet or a plain notes file as you go. An audit you cannot remember is an audit you cannot act on.',
        ],
        bullets: [
          'A browser and the ability to view a page source: right-click, then choose View Page Source.',
          'Google Search Console access for your domain, or the willingness to set it up, which is free.',
          'PageSpeed Insights, for speed and Core Web Vitals on mobile and desktop.',
          'The Rich Results Test, to check structured data.',
          'A list of your five most important pages: the ones that make you money.',
        ],
      },
      {
        heading: 'Step 1: Prove Google can see your pages',
        steps: [
          'Search site:yourdomain.com on Google. The results are roughly what Google has indexed. Note whether your key pages appear.',
          'Repeat the same search on Bing. Bing matters more than it used to, because several AI assistants lean on Bing results.',
          'Compare the number of results to the number of pages you think you have. Big gaps mean blocked pages, orphaned pages, or thin pages Google chose to ignore.',
          'If Search Console is connected, open the Pages report for a precise index coverage picture rather than guessing from the site: search.',
        ],
        callout:
          'If your most important page is missing from Google, stop here and fix indexing first. Everything after this step is decoration until Google can find that page.',
      },
      {
        heading: 'Step 2: Check robots.txt and your sitemap',
        steps: [
          'Visit yourdomain.com/robots.txt. You are looking for Disallow lines that might block important folders, and for a Sitemap line pointing at your XML sitemap.',
          'Visit your XML sitemap, usually at yourdomain.com/sitemap.xml. Every URL in it should be a page you actually want ranked, not staging pages, tag archives or parameter URLs.',
          'Confirm the sitemap is submitted in Google Search Console and Bing Webmaster Tools, and that neither tool reports fetch errors.',
          'Search your page source for noindex on your money pages. One stray meta tag can remove a page from Google for months without any visible symptom.',
        ],
      },
      {
        heading: 'Step 3: Judge titles, descriptions and headings',
        steps: [
          'Open each money page and read the title tag, the text in the browser tab. It should be unique, describe the page, and land near 50 to 60 characters so it does not truncate in results.',
          'Read the meta description. Around 140 to 160 characters, it is your advertisement in the search results; missing descriptions get auto-written, usually badly.',
          'Check that the page has exactly one H1 and that the H2s read like an outline of the topic a customer would recognize.',
          'Look for duplicated titles across pages. If two pages share a title, Google treats them as competitors for the same query.',
        ],
      },
      {
        heading: 'Step 4: Check images and links',
        bullets: [
          'Every meaningful image should have alt text that describes it, both for accessibility and because Google cannot see pixels.',
          'Large photos straight off a phone camera are the most common speed killer on small sites; compress them before uploading.',
          'Click through your navigation, footer and in-content links. Note anything that 404s or redirects somewhere unexpected.',
          'Check that contact details in the footer match your Google Business Profile exactly.',
        ],
      },
      {
        heading: 'Step 5: Check speed and mobile',
        paragraphs: [
          'Run your top pages through PageSpeed Insights and pay attention to the mobile scores and Core Web Vitals, because Google indexes the mobile version of your site. Common culprits on small business sites are uncompressed images, bloated themes, a pile of tracking scripts and hosting that was cheap for a reason.',
          'Then open your site on an actual phone. Tap the phone number, submit the contact form, and try to read the menu. You will find usability problems no crawler reports.',
        ],
      },
      {
        heading: 'Step 6: Structured data and AI readiness',
        steps: [
          'Run the Rich Results Test on your homepage and key templates. It shows whether structured data is present and valid.',
          'Add or fix schema that matches your business: LocalBusiness for local companies, Product for e-commerce, Article for posts, FAQPage where genuine FAQs exist.',
          'Check that robots.txt does not block the AI crawlers you want visiting you, such as GPTBot, OAI-SearchBot, PerplexityBot and ClaudeBot. OpenAI and Perplexity both document their crawlers publicly.',
          'Read your best page opening paragraph. If it does not directly answer the question a customer would ask, an AI assistant has nothing clean to quote.',
        ],
      },
      {
        heading: 'What to fix first, and when to stop',
        paragraphs: [
          'The order of operations is: indexing blockers, then customer blockers, then on-page improvements, then structured data. Do not polish paragraph three of a blog post while your contact form is broken and your services page is noindexed.',
          'When the list outgrows your available time, that is the moment a second pair of eyes earns its keep. Our free audit at The SEO Audit Factory runs these same checks automatically and packages the findings as a five ways you are losing money report, so you can spend your afternoon fixing rather than clicking.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How long does a DIY website audit take?',
        a: 'About an hour for the first pass on a small site, and half a day if you act on what you find. Larger sites scale with page count, which is exactly why automated checks help.',
      },
      {
        q: 'Do I need paid SEO tools for this?',
        a: 'No. Indexing checks, robots.txt, sitemaps, titles, headings, speed and structured data are all verifiable with free tools. Paid tools add convenience and scale, not access to secret information.',
      },
      {
        q: 'The site: search shows almost nothing. What now?',
        a: 'Check robots.txt for broad Disallow rules, look for noindex tags in your templates, and verify the domain in Search Console to see its index coverage. If a recent redesign preceded the disappearance, start there.',
      },
      {
        q: 'How do I know which problems are urgent?',
        a: 'Anything that blocks indexing or blocks a customer from contacting you is urgent. Everything else is ranked by how much traffic and revenue the affected page handles.',
      },
      {
        q: 'Should I audit before a website redesign?',
        a: 'Absolutely, and you should capture every current URL, title and ranking page first. Redesigns are the leading cause of self-inflicted SEO damage, and an audit beforehand is your insurance policy.',
      },
    ],
    sources: [
      { label: 'Google Search Central SEO starter guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
      { label: 'Google: robots.txt introduction', url: 'https://developers.google.com/search/docs/crawling-indexing/robots/intro' },
      { label: 'Google: XML sitemaps overview', url: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview-sitemaps' },
      { label: 'Google Rich Results Test', url: 'https://search.google.com/test/rich-results' },
    ],
    related: ['free-seo-audit', 'technical-seo-checklist', 'website-speed-optimization'],
  },
  {
    slug: 'technical-seo-checklist',
    title: 'The Technical SEO Checklist: 25 Checks That Keep You Indexable',
    category: 'Technical SEO',
    description:
      'A plain-English technical SEO checklist: 25 checks covering HTTPS, redirects, canonicals, robots.txt, sitemaps, mobile, structured data and Core Web Vitals.',
    readMinutes: 10,
    updated: 'November 2026',
    intro:
      'Technical SEO is the plumbing of your website: when it leaks, content and marketing cannot save you. These 25 checks cover the fundamentals that keep a site crawlable, indexable and fast, each explained in plain English with the reason it matters. Run through the list quarterly, and always after a redesign or migration.',
    keyTakeaways: [
      'Everything starts with access: robots.txt, sitemaps, status codes and HTTPS come before any content work.',
      'One page should have one URL, one canonical tag and one H1; duplication splits your chances.',
      'Redirect chains slow users and waste crawl attention, so link directly to final destinations.',
      'Core Web Vitals have concrete thresholds: LCP under 2.5 seconds, INP under 200 milliseconds, CLS under 0.1.',
      'Structured data and AI crawler access decide whether machines can state facts about you correctly.',
      'Checklists do not expire, but sites drift, so re-run this list after every significant change.',
    ],
    sections: [
      {
        heading: 'Access and crawlability (checks 1 to 5)',
        paragraphs: [
          'If a crawler cannot reach a page cheaply and unambiguously, that page does not exist as far as search is concerned. These five checks are the foundation everything else stands on.',
        ],
        bullets: [
          'Check 1: HTTPS everywhere. Every URL should load over https with a valid certificate. Browsers brand insecure pages loudly, which costs trust and traffic before Google weighs in at all.',
          'Check 2: robots.txt exists and does not block important paths. One careless Disallow line can hide your entire site, and Google will not email you about it. The robots.txt format is a documented standard, RFC 9309.',
          'Check 3: an XML sitemap is live and clean. It should list only canonical, indexable URLs you actually want ranked, and it belongs in Search Console and Bing Webmaster Tools.',
          'Check 4: one version of the domain. Pick https with or without www, and 301-redirect all other versions to the winner so links and rankings do not split across duplicates.',
          'Check 5: money pages return status 200. Check your key URLs directly, not just the homepage. A 404 or 500 on a services page is invisible to you and obvious to customers.',
        ],
      },
      {
        heading: 'Redirects and URL hygiene (checks 6 to 10)',
        paragraphs: [
          'URL problems multiply quietly. Every one of these is easy to create and invisible until you look for it.',
        ],
        bullets: [
          'Check 6: no redirect chains. A chain is page A pointing to B pointing to C. Each hop adds delay and dilutes signals, so point A directly at C.',
          'Check 7: internal links target final URLs. Linking through a redirect works, but it is slower and one more thing that can break.',
          'Check 8: canonical tags are self-referencing by default. Each page should declare itself the preferred version unless it is deliberately consolidating into another URL.',
          'Check 9: parameter URLs are handled. Utm tags, sort orders and session IDs should not create infinite duplicate pages. Canonicals, noindex or parameter settings keep them contained.',
          'Check 10: case and trailing slashes are consistent. Pages, page and page slash should not all exist as separate URLs.',
        ],
      },
      {
        heading: 'Indexability and metadata (checks 11 to 15)',
        paragraphs: [
          'This group is where most self-inflicted damage happens, usually during a redesign. It takes minutes to check and months to notice.',
        ],
        bullets: [
          'Check 11: no unwanted noindex tags. Search your templates for noindex and confirm it appears only where you intend, such as internal search results or thank-you pages.',
          'Check 12: unique title tags. Each page gets one, near 50 to 60 characters, describing that page. Duplicated titles make pages compete against each other.',
          'Check 13: unique meta descriptions, roughly 140 to 160 characters. They do not directly rank you, but they are the advertisement users read before clicking.',
          'Check 14: exactly one H1 per page. The H1 states the topic and the H2s break it down; headings are how machines and skimming humans read structure.',
          'Check 15: dead pages behave. Removed pages should return a proper 404 or 410, or 301 to a genuinely relevant page, not a fake 200 with soft error content.',
        ],
      },
      {
        heading: 'Mobile and international (checks 16 to 18)',
        paragraphs: [
          'Google indexes the mobile rendering of your site, so mobile is not a nice-to-have. International tagging matters only if it applies to you, but when it applies, it matters a lot.',
        ],
        bullets: [
          'Check 16: the mobile viewport meta tag is present and correct, and the site is genuinely usable on a phone.',
          'Check 17: mobile usability is real. Tap targets big enough, text readable without zooming, no horizontal scrolling. Test on an actual phone, not just an emulator.',
          'Check 18: hreflang used correctly, briefly. If you serve multiple languages or regions, hreflang annotations tell Google which version to show whom, and they must be reciprocal. If you serve one language in one country, you can skip this entirely.',
        ],
      },
      {
        heading: 'Structured data and speed (checks 19 to 23)',
        paragraphs: [
          'Structured data and performance are the two levers that most directly affect how machines perceive quality. Both degrade slowly as sites grow, and both reward periodic attention.',
        ],
        bullets: [
          'Check 19: schema on key templates. Organization and LocalBusiness identify you, Article covers posts, Product covers e-commerce, FAQPage covers real FAQs. Structured data turns prose into unambiguous facts.',
          'Check 20: the Rich Results Test passes on your templates. Fix reported errors before admiring warnings.',
          'Check 21: images are disciplined. Compressed, sized with width and height to prevent layout shifts, and lazy-loaded below the fold.',
          'Check 22: third-party scripts are justified. Every chat widget, tracker and font you add is a tax on every visitor. Audit the pile quarterly.',
          'Check 23: Core Web Vitals pass their thresholds. Largest Contentful Paint under 2.5 seconds, Interaction to Next Paint under 200 milliseconds, Cumulative Layout Shift under 0.1, measured at the 75th percentile of real users.',
        ],
      },
      {
        heading: 'Monitoring and AI readiness (checks 24 and 25)',
        paragraphs: [
          'The last two checks keep the other 23 honest, and cover the newest layer: whether AI systems are allowed to see you at all.',
        ],
        bullets: [
          'Check 24: Search Console is verified and watched. Coverage errors, manual actions and sitemap problems surface there first, and there is no substitute for looking.',
          'Check 25: AI crawlers get a decision, not an accident. If you want ChatGPT, Perplexity and assistants to see you, bots like GPTBot, OAI-SearchBot, PerplexityBot and ClaudeBot should not be blocked in robots.txt or at your CDN. Blocking is a legitimate business choice; blocking by accident is not.',
        ],
      },
      {
        heading: 'Why technical SEO fails silently',
        paragraphs: [
          'Technical failures rarely announce themselves. Nobody sends an email when a redesign leaves a noindex tag in the template, when the sitemap still lists deleted URLs, or when the staging site outranks production. Sites drift, and the drift is only visible to whoever checks.',
          'This is also why checklists beat vibes. You do not need to be an engineer to run the 25 checks above; you need an hour and a bit of stubbornness. If you would rather not spend the hour, our free audit runs these checks and reports the findings as five ways you are losing money, with the jargon translated.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the most common technical SEO failure?',
        a: 'Accidentally blocking crawlers, usually right after a redesign: a leftover noindex tag, a Disallow rule meant for staging that shipped to production, or a firewall that started blocking bots. It is common because it is invisible.',
      },
      {
        q: 'Do I need a developer for these checks?',
        a: 'You can verify most of them yourself in a browser. Fixing server-level items such as redirects, headers and hosting usually needs a developer, but the checking is free.',
      },
      {
        q: 'Is HTTPS really mandatory?',
        a: 'Yes. Beyond security, browsers flag non-HTTPS pages as insecure, and HTTPS is a long-established ranking signal. There is no realistic argument for staying on plain HTTP.',
      },
      {
        q: 'How do I check Core Web Vitals?',
        a: 'PageSpeed Insights reports lab and field data per URL, and Search Console shows site-wide Core Web Vitals status. Field data from real users is what counts most.',
      },
      {
        q: 'Does passing this checklist guarantee rankings?',
        a: 'No. Technical health removes blockers and penalties; it does not create relevance or authority. It is the entry fee, not the trophy.',
      },
    ],
    sources: [
      { label: 'Google: robots.txt introduction', url: 'https://developers.google.com/search/docs/crawling-indexing/robots/intro' },
      { label: 'Robots Exclusion Protocol (RFC 9309)', url: 'https://datatracker.ietf.org/doc/html/rfc9309' },
      { label: 'Core Web Vitals (web.dev)', url: 'https://web.dev/articles/vitals' },
      { label: 'Google Rich Results Test', url: 'https://search.google.com/test/rich-results' },
    ],
    related: ['how-to-audit-a-website', 'schema-markup-explained', 'website-speed-optimization'],
  },
  {
    slug: 'local-seo-for-small-businesses',
    title: 'Local SEO for Small Businesses: The Complete Playbook',
    category: 'Local SEO',
    description:
      'The local SEO playbook for small businesses: Google Business Profile, NAP consistency, reviews, location pages, local schema and citations, step by step.',
    readMinutes: 8,
    updated: 'November 2026',
    intro:
      'Local SEO is how nearby customers find you, and for most small businesses it pays back faster than general SEO. The playbook comes down to five moves: a complete Google Business Profile, consistent name, address and phone data across the web, genuine reviews, service and location pages that match what you sell, and local structured data. None of it requires a big budget; most of it requires stubbornness.',
    keyTakeaways: [
      'Your Google Business Profile is the highest-leverage local asset you own; complete every field and keep it current.',
      'NAP consistency means identical name, address and phone everywhere, down to Suite versus Ste.',
      'Reviews drive both rankings and conversion: ask consistently, reply always, never buy them.',
      'One page per location and one page per service beats one generic page for everything.',
      'LocalBusiness schema tells Google and AI assistants exactly what you are and where you operate.',
      'Expect meaningful movement in three to six months, faster if you are starting from an incomplete profile.',
    ],
    sections: [
      {
        heading: 'How local search actually works',
        paragraphs: [
          'When someone searches plumber near me or pizza downtown, Google blends normal web results with a map pack of nearby businesses. The map pack ranks on three documented pillars: relevance, how well you match the query; distance, how close you are; and prominence, how well known and well reviewed you are.',
          'You cannot buy your way into the map pack, and you cannot control distance. You can control relevance and prominence, which is what the rest of this playbook does.',
        ],
      },
      {
        heading: 'Google Business Profile: the foundation',
        paragraphs: [
          'Your Business Profile is what appears in the map pack and alongside results, and it is often the first thing a customer sees. An empty or stale profile signals a possibly closed business, which is the one impression you never want to make.',
        ],
        steps: [
          'Claim and verify your profile, then complete every field: hours, phone, website, attributes, services, products and a description written for customers, not keywords.',
          'Choose the most specific primary category available; it is one of the strongest relevance signals. Add secondary categories only if they genuinely apply.',
          'Upload real photos of your work, your team and your premises, and add new ones periodically. Current photos visibly outperform empty galleries in customer trust.',
          'Post occasional updates and keep holiday hours accurate. A profile that says open while the shutters are down generates one-star reviews on its own.',
        ],
      },
      {
        heading: 'NAP consistency and citations',
        paragraphs: [
          'NAP stands for name, address and phone, and consistency means character-for-character identical everywhere your business appears: your site footer, your profile, Facebook, Yelp, Bing Places, Apple Maps and industry directories. Search engines cross-reference these to confirm you are a real, stable business, and mismatches read as instability.',
          'Skip the bulk citation packages that blast your details to hundreds of low-quality directories. A handful of authoritative, relevant listings beats a haystack of junk, and cleaning up deliberate spam later costs more than the package did.',
        ],
        steps: [
          'Standardize your exact NAP format once, including whether you use Suite or Ste, and document it.',
          'Audit your top listings and your own site for mismatches, then fix them at the source rather than patching copies.',
          'Claim Bing Places and Apple Business Connect as well; they feed the maps people actually use.',
        ],
      },
      {
        heading: 'Reviews: the engine of local trust',
        paragraphs: [
          'Google documents that review count and score factor into local search ranking, and customers read them harder than any algorithm: most people check reviews before contacting a local business. The system you build for asking matters more than the platform you ask on.',
        ],
        steps: [
          'Ask for the review at the moment of delight, right after the job is done or the meal is finished, with a direct link that works on a phone.',
          'Reply to every review, good or bad, briefly and professionally. Replies are public evidence that you are present.',
          'Never buy, fake or incentivize reviews. Google prohibits fake engagement, and a spam penalty costs far more than a handful of five-star reviews ever earns.',
          'When a review raises a real complaint, fix the underlying issue first, then reply.',
        ],
      },
      {
        heading: 'Location and service pages that earn their keep',
        paragraphs: [
          'Your website has to prove the same things your profile claims, which means real pages for what you do and where you do it, written for humans.',
        ],
        bullets: [
          'One page per physical location, with its own address, hours, photos, staff, directions and embedded map. Copy-pasting one template with the city name swapped is a doorway page, and Google has spent a decade getting good at spotting those.',
          'One page per service, covering what it involves, what affects pricing, how the process works and the questions customers ask on the phone.',
          'Internal links connecting services to locations where it is genuinely true, and to related services.',
          'An about page with real people. Local search rewards businesses that look like they exist in the world.',
        ],
      },
      {
        heading: 'Local schema and AI assistants',
        paragraphs: [
          'LocalBusiness structured data spells out your name, address, phone, hours, geo coordinates and business type in a format machines parse without guessing. It will not rank you by itself, but it removes ambiguity for every system trying to describe you, and AI assistants increasingly answer find-a-roofer questions from the same web.',
          'Keep the schema consistent with your visible page and your Business Profile. Contradictory data is worse than no data.',
        ],
      },
      {
        heading: 'Service-area businesses',
        paragraphs: [
          'If customers never visit you, plumbers, cleaners, mobile repair, you run a service-area business. Google lets you hide your street address and define the areas you serve, which is the correct setup; showing a home address customers cannot visit only confuses everyone.',
          'Your website then carries the geographic weight: one useful page per area you genuinely serve, with content that proves local experience. Fake city pages for towns you have never worked in tend to attract neither customers nor rankings.',
        ],
      },
      {
        heading: 'Realistic expectations and tracking',
        paragraphs: [
          'Local SEO is fast by SEO standards and slow by human ones. A repaired profile and consistent NAP can show movement in weeks; reviews and page authority take months. Anyone promising page one by Friday is selling the Friday, not the SEO.',
          'Track what predicts revenue: calls and direction requests from your Business Profile, form fills from location pages, and where your phone rings from. Our free audit at The SEO Audit Factory checks your local signals alongside the rest of the site, because a slow website quietly wastes the local visibility you worked to earn.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How long does local SEO take to work?',
        a: 'Expect early movement within weeks if you started from an incomplete profile, and solid traction in three to six months. Reviews and location page authority keep compounding after that.',
      },
      {
        q: 'Can I rank locally without a physical storefront?',
        a: 'Yes. Service-area businesses rank by hiding their address, defining service areas in their profile and proving coverage on their website. Plenty of dominant local businesses are home-based.',
      },
      {
        q: 'Are citation-building services worth paying for?',
        a: 'Mostly no. Cleaning up genuinely inconsistent listings is worth paying for; blasting your details to hundreds of low-quality directories is not, and it can create cleanup work later.',
      },
      {
        q: 'Do reviews really affect my ranking?',
        a: 'Yes. Google documents that review count and score factor into local ranking, and customers treat reviews as the deciding factor long before ranking matters.',
      },
      {
        q: 'Should I hire an agency for local SEO?',
        a: 'You can run this playbook yourself with a few hours a month. Hire help for implementation at scale or cleanup after a mess, and use a free audit first so you know exactly what you would be paying someone to fix.',
      },
    ],
    sources: [
      { label: 'Google Business Profile Help', url: 'https://support.google.com/business' },
      { label: 'Google: LocalBusiness structured data', url: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
      { label: 'schema.org LocalBusiness type', url: 'https://schema.org/LocalBusiness' },
      { label: 'Google Search Central documentation', url: 'https://developers.google.com/search/docs' },
    ],
    related: ['seo-for-local-service-businesses', 'seo-for-restaurants', 'free-seo-audit'],
  },
  {
    slug: 'how-to-appear-in-chatgpt-search',
    title: 'How to Appear in ChatGPT Search: A Practical Guide',
    category: 'AI Search',
    description:
      'How ChatGPT search finds and cites websites: OAI-SearchBot crawling, Bing results, answer-ready content and structured data. Honest, with no guarantees.',
    readMinutes: 9,
    updated: 'November 2026',
    intro:
      'ChatGPT search draws on its own crawler, OAI-SearchBot, together with results from Microsoft Bing, and its ChatGPT-User agent fetches pages live when a user asks about them. You cannot buy a citation and nobody can guarantee one, but you can remove every technical blocker and format your content so quoting you is the easy option. This guide sticks to what OpenAI has documented and what is honestly measurable.',
    keyTakeaways: [
      'ChatGPT search blends its own crawling with Bing results, so Bing indexing is now part of your job.',
      'OpenAI documents three crawlers: OAI-SearchBot for search, GPTBot for training, ChatGPT-User for user-triggered fetches.',
      'If robots.txt or your firewall blocks these bots, ChatGPT cannot see or cite you, full stop.',
      'Content that answers a question in its first sentences is content ChatGPT can lift cleanly.',
      'Mentions of your brand on third-party sites shape what ChatGPT recommends, and those are earned off your website.',
      'Nobody can guarantee AI citations. Anyone who promises them is selling something.',
    ],
    sections: [
      {
        heading: 'What ChatGPT search actually is',
        paragraphs: [
          'Since late 2024, ChatGPT can answer with live web results rather than only its training memory. When it searches, it retrieves pages, reads them and composes an answer with links to the sources it used. The mechanism blends results from Microsoft Bing, a long-standing OpenAI partner, with pages gathered by OpenAI own crawler, which is why your Bing visibility now quietly matters even if you have never opened Bing in your life.',
          'Two behaviors matter separately: answers ChatGPT generates from its index, and answers it builds by fetching a page the user specifically asked about. You want to be reachable in both.',
        ],
      },
      {
        heading: 'The three OpenAI crawlers, precisely',
        paragraphs: [
          'OpenAI documents its crawler user agents publicly, and the distinctions are not academic. Each bot does a different job, and each one changes what ChatGPT can do with your site.',
          'Check your robots.txt for all three names, then check with your host or CDN as well. Many platforms now ship one-click AI bot blocking that is enabled by default, and owners discover it only when traffic never arrives.',
        ],
        bullets: [
          'OAI-SearchBot: the search crawler. It builds the index ChatGPT search draws from. Block it and your pages are effectively invisible to ChatGPT search, no matter how good they are.',
          'GPTBot: the training crawler. It gathers content used to train future models. Blocking it does not remove you from ChatGPT search results, but it does take you out of the training pipeline.',
          'ChatGPT-User: the on-demand fetcher. It retrieves a page in real time when a user asks ChatGPT about a specific URL. Block it and ChatGPT cannot answer questions about your pages on request.',
        ],
      },
      {
        heading: 'Get crawlable, then get easy to read',
        steps: [
          'Confirm robots.txt does not block OAI-SearchBot, GPTBot or ChatGPT-User, unless blocking them is a deliberate business decision you made on purpose.',
          'Make sure key pages render without requiring JavaScript gymnastics, return status 200 quickly, and are listed in an XML sitemap.',
          'Set up and verify Bing Webmaster Tools, submit your sitemap there, and check for crawl errors. Bing is a separate index from Google, and being fine in Google proves nothing about Bing.',
          'Keep titles, headings and page content consistent with what you want to be quoted on, because retrieval matches pages to queries before anything is read.',
        ],
      },
      {
        heading: 'Write content ChatGPT can quote',
        paragraphs: [
          'When ChatGPT composes an answer, it lifts short, clear passages it can stand behind. Content structured as a wall of storytelling buries the quotable part; content structured as an answer presents it immediately.',
        ],
        bullets: [
          'Use headings phrased as the questions customers actually ask, and answer each one in the first sentence or two beneath it.',
          'Keep a direct answer of roughly 40 to 60 words near the top of each section, then add the nuance below.',
          'Prefer specific, checkable statements: prices and what affects them, timelines, materials, requirements, names of things. Vague prose gives a model nothing to cite.',
          'Date your content visibly and keep facts current, because stale pages get skipped when fresher ones say the same thing.',
        ],
      },
      {
        heading: 'Structured data, llms.txt and other signals',
        paragraphs: [
          'Schema markup does not make ChatGPT cite you, but it makes your facts unambiguous to any machine: what you sell, where you operate, what an article covers. FAQPage, Product, LocalBusiness and Article markup are the workhorses for most businesses.',
          'llms.txt is an emerging, optional proposal for pointing AI systems at your best content; it costs almost nothing to add and there is no harm in being early. Treat every vendor claim about llms.txt as a magic ranking switch with suspicion, though. It is a signpost, not a teleporter.',
        ],
      },
      {
        heading: 'The uncomfortable truth: off-site mentions carry weight',
        paragraphs: [
          'Ask ChatGPT who the best option is in your category and it will often answer from lists, review sites, directories, forums and news coverage rather than from company websites. Your reputation, as far as the model sees it, is the sum of what the web says about you.',
          'The practical moves are unglamorous: get listed in the reputable directories your industry actually reads, earn real reviews, contribute genuinely helpful answers where your customers ask questions, and get covered locally when you do something worth covering. Do not astroturf. Faked enthusiasm violates platform policies, and models are surprisingly good at smelling it.',
        ],
      },
      {
        heading: 'How to measure progress without fooling yourself',
        steps: [
          'Keep a fixed list of ten questions a real customer would ask, including ones that do not name your brand, and run them in ChatGPT monthly. Count citations. Ten queries is a small sample, so treat trends, not single runs, as the signal.',
          'Watch analytics for referrals from chatgpt.com and openai.com domains, and from Bing, knowing that many AI answers produce zero clicks by design.',
          'Check Bing Webmaster Tools for index coverage of your key pages, because retrieval starts there.',
          'Judge readiness separately from outcomes. Readiness, you control. Outcomes, you influence.',
        ],
        callout:
          'Our free audit at The SEO Audit Factory includes an AI search readiness check, because being crawlable and quotable is the part you can actually control. The report frames findings as five ways you are losing money, including the AI-shaped ones.',
      },
    ],
    faqs: [
      {
        q: 'Can I pay OpenAI to appear in ChatGPT search?',
        a: 'No. There is no paid placement for citations in ChatGPT answers. Anyone selling guaranteed ChatGPT citations is selling either ignorance or fabrication.',
      },
      {
        q: 'If I block GPTBot, do I disappear from ChatGPT search?',
        a: 'No. GPTBot governs training data. The search crawler is OAI-SearchBot, and blocking that one is what removes you from search visibility. Decide about each deliberately.',
      },
      {
        q: 'How long until my site shows up in ChatGPT answers?',
        a: 'Crawl cycles take days to weeks, and competitive queries may never feature you. Track monthly, in writing, so you are measuring trends rather than moods.',
      },
      {
        q: 'Does ranking in Google help with ChatGPT?',
        a: 'Indirectly, yes. Authority signals, content quality and third-party mentions overlap heavily across engines, but the indexes are different, so do the Bing-side work too.',
      },
      {
        q: 'Is it worth adding my site to directories for AI visibility?',
        a: 'For the reputable ones your industry and local area actually use, yes, because assistants lean on third-party sources when recommending. Skip paid blasts to hundreds of junk directories.',
      },
    ],
    sources: [
      { label: 'OpenAI crawler documentation', url: 'https://platform.openai.com/docs/bots' },
      { label: 'Bing Webmaster Tools', url: 'https://www.bing.com/webmasters' },
      { label: 'schema.org', url: 'https://schema.org' },
      { label: 'llms.txt specification', url: 'https://llmstxt.org' },
    ],
    related: ['geo-vs-seo', 'how-to-get-cited-by-perplexity', 'schema-markup-explained'],
  },
  {
    slug: 'how-to-get-cited-by-perplexity',
    title: 'How to Get Cited by Perplexity: What Actually Matters',
    category: 'AI Search',
    description:
      'What Perplexity looks for when picking sources: PerplexityBot crawling, freshness, direct answers, footnotes and topical depth, with honest guidance and no hype.',
    readMinutes: 8,
    updated: 'November 2026',
    intro:
      'Perplexity answers questions by searching the live web and footnoting the sources behind each claim, which makes it one of the most transparent AI engines to optimize for. Its crawler, PerplexityBot, has to reach and read your pages, and its answer system favors pages that state answers directly, stay fresh and go deep on a topic. You cannot guarantee a citation; you can make yourself impossible to overlook.',
    keyTakeaways: [
      'PerplexityBot must be allowed in robots.txt and at your firewall, or you are invisible by definition.',
      'Perplexity footnotes its answers, so it prefers sources that state the answer plainly near the top.',
      'Source dates are displayed to users, so visibly updated pages beat stale ones with identical content.',
      'Depth beats tricks: clusters of related pages establish you as a source on a topic.',
      'Structured data clarifies facts, but clean human-readable sentences do the real work.',
      'Track perplexity.ai referrals and run your own monthly query checks instead of trusting vendor promises.',
    ],
    sections: [
      {
        heading: 'How Perplexity builds an answer',
        paragraphs: [
          'When you ask Perplexity something, it runs live searches, retrieves promising pages, reads them and writes a synthesized answer with numbered footnotes linking to the sources it used. You are not competing for a blue link position; you are competing to be one of a handful of footnotes.',
          'That reframes the goal. A footnote goes to the page that answers the question cleanly and credibly, not the page with the most keywords or the biggest brand.',
        ],
        callout:
          'Every optimization below falls into one of two buckets: make sure Perplexity can reach your pages, and make your pages worth quoting. Everything else is noise.',
      },
      {
        heading: 'PerplexityBot and technical access',
        steps: [
          'Check robots.txt for PerplexityBot. Perplexity documents its crawler, and blocking it removes you from consideration wholesale.',
          'Ask your host or check your CDN settings for AI crawler blocking. Many platforms now ship one-click AI bot blocks that are enabled by default, and site owners discover them only when traffic never arrives.',
          'Confirm key pages return status 200 quickly and render server-side, so a crawler without a heavyweight browser still sees your content.',
          'Keep an accurate XML sitemap so fresh and important pages are discovered promptly.',
        ],
      },
      {
        heading: 'Formatting that earns the footnote',
        bullets: [
          'Answer the question in the first 100 words of the page, in one or two plain sentences, before any storytelling.',
          'Phrase section headings as the questions your customers type, so retrieval can match a passage to a query.',
          'Use short paragraphs, numbered steps and tables for anything comparative, because extractable structure survives summarization.',
          'Include specifics: prices and ranges, timelines, materials, regulations, names, dates. Specifics are what an answer engine can state with confidence.',
          'Show a visible last-updated date and mean it. Perplexity displays source dates, and users read them.',
        ],
      },
      {
        heading: 'Freshness as a competitive weapon',
        paragraphs: [
          'Because Perplexity surfaces when sources were published or updated, maintenance becomes a ranking-adjacent activity. A page updated last month has a structural advantage over the identical page updated two years ago, and users can see the difference even when the words have not changed much.',
          'Update with substance: revise statistics, add sections for questions that have emerged, fix anything that changed in your industry. Trivial date-bumping without real changes is a recognized spam pattern and can erode trust in the whole domain.',
        ],
        steps: [
          'Review your ten most important pages quarterly and improve something real on each.',
          'Retire or consolidate pages about things that are no longer true.',
          'Keep the sitemap current so recrawls find the updated versions quickly.',
        ],
      },
      {
        heading: 'Structured data and topical depth',
        paragraphs: [
          'Schema markup such as Article, FAQPage, Product and LocalBusiness gives Perplexity clean, machine-readable facts that line up with your visible text. It will not rescue thin content, but it removes friction when a model is deciding what your page actually claims.',
          'Depth matters as much as format. A single lonely page is a data point; a cluster of interlinked pages covering a topic from every angle is a source. Build the hub, cover the related questions, and link them together so a crawler that lands anywhere can see the territory.',
        ],
      },
      {
        heading: 'What does not work',
        bullets: [
          'Keyword stuffing: Perplexity reads for meaning, and stuffed pages read badly to humans and machines alike.',
          'Buying citations: nobody resells Perplexity footnotes, so anyone offering to is reselling disappointment.',
          'Mass-producing thin AI pages: retrieval favors corroborated, substantive sources, and volume of shallow pages does not substitute.',
          'Hiding text or cloaking: serving bots different content than users violates the norms every major engine documents, and gets sites excluded.',
        ],
      },
      {
        heading: 'Measuring honestly',
        steps: [
          'Baseline today: run ten real customer questions through Perplexity and record which sources get cited, including your competitors.',
          'Watch analytics for referrals from perplexity.ai and related domains, and note what those visitors do next.',
          'Re-run the same ten questions monthly. Progress is a rising citation count and better share versus competitors, not one lucky run.',
          'Separate readiness from results: access, formatting and freshness are yours to control, and citation outcomes follow with time and luck. Our free audit reports your AI readiness as part of five ways you are losing money, so you know which bucket each fix belongs to.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does Perplexity use Google or Bing results?',
        a: 'Perplexity runs its own search stack and its own crawler, PerplexityBot, and does not simply resell Google or Bing results. Its documentation describes the crawler; the full ranking recipe is not public.',
      },
      {
        q: 'Will structured data alone get me cited?',
        a: 'No. Schema clarifies facts, but citation comes from content that answers a question clearly and credibly. Schema is the labeling; the content is the product.',
      },
      {
        q: 'How quickly can I appear in Perplexity answers?',
        a: 'Crawling and index refresh take days to weeks, and competitive queries can take months or never. Judge monthly trends, not daily curiosity.',
      },
      {
        q: 'Can I block PerplexityBot and still rank in Google?',
        a: 'Yes, robots.txt directives apply per bot. Just understand the trade: blocking PerplexityBot removes you from Perplexity answers entirely while leaving Google untouched.',
      },
      {
        q: 'Do Perplexity visitors convert?',
        a: 'They tend to be mid-research and click through to sources more than on some other AI surfaces. Your analytics will answer this better than any general claim; watch perplexity.ai referrals for a couple of months.',
      },
    ],
    sources: [
      { label: 'Perplexity documentation', url: 'https://docs.perplexity.ai' },
      { label: 'Perplexity docs: getting started', url: 'https://docs.perplexity.ai/guides/getting-started' },
      { label: 'schema.org', url: 'https://schema.org' },
      { label: 'llms.txt specification', url: 'https://llmstxt.org' },
    ],
    related: ['how-to-appear-in-chatgpt-search', 'google-ai-overviews-optimization', 'what-is-answer-engine-optimization'],
  },
  {
    slug: 'google-ai-overviews-optimization',
    title: 'Google AI Overviews Optimization: How to Be the Source',
    category: 'AI Search',
    description:
      'How Google AI Overviews choose sources, and how helpful content, question headings, concise answers and schema make your site the one worth citing.',
    readMinutes: 9,
    updated: 'November 2026',
    intro:
      'Google AI Overviews are AI-written summaries that appear above traditional results for many informational queries, with links to the pages Google drew on. There is no opt-in switch and no paid inclusion; Google has said eligibility comes from its existing ranking and quality systems. Your job is to rank well, answer clearly and keep your facts machine-readable, because that is what the system draws from.',
    keyTakeaways: [
      'AI Overviews are built on Google existing ranking systems, including Gemini models, not on a separate index you can game.',
      'There is no switch to opt in, and no way to pay for a citation inside one.',
      'Googlebot crawling is the entry fee; Google-Extended governs Gemini training use and does not control search visibility.',
      'Question-shaped headings plus a concise 40 to 60 word answer make a page liftable.',
      'Schema marks up your facts, but readable sentences do the persuading.',
      'Pages that get cited typically already rank well, so traditional SEO remains the main lever.',
    ],
    sections: [
      {
        heading: 'What AI Overviews are',
        paragraphs: [
          'For a growing share of informational searches, Google generates a summary at the top of results, assembled by its models from pages it found, with links to sources. It behaves differently from featured snippets: it is generated per query, it synthesizes multiple sources, and it handles longer, more conversational questions.',
          'Availability varies by query, language and country, and the experience keeps evolving since its 2024 launch. That volatility is precisely why the durable strategy is making your site genuinely quotable rather than chasing each interface change.',
        ],
      },
      {
        heading: 'What Google has actually said',
        bullets: [
          'Google guidance is that no special action is required to be eligible for AI features, beyond what makes pages eligible for Search generally: being crawlable and indexed.',
          'Its people-first content guidance applies unchanged; the systems that decide what to summarize build on the same quality signals that decide what to rank.',
          'Google publishes a dedicated help page about AI features and your website, and it is the only source worth trusting on this topic. Everything else, including this article, is interpretation layered on top.',
        ],
        paragraphs: [
          'Read that page once, then get suspicious of anyone selling an AI Overview optimization package with confident mechanics. Nobody outside Google knows the exact recipe, including the people selling it.',
        ],
      },
      {
        heading: 'Googlebot, Google-Extended and what each controls',
        paragraphs: [
          'Two Google tokens get confused constantly, and the difference matters to your strategy.',
        ],
        bullets: [
          'Googlebot: the crawler behind Search, and therefore behind AI Overviews, which draw on indexed content. Do not block it if you want to exist in Google at all.',
          'Google-Extended: a robots.txt token controlling whether your content can be used to train Gemini and Vertex AI models. Per Google documentation, it does not affect eligibility in Search or other Google products.',
        ],
        paragraphs: [
          'So the decision to block Google-Extended is about training use, not about AI Overviews. Decide it as a policy question, knowing that blocking it does not remove you from search or summaries.',
        ],
      },
      {
        heading: 'Formatting: be the answer, not just a source',
        steps: [
          'For each important page, write down the question a customer is really asking, and make the page main heading and intro answer it without a windup.',
          'Place a direct answer of roughly 40 to 60 words immediately under each question-shaped heading, then expand with detail, examples and edge cases.',
          'Use lists and tables for anything comparative or sequential; generated summaries favor extractable structure.',
          'Keep facts specific and current, with a visible update date. Summaries prefer sources that look maintained.',
        ],
      },
      {
        heading: 'Schema that helps Google understand you',
        bullets: [
          'Article with dates, so Google knows what is current; Organization and LocalBusiness, so it knows who you are and where you operate.',
          'Product for anything you sell, with prices and availability; FAQPage for genuine FAQs. Note that Google now displays FAQ rich results mainly for authoritative government and health sites, but the markup still helps machines parse your page.',
          'Validate with the Rich Results Test and fix errors before admiring warnings.',
        ],
        paragraphs: [
          'Schema is labeling, not magic. It removes ambiguity about facts you have already published, which matters in an ecosystem where machines assemble answers from your sentences.',
        ],
      },
      {
        heading: 'Why traditional rankings still carry the flag',
        paragraphs: [
          'AI Overviews draw on content that Google ranking systems already surfaced for the query. A page buried on page five is rarely the one being summarized, whatever its formatting. Everything that earns rankings, relevance, depth, authority, a technically sound site, also earns AI Overview consideration.',
          'Treat AI Overviews as a tax and a dividend on the same work. The tax: informational queries may send fewer clicks than they used to. The dividend: a cited page gets prominent placement and brand exposure that a plain ranking never provided.',
        ],
      },
      {
        heading: 'Measuring without panicking',
        steps: [
          'Watch Search Console for impressions and clicks on affected queries; changes there are the ground truth, and they arrive faster than any third-party tool.',
          'Manually note which of your key queries show an AI Overview today, and re-check monthly. Volatility is the norm.',
          'Track branded search volume as a proxy for the exposure citations create.',
          'Shift content effort toward queries where you can realistically be the source, and accept that some informational queries are now won by the summary itself.',
        ],
        callout:
          'Our free audit covers AI readiness alongside classic technical checks, and reports the findings as five ways you are losing money, so you can fix the quiet leaks before they become loud ones.',
      },
    ],
    faqs: [
      {
        q: 'Can I opt my site out of AI Overviews?',
        a: 'There is no dedicated switch. Google preview controls such as nosnippet also limit how content appears in AI features, so limiting summaries limits the exposure too, and blocking Googlebot removes you from Search entirely. Opting out of Overviews while keeping normal search visibility is not a choice Google currently offers.',
      },
      {
        q: 'Do AI Overviews reduce my clicks?',
        a: 'On some informational queries, yes, and on others a citation can raise clicks and brand searches. The honest move is to measure your own queries in Search Console rather than adopt someone else panic.',
      },
      {
        q: 'Should I block Google-Extended?',
        a: 'It is a business decision about training use, not a search visibility decision. Google documents that Google-Extended does not affect eligibility in Search or other Google products.',
      },
      {
        q: 'How do I become one of the cited sources?',
        a: 'Rank well for the query, answer the question clearly near the top of the page, structure the detail beneath it, and keep facts current. There is no separate submission process or secret tag.',
      },
      {
        q: 'Do AI Overviews appear for local searches?',
        a: 'They appear more often for informational and how-to style queries than for straightforward local intent, where the map pack still dominates. Keep your Business Profile in order regardless.',
      },
    ],
    sources: [
      { label: 'Google: AI features and your website', url: 'https://developers.google.com/search/docs/appearance/ai-features' },
      { label: 'Google: creating helpful, people-first content', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content' },
      { label: "Google: Google's crawlers and fetchers overview", url: 'https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers' },
      { label: 'Google Rich Results Test', url: 'https://search.google.com/test/rich-results' },
    ],
    related: ['what-is-answer-engine-optimization', 'how-to-appear-in-chatgpt-search', 'schema-markup-explained'],
  },
  {
    slug: 'geo-vs-seo',
    title: 'GEO vs SEO: What Generative Engine Optimization Actually Adds',
    category: 'AI Search',
    description:
      'GEO and AEO overlap with SEO but are not replacements. Compare goals, tactics and measurements, and see why fundamentals still decide who gets cited.',
    readMinutes: 7,
    updated: 'November 2026',
    intro:
      'GEO, generative engine optimization, is the practice of making content easy for AI systems to find, quote and credit, while AEO, answer engine optimization, aims the same effort at answer boxes and voice assistants. Both are layers on top of SEO rather than replacements for it, because generative engines draw heavily on the same signals that drive rankings. If your foundations are solid, GEO is mostly formatting and measurement, not a rebuild.',
    keyTakeaways: [
      'SEO ranks pages, AEO wins answer boxes and voice answers, GEO earns citations inside AI-generated responses.',
      'All three stand on the same floor: crawlability, quality content, authority and freshness.',
      'The genuinely new GEO tactics are formatting for quotability and earning off-site mentions.',
      'Citations are harder to measure than clicks, so honest measurement matters more here, not less.',
      'No vendor can guarantee AI citations; guarantees are a red flag, not a feature.',
      'Do SEO first, GEO second: a site that cannot rank will not be quoted either.',
    ],
    sections: [
      {
        heading: 'Three acronyms, one web',
        paragraphs: [
          'SEO, search engine optimization, is the discipline of earning visibility in search results. AEO, answer engine optimization, targets the places that read a single answer aloud or display one directly: featured snippets, People Also Ask boxes and voice assistants. GEO, generative engine optimization, targets systems that compose their own responses and credit sources: ChatGPT, Perplexity, Google AI Overviews and their peers.',
          'The doors differ, the building is the same. All three ultimately depend on a site that machines can reach, read, trust and quote.',
        ],
      },
      {
        heading: 'The comparison at a glance',
        bullets: [
          'Goal: SEO earns rankings and clicks; AEO owns the featured snippet and the spoken answer; GEO earns a citation inside an AI response.',
          'Surfaces: SEO blue links and map packs; AEO snippets, People Also Ask and voice assistants; GEO ChatGPT, Perplexity, Gemini and AI Overviews.',
          'Core tactics: SEO keywords, links and technical health; AEO concise direct answers and clean structure; GEO quotable facts, schema, freshness and third-party mentions.',
          'Measurement: SEO rankings, traffic and conversions; AEO snippet ownership; GEO citation checks and AI referrer traffic, measured manually and imperfectly.',
          'Buying your way in: impossible in all three. Ads exist on the edges of these surfaces; they do not purchase citations.',
          'Guarantees: none exist in any of the three, and a vendor offering them in any category is telling you who they are.',
        ],
      },
      {
        heading: 'Where they overlap completely',
        paragraphs: [
          'Crawlability is universal: an engine that cannot fetch your page cannot quote it, whether that engine is Googlebot or PerplexityBot. Quality is universal: systems tuned to reward helpful, accurate content reward it in every surface. Authority is universal: corroboration from other sites raises confidence everywhere.',
          'In practice, a well-optimized SEO page and a well-optimized GEO page are about ninety percent the same artifact: fast, clear, accurate, structured and maintained. The differences are the last mile, not the foundation.',
        ],
      },
      {
        heading: 'Where GEO genuinely differs',
        bullets: [
          'Passage-level citation: AI engines quote the paragraph, not the whole page, so individual sections must stand alone as complete answers.',
          'Off-site mentions: generative answers lean on what the web says about you, lists, reviews, forums and news, more than classic ranking ever did.',
          'Conversational queries: people ask full-sentence questions, which rewards content phrased around real questions rather than stub keywords.',
          'Zero-click by design: a citation can build your brand without sending a click, so measurement must widen beyond sessions.',
        ],
      },
      {
        heading: 'Why fundamentals still win',
        paragraphs: [
          'Generative engines retrieve from indexes and rank candidate sources with systems that look a lot like traditional search ranking. The glossy GEO tactics of the month, secret tags, prompt injection, citation vending machines, churn constantly because they are guesses layered on top of an opaque system.',
          'What survives the churn is boring: a technically sound site, genuinely useful content, real-world reputation and patience. If someone rebrands a standard SEO audit as proprietary GEO science and triples the invoice, you now know exactly what to call that.',
        ],
      },
      {
        heading: 'A practical order of operations',
        steps: [
          'First, fix technical SEO: indexing, speed, HTTPS, sitemaps, mobile. This is the floor for every surface.',
          'Second, list the questions your customers actually ask, in their words, and make sure each has a page or section that answers it directly.',
          'Third, format for quotability: question-shaped headings, 40 to 60 word direct answers, steps and tables, visible update dates.',
          'Fourth, add schema where it maps to your business and validate it.',
          'Fifth, build depth: interlinked clusters on your core topics, plus reviews and mentions on reputable third-party sites.',
          'Sixth, measure monthly: rankings and clicks in Search Console, citations in ChatGPT and Perplexity, AI referrers in analytics.',
        ],
        callout:
          'The SEO Audit Factory checks both sides of this divide in one free pass: traditional technical health and AI search readiness, reported as five ways you are losing money. Foundations first, garnish second.',
      },
    ],
    faqs: [
      {
        q: 'Is GEO a real discipline or just rebranded SEO?',
        a: 'It is a real layer on top of SEO with a few genuinely new tactics, mostly formatting for quotability and managing off-site reputation. Much of what is sold as GEO, though, is standard SEO with a new invoice.',
      },
      {
        q: 'Should I rewrite my whole website for GEO?',
        a: 'No. Keep what works and tighten the last mile: direct answers under question-shaped headings, current dates, and schema where relevant. Full rewrites discard equity for fashion.',
      },
      {
        q: 'Do backlinks still matter for AI citations?',
        a: 'Yes. Retrieval and ranking still lean on authority signals, and corroboration across the web is how models decide which sources to trust.',
      },
      {
        q: 'Which AI engine should I prioritize?',
        a: 'The ones your customers use. A useful default for most businesses: Google first, then ChatGPT and Perplexity, since they command the most usage and lean on the most visible indexes.',
      },
      {
        q: 'How do I measure GEO without fancy tools?',
        a: 'A fixed list of ten real customer questions, run monthly in each engine, with citation counts written down. Add AI referrer traffic in analytics. Imperfect but honest beats a dashboard that fabricates certainty.',
      },
    ],
    sources: [
      { label: 'Google: AI features and your website', url: 'https://developers.google.com/search/docs/appearance/ai-features' },
      { label: 'Google: creating helpful, people-first content', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content' },
      { label: 'schema.org', url: 'https://schema.org' },
      { label: 'llms.txt specification', url: 'https://llmstxt.org' },
    ],
    related: ['what-is-answer-engine-optimization', 'how-to-appear-in-chatgpt-search', 'how-to-save-money-on-seo'],
  },
  {
    slug: 'what-is-answer-engine-optimization',
    title: 'What Is Answer Engine Optimization (AEO)?',
    category: 'AI Search',
    description:
      'Answer engine optimization (AEO) is structuring content so answer engines can quote it directly. Learn what citation-ready content looks like, honestly.',
    readMinutes: 7,
    updated: 'November 2026',
    intro:
      'Answer engine optimization, AEO, is the practice of structuring content so answer engines, from Google featured snippets to ChatGPT and Perplexity, can lift a clean, correct answer straight from your page. Citation-ready content states the answer up front in plain sentences, organizes detail beneath it, and marks up facts with structured data. It works best as an upgrade to solid SEO, not a replacement for it.',
    keyTakeaways: [
      'AEO makes content quotable: direct answers first, supporting detail below, facts labeled with schema.',
      'Answer engines favor definitions, numbered steps, comparison tables and FAQs that mirror real questions.',
      'Retrieval, extractability, corroboration and freshness are the four things that decide who gets quoted.',
      'Structure that helps machines is the same structure that helps skimming humans; there is no trade-off.',
      'Measure with citation counts, snippet ownership and AI referrer traffic, not vendor scores.',
      'Nobody can guarantee citations; treat promises of guaranteed placement as a refund request waiting to happen.',
    ],
    sections: [
      {
        heading: 'What counts as an answer engine',
        bullets: [
          'Google featured snippets and People Also Ask boxes, the original answer engines.',
          'Voice assistants that read a single result aloud, where position two is a rounding error away from zero.',
          'Google AI Overviews and Bing Copilot, which summarize the web with links.',
          'ChatGPT search and Perplexity, which retrieve pages and synthesize footnoted answers.',
        ],
        paragraphs: [
          'They differ in plumbing but share one behavior: they extract a short passage and present it as the answer. AEO is the craft of being the page that passage comes from.',
        ],
      },
      {
        heading: 'How answer engines pick sources',
        bullets: [
          'Retrieval: your page must be indexed and matched to the question, which is where crawlability and relevance earn their keep.',
          'Extractability: a clean, self-contained passage must exist on the page, ideally answering the question in one or two sentences.',
          'Corroboration: engines gain confidence when other sources agree with you, which is why accuracy and consistency across the web matter.',
          'Freshness: for anything time-sensitive, visibly maintained pages beat stale ones with identical words.',
        ],
        paragraphs: [
          'Notice what is absent: tricks. Every factor above is a dressed-up version of being genuinely useful, which is either disappointing or liberating depending on your vendor.',
        ],
      },
      {
        heading: 'Templates that work',
        paragraphs: [
          'Four formats cover most of what answer engines want to quote: a definition stated up front, a numbered step list, a small comparison table and a set of real FAQs. Each is also just good writing, which is not a coincidence.',
          'For anything with options, add a small table with clear column labels such as price, time, difficulty and best for. Tables survive summarization better than paragraphs, and they give a customer a decision in ten seconds.',
        ],
      },
      {
        heading: 'The definition block',
        level: 3,
        paragraphs: [
          'Open with the term and its definition in the first sentence: a what-is page that defines its subject inside the first twenty words. Then spend the rest of the section on how it works, why it matters and where it is commonly misunderstood. The first sentence is the part engines lift; the rest is why you deserve the lift.',
        ],
      },
      {
        heading: 'The step list',
        level: 3,
        paragraphs: [
          'How-to content earns citations when steps are genuinely sequential, one action per step, each starting with a verb. Numbered steps also let answer engines present your process nearly verbatim, which is exactly what you want.',
        ],
      },
      {
        heading: 'The FAQ block',
        level: 3,
        paragraphs: [
          'Real questions from sales calls and support tickets, answered in two to four sentences each. Fake questions nobody asks are padding, and engines are increasingly tuned to skip them. If your FAQ answers things people actually wonder, it is doing three jobs at once: helping customers, helping agents, helping engines.',
        ],
      },
      {
        heading: 'Schema: labeling the facts',
        paragraphs: [
          'Structured data is a machine-readable caption on your content: this is an Article, published then updated; this is a Product, costing this much; this is a LocalBusiness at this address; these are genuine FAQs. It removes ambiguity when an engine is deciding what your page claims, and it feeds the rich results Google still shows.',
        ],
        bullets: [
          'Organization and LocalBusiness for who and where; Product for what you sell; Article for content with dates; FAQPage for real FAQs.',
          'Validate with Google Rich Results Test or the schema.org validator before celebrating.',
          'Keep schema consistent with the visible page. Markup that contradicts your content is treated as spam, and rightly so.',
        ],
      },
      {
        heading: 'Measuring progress, and the mistakes to avoid',
        paragraphs: [
          'Measurement keeps AEO honest, and a short list of avoidable errors keeps it cheap. Run the loop below monthly, and treat the mistake list as a pre-flight check before publishing anything new.',
        ],
        steps: [
          'Baseline today: note which of your target questions currently show a snippet, an AI Overview, or a ChatGPT or Perplexity citation, and who owns each.',
          'Re-check monthly with the same question list, and record movement either way. Citations are volatile, so trends beat single data points.',
          'Track AI referrer domains in analytics, knowing most AI answers send no click and the click is not the only value.',
          'Report citations alongside rankings and conversions, not instead of them. AEO is a channel, not a religion.',
        ],
        bullets: [
          'Burying the answer under three paragraphs of throat-clearing. If the answer is not near the top, it is not really there.',
          'Rewriting the entire site to chase one format. Tighten the pages that target real questions first.',
          'Schema spam: marking up content that is not on the page, or inventing FAQs to wear the badge.',
          'Chasing every engine with a panic response to each update. The fundamentals do not change that fast.',
          'Believing guarantees. Citations are earned in systems nobody outside the engines fully controls.',
        ],
        callout:
          'If you want to know whether your pages are quotable today, The SEO Audit Factory free audit checks answer readiness alongside technical health and reports it as five ways you are losing money. No signup, no invoice, no drama.',
      },
    ],
    faqs: [
      {
        q: 'Is AEO different from SEO?',
        a: 'It is a specialized layer. SEO earns visibility in ranked results; AEO formats that visibility for extraction, so an engine can lift one clean answer. The foundations are identical, and AEO without SEO has nothing to stand on.',
      },
      {
        q: 'Do I need FAQ schema on every page?',
        a: 'No. FAQPage markup belongs where genuine FAQs exist. Google limits FAQ rich result display to authoritative government and health sites, but accurate markup can still help machines understand the page.',
      },
      {
        q: 'How long does it take to see citations?',
        a: 'Snippet changes can happen within weeks of reformatting. AI citation changes lag crawling and index refresh, so think in months, and accept that some competitive questions may never feature you.',
      },
      {
        q: 'Can a small business win citations against big brands?',
        a: 'Yes, especially on specific long-tail questions the giants have not bothered to answer precisely. Depth and clarity beat size on narrow questions.',
      },
      {
        q: 'What is the fastest AEO win for most sites?',
        a: 'Take your five most visited pages, make each heading a real question, and put a two-sentence direct answer immediately under it. An hour of work, often visible within a month.',
      },
    ],
    sources: [
      { label: 'Google: introduction to structured data', url: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data' },
      { label: 'schema.org', url: 'https://schema.org' },
      { label: 'Google: creating helpful, people-first content', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content' },
      { label: 'llms.txt specification', url: 'https://llmstxt.org' },
    ],
    related: ['geo-vs-seo', 'google-ai-overviews-optimization', 'how-to-create-an-llms-txt-file'],
  },
];
