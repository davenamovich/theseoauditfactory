import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ARTICLES } from '../../content';

export const dynamicParams = false;
export const generateStaticParams = () => ARTICLES.map(article => ({ slug: article.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const article = ARTICLES.find(item => item.slug === slug);
 return article ? { title: `${article.title} | P&R Field Notes`, description: article.description, robots: { index: false, follow: true } } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const article = ARTICLES.find(item => item.slug === slug); if (!article) notFound();
 return <main className="mx-auto min-h-screen max-w-3xl px-5 py-12"><nav className="flex gap-2 text-sm text-muted-foreground"><Link href="/" className="underline">Field Notes</Link><span>/</span><Link href="/blog" className="underline">Blog</Link><span>/</span><span>Draft</span></nav><article className="mt-8"><header><p className="text-xs font-bold uppercase tracking-widest text-primary">Comparison draft · Reviewed {article.updated}</p><h1 className="mt-3 text-4xl font-black leading-tight">{article.title}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{article.description}</p><p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">Editorial draft: verify every current product-specific statement, date, feature, and cost before publication. This article is not an endorsement or ranking.</p></header><div className="mt-10 space-y-9">{article.sections.map((section,i)=><section key={i}><h2 className="text-2xl font-bold">{section.heading}</h2>{section.paragraphs.map((p,j)=><p key={j} className="mt-3 leading-7 text-muted-foreground">{p}</p>)}{section.bullets&&<ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">{section.bullets.map((b,j)=><li key={j}>{b}</li>)}</ul>}</section>)}</div><section className="mt-12 border-t border-border pt-8"><h2 className="text-xl font-bold">Sources and further reading</h2><ul className="mt-3 space-y-2">{article.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{source.label} ↗</a></li>)}</ul></section><Link href="/blog" className="mt-10 inline-block text-sm underline">← All comparison drafts</Link></article></main>;
}
