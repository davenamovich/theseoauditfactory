import type { KnowledgeArticle, GlossaryTerm, ResourceLink } from './types';

// Articles B: performance, industries, local, money, technical and AI search pieces.
// Every article stands alone and cites only real, verifiable primary sources.

export const ARTICLES_B: KnowledgeArticle[] = [
  {
    slug: 'website-speed-optimization',
    title: 'Website Speed Optimization: Where Sites Lose Seconds and Money',
    category: 'Performance',
    description:
      'Speed is money. Find where slow pages lose customers and hosting bills grow, then fix image weight, render-blocking scripts, caching, fonts and TTFB.',
    readMinutes: 7,
    updated: 'November 2026',
    intro:
      'A slow website charges you twice: once in visitors who leave before the page finishes loading, and again in hosting and bandwidth bills inflated by oversized files. Website speed optimization is mostly disciplined cleanup, not a rebuild: compress images, cut render-blocking scripts, cache properly and make sure your hosting answers quickly. Most small business sites can find several seconds of improvement in an afternoon of focused work.',
    keyTakeaways: [
      'Images are usually the biggest single source of page weight; compress and resize before uploading.',
      'Render-blocking scripts and web fonts delay the moment a page becomes usable.',
      'Hosting quality shows up in TTFB, the time it takes your server to start answering.',
      'Caching lets repeat visits and busy periods skip most of the work.',
      'Measure with PageSpeed Insights and track Core Web Vitals: LCP, INP and CLS.',
      'Leaner pages use less bandwidth, which is a direct saving on hosting bills.',
    ],
    sections: [
      {
        heading: 'Where the seconds actually go',
        paragraphs: [
          'Every page load is a short relay race: the browser asks your server for the page, the server answers, the browser downloads the assets it needs, and only then can a visitor see and use anything. Time leaks at every leg of that race, and the leaks are usually not where owners guess. It is rarely the design; it is what the design is carrying.',
          'The four repeat offenders are oversized images, render-blocking scripts, slow server responses and inefficient font loading. Diagnose before you treat: run the page through PageSpeed Insights and read the opportunities section rather than guessing at what feels slow.',
        ],
        bullets: [
          'Images: usually the largest share of page weight on small business sites.',
          'Scripts: chat widgets, trackers and tag managers that block what the browser can show.',
          'Server response: slow hosting turns every page on the site slow at once.',
          'Fonts: several families and weights force extra downloads before text renders.',
        ],
      },
      {
        heading: 'Image weight: the usual suspect',
        paragraphs: [
          'The single most common speed problem on small business sites is a photo straight off a phone: several megabytes, displayed at 800 pixels wide. The browser downloads every byte anyway. Resizing and compressing before upload routinely cuts an image file by more than nine tenths, which is not optimization so much as hygiene.',
          'Modern formats help further. WebP and AVIF carry the same visual information in a fraction of the size of older formats, and every mainstream browser now supports WebP. Most content management systems can convert automatically with a plugin or a built-in setting, so there is little excuse left.',
        ],
        steps: [
          'Export images at the size they are actually displayed, not larger.',
          'Compress before upload using any standard image tool or your CMS image settings.',
          'Convert to WebP where your platform supports it.',
          'Lazy-load images below the fold so they load only when a visitor scrolls to them.',
          'Skip auto-playing hero videos and five-slide carousels; one strong still image loads faster and communicates better.',
        ],
        callout:
          'A before-and-after test: compress your homepage hero image and reload. If the page suddenly feels instant, you have just found most of your problem.',
      },
      {
        heading: 'Render-blocking scripts and third-party tags',
        paragraphs: [
          'Scripts that must load before the page can render are called render-blocking, and the worst offenders are often ones you added voluntarily: chat bubbles, cookie banners, analytics tags, embedded maps and marketing pixels. Each one asks the browser to stop and fetch something before showing your content. On a site with a dozen third-party tags, that waiting adds up faster than anything happening on your own server.',
          'The fix is an audit plus delegation. List every script on the site, ask what each one earns, and remove the ones that answer nothing. For the keepers, defer or async loading lets the page paint first and the tag arrive fashionably late; a developer or a well-configured plugin can arrange this in about an hour.',
        ],
        callout:
          'One live chat widget added casually can cost more loading time than every image on the page. Keep the widget if it earns its place, but load it lazily.',
      },
      {
        heading: 'Hosting, TTFB and the bill you did not budget for',
        paragraphs: [
          'TTFB, or time to first byte, measures how long your server takes to start answering. If it is slow, every page on the site is slow no matter how tidy the images are, because nothing can begin until the server speaks. Cheap shared hosting packs thousands of sites onto one machine, and your neighbors traffic becomes your problem at exactly the busy moments.',
          'Speed is also a cost line, not just a quality line. Heavy pages burn bandwidth, bandwidth overages trigger upgrade plans, and upgrade cycles get sold as traffic growth when they are often just weight. A lean site on modest hosting frequently outperforms a bloated site on expensive hosting, which is the cheapest speed improvement available: pay less, serve less, load faster.',
          'A content delivery network, or CDN, keeps copies of your static files on servers around the world so visitors download from nearby. For most small sites it is included in modern hosting platforms or costs little, and it softens the blow of traffic spikes.',
        ],
      },
      {
        heading: 'Caching: do the work once',
        paragraphs: [
          'Caching means storing a finished result so it does not have to be rebuilt every time. Your server can cache a generated page, the CDN can cache your images, and the visitor browser can cache assets between visits. Done well, a return visitor downloads almost nothing new, and a thousand simultaneous visitors read from cache instead of hammering the server.',
        ],
        bullets: [
          'Page caching: the server saves the finished HTML instead of assembling it for every request.',
          'Browser caching: returning visitors reuse files already on their device.',
          'CDN caching: static files are served from locations close to the visitor.',
          'Most common platforms handle all three with one reputable performance plugin; configure once, then stop fiddling.',
        ],
      },
      {
        heading: 'Font loading without the flash',
        paragraphs: [
          'Web fonts are a quiet tax. Each family and weight is a separate file that must download before text can appear in that style, and a site loading four families in three weights is requesting twelve files to display a sentence. Two families and a handful of weights is plenty for almost every business.',
          'Two settings make fonts behave. Font-display swap lets text appear immediately in a fallback font and upgrades when the real one arrives, instead of hiding text entirely. Preloading your main font files moves them to the front of the queue. Subsetting, which trims the characters you never use, finishes the job.',
        ],
      },
      {
        heading: 'Measuring what matters, monthly',
        paragraphs: [
          'PageSpeed Insights is free and needs no setup: enter a URL and it grades the page and lists specific opportunities, ordered by what will help most. The numbers that matter are the Core Web Vitals Google documents at web.dev: LCP for loading, INP for interactivity and CLS for visual stability. Each metric has its own guide with the fixes that actually move it.',
          'Speed is not a one-time project because sites decay. Widgets get added, plugins update, images accumulate. A twenty-minute monthly check with PageSpeed Insights, plus the free audit report from The SEO Audit Factory if you want a second pair of eyes, keeps a small problem from becoming a redesign.',
        ],
        steps: [
          'Run your five most visited pages through PageSpeed Insights on mobile.',
          'Fix the largest opportunities first, usually images and scripts.',
          'Note your Core Web Vitals and re-test after each change.',
          'Repeat monthly and after any plugin, theme or redesign change.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How fast is fast enough?',
        a: 'Aim for your main content visible within about two and a half seconds on a mid-range phone, which is what the LCP metric measures. Faster is better, but the biggest business gains come from fixing pages that take five seconds or more. Always test on a mobile connection, not your office Wi-Fi.',
      },
      {
        q: 'Will faster pages improve my rankings?',
        a: 'Speed is a confirmed page experience signal, but it rarely outranks content quality and relevance. Treat speed as removing a handicap, not as a cheat code. The clearest business impact is conversion: fewer visitors abandon a fast page before it loads.',
      },
      {
        q: 'Do I need a developer for this?',
        a: 'Not for the basics. Resizing images, removing unused plugins and widgets, enabling caching and choosing decent hosting are all owner-level tasks in modern platforms. Bring in help for script restructuring, critical CSS and anything touching theme code.',
      },
      {
        q: 'What is the single quickest win?',
        a: 'Compress and resize your images, starting with the homepage hero. On most small business sites this hour of work removes the majority of excess page weight. It requires no code and is instantly reversible.',
      },
      {
        q: 'How often should I re-check speed?',
        a: 'Monthly is plenty, plus after any significant change such as a new plugin, a redesign or a campaign that adds tracking tags. Core Web Vitals drift quietly, so put the check on a calendar rather than waiting for complaints.',
      },
    ],
    sources: [
      { label: 'Core Web Vitals (web.dev)', url: 'https://web.dev/articles/vitals' },
      { label: 'PageSpeed Insights', url: 'https://pagespeed.web.dev' },
      { label: 'Optimize LCP (web.dev)', url: 'https://web.dev/articles/optimize-lcp' },
      { label: 'Lighthouse documentation', url: 'https://developer.chrome.com/docs/lighthouse/overview' },
    ],
    related: ['technical-seo-checklist', 'how-to-audit-a-website', 'seo-mistakes-that-cost-businesses-money'],
  },
  {
    slug: 'seo-for-contractors',
    title: 'SEO for Contractors: Winning the Trade Area Online',
    category: 'Industries',
    description:
      'How contractors win local search: trade-and-city service pages, real project proof, reviews, Google Business Profile and honest lead math for the trade area.',
    readMinutes: 8,
    updated: 'November 2026',
    intro:
      'Contractors do not need to rank everywhere; they need to be the obvious choice in the towns their trucks roll through. That takes one solid page per trade and key city, before-and-after proof from real jobs, a steady review habit and a Google Business Profile that matches your services. Generic agency templates fail contractors because they chase big keywords instead of the specific jobs customers actually search for.',
    keyTakeaways: [
      'Build one page per trade and one per key city, each with unique, specific content.',
      'Before-and-after photos and short job write-ups are proof competitors cannot copy.',
      'A review habit beats a review spike: ask every customer, every time.',
      'Your Google Business Profile and website must agree on services and service area.',
      'Work from example math, not promises: traffic, close rate and job value drive outcomes.',
      'Skip backlink packages and copy-paste city pages; they cost more than they earn.',
    ],
    sections: [
      {
        heading: 'Why generic templates fail contractors',
        paragraphs: [
          'The average agency template targets a head term like plumber or roof repair and stops there. But nobody hires a plumber; they hire someone to fix a burst pipe in a specific town today. Contractor search is trade plus place plus urgency, and a template with stock photos and one thin services page cannot win that query against a competitor who names the problem, the neighborhood and the process.',
          'Templates also flatten what makes a trade business credible: the work itself. A page that could belong to any company in any state signals exactly nothing. The bar is not beautiful; the bar is specific.',
        ],
      },
      {
        heading: 'One service page per trade, one per city',
        paragraphs: [
          'Structure beats volume. A page for each service you sell and a page for each town you serve gives search engines a precise answer for each query, and gives customers a page that reads like it was written for them. This only works when each page earns its existence; ten genuinely different pages beat a hundred near-duplicates every time.',
        ],
        bullets: [
          'Title and headline that name the trade and the area, in plain words.',
          'The specific problems you handle, listed the way customers describe them.',
          'Real photos from your jobs, not stock imagery.',
          'Your service area and typical response time stated clearly.',
          'Frequently asked questions your office actually answers by phone.',
          'One obvious next step: phone number, quote form or booking link.',
        ],
        callout:
          'A doorway page for every suburb with the same paragraph and a swapped town name is spam, and it performs like spam. Every city page needs details only that area would have: permits, soil, housing stock, response time from your shop.',
      },
      {
        heading: 'Before-and-after content that sells',
        paragraphs: [
          'Your strongest content is your job log. A short write-up of a real project: what the customer called about, what you found, what you did, how long it took, and one or two photos. It is proof, it is keyword-rich without trying, and no competitor can copy it because it happened to you.',
          'Systematize it: after notable jobs, spend ten minutes writing three paragraphs and uploading photos. Over a year this becomes dozens of pages of unique evidence, and the same material feeds social posts, email and proposals. If photographing client homes feels sensitive, ask permission and frame respectfully; most customers are pleased to be associated with a good job.',
        ],
      },
      {
        heading: 'Reviews: the compounding asset',
        paragraphs: [
          'Reviews influence the map pack as much as anything you control, and they compound. A business that asks every customer for a Google review and answers every review, good or bad, builds a visible habit of competence. A business with forty reviews from 2019 looks abandoned regardless of how good the work was.',
          'The rules are simple and enforced: never pay for reviews, never offer incentives, and do not filter who you ask. Ask everyone at the handover moment when goodwill is highest, make it a two-tap link, and let the honest mix speak. Google documents its review policies in the Business Profile help center, and violations risk losing the reviews or the profile itself.',
        ],
      },
      {
        heading: 'Google Business Profile and local schema',
        paragraphs: [
          'Your Business Profile is the listing that appears in the map pack, and it should mirror your website exactly: same services, same service area, same phone number. Pick the most specific category that fits your trade, fill in every service with a short description, and post photos weekly. An unfinished profile loses to a finished one more often than any clever tactic can compensate.',
          'On the website side, LocalBusiness schema is machine-readable labeling that connects your pages to your business details: name, phone, area served and business type. It does not work magic, but it removes ambiguity for search engines and AI assistants trying to quote your facts. Validate it with the Rich Results Test after adding it.',
        ],
      },
      {
        heading: 'Lead math done honestly',
        paragraphs: [
          'Anyone who promises you revenue from SEO is selling, not estimating. What you can do is arithmetic on clearly labeled assumptions so expectations match effort. Here is the shape of it, using example numbers only.',
        ],
        bullets: [
          'Assume 400 monthly searches across your trade area for your core services (example figure; check your own data in keyword planning tools or Search Console).',
          'Assume your pages and map listing win 20 percent of those searches (example assumption).',
          'Assume 30 percent of visitors contact you and you close half of qualified leads (example rates; track your own).',
          'That works out to roughly 12 booked leads a month at 400 x 0.2 x 0.3 x 0.5, before seasonal swings (example math, not a forecast).',
          'Now price it honestly: if an average job is $800 and your margin is a third, compare twelve jobs against the real monthly cost of the work.',
        ],
        callout:
          'Change any assumption and the answer changes, which is the point. Insist that whoever pitches you shows their assumptions, because invented revenue projections are the oldest trick in agency sales.',
      },
      {
        heading: 'What to skip, deliberately',
        paragraphs: [
          'The trade area is winnable with unglamorous work: pages that fit, proof you did the work, reviews that accumulate and a profile that is complete. That is the whole playbook, and it is one most of your competitors will not finish.',
        ],
        bullets: [
          'Backlink packages: most are spam networks that violate the spam policies Google publishes.',
          'Thirty near-identical city pages: consolidate into fewer, better pages.',
          'Directory blasts: a handful of real, relevant directories is plenty.',
          'Month-one guarantees: rankings on a schedule are a sales artifact, not a process.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Should every town I serve get its own page?',
        a: 'Only where you can write something genuinely specific: local regulations, typical housing, response time from your shop, jobs you have done there. If the only change is the town name in the text, build one strong service-area page instead. Thin duplicated pages waste crawl and credibility.',
      },
      {
        q: 'Do contractors need a blog?',
        a: 'Not a blog for its own sake, but the job write-ups described above serve the same purpose with better material. Publish when you have something real to show, not on a content calendar schedule. Ten honest project posts outweigh fifty filler articles.',
      },
      {
        q: 'How many Google reviews do I need?',
        a: 'There is no magic number; recency, volume and your responses all matter more than a threshold. Aim to add a steady trickle every month rather than a burst. Answer every review, including the unfair ones, because future customers read your replies.',
      },
      {
        q: 'How long until SEO brings contractor leads?',
        a: 'Business Profile improvements often show within weeks, while website pages can take several months to earn rankings in a competitive trade area. Anyone promising page one by Friday is guessing or bending rules. Judge progress by calls and form fills, not screenshots.',
      },
      {
        q: 'Is paid advertising better than SEO for contractors?',
        a: 'Paid search buys visibility immediately and stops the day you stop paying, which suits urgent services. SEO builds an asset that keeps working, but slowly. Many established trades run both: ads for the phone to ring this week, SEO to lower the long-run cost of every lead.',
      },
    ],
    sources: [
      { label: 'Google Business Profile Help', url: 'https://support.google.com/business' },
      { label: 'Google SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
      { label: 'LocalBusiness schema (schema.org)', url: 'https://schema.org/LocalBusiness' },
    ],
    related: ['seo-for-local-service-businesses', 'local-seo-for-small-businesses', 'free-seo-audit'],
  },
  {
    slug: 'seo-for-restaurants',
    title: 'SEO for Restaurants: Menus, Maps and Mouths',
    category: 'Industries',
    description:
      'Restaurants live and die by maps and menus. Get Google Business Profile right, feed photos and reviews, use menu schema and pick platforms with care.',
    readMinutes: 7,
    updated: 'November 2026',
    intro:
      'Restaurant search is decided in seconds on a phone: map listing, photos, menu, reviews. Your SEO priority is a complete Google Business Profile with a current menu and real photography, a steady flow of honest reviews and a website that machines can read, menu included. Everything else is platform strategy and photo discipline.',
    keyTakeaways: [
      'Your Google Business Profile is your real homepage; hours, menu and photos must stay current.',
      'Recent photos of dishes, interior and exterior drive the tap more than any keyword.',
      'Menu schema helps machines read your menu, though Google shows no dedicated menu result.',
      'Steady review velocity with responses beats chasing a perfect score.',
      'Multi-location restaurants need genuinely unique pages per location.',
      'Understand the trade-off before handing content and fees to delivery platforms.',
    ],
    sections: [
      {
        heading: 'Maps, menus and mouths',
        paragraphs: [
          'When someone searches for where to eat, they are not reading your about page; they are scanning a map, a star rating and a row of photos. The decision window is seconds, and nearly all of it happens on the search results surface rather than your website. That is why restaurant SEO is mostly profile SEO: the listing is the storefront.',
          'The website still matters, but for different jobs: hosting the menu permanently, telling your story, taking reservations without commission and giving search engines and AI assistants something accurate to quote. Treat the site as the source of truth and the profile as the shop window.',
        ],
      },
      {
        heading: 'Google Business Profile: the non-negotiables',
        bullets: [
          'Claim and verify the profile; an unclaimed listing is an open door for edits you did not make.',
          'Keep hours exact, including holiday and seasonal hours; wrong hours cost you customers who made the trip.',
          'Add your full menu or link to the menu page on your site, with prices where you are comfortable.',
          'Choose the most specific categories, such as Neapolitan pizza restaurant rather than just restaurant.',
          'Upload fresh photos weekly: dishes, plates in context, interior, exterior, signage.',
          'Add a reservation or booking link if you take bookings.',
          'Use posts for events, specials and seasonal menus.',
        ],
        paragraphs: [
          'Photos deserve emphasis. Listings with current, appetizing photography earn the tap, and the tap is the conversion. One hour of daylight phone photography every couple of weeks outperforms any paid food stylist, and the same shots feed your website and social channels.',
        ],
      },
      {
        heading: 'Menu schema in plain terms',
        paragraphs: [
          'Schema markup is labeling that tells machines what things are. On a restaurant site, the Menu, MenuSection and MenuItem types from schema.org describe your dishes, prices and sections in a format software can parse. You add it as a small script block on the menu page and check it with the Rich Results Test.',
          'An honesty check: Google does not currently produce a special rich result for restaurant menus, so menu schema will not decorate your listing. Its value is machine readability: comparison tools, scrapers and AI assistants can quote your dishes and prices accurately instead of guessing from a PDF. If your menu is a PDF image, that is the bigger problem; publish it as text on a page.',
        ],
      },
      {
        heading: 'Review velocity over review perfection',
        paragraphs: [
          'A 4.6 rating with twenty reviews this month beats a 4.9 with none since last year, because recency signals an operating business and volume builds trust. Velocity also dilutes the damage of the inevitable unfair one-star. The habit is simple: ask tables at the high point, the compliment or the clean plate, with a card or QR code that opens the review form in two taps.',
          'Never buy reviews, never incentivize them and never filter who you ask; the policies Google publishes prohibit all three and enforcement is real. Do respond to reviews, especially critical ones, briefly and without defensiveness. Your response is written for the next thousand readers, not the one complainer.',
        ],
      },
      {
        heading: 'Location pages for multiple spots',
        paragraphs: [
          'If you have several locations, each needs its own page with genuinely local content: that address, hours, parking, the neighborhood, the dishes that location is known for, the team if you like. Search engines compare pages, and five identical pages with swapped addresses read as shortcuts rather than information.',
          'Each location also needs its own Business Profile tied to the matching page, and the details must agree everywhere: name, address, phone, hours. Disagreement between your site, your profile and third-party platforms quietly suppresses visibility because the systems cannot tell which facts are true.',
        ],
      },
      {
        heading: 'Reservation and delivery platform trade-offs',
        bullets: [
          'Platforms bring reach and discovery you could not buy on your own, especially for delivery.',
          'They take commissions on every order and own the customer relationship and data.',
          'Their copies of your menu can drift out of date and outrank your own site.',
          'Keep your website the brand hub: accurate menu, your photos, direct booking.',
          'Claim your listings on the major platforms so at least the facts are yours to correct.',
        ],
        paragraphs: [
          'There is no universal right answer; a beach takeaway and a downtown fine-dining room weigh fees and reach differently. What is universal: know the numbers, and never let a third party be the only place your menu exists.',
        ],
      },
      {
        heading: 'Photo-driven content on a shoestring',
        paragraphs: [
          'Restaurants are the rare business whose content produces itself nightly. Shoot at the pass or the table in daylight where possible, keep a simple visual style, and batch: one session yields dish photos for the site, posts for the profile, clips for social and thumbnails for the delivery listing. Add short captions that name the dish and one concrete detail, the kind of text that gives search engines and AI systems something real to quote.',
          'If time is the constraint, this is where AI content tools earn their keep: The SEO Audit Factory uses Plunder & Riffle to generate its own meme and short-video content from existing material, and the same approach works for a weekly dish post. Draft with tools, approve with a human, and never post a photo of food you do not actually serve.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do restaurants still need a website if the Google profile is complete?',
        a: 'Yes. The profile wins the tap, but your site anchors the facts: the full menu in text, reservations without commission, private events, and a page AI systems can quote. A profile-only restaurant is renting its storefront.',
      },
      {
        q: 'Does menu schema get me a rich result in Google?',
        a: 'No. Google does not offer a dedicated menu rich result today. The markup still helps other machines, including AI assistants, read your dishes and prices accurately. Validate whatever you add so it parses cleanly.',
      },
      {
        q: 'How do I get more reviews without breaking Google rules?',
        a: 'Ask every table at the right moment with a two-tap link, and never offer anything in exchange for a review or filter who gets asked. Consistency beats incentives anyway. Respond to all reviews so future customers see how you handle both praise and complaints.',
      },
      {
        q: 'Should I take reservations through my own site or a platform?',
        a: 'Both, depending on your volume and the fees. Your own booking keeps the customer relationship and avoids commission, while platforms add discovery. Make sure whichever you use appears as the booking link on your Business Profile.',
      },
      {
        q: 'What matters more for restaurants, Instagram or Google?',
        a: 'They do different jobs. Instagram keeps existing fans hungry; Google decides who finds you at the moment of hunger. If you must prioritize one, prioritize the map listing, because that is where the booking decision happens.',
      },
    ],
    sources: [
      { label: 'Google Business Profile Help', url: 'https://support.google.com/business' },
      { label: 'Menu schema (schema.org)', url: 'https://schema.org/Menu' },
      { label: 'Google Rich Results Test', url: 'https://search.google.com/test/rich-results' },
    ],
    related: ['seo-for-local-service-businesses', 'local-seo-for-small-businesses', 'how-to-generate-free-marketing-content'],
  },
  {
    slug: 'seo-for-local-service-businesses',
    title: 'SEO for Local Service Businesses: The Map Pack Playbook',
    category: 'Local SEO',
    description:
      'A plain-English map pack playbook: relevance, distance and prominence, GBP categories, service areas, reviews that follow Google rules, and honest tracking.',
    readMinutes: 8,
    updated: 'November 2026',
    intro:
      'The map pack, the boxed map-and-list result for local searches, is decided by three factors Google describes publicly: relevance, distance and prominence. You control relevance with complete profile categories and service details, you work with distance by being honest about your service area, and you earn prominence through reviews, links and consistent business information. This playbook turns those three into a weekly routine.',
    keyTakeaways: [
      'Relevance, distance and prominence are the map pack factors Google describes publicly.',
      'Your primary Google Business Profile category is the strongest relevance lever you control.',
      'Service-area settings must reflect reality; proximity is not something you can fake.',
      'Reviews help only if they follow Google rules: no incentives, no gating, no fakes.',
      'Location pages and citations should repeat identical name, address and phone details.',
      'Track calls, direction requests and booked jobs, not ranking screenshots.',
    ],
    sections: [
      {
        heading: 'How the map pack actually picks winners',
        paragraphs: [
          'Google describes three factors for local results. Relevance is how well your listing matches the search. Distance is how far you are from the searcher or the area they named. Prominence is how well known and well referenced your business is, both online and off.',
          'Notice what is absent: tricks. You cannot bribe distance, and relevance is mostly accurate information rather than keyword incantations. That is good news for businesses willing to be thorough, because most of your competitors will not be.',
        ],
      },
      {
        heading: 'Relevance: categories and completeness',
        paragraphs: [
          'When Google asks what your business is, your primary category is the answer, and it carries the most weight in matching you to searches. Choose the most specific accurate category, add secondary categories for genuine secondary services, and fill every service with a plain description. A complete profile reads as confidence; a half-filled one reads as a business that might not answer the phone.',
        ],
        bullets: [
          'Primary category: the most specific one that fits, not the broadest.',
          'Secondary categories: only for services you actually sell.',
          'Services list: each with two plain sentences describing what is included.',
          'Business description: what you do, where, and one proof point.',
          'Attributes: hours, accessibility, payment options, whatever applies; completeness compounds.',
        ],
      },
      {
        heading: 'Distance: service-area settings that match reality',
        paragraphs: [
          'If customers come to you, you have a storefront address and it should be shown. If you go to customers, you can hide the address and set service areas, but only if that is genuinely how you operate; inventing an office address in a better postcode violates the rules and gets profiles suspended.',
          'Distance itself is not negotiable: you rank where you are. What you can influence is how well you cover your real area: name the towns you serve on your website, build one strong page per town you can genuinely write about, and keep the profile service area current as you expand or contract.',
        ],
      },
      {
        heading: 'Prominence: reviews that follow Google rules',
        paragraphs: [
          'Prominence is reputation, and reviews are its loudest signal. The rules Google publishes are unambiguous: do not offer payment or perks for reviews, do not write fake ones, and do not use gating, the practice of asking only customers who first say they are happy. Review gating in particular trips up well-meaning businesses using feedback software that filters.',
          'The compliant machine is simple: ask every customer, every time, at the moment of satisfaction, with a link that opens the review form in two taps. Respond to every review. Over months this produces a defensible, compounding asset that no competitor can buy, which is the point.',
        ],
      },
      {
        heading: 'Location pages and citations',
        paragraphs: [
          'Your website and your profile should tell one story. A location or service-area page per town, with unique local detail, gives Google a page to rank and gives customers specifics. Citations, meaning your business details listed on real directories and industry sites, reinforce the same facts; the details must match character for character, because systems compare.',
        ],
        bullets: [
          'One page per real location or town you actively serve, with unique content.',
          'Identical name, address and phone everywhere: site, profile, directories, invoices.',
          'A handful of meaningful citations beats fifty spammy ones; think chambers of commerce, industry associations, local news.',
          'Call tracking tools that swap in different phone numbers can muddy citations; if you use one, keep your main number in the most visible places.',
        ],
      },
      {
        heading: 'Tracking honestly',
        paragraphs: [
          'Google gives you the numbers that matter inside the profile: calls, direction requests, website clicks and booking interactions. Those, plus form fills and booked jobs from your site, are the scoreboard. Ranking positions are inputs, not results, and screenshots from a rank tracker pointed at an unrepresentative location prove nothing.',
          'Set a baseline before you change anything, then review monthly. If calls are flat after three months of honest work, the problem is usually conversion or capacity, not visibility, and no amount of map pack polish fixes a phone nobody answers. A free audit like the five ways you are losing money report from The SEO Audit Factory can separate the visibility problem from the conversion problem before you spend.',
        ],
      },
      {
        heading: 'What not to do',
        bullets: [
          'Do not stuff keywords into your business name; use your real-world name.',
          'Do not create listings at addresses you do not operate from.',
          'Do not incentivize or filter reviews.',
          'Do not copy a competitor category list blindly; accuracy wins disputes and penalties lose profiles.',
        ],
        paragraphs: [
          'None of this is clever, which is the uncomfortable part. The map pack rewards businesses that are accurate, complete and reviewed, sustained over months. The playbook is short; the discipline is the product.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I rank in a city where I have no physical address?',
        a: 'You can set service areas for towns you genuinely serve, and Google may show you there, but proximity matters and listings with addresses in that city have an edge. Build a genuinely useful page for that town and collect reviews from customers there. Do not fabricate an address; suspensions are enforced.',
      },
      {
        q: 'Do keywords in my business name help rankings?',
        a: 'They can, which is exactly why Google forbids them: your listing name must match your real-world business name. Adding Plumbing Experts of Dallas when your sign says J. Marsh risks suspension and looks sloppy to customers. Put keywords in your services and description instead.',
      },
      {
        q: 'How fast do reviews affect map pack performance?',
        a: 'Reviews influence prominence over time rather than overnight. A steady stream of new, genuine reviews plus consistent responses tends to show up in performance within a few months. There is no number that unlocks anything; the trend matters more than the total.',
      },
      {
        q: 'Are citations still worth building?',
        a: 'A handful of accurate listings on real, relevant directories still helps consistency and discovery. Mass-submitting to hundreds of low-quality directories is a paid relic that adds little. Correct any wrong listings you find, because mismatched details quietly undermine everything else.',
      },
      {
        q: 'A competitor has dozens of fake-looking reviews. Should I report them?',
        a: 'You can flag reviews that violate Google policies through the profile, and Google does remove policy-violating reviews, though not always quickly. Focus on your own review velocity rather than policing rivals. In most markets, the business that asks every customer wins the long game.',
      },
    ],
    sources: [
      { label: 'Google Business Profile Help', url: 'https://support.google.com/business' },
      { label: 'Google Search spam policies', url: 'https://developers.google.com/search/docs/essentials/spam-policies' },
      { label: 'Google SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
    ],
    related: ['local-seo-for-small-businesses', 'how-to-save-money-on-seo', 'free-seo-audit'],
  },
  {
    slug: 'how-to-save-money-on-seo',
    title: 'How to Save Money on SEO: 14 Checks Before You Spend Another Dollar',
    category: 'Money',
    description:
      'Fourteen checks that cut SEO waste: audit before buying, cancel overlapping tools, fix conversion first, spot agency red flags and know when DIY is enough.',
    readMinutes: 8,
    updated: 'November 2026',
    intro:
      'Most SEO money is wasted before any campaign starts: traffic bought for a site that cannot convert, tools that overlap, retainers buying deliverables nobody reads. Run these fourteen checks first. You will either find the fix is free, learn precisely what to buy, or discover that part of the work is a DIY afternoon rather than a line item.',
    keyTakeaways: [
      'Audit before buying; a free audit report is cheaper than a month of the wrong retainer.',
      'Fix conversion before traffic; visitors into a leaking funnel are expensive noise.',
      'Cancel overlapping subscriptions; one audit tool plus Search Console covers most small sites.',
      'Automate repetitive drafting and reporting; pay humans for judgment, not keystrokes.',
      'DIY is genuinely enough for basics: titles, profiles, reviews, image cleanup.',
      'Walk away from guaranteed rankings, mystery deliverables and packages priced per link.',
    ],
    sections: [
      {
        heading: 'Audit before you spend a dollar',
        paragraphs: [
          'The most expensive SEO is the kind bought blind. When you do not know what is broken, every pitch sounds plausible and you end up paying for services that address problems you do not have. A proper audit flips the dynamic: you walk into sales conversations knowing your three real issues, which makes you nearly impossible to upsell.',
          'You do not need to pay for that first look. The SEO Audit Factory runs a free audit and sends a five ways you are losing money report, and Google Search Console is free and shows how people currently find you. Use both; if a prospective agency dismisses your audit findings without looking at them, that is information too.',
        ],
      },
      {
        heading: 'The fourteen checks',
        paragraphs: [
          'Work through these in order. Most are free, and the list is sequenced so the cheapest, highest-impact items come first.',
        ],
        steps: [
          'Claim and complete your Google Business Profile; it is the highest-value free listing you own.',
          'Check every page title and meta description; write unique ones where they are missing or duplicated.',
          'Run your top five pages through PageSpeed Insights and compress your images before paying anyone.',
          'Open your site on your own phone over mobile data and try to finish a purchase or booking path.',
          'Search site:yourdomain.com to see what Google actually indexes; surprises here are cheap to fix early.',
          'Confirm every important page has an obvious next step: call, form, booking or directions.',
          'List every marketing tool subscription you pay for and mark the overlaps.',
          'Read the queries report in Search Console; pages with impressions but no clicks usually need better titles.',
          'Find pages that compete for the same keyword and consolidate or differentiate them.',
          'Run key pages through the Rich Results Test and fix broken structured data.',
          'Ask your three best customers how they found you, then check whether your tracking reflects that.',
          'Re-read your last three SEO invoices and match each charge to a deliverable you can name.',
          'Check that robots.txt and your sitemap are not accidentally blocking pages you want indexed.',
          'Write down one measurable goal with a number and a date before you sign anything.',
        ],
      },
      {
        heading: 'Overlapping tools are the silent budget leak',
        paragraphs: [
          'The typical small business stack accretes like sediment: an audit tool, a keyword tool, a rank tracker, a site monitor, a premium SEO plugin, each subscribed in a different month for a different reason. Individually defensible; collectively redundant. One solid audit tool plus Google free Search Console and PageSpeed Insights covers the monitoring needs of almost any site under a few thousand pages.',
          'Cancel in this order: tools you cannot name the last useful insight from, tools duplicating data Search Console gives free, and tools whose reports you forward unopened. Put annual renewals on the calendar, because silent auto-renewal is the subscription industry favorite feature and yours.',
        ],
      },
      {
        heading: 'Fix conversion before buying traffic',
        paragraphs: [
          'Buying traffic to a site that does not convert is paying to watch a leak work. If a page gets visits and no calls, adding a thousand more visits changes nothing but the bill. The cheapest conversion fixes are usually mechanical: a phone number visible without scrolling, a form with three fields instead of nine, a headline that says what you do and where.',
          'A simple test before any traffic spend: send a modest amount of paid traffic to the page, or point existing visitors at it, and see whether even one percent take action. If they do not, spend the budget on the page first. Traffic amplifies whatever a page already does, including nothing.',
        ],
      },
      {
        heading: 'Automate the repetitive work, buy the judgment',
        paragraphs: [
          'Much of what used to be billed as monthly SEO labor is now automatable: rank and vitals monitoring, first-draft meta descriptions, alt text, reporting decks, transcriptions and social variations of one article. Tools and AI handle this at trivial cost, and draft quality is fine because a human edits before anything ships.',
          'Where humans still earn fees: strategy, technical surgery, prioritization and taste. When you evaluate a provider, ask which parts of their monthly work are automated and which are judgment; the honest ones will tell you, and their pricing will make sense. We built The SEO Audit Factory on exactly this split: the machine runs the audit and drafts the report, and the recommendations are the part worth reading.',
        ],
      },
      {
        heading: 'When DIY is enough, and when it is not',
        bullets: [
          'DIY is enough for: claiming and completing your Business Profile.',
          'DIY is enough for: writing unique titles and descriptions on a site of under fifty pages.',
          'DIY is enough for: compressing images, enabling caching and trimming plugins.',
          'DIY is enough for: asking customers for reviews and answering them.',
          'Hire for: site migrations, redesigns and platform changes, where the expensive mistakes are silent.',
          'Hire for: recovering from penalties or a history of bought links.',
          'Hire for: competitive markets where the technical floor is high and judgment separates you.',
          'Hire for: anything involving JavaScript rendering, log files or international targeting, unless you enjoy reading specifications.',
        ],
        paragraphs: [
          'The honest test: if the task has a documented checklist and a clear finish, DIY it. If it has judgment calls with lasting consequences, buy it, from someone who can explain the trade-offs in your language.',
        ],
      },
      {
        heading: 'Evaluating agency pricing, and the red flags',
        paragraphs: [
          'Legitimate SEO pricing mostly tracks hours, seniority and scope, and providers should connect price to expected work rather than to vibes. Ask what specifically happens in month one, who does it and how you will judge it. Vague answers cost you months; specific ones cost only money.',
        ],
        bullets: [
          'Guaranteed rankings or guaranteed placement; nobody sells certainty in a system they do not control.',
          'A proprietary relationship with Google; Google does not do special deals with small agencies.',
          'Deliverables you cannot inspect: mystery link packages and secret dashboards.',
          'Pricing per link; links are earned or placed, and bulk pricing signals bulk networks.',
          'Twelve-month contracts proposed before any diagnosis of your site.',
          'Reports full of activity metrics with no mention of calls, leads or sales.',
        ],
        callout:
          'SEO budgets do not need to be big; they need to be pointed. Fourteen checks and a skeptical read of every proposal will save most small businesses more than the average monthly retainer, and that is before the campaign even starts.',
      },
    ],
    faqs: [
      {
        q: 'How much should a small business spend on SEO?',
        a: 'Enough to fix what your audit actually finds, then a consistent modest amount for the ongoing work of content, reviews and maintenance. For many local businesses that is a few focused hours a week plus modest tooling, or a scoped project when something technical breaks. Consistency beats size.',
      },
      {
        q: 'Are cheap SEO packages ever worth it?',
        a: 'Packages priced low enough to be impulse purchases are usually templates: the same checklist for every client, often with bulk low-quality links that create cleanup costs later. You are not saving money; you are scheduling it. Scope specific work instead of buying tiers.',
      },
      {
        q: 'Can I do SEO myself with free tools?',
        a: 'For most small sites, the fundamentals yes: Search Console and PageSpeed Insights cover diagnosis, and the fixes are documented in Google own starter guide. The judgment calls around migrations, penalties and competitive strategy are where paid expertise pays.',
      },
      {
        q: 'What should an agency actually deliver each month?',
        a: 'Named work with visible artifacts: changes made to your site, content drafted and shipped, outreach you can see, and a report connecting activity to calls, leads or sales. If the report cannot survive the question of what changed because of it, the retainer is a subscription to nothing.',
      },
      {
        q: 'How do I cancel overlapping tools without losing data?',
        a: 'Export what matters first: rankings history, audit archives, keyword lists. Most tools offer CSV export, and your irreplaceable data is usually just your own site history, which Search Console keeps free anyway. Set cancellation reminders before renewal dates, not after.',
      },
    ],
    sources: [
      { label: 'Google SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
      { label: 'PageSpeed Insights', url: 'https://pagespeed.web.dev' },
      { label: 'Google Search Console', url: 'https://search.google.com/search-console/about' },
    ],
    related: ['how-to-audit-a-website', 'free-seo-audit', 'seo-mistakes-that-cost-businesses-money'],
  },
  {
    slug: 'how-to-generate-free-marketing-content',
    title: 'How to Generate Free Marketing Content From What You Already Have',
    category: 'Money',
    description:
      'Turn the content you already have into memes, graphics, short videos and captions. Batch production, AI tooling, human review and honest rights practices.',
    readMinutes: 7,
    updated: 'November 2026',
    intro:
      'You almost certainly have a distribution problem, not a content problem. Service pages, job photos, customer questions, reviews and old emails are raw material for memes, social graphics, short videos and captions, and AI tools now turn that material into publishable drafts for free. The only non-negotiables are batching and a human review step.',
    keyTakeaways: [
      'Inventory before creating: your best content is already on your site, phone and inbox.',
      'One source asset should become a graphic, captions, a short video script and a post set.',
      'Batch production in one session beats daily scrambling all week.',
      'The SEO Audit Factory uses Plunder & Riffle as its engine for meme and video generation; similar AI tools work for any business.',
      'Human review before publishing catches wrong facts, wrong tone and AI inventions.',
      'Check rights on every photo and quote; free does not mean careless.',
    ],
    sections: [
      {
        heading: 'Inventory before creation',
        paragraphs: [
          'Before paying anyone to create content, list what exists. Most businesses are sitting on years of material: the service pages someone wrote in 2022, hundreds of job photos, reviews full of customer language, an inbox of questions the office answers daily, invoices that reveal what sells when. None of it costs anything to mine because it is already paid for.',
        ],
        bullets: [
          'Website pages: every service, product and FAQ is a week of social posts.',
          'Photos and videos: job sites, products, before-and-afters, the team at work.',
          'Reviews and testimonials: customer language is caption gold.',
          'Email threads: the questions asked five times a day are the content people actually want.',
          'Old marketing: brochures, proposals and presentations nobody has reread since they were printed.',
        ],
      },
      {
        heading: 'The repurposing ladder',
        paragraphs: [
          'Repurposing works best as a fixed ladder you climb for every source asset, rather than an act of inspiration. Take one service page and walk it up the rungs; twenty minutes later you have a week of posts from something that already existed.',
        ],
        steps: [
          'Pick one existing asset: a service page, a project write-up, a common question.',
          'Extract three specific insights or claims from it, in the words a customer would use.',
          'Turn one insight into a simple graphic with one message and readable text.',
          'Write three caption variants: one plain, one story-shaped, one question.',
          'Script a 15 to 30 second short video from the second insight: hook, point, next step.',
          'Schedule the set across the week, then start the ladder again with the next asset.',
        ],
        callout:
          'A plumbing page about water heater flushes becomes a graphic of the sediment a tank collects, a caption about how often to flush, a video of the flush itself and a question post about the last time you thought about your tank. Same source, four formats, zero new research.',
      },
      {
        heading: 'Memes and social graphics without a designer',
        paragraphs: [
          'Graphics do not need a designer; they need consistency and readability. Pick two fonts and two or three brand colors, save them as reusable templates in any free design tool or even your phone editor, and never start from a blank canvas again. Text over image beats cleverness: if it cannot be read in the feed at a glance, it is decoration.',
          'Memes specifically are a tone decision, not a format. The formula that works for most businesses is a recognizable situation plus one honest line: the boiler that dies on the coldest day, the client email that says make it pop. Keep a running note of moments from your actual week; your industry absurdities are content, and nobody else has your vantage point.',
        ],
      },
      {
        heading: 'Short video and captions in batches',
        paragraphs: [
          'Short video rewards the lo-fi and punishes the overproduced, which is convenient. Film five videos in one hour: same spot, good daylight, phone propped at eye level. Each follows the same spine: one-line hook, one useful point, one next step. Put captions on every video, because most feed viewing happens with the sound off.',
          'Batching is what makes this sustainable. One filming hour, one captioning pass, one scheduling session, and the week of video is done. The business owners who fail at video are not the ones without talent; they are the ones trying to decide what to film every single day.',
        ],
      },
      {
        heading: 'AI tools as the engine',
        paragraphs: [
          'This is where the cost drops to zero and the bottleneck becomes review. Modern AI tools draft captions, generate meme concepts, cut long clips into shorts, write video scripts and produce graphics from a prompt and your source material. The SEO Audit Factory practices what it preaches here: Plunder & Riffle is the engine we use for our own meme and video generation, and the same approach, feed it real material, batch the prompts, edit the output, works with any capable tool.',
          'Two habits separate useful AI output from noise. First, feed it specifics: your actual service names, your customers actual words, your actual offers, because generic prompts produce generic posts. Second, write a short brand voice note, three sentences about tone and forbidden words, and paste it at the top of every prompt session so the drafts start closer to publishable.',
        ],
      },
      {
        heading: 'The human review step',
        paragraphs: [
          'AI drafts, humans ship. The review pass is short but never optional, because the failure modes are specific: invented facts, outdated prices, slightly wrong service descriptions, tone that drifts into parody of your brand, and the occasional sentence no human would write. Read everything once as an editor, not a fan.',
        ],
        bullets: [
          'Facts: prices, service names, claims and locations are all correct.',
          'Rights: every photo and quote is yours or used with permission.',
          'Tone: would you say this sentence to a customer face?',
          'Links and handles: they point where the caption promises.',
          'Disclosure: anything paid, gifted or sponsored is labeled honestly.',
        ],
      },
      {
        heading: 'Rights and honesty',
        paragraphs: [
          'Free content is not careless content. Customer photos and reviews need permission before you republish, employee appearances need consent, and stock or AI-generated imagery must not be presented as your actual work. A customer before-and-after that never happened is not marketing; it is a liability with a caption.',
          'The honesty rule doubles as strategy: specific, true, checkable content is also what search engines and AI systems can quote with confidence. Fake polish ranks nowhere and persuades nobody. The material you already have, mildly edited and honestly captioned, is the best free marketing available because it is the only set that is genuinely yours.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How often should a small business post?',
        a: 'As often as you can sustain honestly, which for most is three to five times a week across one or two platforms. Batching makes that feasible in about two hours a week. One good platform done consistently beats four done sporadically.',
      },
      {
        q: 'Are AI-generated posts bad for SEO?',
        a: 'Search engines evaluate helpfulness, not authorship, and their guidance allows content created with automation when it is useful and reviewed by people. Low-value mass-produced posts are what gets ignored. The review step is what keeps you on the right side of that line.',
      },
      {
        q: 'What free tools do I need to start?',
        a: 'A phone camera, a free design tool with templates, a scheduling tool free tier and any capable AI assistant for drafts. That combination covers graphics, captions, short video and scheduling for zero spend. Upgrade only when a specific bottleneck, not boredom, demands it.',
      },
      {
        q: 'Can I repost customer reviews as content?',
        a: 'Yes, with permission for named or identifiable content, and quotes from public reviews are generally fine to share with attribution. Always check the platform terms and your local rules on testimonials for regulated industries. Ask once, keep the reply, reuse for years.',
      },
      {
        q: 'How do I keep a consistent brand voice with AI drafts?',
        a: 'Write a three-sentence voice note covering tone, audience and words you never use, and include it in every prompt. Edit the first drafts closely so the output learns your patterns if the tool retains context. The voice note is also useful for any human who ever writes for you.',
      },
    ],
    sources: [
      { label: 'Creating helpful, reliable, people-first content (Google)', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content' },
      { label: 'Google SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
    ],
    related: ['how-to-save-money-on-seo', 'free-seo-audit', 'seo-mistakes-that-cost-businesses-money'],
  },
  {
    slug: 'schema-markup-explained',
    title: 'Schema Markup Explained: Structured Data in Plain English',
    category: 'Technical SEO',
    description:
      'Structured data in plain English: what JSON-LD is, the schema types that matter, how to validate markup and the mistakes that make search engines ignore it.',
    readMinutes: 7,
    updated: 'November 2026',
    intro:
      'Schema markup is labeling you add to a page so search engines and AI systems know what things are, not just what the words say. It is written in a format called JSON-LD, added as a small script block, and checked with two free validators. It removes ambiguity about your business, articles and navigation, but it is not a spell: no markup guarantees stars, rankings or AI citations.',
    keyTakeaways: [
      'Schema describes content that already exists on the page; it does not create content.',
      'JSON-LD is the recommended format: one script block, easy to add and remove.',
      'Most businesses need only Organization or LocalBusiness, Article, BreadcrumbList and FAQPage.',
      'Validate with the Rich Results Test and the schema.org validator.',
      'Realistic benefits: richer listings when eligible, and clearer facts for AI systems.',
      'The classic mistake is marking up content visitors cannot see.',
    ],
    sections: [
      {
        heading: 'What JSON-LD actually is',
        paragraphs: [
          'A web page has two audiences: people who read the visible text, and machines that parse the underlying code. Schema markup is a vocabulary for the second audience. Written as JSON-LD, which stands for JavaScript Object Notation for Linked Data, it is a block of labeled facts placed in the page code: this organization is named X, its phone is Y, this article was published on Z.',
          'The practical consequence is that it is remarkably owner-friendly. Unlike older approaches that threaded attributes through every HTML tag, a JSON-LD block is one self-contained script. Your developer can add it to a template once, you can read it almost like a form, and removing it cannot break your page layout because it is invisible.',
        ],
      },
      {
        heading: 'The types worth your time',
        paragraphs: [
          'The schema.org vocabulary offers hundreds of types, which is a good way to never start. In practice, most businesses need a handful, chosen by what the page actually is.',
        ],
        bullets: [
          'Organization: who you are as a company, with name, logo and contact points; the base label for your brand.',
          'LocalBusiness and its subtypes such as Restaurant: the local version, with address, hours and area served, matching your Google Business Profile exactly.',
          'Article: for blog posts and news, with headline, author, dates and images.',
          'BreadcrumbList: the trail of links showing where a page sits in your site, which helps both machines and your listing display.',
          'FAQPage: question-and-answer content that exists visibly on the page; note that Google now shows FAQ rich results mainly for authoritative government and health websites, but the markup still documents your questions for other machines.',
        ],
        callout:
          'Product, Event, Recipe and JobPosting types exist too, and matter when they describe your page. The selection rule is boring and absolute: mark up what is on the page, in the type that matches it.',
      },
      {
        heading: 'Adding it without breaking anything',
        steps: [
          'Decide what each important page is: an article, a local business page, a product.',
          'Find where the template lives, or ask your developer; most platforms have a head or scripts section.',
          'Write the JSON-LD block with the required properties for that type, filling in true values.',
          'Test the page in the Rich Results Test before and after deploying.',
          'Re-validate after redesigns, theme changes and plugin updates, because templates get rewritten and markup quietly vanishes.',
        ],
        paragraphs: [
          'If your site runs on a common platform, a reputable plugin or app can generate the basics for you. Generated markup still needs validating, because plugins have versions, conflicts and opinions.',
        ],
      },
      {
        heading: 'Validation: two free tools',
        paragraphs: [
          'Google Rich Results Test checks a URL or pasted code and tells you two different things: whether the structured data parses cleanly, and whether the page is eligible for any Google rich results. The schema.org validator, at validator.schema.org, checks the markup against the vocabulary itself without Google particular rules. Use both; they catch different mistakes.',
          'A clean validation is not a trophy, it is a hygiene certificate. It means machines can read your labels without choking. Whether any system chooses to display or quote those labels is a separate decision influenced by quality, authority and demand.',
        ],
      },
      {
        heading: 'Realistic benefits, stated honestly',
        paragraphs: [
          'Here is the honest ledger. Eligibility: certain markup makes your listing eligible for enhancements such as breadcrumbs, when Google criteria are met. Clarity: structured facts help search engines and AI assistants represent your business accurately, including hours, prices and services, which matters more as assistants answer questions directly. No guarantees: markup is not a ranking factor by itself, and no validator output promises stars or citations.',
          'The right mental model is labeling, not leverage. A warehouse with accurate shelf labels is easier to stock, audit and pick from; the labels do not create inventory. Businesses are often disappointed by schema because they were sold leverage; businesses with accurate labels simply find their facts travel further.',
        ],
      },
      {
        heading: 'Common mistakes that get markup ignored',
        bullets: [
          'Marking up content that is not visible on the page; the fastest route to a spam manual action, and the most common one.',
          'Wrong type selection, like FAQPage on a page with no questions, or Organization on a page about a single product.',
          'Stale facts: old prices, moved addresses, discontinued services, all confidently labeled.',
          'Duplicate conflicting blocks from a plugin plus a hand-written script, telling machines two different truths.',
          'One-time setup with no re-validation, so a redesign silently strips the labels.',
        ],
        paragraphs: [
          'Every one of these is caught by the two validators in minutes, which is why validation belongs in your publish checklist rather than in a developer memory. Machines forgive missing labels; they do not forgive lying ones.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does schema markup improve rankings?',
        a: 'Not directly. Google describes structured data as a way to understand content and enable search enhancements, not a ranking factor. Its value is eligibility for richer displays and unambiguous facts for machines, which can improve how often and how accurately you appear.',
      },
      {
        q: 'Can I add schema myself without a developer?',
        a: 'Usually yes on common platforms, using a reputable plugin or app to generate Organization, LocalBusiness or Article markup. You will still need to fill in true values and validate the result. Custom setups, unusual types and template surgery are developer work.',
      },
      {
        q: 'Why did FAQ rich results disappear from search?',
        a: 'Google limited FAQ rich results in 2023 to well-known, authoritative government and health websites, so most sites no longer see them. The FAQPage markup remains valid and still helps other machines understand your questions and answers. Do not remove valid markup because a display feature narrowed.',
      },
      {
        q: 'Is more schema better?',
        a: 'No. Accuracy and relevance beat volume every time, and marking up things that are not on the page violates Google structured data policies. Two correct types outweigh twenty decorative ones. Every extra block is another thing to keep true.',
      },
      {
        q: 'How do I know my schema is working?',
        a: 'Check that validation passes, watch Search Console enhancement reports for errors Google finds, and look for the eligible features appearing in results over time. Remember that display decisions belong to the search engine. If your facts start being quoted accurately by assistants, the labels are doing their job.',
      },
    ],
    sources: [
      { label: 'Introduction to structured data (Google Search Central)', url: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data' },
      { label: 'Google Rich Results Test', url: 'https://search.google.com/test/rich-results' },
      { label: 'schema.org Validator', url: 'https://validator.schema.org' },
      { label: 'schema.org vocabulary', url: 'https://schema.org' },
    ],
    related: ['technical-seo-checklist', 'how-to-appear-in-chatgpt-search', 'how-to-audit-a-website'],
  },
  {
    slug: 'how-to-create-an-llms-txt-file',
    title: 'How to Create an llms.txt File (and Whether You Need One)',
    category: 'AI Search',
    description:
      'What llms.txt is, the proposed file structure, how AI crawlers interact with robots.txt today, and an honest answer on whether your site needs one yet.',
    readMinutes: 6,
    updated: 'November 2026',
    intro:
      'llms.txt is a proposal from llmstxt.org for a single markdown file at your site root that points AI systems to your best pages, the way a sitemap lists pages for search crawlers. It is a proposal, not a confirmed standard: major AI companies have not confirmed it changes what they cite, and adoption is early. Writing one costs fifteen minutes and doubles as a clarity exercise, which is the honest case for it.',
    keyTakeaways: [
      'llms.txt is a proposal: an H1 title, a blockquote summary, and sections of markdown links with short descriptions.',
      'It is optional and early-stage; no AI company has confirmed it influences citations.',
      'robots.txt, governed by RFC 9309, still controls which AI crawlers may fetch your site.',
      'An llms.txt file cannot override robots.txt; the two answer different questions.',
      'The file real value today is forcing you to name your best pages in one place.',
      'Clear, factual, well-structured pages remain what AI systems actually quote.',
    ],
    sections: [
      {
        heading: 'What llms.txt is supposed to be',
        paragraphs: [
          'The llmstxt.org proposal is short, which is part of its charm. Place a file named llms.txt at the root of your site, written in markdown. The proposed structure: one H1 heading with your site or project name, one blockquote paragraph summarizing what the site is for, and then any number of sections, each an H2 heading followed by a list of markdown links to your most important pages, optionally each with a one-line description.',
          'The idea behind it: AI systems fetching a site have limited context, and a compact, human-curated map of the good stuff is more useful than parsing a whole navigation tree. A companion file, llms-full.txt, is proposed as a place for expanded content. The whole thing reads like a readme for your website, which is a fair description.',
        ],
      },
      {
        heading: 'A short example',
        paragraphs: [
          'Here is the shape of a small business file, using a fictional plumber. The links are markdown links, per the proposal, each optionally followed by a brief description. The domain shown is a reserved example domain, not a real site.',
        ],
        bullets: [
          '# Acme Plumbing',
          '> Acme Plumbing serves the greater Springfield area with 24/7 drain, leak and water heater services. Licensed, insured, and answering the phone since 2009.',
          '## Services',
          '- [Drain cleaning](https://www.acmeplumbing.example/services/drain-cleaning): hydro jetting and rooter service for blocked drains, with response times by suburb.',
          '- [Water heater repair](https://www.acmeplumbing.example/services/water-heater-repair): same-day tank and tankless repair, plus replacement guidance.',
          '## Trust',
          '- [Licensing and guarantees](https://www.acmeplumbing.example/about/licensing): license numbers, insurance and the workmanship guarantee.',
          '- [Pricing](https://www.acmeplumbing.example/pricing): flat service call fees and what affects a quote.',
        ],
        callout:
          'Note what the example does not contain: keywords crammed into descriptions, twenty links to every page on the site, or sales language. The proposal is a map for a machine with limited patience; five to ten genuinely important links beat an exhaustive index of everything.',
      },
      {
        heading: 'Whether you need one: the honest answer',
        paragraphs: [
          'Here is the state of play. llms.txt is a proposal documented at llmstxt.org, not a standard ratified by anyone. Some tools and sites have adopted it; the major AI assistants have not confirmed that they read it or that it influences what they cite. Anyone selling llms.txt as a guaranteed AI visibility service is selling ahead of the evidence.',
          'So should you write one? The cost is fifteen minutes and the upside is a file that might matter later plus one that is useful now: it forces you to name your ten best pages, which is also your internal linking plan, your homepage navigation review and your content inventory. We would not build a strategy around it, and we would not leave fifteen free minutes on the table either. If an audit report flags thin or missing pages, the llms.txt exercise will surface exactly which pages you wished existed.',
        ],
      },
      {
        heading: 'AI crawlers and robots.txt: the part that matters today',
        paragraphs: [
          'What governs AI access to your site today is robots.txt, defined in RFC 9309, the protocol search engines and AI companies say they follow. AI crawlers publish their own user agents and documentation; OpenAI, for example, documents its crawlers and how site owners can control them. If you want AI systems to see your content, you allow their crawlers; if you do not, you block them, and reputable ones respect that.',
          'Two facts worth holding onto. First, blocking AI crawlers is a legitimate choice, but it means your content generally will not appear in those systems, which is a business decision more than a technical one. Second, llms.txt sits outside robots.txt entirely: adding the file permits nothing and blocks nothing. The two mechanisms answer different questions, one about permission and one about presentation.',
        ],
      },
      {
        heading: 'Creating one in fifteen minutes',
        steps: [
          'List the five to ten pages that best answer your customers real questions: services, pricing, FAQs, about, proof.',
          'Write one sentence at the top: what this business does, for whom, where.',
          'Group the links into two to four sections with plain H2 names, such as Services, Pricing, Trust.',
          'Write each link as a markdown link with a one-line factual description; no superlatives survive contact with a good editor anyway.',
          'Save the file as llms.txt, upload it to your site root directory, and check that yourdomain.com/llms.txt loads in a browser.',
          'Diarize a quarterly update; a stale map is worse than no map.',
        ],
        paragraphs: [
          'Keep a copy in your content folder too. The list of pages you consider canonical is exactly the list a redesign tends to lose, and the file doubles as a checklist for whoever rebuilds the site next.',
        ],
      },
      {
        heading: 'Expectations, stated honestly',
        paragraphs: [
          'Do not expect a citation to appear because a file exists. What AI systems quote, as far as anyone can observe, is well-structured, factual, findable content, plus the signals of relevance and authority those systems already use. An llms.txt file neither replaces nor overrides any of that; it is at best a convenience layer on top of pages worth quoting.',
          'The defensible position: write the file because it is cheap and clarifying, keep your robots.txt decisions deliberate, and spend the real effort on the pages the file points to. If a page is not worth linking in your own ten-line map, that is a signal about the page, not about the map.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is llms.txt an official standard?',
        a: 'No. It is a proposal documented at llmstxt.org, adopted by some tools and sites, but not ratified by any standards body and not confirmed by the major AI companies as something they use. Treat it as a lightweight best practice with uncertain upside, not a specification with guaranteed behavior.',
      },
      {
        q: 'Does llms.txt replace robots.txt?',
        a: 'No. robots.txt, defined in RFC 9309, controls which crawlers may fetch which parts of your site, and AI companies document how they honor it. llms.txt is a presentation layer that summarizes your content. You may need both, and neither influences the other.',
      },
      {
        q: 'Will llms.txt get me cited by ChatGPT or Perplexity?',
        a: 'There is no confirmed mechanism for that, and anyone promising citations from a file is guessing. Assistants quote content that is clear, factual and accessible to their crawlers. Write the file, then invest in the pages it links.',
      },
      {
        q: 'Where exactly does the file go?',
        a: 'At the root of your domain, so it loads at yourdomain.com/llms.txt. If your platform does not let you upload to the root, your developer can place it, and most static hosts and CDNs make it trivial. Check that it loads in a normal browser before calling it done.',
      },
      {
        q: 'What is llms-full.txt?',
        a: 'A companion file proposed by the same specification, containing expanded content for the pages you list, for systems that want more than a map. It is optional and heavier to maintain. For most small businesses, llms.txt alone is plenty until there is evidence anyone is reading either.',
      },
    ],
    sources: [
      { label: 'The llms.txt proposal (llmstxt.org)', url: 'https://llmstxt.org' },
      { label: 'Robots Exclusion Protocol, RFC 9309 (IETF)', url: 'https://datatracker.ietf.org/doc/html/rfc9309' },
      { label: 'OpenAI crawler and bot documentation', url: 'https://platform.openai.com/docs/bots' },
      { label: 'robots.txt introduction (Google Search Central)', url: 'https://developers.google.com/search/docs/crawling-indexing/robots/intro' },
    ],
    related: ['how-to-appear-in-chatgpt-search', 'how-to-get-cited-by-perplexity', 'technical-seo-checklist'],
  },
  {
    slug: 'seo-mistakes-that-cost-businesses-money',
    title: '18 SEO Mistakes That Quietly Cost Businesses Money',
    category: 'Money',
    description:
      'Eighteen SEO mistakes that drain budgets quietly, from unclaimed Google profiles to paid link schemes, each with the cost mechanism and the practical fix.',
    readMinutes: 8,
    updated: 'November 2026',
    intro:
      'Most SEO losses never show up on a spreadsheet: the unclaimed Google profile, the six-second page load, the tool renewal nobody remembers approving. Here are eighteen mistakes, ordered so the free fixes come first, each with the mechanism that drains money and the practical fix. Work down the list; most businesses will find five or six apply to them today.',
    keyTakeaways: [
      'The costliest mistakes are often free to fix: profiles, titles, image weight.',
      'Every mistake has a cost mechanism; name it before paying anyone to fix it.',
      'Link schemes and review shortcuts create penalties that cost more than they earned.',
      'Buying traffic before fixing conversion multiplies the waste.',
      'Overlapping tools and set-and-forget retainers are the quietest drains.',
      'No measurement means no way to stop a losing spend.',
    ],
    sections: [
      {
        heading: 'How to read this list',
        paragraphs: [
          'Each mistake comes with its cost mechanism, meaning the specific way it takes money from you, and a fix. The ordering is deliberate: the first six cost nothing but an afternoon, the middle six are strategy-level leaks, and the last six are slow burns that compound. Prioritize by what is free, not by what is fashionable.',
        ],
      },
      {
        heading: 'Mistakes 1 to 6: the free fixes',
        bullets: [
          '1. Unclaimed or unfinished Google Business Profile. Cost: the map pack sends calls to competitors who bothered to fill in hours, photos and services, while you forfeit the highest-intent free traffic in local search. Fix: claim it, complete every field, add photos weekly and answer reviews.',
          '2. Slow, bloated pages. Cost: visitors abandon before your offer renders, and heavy pages burn bandwidth that inflates hosting bills. Fix: compress and resize images, defer non-essential scripts, enable caching, and re-test with PageSpeed Insights.',
          '3. Missing or duplicated titles and descriptions. Cost: your pages appear in results with ignored or auto-generated text, so impressions never become clicks. Fix: write one honest title and description per page, naming the service and the place.',
          '4. Thin pages. Cost: dozens of shallow pages dilute your site credibility, compete with each other and waste crawl. Fix: consolidate near-duplicates into fewer, substantial pages, and expand the ones that deserve to rank.',
          '5. Stock-photo-only content. Cost: nothing on the page distinguishes you from the competitor using the same handshake photo, so trust and conversion suffer. Fix: one hour of real photography per month; your actual work is the asset.',
          '6. Accidentally blocking crawlers. Cost: a bad robots.txt rule or a stray noindex tag quietly removes pages from Google, and you keep paying for a site nobody can find. Fix: check robots.txt, your sitemap and Search Console indexing report after every site change.',
        ],
      },
      {
        heading: 'Mistakes 7 to 12: the money leaks',
        bullets: [
          '7. Paying for tools that overlap. Cost: four subscriptions covering the same data can silently cost more per year than the SEO work itself. Fix: keep one audit tool plus Search Console and PageSpeed Insights, and cancel what you cannot name a recent insight from.',
          '8. No conversion path. Cost: traffic arrives and leaves because there is no obvious call, form or booking step, so every marketing dollar evaporates at the last step. Fix: one clear next action on every important page, tested on your own phone.',
          '9. Chasing vanity keywords. Cost: budget spent on broad, high-volume terms that never convert, while the service-plus-city terms your buyers use go unclaimed. Fix: target intent; a smaller number of searches that can become customers beats a big number that cannot.',
          '10. Buying backlink schemes. Cost: bulk links from spam networks risk penalties and cleanup bills that dwarf whatever they briefly earned. Fix: earn links with content and relationships worth citing, and read the spam policies Google publishes before anyone offers you a package.',
          '11. Review shortcuts. Cost: bought or incentivized reviews violate Google policies and risk removal or suspension, and a suspicious review profile converts worse than an honest one. Fix: ask every customer, every time, and respond to all of them.',
          '12. Copy-paste location pages. Cost: near-duplicate pages for every suburb read as spam to search engines and as boilerplate to customers, ranking nowhere. Fix: one genuinely local page per real area, or one honest service-area page instead.',
        ],
      },
      {
        heading: 'Mistakes 13 to 18: the slow burns',
        bullets: [
          '13. Ignoring AI search readiness. Cost: assistants and AI overviews increasingly answer questions directly, and unclear, unstructured, slow sites are not the ones they quote. Fix: factual pages that answer real questions, correct structured data, deliberate robots.txt decisions for AI crawlers.',
          '14. Broken redirects and 404s after redesigns. Cost: years of accumulated link equity evaporates when old URLs die without redirects, and customers hit dead ends. Fix: map every old URL to its new home before launch, then check Search Console after.',
          '15. Keyword stuffing your business name and fake listings. Cost: profiles get suspended, and a suspended profile loses the map pack overnight. Fix: your real name, real address, real categories; accuracy is the strategy.',
          '16. Designing for awards instead of answers. Cost: beautiful pages that hide the phone number, bury the price and open with philosophy lose to plain pages that answer fast. Fix: the visitor question answered above the fold, with the next step beside it.',
          '17. Set-and-forget SEO. Cost: sites decay, competitors publish, and a strategy from two years ago slowly converts into a liability you pay hosting on. Fix: one scheduled hour a month to review performance, freshness and the basics on this list.',
          '18. No measurement. Cost: without calls, form fills and sales tied to channels, you cannot tell a winning spend from a habitual one, so losing spend continues indefinitely. Fix: Search Console, profile insights and one written goal with a number and a date.',
        ],
      },
      {
        heading: 'The pattern behind all eighteen',
        paragraphs: [
          'Notice the common thread: none of these mistakes are exotic, and none of the fixes require genius. The cost comes from quiet accumulation: small defaults left unattended, subscriptions set to auto-renew, pages that were good enough in 2023. SEO losses are a maintenance failure more often than a talent failure.',
          'The flip side is that the correction curve is steep at the start. The first afternoon of fixes usually recovers more than the first month of paid campaigns, because you are removing handicaps rather than buying advantages. Money saved on mistakes is the cheapest marketing budget increase available.',
        ],
      },
      {
        heading: 'Start with the free look',
        paragraphs: [
          'If reading this list produced a vague sense of dread, get the specifics before spending. The SEO Audit Factory runs a free audit and sends a five ways you are losing money report, which maps your site against exactly these failure modes and tells you which ones apply to you. Then you can fix the free items yourself this weekend, and walk into any paid engagement knowing precisely what you are buying.',
          'That order, audit first, fix free things first, buy judgment last, is the difference between an SEO budget and an SEO donation.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Which mistake should I fix first?',
        a: 'Whichever is free and touches high-intent traffic, which is usually the Google Business Profile and page titles. Then image weight, since it helps every visitor and your hosting bill. The ordering in this list is a reasonable default.',
      },
      {
        q: 'How much does fixing these usually cost?',
        a: 'The first six cost nothing but time, and the next six are mostly decisions rather than purchases. Paid work earns its keep on migrations, penalties and competitive technical jobs. Anyone quoting four figures before diagnosing your site is quoting the invoice, not the problem.',
      },
      {
        q: 'Can one mistake undo everything else?',
        a: 'Yes: a robots.txt accident, a spam penalty or a suspended profile can zero out good work quickly. That is why the free checks belong on a monthly calendar rather than a one-time project. Prevention is a maintenance habit, not a campaign.',
      },
      {
        q: 'How do I know if my agency is causing these mistakes?',
        a: 'Ask them directly which of these eighteen your site currently has and what they are doing about each. A good provider answers with specifics; a defensive one answers with reports. Also check invoices against the tool-overlap mistake, since your stack often reflects their vendor relationships.',
      },
      {
        q: 'How often should I re-check this list?',
        a: 'Monthly for the fast-moving items like profile completeness, titles and speed, and quarterly for the slow burns like tool subscriptions and AI readiness. Put it on the calendar with the same seriousness as payroll. Decay is quiet precisely because nobody scheduled the check.',
      },
    ],
    sources: [
      { label: 'Google SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
      { label: 'Google Search spam policies', url: 'https://developers.google.com/search/docs/essentials/spam-policies' },
      { label: 'Google Business Profile Help', url: 'https://support.google.com/business' },
      { label: 'PageSpeed Insights', url: 'https://pagespeed.web.dev' },
    ],
    related: ['free-seo-audit', 'how-to-save-money-on-seo', 'website-speed-optimization'],
  },
];

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'SEO',
    slug: 'seo',
    category: 'Fundamentals',
    definition:
      'Search engine optimization: the work of making your website easy for search engines to understand and worth showing to searchers. It covers technical health, content and reputation. Done well, it brings in customers who were already looking for what you sell.',
  },
  {
    term: 'SERP',
    slug: 'serp',
    category: 'Fundamentals',
    definition:
      'Search engine results page: what Google shows after a search, including ads, maps, AI answers and organic listings. Ranking well means appearing prominently on the SERP for searches that matter to your business.',
  },
  {
    term: 'Organic Traffic',
    slug: 'organic-traffic',
    category: 'Fundamentals',
    definition:
      'Visitors who arrive through unpaid search results rather than ads or typed-in addresses. It is valued because it compounds and costs less per visit over time, though it takes months to build.',
  },
  {
    term: 'Local Pack / Map Pack',
    slug: 'local-pack-map-pack',
    category: 'Local',
    definition:
      'The boxed Google result showing a map and a short list of local businesses for searches like plumber near me. Appearing in it drives calls and direction requests more than most website rankings, so local businesses compete hard for it.',
  },
  {
    term: 'Google Business Profile',
    slug: 'google-business-profile',
    category: 'Local',
    definition:
      'The free Google listing that controls how your business appears in Search and Maps: hours, photos, services, reviews and posts. For local businesses it is often the highest-value marketing asset, and it is free.',
  },
  {
    term: 'NAP Consistency',
    slug: 'nap-consistency',
    category: 'Local',
    definition:
      'Name, Address, Phone: your business details as listed everywhere online. When they match exactly across your site, Google profile and directories, machines trust the facts; when they conflict, rankings and customer calls suffer.',
  },
  {
    term: 'Citation',
    slug: 'citation',
    category: 'Local',
    definition:
      'Any online mention of your business name, address and phone, typically in directories and industry listings. Citations help confirm your business is real and local; a handful of accurate ones beats hundreds of spammy ones.',
  },
  {
    term: 'Backlink',
    slug: 'backlink',
    category: 'Fundamentals',
    definition:
      'A link from another website to yours. Search engines treat relevant links from credible sites as votes of confidence, which is why earning them matters and why buying them in bulk is risky and against the rules.',
  },
  {
    term: 'Domain Authority',
    slug: 'domain-authority',
    category: 'Fundamentals',
    definition:
      'A score some SEO tools use to estimate the strength of a website backlink profile. It is not a Google metric and Google does not use it. Useful as a rough comparison, misleading as a goal.',
  },
  {
    term: 'Technical SEO',
    slug: 'technical-seo',
    category: 'Technical',
    definition:
      'The plumbing of search visibility: crawlability, indexing, speed, structured data, redirects and mobile behavior. Content cannot rank if the plumbing is broken, which is why technical checks come first in audits.',
  },
  {
    term: 'On-Page SEO',
    slug: 'on-page-seo',
    category: 'Fundamentals',
    definition:
      'Optimizing the elements on your own pages: titles, headings, text, images and internal links. It is the part of SEO you fully control and usually the fastest place to see improvements.',
  },
  {
    term: 'Off-Page SEO',
    slug: 'off-page-seo',
    category: 'Fundamentals',
    definition:
      'Reputation building away from your website: links, reviews, mentions and citations. It signals to search engines that others vouch for you, and it cannot be fully faked.',
  },
  {
    term: 'Core Web Vitals',
    slug: 'core-web-vitals',
    category: 'Performance',
    definition:
      'Google set of user experience metrics: loading (LCP), interactivity (INP) and visual stability (CLS). They measure whether pages feel fast and steady to real visitors, and Google documents them at web.dev.',
  },
  {
    term: 'LCP',
    slug: 'lcp',
    category: 'Performance',
    definition:
      'Largest Contentful Paint: how long the main content of a page takes to appear, ideally within about 2.5 seconds. Oversized images and slow servers are the usual causes of a poor score.',
  },
  {
    term: 'INP',
    slug: 'inp',
    category: 'Performance',
    definition:
      'Interaction to Next Paint: how quickly a page responds when someone taps or clicks, ideally within about 200 milliseconds. Heavy scripts are the usual culprit when a page feels frozen.',
  },
  {
    term: 'CLS',
    slug: 'cls',
    category: 'Performance',
    definition:
      'Cumulative Layout Shift: how much a page jumps around while loading. Shifts cause mis-taps and frustration, and they are usually caused by images and ads without reserved space.',
  },
  {
    term: 'TTFB',
    slug: 'ttfb',
    category: 'Performance',
    definition:
      'Time to First Byte: how long the server takes to start responding to a request. Slow TTFB makes every page slow, and the usual fix is better hosting, caching or a content delivery network.',
  },
  {
    term: 'Canonical URL',
    slug: 'canonical-url',
    category: 'Technical',
    definition:
      'The declared master version of a page that exists at multiple addresses. It tells search engines which copy to count, preventing your own pages from competing with each other.',
  },
  {
    term: 'robots.txt',
    slug: 'robots-txt',
    category: 'Technical',
    definition:
      'A text file at your site root that tells crawlers which parts of the site they may fetch, defined by the robots exclusion protocol in RFC 9309. One wrong line can hide your site from Google, so it deserves a look after every redesign.',
  },
  {
    term: 'XML Sitemap',
    slug: 'xml-sitemap',
    category: 'Technical',
    definition:
      'A file listing the pages you want search engines to find. It does not guarantee indexing, but it helps crawlers discover pages, especially on large or newly launched sites.',
  },
  {
    term: 'Structured Data / Schema Markup',
    slug: 'structured-data-schema-markup',
    category: 'Technical',
    definition:
      'Machine-readable labeling, usually JSON-LD, that tells search engines what things on a page are: a business, an article, an FAQ. It can make listings eligible for enhancements and helps AI systems quote your facts accurately.',
  },
  {
    term: 'Rich Results',
    slug: 'rich-results',
    category: 'Technical',
    definition:
      'Search listings with extras beyond the blue link, such as breadcrumbs, images or review stars, enabled by valid structured data and Google eligibility rules. Eligibility is not a guarantee; the search engine decides what to display.',
  },
  {
    term: 'Featured Snippet',
    slug: 'featured-snippet',
    category: 'Fundamentals',
    definition:
      'The boxed answer Google lifts from a page and shows above the organic results. Clear, direct answers to specific questions have the best chance of being lifted.',
  },
  {
    term: 'AI Overviews',
    slug: 'ai-overviews',
    category: 'AI Search',
    definition:
      'Google AI-generated summaries shown above some search results, with links to their sources. Being quoted requires clear, factual, well-structured content that answers questions directly.',
  },
  {
    term: 'GEO (Generative Engine Optimization)',
    slug: 'geo-generative-engine-optimization',
    category: 'AI Search',
    definition:
      'The practice of making content likely to be found, quoted and cited by generative AI systems such as chatbots and AI summaries. It overlaps heavily with good SEO: clear facts, structure and authority still decide who gets referenced.',
  },
  {
    term: 'AEO (Answer Engine Optimization)',
    slug: 'aeo-answer-engine-optimization',
    category: 'AI Search',
    definition:
      'Optimizing to be the direct answer in engines that reply rather than list: assistants, AI chat and answer boxes. The core skill is writing pages that answer a specific question plainly, early and completely.',
  },
  {
    term: 'llms.txt',
    slug: 'llms-txt',
    category: 'AI Search',
    definition:
      'A proposed markdown file at a site root that lists the pages AI systems should read, described at llmstxt.org. It is a proposal rather than a confirmed standard, and it does not override robots.txt.',
  },
  {
    term: 'E-E-A-T',
    slug: 'e-e-a-t',
    category: 'Content',
    definition:
      'Experience, Expertise, Authoritativeness, Trustworthiness: the qualities Google quality guidelines ask its raters to look for in content. For business owners it translates simply: show real experience, real credentials and honest facts.',
  },
];

export const RESOURCE_LINKS: ResourceLink[] = [
  {
    name: 'Google Search Central documentation',
    url: 'https://developers.google.com/search/docs',
    description: 'Google official documentation on how Search works, from the starter guide to structured data and spam policies.',
    category: 'Learning',
    free: true,
  },
  {
    name: 'Google Search Console Performance report',
    url: 'https://support.google.com/webmasters/answer/9153377',
    description: 'Official guide to the Search Console performance report, where you see the queries and pages bringing impressions and clicks.',
    category: 'Analytics',
    free: true,
  },
  {
    name: 'PageSpeed Insights',
    url: 'https://pagespeed.web.dev',
    description: 'Google free page speed and Core Web Vitals tester; enter a URL and get prioritized fixes.',
    category: 'Performance',
    free: true,
  },
  {
    name: 'Google Rich Results Test',
    url: 'https://search.google.com/test/rich-results',
    description: 'Validates structured data on a URL and reports eligibility for Google rich results.',
    category: 'Technical SEO',
    free: true,
  },
  {
    name: 'schema.org Validator',
    url: 'https://validator.schema.org',
    description: 'Checks structured data against the schema.org vocabulary, independent of Google particular rules.',
    category: 'Technical SEO',
    free: true,
  },
  {
    name: 'Google Business Profile Manager',
    url: 'https://business.google.com',
    description: 'Where you claim and manage the listing that controls your appearance in Google Search and Maps.',
    category: 'Local SEO',
    free: true,
  },
  {
    name: 'Robots Exclusion Protocol (RFC 9309)',
    url: 'https://datatracker.ietf.org/doc/html/rfc9309',
    description: 'The formal specification for robots.txt, the file that governs which crawlers may fetch your site.',
    category: 'Technical SEO',
    free: true,
  },
  {
    name: 'llmstxt.org',
    url: 'https://llmstxt.org',
    description: 'The proposal for the llms.txt file format: a markdown map of your best content for AI systems.',
    category: 'AI Search',
    free: true,
  },
  {
    name: 'web.dev',
    url: 'https://web.dev',
    description: 'Google guidance on web performance and Core Web Vitals, with plain explanations and concrete fixes.',
    category: 'Performance',
    free: true,
  },
  {
    name: 'Bing Webmaster Tools',
    url: 'https://www.bing.com/webmasters/about',
    description: 'Free diagnostics, indexing reports and keyword data for Bing, which also feeds several AI assistants.',
    category: 'Analytics',
    free: true,
  },
  {
    name: 'Google Search Console',
    url: 'https://search.google.com/search-console/about',
    description: 'The free control panel for how Google sees your site: indexing, queries, sitemaps and issues.',
    category: 'Analytics',
    free: true,
  },
  {
    name: 'Cloudflare Learning Center',
    url: 'https://www.cloudflare.com/learning/',
    description: 'Plain-English explanations of web infrastructure: CDNs, DNS, caching and security.',
    category: 'Learning',
    free: true,
  },
  {
    name: 'MDN HTTP Status Codes',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status',
    description: 'Reference for HTTP status codes such as 301, 404 and 503, useful when auditing redirects and errors.',
    category: 'Technical SEO',
    free: true,
  },
  {
    name: 'OpenAI crawler documentation',
    url: 'https://platform.openai.com/docs/bots',
    description: 'Documents the crawlers and user agents OpenAI uses and how site owners can allow or block them in robots.txt.',
    category: 'AI Search',
    free: true,
  },
];
