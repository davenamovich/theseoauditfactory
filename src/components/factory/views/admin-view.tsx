'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity, Bot, Check, Database, FileText, Key, Loader2, Lock, Plug, Save, Settings2, TrendingUp, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ScoreRing } from '../score-ring';

interface Stats {
  audits: { total: number; today: number; month: number; completed: number; failed: number; avgScore: number };
  topFindings: Array<{ code: string; title: string; category: string; severity: string; count: number }>;
  content: { byTypeStatus: Array<{ assetType: string; status: string; count: number }>; byProvider: Array<{ provider: string; count: number }>; recent: Array<{ id: string; assetType: string; status: string; provider?: string; toolName?: string; createdAt: string; auditId?: string }> };
  pnrClicks: number;
  topArticles: Array<{ slug: string | null; views: number }>;
  integrations: {
    mcp: { reachable: boolean; serverInfo?: { name?: string; title?: string; version?: string } | null; toolCount: number; error?: string | null; tools: string[] };
    pnrKeyConfigured: boolean;
    auditEngine: string;
    agentRuntime: string;
  };
  settings: { freeContentPerAudit: number; maxAuditsPerIpPerDay: number; auditConcurrency: number; cacheTtlMinutes: number; mcpFallbackEnabled: boolean };
  recentAudits: Array<{ id: string; host: string; status: string; overallScore: number | null; createdAt: string; stage: string }>;
}

const LLMSTXT = `# The SEO Audit Factory

> Free SEO audits that crawl real pages, plus five personalized ways to save
> money on marketing and free marketing content powered by the Plunder & Riffle
> MCP. Operated by Plunder & Riffle. No signup, no credit card.

- [Free SEO Audit](/#/): Run a real audit: technical, content, AI search readiness, local and performance checks with evidence for every finding.
- [Knowledge Center](/#/learn): 18 practical guides on SEO, AI search (GEO/AEO), local SEO and marketing economics.
- [SEO Glossary](/#/glossary): Plain-English definitions of the terms business owners actually ask about.
- [Free SEO Resources](/#/resources): Curated free tools from primary sources (Google Search Central, web.dev, schema.org, llmstxt.org).
- [About & Methodology](/#/about): How the audit engine works, its limits, privacy practices and contact information.`;

export function AdminView() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<Stats['settings'] | null>(null);
  const [pnrKeyInput, setPnrKeyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const authHeaders = useCallback((): Record<string, string> => {
    const stored = sessionStorage.getItem('saf-admin-key') ?? key;
    return { 'x-admin-key': stored };
  }, [key]);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: authHeaders(), cache: 'no-store' });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data: Stats = await res.json();
      setStats(data);
      setSettings(data.settings);
      setAuthed(true);
      sessionStorage.setItem('saf-admin-key', key || sessionStorage.getItem('saf-admin-key') || '');
    } catch {
      setAuthed(false);
    }
  }, [authHeaders, key]);

  useEffect(() => {
    const stored = sessionStorage.getItem('saf-admin-key');
    if (stored) {
      setKey(stored);
      fetch('/api/admin/audits', { headers: { 'x-admin-key': stored } })
        .then((r) => (r.ok ? (setAuthed(true), load()) : setAuthed(false)))
        .catch(() => setAuthed(false));
    } else {
      setAuthed(false);
    }
  }, []);

  const login = async () => {
    const res = await fetch('/api/admin/audits', { headers: { 'x-admin-key': key } });
    if (res.ok) {
      sessionStorage.setItem('saf-admin-key', key);
      setAuthed(true);
      load();
    } else {
      toast({ title: 'Wrong key', description: 'Check the admin key and try again.' });
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...settings };
      if (pnrKeyInput.trim()) body.pnrApiKey = pnrKeyInput.trim();
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      setPnrKeyInput('');
      toast({ title: 'Settings saved' });
      load();
    } catch {
      toast({ title: 'Save failed', description: 'Check the key and try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (authed === null) {
    return <div className="flex items-center justify-center py-32 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary mr-2" /> Checking access...</div>;
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24">
        <Card className="border-border/70">
          <CardContent className="p-7">
            <Lock className="h-6 w-6 text-primary" />
            <h1 className="mt-3 text-xl font-black tracking-tight">Admin dashboard</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Enter the admin key. Default for this deployment: <code className="font-mono text-primary">plunder-admin</code> (set ADMIN_KEY env var in production).</p>
            <Input
              type="password"
              placeholder="Admin key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              className="mt-4 bg-background/60"
              aria-label="Admin key"
            />
            <Button className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold" onClick={login}>
              UNLOCK DASHBOARD
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats || !settings) {
    return <div className="flex items-center justify-center py-32 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary mr-2" /> Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">ADMIN DASHBOARD</h1>
          <p className="text-sm text-muted-foreground">Live operational data from the database and integrations.</p>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary">Operator</Badge>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="bg-card/70 border border-border/60">
          <TabsTrigger value="overview"><Activity className="h-4 w-4 mr-1.5" /> Overview</TabsTrigger>
          <TabsTrigger value="content"><Database className="h-4 w-4 mr-1.5" /> Content</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="h-4 w-4 mr-1.5" /> Integrations</TabsTrigger>
          <TabsTrigger value="settings"><Settings2 className="h-4 w-4 mr-1.5" /> Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {[
              ['Total audits', stats.audits.total],
              ['Today', stats.audits.today],
              ['This month', stats.audits.month],
              ['Completed', stats.audits.completed],
              ['Failed', stats.audits.failed],
              ['Avg score', stats.audits.avgScore],
            ].map(([label, value]) => (
              <Card key={label as string} className="border-border/60 bg-card/60">
                <CardContent className="p-4">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
                  <div className="mt-1 font-mono font-black text-2xl">{String(value)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <Card className="border-border/60 bg-card/60">
              <CardContent className="p-5">
                <h2 className="font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Most common SEO problems</h2>
                <div className="mt-3 space-y-2">
                  {stats.topFindings.length === 0 && <p className="text-sm text-muted-foreground">No findings recorded yet.</p>}
                  {stats.topFindings.map((f) => (
                    <div key={f.code} className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/40 px-3.5 py-2">
                      <Badge variant="outline" className={`text-[10px] font-bold shrink-0 ${f.severity === 'critical' || f.severity === 'high' ? 'border-red-500/40 text-red-400' : 'border-amber-500/40 text-amber-400'}`}>{f.severity}</Badge>
                      <span className="text-sm truncate flex-1">{f.title}</span>
                      <span className="font-mono text-sm text-primary shrink-0">{f.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-5">
              <Card className="border-border/60 bg-card/60">
                <CardContent className="p-5">
                  <h2 className="font-bold">Recent audits</h2>
                  <div className="mt-3 space-y-1.5 max-h-72 overflow-y-auto scroll-slim">
                    {stats.recentAudits.map((a) => (
                      <div key={a.id} className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/40 px-3.5 py-2 text-sm">
                        <span className="font-mono text-xs truncate flex-1">{a.host}</span>
                        <Badge variant="outline" className={`text-[10px] ${a.status === 'completed' ? 'border-primary/40 text-primary' : a.status === 'failed' ? 'border-red-500/40 text-red-400' : 'border-amber-500/40 text-amber-400'}`}>{a.status}</Badge>
                        {a.overallScore !== null && <span className="font-mono text-primary">{a.overallScore}</span>}
                      </div>
                    ))}
                    {stats.recentAudits.length === 0 && <p className="text-sm text-muted-foreground">No audits yet.</p>}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-card/60">
                <CardContent className="p-5">
                  <h2 className="font-bold">Popular knowledge articles</h2>
                  <div className="mt-3 space-y-1.5">
                    {stats.topArticles.length === 0 && <p className="text-sm text-muted-foreground">No article views tracked yet.</p>}
                    {stats.topArticles.map((a) => (
                      <div key={a.slug ?? '?'} className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/40 px-3.5 py-2 text-sm">
                        <span className="font-mono text-xs truncate flex-1">{a.slug}</span>
                        <span className="font-mono text-primary">{a.views}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-5 flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2.5">
                {stats.pnrClicks > 0 ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm">P&amp;R banner clicks: <span className="font-mono font-bold">{stats.pnrClicks}</span></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-sm">P&amp;R conversion to explore: <span className="font-mono font-bold">{stats.pnrClicks}</span></span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-5 grid lg:grid-cols-2 gap-5">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-5">
              <h2 className="font-bold">Content jobs by type</h2>
              <div className="mt-3 space-y-1.5">
                {stats.content.byTypeStatus.length === 0 && <p className="text-sm text-muted-foreground">No generations yet.</p>}
                {stats.content.byTypeStatus.map((g) => (
                  <div key={g.assetType + g.status} className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/40 px-3.5 py-2 text-sm">
                    <span className="font-mono text-xs flex-1 truncate">{g.assetType}</span>
                    <Badge variant="outline" className="text-[10px] border-border">{g.status}</Badge>
                    <span className="font-mono text-primary">{g.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-5">
              <h2 className="font-bold">By provider</h2>
              <div className="mt-3 space-y-1.5">
                {stats.content.byProvider.map((g) => (
                  <div key={g.provider} className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/40 px-3.5 py-2 text-sm">
                    <span className="font-mono text-xs flex-1 truncate">{g.provider}</span>
                    <span className="font-mono text-primary">{g.count}</span>
                  </div>
                ))}
              </div>
              <h2 className="font-bold mt-5">Recent generations</h2>
              <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto scroll-slim">
                {stats.content.recent.map((j) => (
                  <div key={j.id} className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/40 px-3.5 py-2 text-sm">
                    <span className="font-mono text-xs flex-1 truncate">{j.assetType}{j.toolName ? ` · ${j.toolName}` : ''}</span>
                    <Badge variant="outline" className={`text-[10px] ${j.status === 'completed' ? 'border-primary/40 text-primary' : j.status === 'failed' ? 'border-red-500/40 text-red-400' : 'border-amber-500/40 text-amber-400'}`}>{j.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-5 grid lg:grid-cols-2 gap-5">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-5">
              <h2 className="font-bold flex items-center gap-2">
                <Plug className="h-4 w-4 text-primary" /> P&amp;R MCP (live inspection)
                <Badge variant="outline" className={`ml-auto text-[10px] font-bold ${stats.integrations.mcp.reachable ? 'border-primary/40 text-primary' : 'border-red-500/40 text-red-400'}`}>
                  {stats.integrations.mcp.reachable ? 'REACHABLE' : 'UNREACHABLE'}
                </Badge>
              </h2>
              {stats.integrations.mcp.serverInfo && (
                <p className="mt-2 text-sm text-muted-foreground font-mono">
                  {stats.integrations.mcp.serverInfo.title ?? stats.integrations.mcp.serverInfo.name} v{stats.integrations.mcp.serverInfo.version}
                </p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                Tools discovered: <span className="font-mono font-bold text-foreground">{stats.integrations.mcp.toolCount}</span> · API key: {stats.integrations.pnrKeyConfigured ? 'configured' : 'not configured'}
              </p>
              {stats.integrations.mcp.error && <p className="mt-2 text-xs text-red-400">{stats.integrations.mcp.error}</p>}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-64 overflow-y-auto scroll-slim">
                {stats.integrations.mcp.tools.map((t) => (
                  <div key={t} className="rounded border border-border/50 bg-background/40 px-2.5 py-1.5 font-mono text-xs text-muted-foreground truncate">{t}</div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Generation calls require an API key (Authorization: Bearer). Set it in Settings or via the PNR_MCP_KEY env var. Without a key, generation falls back to the built-in AI engine, clearly labeled.
              </p>
            </CardContent>
          </Card>
          <div className="space-y-5">
            <Card className="border-border/60 bg-card/60">
              <CardContent className="p-5">
                <h2 className="font-bold flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> Agent runtime</h2>
                <p className="mt-2 text-sm text-muted-foreground">{stats.integrations.agentRuntime}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stats.integrations.auditEngine}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/60">
              <CardContent className="p-5">
                <h2 className="font-bold flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> llms.txt (copy into public/)</h2>
                <pre className="mt-2 rounded-lg border border-border/50 bg-background/50 p-3 text-[11px] font-mono whitespace-pre-wrap max-h-56 overflow-y-auto scroll-slim">{LLMSTXT}</pre>
                <Button size="sm" variant="outline" className="mt-2 border-border" onClick={() => navigator.clipboard.writeText(LLMSTXT).then(() => toast({ title: 'llms.txt copied' }))}>
                  COPY
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-5">
          <Card className="border-border/60 bg-card/60 max-w-2xl">
            <CardContent className="p-6 space-y-5">
              {([
                ['freeContentPerAudit', 'Free content generations per audit'],
                ['maxAuditsPerIpPerDay', 'Max audits per IP per day'],
                ['auditConcurrency', 'Audit concurrency (agent slots)'],
                ['cacheTtlMinutes', 'Audit cache TTL (minutes)'],
              ] as const).map(([field, label]) => (
                <div key={field}>
                  <Label className="text-muted-foreground">{label}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={settings[field]}
                    onChange={(e) => setSettings({ ...settings, [field]: Number(e.target.value) })}
                    className="mt-1.5 bg-background/60"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">Built-in fallback generator</div>
                  <div className="text-xs text-muted-foreground">Used when the P&amp;R MCP has no API key. Always labeled in the UI.</div>
                </div>
                <Switch checked={settings.mcpFallbackEnabled} onCheckedChange={(v) => setSettings({ ...settings, mcpFallbackEnabled: v })} aria-label="Toggle fallback generator" />
              </div>
              <div>
                <Label className="text-muted-foreground flex items-center gap-1.5"><Key className="h-3.5 w-3.5" /> P&amp;R MCP API key {stats.integrations.pnrKeyConfigured ? '(configured - replace or save empty to clear)' : '(not configured)'}</Label>
                <Input
                  type="password"
                  placeholder="Paste agent API key (sent as Authorization: Bearer ...)"
                  value={pnrKeyInput}
                  onChange={(e) => setPnrKeyInput(e.target.value)}
                  className="mt-1.5 bg-background/60 font-mono"
                />
              </div>
              <Button onClick={saveSettings} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />} SAVE SETTINGS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
