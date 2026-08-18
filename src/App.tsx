import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Download,
  ExternalLink,
  FileText,
  Fingerprint,
  FlaskConical,
  LayoutList,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Link, Navigate, NavLink, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import { applicationStatuses, type ApplicationStatus } from "../shared/contracts";
import { apiRequest, markApplicationApplied, openArtifact, updateApplicationStatus, type ApplicationDetail, type ApplicationSummary, type ArtifactSummary } from "./api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type SessionState = { status: "loading" | "anonymous" | "authenticated"; user?: AuthUser };
type AuthUser = { id: string; email: string; name?: string | null };

export function App() {
  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const [configuration, setConfiguration] = useState<{
    loading: boolean;
    localMode: boolean;
  }>({ loading: true, localMode: false });

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((health: { localMode?: boolean }) => {
        setConfiguration({ loading: false, localMode: Boolean(health.localMode) });
      })
      .catch(() => setConfiguration({ loading: false, localMode: false }));
  }, []);

  useEffect(() => {
    if (!configuration.localMode) {
      setSession({ status: "anonymous" });
      return;
    }
    fetch("/api/me")
      .then(async (response) => {
        if (!response.ok) throw new Error("Local profile is unavailable.");
        return response.json() as Promise<{ user: AuthUser }>;
      })
      .then(({ user }) => setSession({ status: "authenticated", user }))
      .catch(() => setSession({ status: "anonymous" }));
  }, [configuration]);

  if (configuration.loading || session.status === "loading") return <LoadingScreen />;
  if (!configuration.localMode || session.status === "anonymous") return <SetupScreen />;

  return (
    <AppShell
      user={session.user!}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/applications" replace />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/:id" element={<ApplicationPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/applications" replace />} />
      </Routes>
    </AppShell>
  );
}

function AppShell({ user, children }: { user: AuthUser; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigation = [
    { to: "/applications", label: "Applications", icon: LayoutList },
    { to: "/analytics", label: "Outcomes", icon: BarChart3 },
    { to: "/profile", label: "Profile & facts", icon: CircleUserRound },
  ];
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-forest text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-7 py-7">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-mint text-forest"><Sparkles size={19} /></div>
            <div><p className="font-display text-xl tracking-tight">Jobsearch</p><p className="text-xs text-white/48">Application intelligence</p></div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-7">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link--active" : ""}`}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/[0.06] p-4">
            <p className="truncate text-sm font-medium">{user.name || "Jobsearch user"}</p>
            <p className="mt-1 truncate text-xs text-white/45">{user.email}</p>
            <p className="mt-3 text-xs text-mint/70">Local access only</p>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-canvas/90 px-5 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2 font-display text-lg"><Sparkles size={18} /> Jobsearch</div>
        <Button variant="outline" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></Button>
      </header>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-forest p-5 text-white lg:hidden">
          <div className="flex items-center justify-between"><p className="font-display text-xl">Jobsearch</p><Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X /></Button></div>
          <nav className="mt-12 space-y-2">
            {navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className="sidebar-link"><Icon size={19} />{label}</NavLink>)}
          </nav>
        </div>
      )}

      <main className="lg:pl-72"><div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-8 sm:py-10 xl:px-12">{children}</div></main>
    </div>
  );
}

function ApplicationsPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";
  const query = params.get("q") || "";
  const applications = useQuery({
    queryKey: ["applications", status, query],
    queryFn: () => apiRequest<{ applications: ApplicationSummary[] }>(`/api/applications?${new URLSearchParams({ ...(status ? { status } : {}), ...(query ? { q: query } : {}) })}`),
  });
  const rows = applications.data?.applications ?? [];
  const counts = rows.reduce<Record<string, number>>((result, row) => {
    result[row.currentStatus] = (result[row.currentStatus] ?? 0) + 1;
    return result;
  }, {});
  return (
    <Page>
      <PageHeading eyebrow="Application library" title="Every application, with its reasoning intact" description="A record of the roles, evidence, wording choices, application status, and artifacts sent." />
      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="In preparation" value={(counts.researching ?? 0) + (counts.preparing ?? 0) + (counts.ready ?? 0)} tone="warm" />
        <Metric label="Applied" value={counts.applied ?? 0} />
        <Metric label="In conversation" value={(counts.screening ?? 0) + (counts.interviewing ?? 0)} tone="mint" />
        <Metric label="Offers" value={counts.offer ?? 0} tone="bright" />
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md"><Search className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted" size={17} /><Input className="pl-10" value={query} onChange={(event) => updateParam(params, setParams, "q", event.target.value)} placeholder="Search company or role" /></div>
          <Select value={status || "all"} onValueChange={(value) => updateParam(params, setParams, "status", value === "all" ? "" : value)}>
            <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All statuses</SelectItem>{applicationStatuses.map((value) => <SelectItem key={value} value={value}>{statusLabel(value)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {applications.isLoading ? <ListSkeleton /> : applications.error ? <ErrorState error={applications.error} /> : rows.length === 0 ? <EmptyState /> : (
          <div className="divide-y divide-line">{rows.map((row) => <ApplicationRow key={row.id} application={row} />)}</div>
        )}
      </Card>
    </Page>
  );
}

function ApplicationRow({ application }: { application: ApplicationSummary }) {
  return <Link to={`/applications/${application.id}`} className="group grid gap-4 p-5 transition hover:bg-white/65 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
    <div className="flex min-w-0 items-start gap-4"><div className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white text-forest"><Building2 size={19} /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2">{application.needsAttention && <Star aria-label="Needs attention" className="fill-amber-400 text-amber-500" size={18} />}<h2 className="truncate font-display text-lg font-semibold">{application.position}</h2><StatusBadge status={application.currentStatus} />{typeof application.matchScore === "number" && <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-forest" title="Comparative fit judgment based on the stored positioning strategy"><Sparkles size={12} /> {Math.round(application.matchScore)}% match</span>}</div><p className="mt-1 text-sm text-muted">{application.company}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted"><span className="flex items-center gap-1.5"><CalendarDays size={13} /> Updated {formatDate(application.updatedAt)}</span><span className="flex items-center gap-1.5"><FileText size={13} /> {application.artifactCount} artifact{application.artifactCount === 1 ? "" : "s"}</span><span>{application.language.toUpperCase()}</span></div></div></div>
    <ChevronRight className="hidden text-muted transition group-hover:translate-x-1 group-hover:text-forest sm:block" size={20} />
  </Link>;
}

function ApplicationPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string>();
  const detail = useQuery({ queryKey: ["application", id], queryFn: () => apiRequest<{ application: ApplicationDetail }>(`/api/applications/${id}`) });
  const data = detail.data?.application;
  const latestRenderedCv = data?.artifacts
    .filter((artifact) => artifact.type === "cv" && artifact.state === "final" && artifact.hasHtml && artifact.hasPdf)
    .sort((left, right) => right.revision - left.revision)[0];
  const confirmApplied = useMutation({
    mutationFn: async () => {
      if (!data || !latestRenderedCv) throw new Error("Render a final CV before confirming this application.");
      const confirmed = window.confirm(
        `Confirm that you submitted your application to ${data.application.company}? This will mark it as applied and freeze CV v${latestRenderedCv.revision}.`,
      );
      if (!confirmed) return false;
      setActionError(undefined);
      await markApplicationApplied(id, latestRenderedCv.id);
      return true;
    },
    onSuccess: async (confirmed) => {
      if (!confirmed) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["application", id] }),
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics"] }),
      ]);
    },
    onError: (error) => setActionError(error instanceof Error ? error.message : "Could not mark the application as applied."),
  });
  const updateStatus = useMutation({
    mutationFn: async (status: ApplicationStatus) => {
      if (!data || status === data.application.currentStatus) return false;
      if (status === "applied") {
        if (!data.application.appliedAt) {
          await confirmApplied.mutateAsync();
          return false;
        }
        setActionError(undefined);
        await updateApplicationStatus(id, status);
        return true;
      }
      if (["accepted", "rejected", "withdrawn", "archived"].includes(status)) {
        const confirmed = window.confirm(`Change this application to ${statusLabel(status)}?`);
        if (!confirmed) return false;
      }
      setActionError(undefined);
      await updateApplicationStatus(id, status);
      return true;
    },
    onSuccess: async (changed) => {
      if (!changed) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["application", id] }),
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics"] }),
      ]);
    },
    onError: (error) => setActionError(error instanceof Error ? error.message : "Could not update the application status."),
  });
  if (detail.isLoading) return <Page><ListSkeleton /></Page>;
  if (detail.error || !data) return <Page><ErrorState error={detail.error} /></Page>;
  const latestJob = data.documents.find((document) => document.type === "job_snapshot");
  const latestResearch = data.documents.find((document) => document.type === "company_research");
  const artifactsByNewestRevision = [...data.artifacts].sort((left, right) => {
    if (left.type === right.type) return right.revision - left.revision;
    if (left.type === "cv") return -1;
    if (right.type === "cv") return 1;
    return Date.parse(right.createdAt) - Date.parse(left.createdAt);
  });
  const latestRevisionByType = new Map<string, number>();
  for (const artifact of artifactsByNewestRevision) {
    if (!latestRevisionByType.has(artifact.type)) latestRevisionByType.set(artifact.type, artifact.revision);
  }
  const latestArtifacts = artifactsByNewestRevision.filter((artifact) => latestRevisionByType.get(artifact.type) === artifact.revision);
  const previousArtifacts = artifactsByNewestRevision.filter((artifact) => latestRevisionByType.get(artifact.type) !== artifact.revision);
  return <Page>
    <Link to="/applications" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-forest"><ArrowLeft size={16} /> All applications</Link>
    <div className="mt-6 flex flex-col gap-5 border-b border-line pb-8 xl:flex-row xl:items-end xl:justify-between">
      <div><div className="flex flex-wrap items-center gap-3">{data.application.needsAttention && <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700"><Star className="fill-amber-400 text-amber-500" size={17} /> Needs attention</span>}<StatusBadge status={data.application.currentStatus} /><span className="text-xs uppercase tracking-[.16em] text-muted">{data.application.language}</span></div><h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold tracking-[-.035em] sm:text-5xl">{data.application.position}</h1><p className="mt-3 text-lg text-muted">{data.application.company}</p></div>
      <div className="flex flex-wrap gap-2">
        <Select value={data.application.currentStatus} disabled={updateStatus.isPending || confirmApplied.isPending} onValueChange={(value) => updateStatus.mutate(value as ApplicationStatus)}>
          <SelectTrigger className="w-48"><SelectValue aria-label="Application status" /></SelectTrigger>
          <SelectContent>{applicationStatuses.map((value) => <SelectItem key={value} value={value}>{statusLabel(value)}</SelectItem>)}</SelectContent>
        </Select>
        {data.application.sourceUrl && (
          <Button asChild>
            <a href={data.application.sourceUrl} target="_blank" rel="noreferrer">
              Apply <ExternalLink size={16} />
            </a>
          </Button>
        )}
        {data.application.appliedAt ? (
          <Button variant="outline" disabled><Check size={16} /> Submitted</Button>
        ) : (
          <Button
            variant="outline"
            disabled={!latestRenderedCv || confirmApplied.isPending}
            title={latestRenderedCv ? `Freeze and submit CV v${latestRenderedCv.revision}` : "A rendered final CV is required"}
            onClick={() => confirmApplied.mutate()}
          >
            <Check size={16} /> {confirmApplied.isPending ? "Confirming…" : "Confirm applied"}
          </Button>
        )}
      </div>
    </div>
    {actionError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{actionError}</p>}

    <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,.75fr)]">
      <div className="space-y-6">
        <section className="panel p-6 sm:p-7">
          <SectionHeading icon={FileText} title="Latest artifacts" detail={latestArtifacts.length ? "Use these versions" : "No artifacts"} />
          {latestArtifacts.length ? <div className="mt-5 space-y-3">{latestArtifacts.map((artifact) => <ArtifactCard key={artifact.id} artifact={artifact} current />)}</div> : <InlineEmpty text="No CV or cover-letter drafts have been stored yet." />}
          {previousArtifacts.length > 0 && (
            <details className="mt-5 rounded-2xl border border-line bg-white/45 p-4">
              <summary className="cursor-pointer select-none text-sm font-semibold text-muted">Previous revisions — do not send ({previousArtifacts.length})</summary>
              <p className="mt-2 text-xs leading-5 text-muted">These are retained for history. The latest versions above replace them.</p>
              <div className="mt-4 space-y-3">{previousArtifacts.map((artifact) => <ArtifactCard key={artifact.id} artifact={artifact} />)}</div>
            </details>
          )}
        </section>
        <section className="panel p-6 sm:p-7"><SectionHeading icon={BriefcaseBusiness} title="Captured role" detail={latestJob ? `Snapshot v${latestJob.revision}` : "No snapshot"} />{latestJob ? <div className="prose-copy mt-5"><h3>{String(latestJob.payload.title || data.application.position)}</h3><p className="whitespace-pre-wrap">{String(latestJob.payload.description || "")}</p></div> : <InlineEmpty text="No job description snapshot is available." />}</section>
        <section className="panel p-6 sm:p-7"><SectionHeading icon={FlaskConical} title="Research evidence" detail={latestResearch ? `${latestResearch.sources.length} source${latestResearch.sources.length === 1 ? "" : "s"}` : "Not captured"} />{latestResearch ? <div className="mt-5"><JsonSummary value={latestResearch.payload} /><div className="mt-5 space-y-2">{latestResearch.sources.map((source, index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" className="source-link"><ExternalLink size={14} /><span>{source.title || source.url}</span></a>)}</div>{latestResearch.inferences.length > 0 && <div className="mt-5 rounded-xl bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-amber-900">Agent inferences</p><ul className="mt-2 space-y-1 text-sm text-amber-950/70">{latestResearch.inferences.map((item) => <li key={item}>• {item}</li>)}</ul></div>}</div> : <InlineEmpty text="Company research has not been stored yet." />}</section>
      </div>
      <aside className="space-y-6">
        <section className="panel p-6"><SectionHeading icon={CalendarDays} title="Timeline" />{data.events.length ? <div className="timeline mt-5">{data.events.map((event) => <div key={event.id} className="timeline-item"><span className="timeline-dot" /><p className="text-sm font-medium">{eventLabel(event.type, event.payload)}</p><p className="mt-1 text-xs text-muted">{formatDateTime(event.occurredAt)} · {event.actor}</p></div>)}</div> : <InlineEmpty text="No events recorded." />}</section>
        <CollectionPanel title="Contacts" icon={CircleUserRound} items={data.contacts} empty="No employer contacts recorded." render={(item) => <div><p className="text-sm font-semibold">{String(item.name)}</p>{item.role ? <p className="mt-1 text-xs text-muted">{String(item.role)}</p> : null}</div>} />
        <CollectionPanel title="Interviews" icon={CalendarDays} items={data.interviews} empty="No interviews recorded." render={(item) => <div><p className="text-sm font-semibold">{String(item.stage)}</p>{item.scheduledAt ? <p className="mt-1 text-xs text-muted">{formatDateTime(String(item.scheduledAt))}</p> : null}</div>} />
        <CollectionPanel title="Feedback & learning" icon={Sparkles} items={data.feedback} empty="No feedback or hypotheses recorded." render={(item) => <div><p className="text-xs font-semibold uppercase tracking-wider text-muted">{String(item.type).replaceAll("_", " ")}</p><JsonSummary value={item.payload as Record<string, unknown>} compact /></div>} />
      </aside>
    </div>
  </Page>;
}

function ArtifactCard({ artifact, current = false }: { artifact: ArtifactSummary; current?: boolean }) {
  const [error, setError] = useState<string>();
  const score = artifact.scorecard as Record<string, number>;
  return <article className={`rounded-2xl border p-5 ${current ? "border-forest/25 bg-white" : "border-line bg-white/55 opacity-75"}`}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="artifact-type">{artifact.type.replaceAll("_", " ")}</span><span className="text-xs text-muted">v{artifact.revision}</span><span className={`artifact-state artifact-state--${artifact.state}`}>{artifact.state}</span><span className={current ? "rounded-full bg-mint px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-forest" : "rounded-full bg-stone-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-600"}>{current ? "Latest — use this" : "Superseded"}</span></div><p className="mt-3 text-sm text-muted">Created {formatDateTime(artifact.createdAt)}{artifact.frozenAt ? ` · frozen ${formatDate(artifact.frozenAt)}` : ""}</p></div><div className="flex gap-2">{artifact.hasHtml && <Button variant="outline" size="sm" onClick={() => openArtifact(artifact.id, "html").catch((value) => setError(value.message))}><ExternalLink size={15} /> {current ? "Preview" : "Preview old"}</Button>}{artifact.hasPdf && <Button variant={current ? "default" : "outline"} size="sm" onClick={() => openArtifact(artifact.id, "pdf", true).catch((value) => setError(value.message))}><Download size={15} /> {current ? "Download PDF" : "Old PDF"}</Button>}</div></div>
    {Object.keys(score).length > 0 && <div className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-4 sm:grid-cols-5">{["evidenceStrength", "jobAlignment", "keywordCoverage", "clarity", "unsupportedClaimRisk"].map((key) => typeof score[key] === "number" ? <div key={key}><p className="text-lg font-semibold tabular-nums">{score[key]}</p><p className="mt-0.5 text-[10px] leading-tight text-muted">{scoreLabel(key)}</p></div> : null)}</div>}
    {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
  </article>;
}

function AnalyticsPage() {
  const result = useQuery({ queryKey: ["analytics"], queryFn: () => apiRequest<{ analytics: { funnel: Record<string, number>; byStatus: Record<string, number> } }>("/api/analytics/funnel") });
  if (result.isLoading) return <Page><ListSkeleton /></Page>;
  if (result.error || !result.data) return <Page><ErrorState error={result.error} /></Page>;
  const funnel = result.data.analytics.funnel;
  const max = Math.max(funnel.applications || 1, 1);
  return <Page><PageHeading eyebrow="Outcome signals" title="See the funnel before explaining it" description="Observed outcomes stay separate from hypotheses, so early patterns do not become false certainty." />
    <section className="panel mt-8 p-6 sm:p-8"><div className="flex items-center gap-3"><div className="icon-tile"><BarChart3 size={18} /></div><div><h2 className="font-display text-xl font-semibold">Application funnel</h2><p className="text-sm text-muted">Current observed states</p></div></div><div className="mt-8 space-y-6">{Object.entries(funnel).map(([label, value]) => <div key={label} className="grid gap-2 sm:grid-cols-[120px_1fr_52px] sm:items-center"><p className="text-sm font-medium capitalize">{label}</p><div className="h-3 overflow-hidden rounded-full bg-forest/7"><div className="h-full rounded-full bg-forest transition-all" style={{ width: `${Math.max(value ? 4 : 0, (value / max) * 100)}%` }} /></div><p className="text-right text-sm font-semibold tabular-nums">{value}</p></div>)}</div></section>
    <section className="mt-6 grid gap-4 md:grid-cols-2"><div className="panel p-6"><ShieldCheck className="text-forest" /><h3 className="mt-5 font-display text-xl font-semibold">Evidence first</h3><p className="mt-2 text-sm leading-6 text-muted">Employer feedback and observed outcomes are retained as evidence. Agent explanations remain hypotheses until repeated results support them.</p></div><div className="panel p-6"><Fingerprint className="text-forest" /><h3 className="mt-5 font-display text-xl font-semibold">Reproducible versions</h3><p className="mt-2 text-sm leading-6 text-muted">Every draft carries its methodology hash, source snapshot, facts used, and scorecard for later comparison.</p></div></section>
  </Page>;
}

function ProfilePage() {
  const result = useQuery({ queryKey: ["profile"], queryFn: () => apiRequest<{ profile: { profile: Record<string, unknown>; facts: Array<Record<string, unknown>>; profileSources: Array<Record<string, unknown>> } }>("/api/profile") });
  if (result.isLoading) return <Page><ListSkeleton /></Page>;
  if (result.error || !result.data) return <Page><ErrorState error={result.error} /></Page>;
  const data = result.data.profile;
  const verified = data.facts.filter((fact) => fact.verificationStatus === "verified");
  const unverified = data.facts.filter((fact) => fact.verificationStatus !== "verified");
  return <Page><PageHeading eyebrow="Evidence profile" title={String(data.profile.displayName || "Profile & facts")} description="Public source snapshots and private verified facts form the evidence boundary for every tailored application." />
    <section className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="Verified facts" value={verified.length} tone="mint" /><Metric label="Awaiting verification" value={unverified.length} tone="warm" /><Metric label="Source snapshots" value={data.profileSources.length} /></section>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]"><section className="panel p-6 sm:p-7"><SectionHeading icon={ShieldCheck} title="Fact bank" detail="Final artifacts may only use verified facts" />{data.facts.length ? <div className="mt-5 divide-y divide-line">{data.facts.map((fact) => <div key={String(fact.id)} className="py-4 first:pt-0"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted">{String(fact.category)}</p><h3 className="mt-1 font-medium">{String(fact.label)}</h3></div><span className={fact.verificationStatus === "verified" ? "verified" : "unverified"}>{fact.verificationStatus === "verified" ? <Check size={12} /> : null}{String(fact.verificationStatus)}</span></div><JsonSummary value={fact.value as Record<string, unknown>} compact /></div>)}</div> : <InlineEmpty text="The private fact bank is empty." />}</section><aside className="space-y-6"><section className="panel p-6"><SectionHeading icon={Fingerprint} title="Source snapshots" />{data.profileSources.length ? <div className="mt-5 space-y-3">{data.profileSources.map((source) => <div key={String(source.id)} className="rounded-xl border border-line p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold capitalize">{String(source.adapter)}</p><span className="text-xs uppercase text-muted">{String(source.locale)}</span></div><p className="mt-2 text-xs text-muted">Imported {formatDate(String(source.importedAt))}</p><p className="mt-1 truncate font-mono text-[10px] text-muted">{String(source.sourceRevision || "No revision")}</p></div>)}</div> : <InlineEmpty text="No profile source has been imported." />}</section><section className="panel p-6"><SectionHeading icon={CircleUserRound} title="Preferences" /><JsonSummary value={data.profile.preferences as Record<string, unknown>} /></section></aside></div>
  </Page>;
}

function SetupScreen() { return <div className="grid min-h-screen place-items-center bg-canvas p-6"><Card className="max-w-xl p-8 sm:p-10"><div className="icon-tile"><Fingerprint size={20} /></div><p className="eyebrow mt-6">Setup is incomplete</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Ask Codex to finish setup</h1><p className="mt-4 text-sm leading-6 text-muted">Open this repository in Codex and say: “Set up Jobsearch for me.” Codex will configure the private local database and guide you through the profile interview.</p></Card></div>; }
function SetupStep({ number, text }: { number: string; text: string }) { return <li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-forest text-xs text-white">{number}</span><span className="pt-1 text-muted">{text}</span></li>; }
function LoadingScreen() { return <div className="grid min-h-screen place-items-center bg-forest text-white"><div className="text-center"><Sparkles className="mx-auto animate-pulse text-mint" /><p className="mt-4 font-display text-xl">Opening Jobsearch</p></div></div>; }
function Page({ children }: { children: ReactNode }) { return <div className="animate-in">{children}</div>; }
function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <header><p className="eyebrow">{eyebrow}</p><h1 className="mt-3 max-w-5xl font-display text-4xl font-semibold tracking-[-.035em] sm:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p></header>; }
function Metric({ label, value, tone = "default" }: { label: string; value: number; tone?: string }) { return <Card className={`metric metric--${tone}`}><p className="text-xs font-medium text-muted">{label}</p><p className="mt-4 font-display text-4xl font-semibold tracking-tight">{value}</p></Card>; }
function StatusBadge({ status }: { status: ApplicationStatus }) { return <Badge variant="secondary" className={`status status--${status}`}>{statusLabel(status)}</Badge>; }
function SectionHeading({ icon: Icon, title, detail }: { icon: typeof FileText; title: string; detail?: string }) { return <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="icon-tile"><Icon size={17} /></div><h2 className="font-display text-xl font-semibold">{title}</h2></div>{detail && <span className="text-xs text-muted">{detail}</span>}</div>; }
function CollectionPanel({ title, icon, items, empty, render }: { title: string; icon: typeof FileText; items: Array<Record<string, unknown> & { id: string }>; empty: string; render: (item: Record<string, unknown> & { id: string }) => ReactNode }) { return <Card className="p-6"><SectionHeading icon={icon} title={title} />{items.length ? <div className="mt-5 space-y-3">{items.map((item) => <div key={item.id} className="rounded-xl border border-line p-4">{render(item)}</div>)}</div> : <InlineEmpty text={empty} />}</Card>; }
function JsonSummary({ value, compact = false }: { value: Record<string, unknown>; compact?: boolean }) { const entries = Object.entries(value).filter(([, item]) => item !== null && item !== undefined && item !== ""); if (!entries.length) return null; return <dl className={compact ? "mt-3 space-y-2" : "space-y-3"}>{entries.map(([key, item]) => <div key={key} className={compact ? "text-xs" : "grid gap-1 text-sm sm:grid-cols-[140px_1fr]"}><dt className="font-medium capitalize text-muted">{key.replaceAll(/([A-Z_])/g, " $1").trim()}</dt><dd className="break-words text-ink/80">{typeof item === "string" || typeof item === "number" || typeof item === "boolean" ? String(item) : JSON.stringify(item)}</dd></div>)}</dl>; }
function InlineEmpty({ text }: { text: string }) { return <p className="mt-5 rounded-xl border border-dashed border-line p-5 text-sm text-muted">{text}</p>; }
function EmptyState() { return <div className="grid min-h-80 place-items-center p-8 text-center"><div><div className="icon-tile mx-auto"><BriefcaseBusiness size={20} /></div><h3 className="mt-4 font-display text-xl font-semibold">No applications match</h3><p className="mt-2 text-sm text-muted">Applications appear here after the agent records them with the CLI.</p></div></div>; }
function ErrorState({ error }: { error: unknown }) { return <Card className="p-8"><p className="font-medium text-red-800">Could not load this view</p><p className="mt-2 text-sm text-muted">{error instanceof Error ? error.message : "Try again after checking the local API."}</p></Card>; }
function ListSkeleton() { return <Card className="divide-y divide-line">{[1, 2, 3].map((item) => <div key={item} className="flex gap-4 p-6"><Skeleton className="size-11 rounded-xl" /><div className="flex-1"><Skeleton className="h-4 w-2/5" /><Skeleton className="mt-3 h-3 w-1/4" /></div></div>)}</Card>; }

function updateParam(params: URLSearchParams, setParams: (next: URLSearchParams) => void, key: string, value: string) { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next); }
function statusLabel(status: string) { return ({ discovered: "Considering", interviewing: "Interview", no_response: "No response" } as Record<string, string>)[status] || status.replaceAll("_", " ").replace(/^./, (value) => value.toUpperCase()); }
function scoreLabel(key: string) { return ({ evidenceStrength: "Evidence", jobAlignment: "Alignment", keywordCoverage: "Keywords", clarity: "Clarity", unsupportedClaimRisk: "Claim risk" } as Record<string, string>)[key] || key; }
function eventLabel(type: string, payload: Record<string, unknown>) { if (type === "status_changed" && payload.status) return `Status changed to ${statusLabel(String(payload.status))}`; if (type === "attention_updated") return payload.needsAttention ? "Marked for attention" : "Attention marker removed"; if (type === "application_applied") return "Application marked as sent"; if (type === "application_created") return "Application captured"; return statusLabel(type); }
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
