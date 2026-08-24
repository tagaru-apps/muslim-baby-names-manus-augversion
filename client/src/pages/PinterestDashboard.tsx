import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Clock3, ExternalLink, KeyRound, LoaderCircle, Plus, Send, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusLabel: Record<string, string> = {
  draft: "Draft", ready_for_review: "Ready for review", owner_approved: "Approved", queued: "Queued", published: "Published", failed: "Needs attention", cancelled: "Cancelled",
};

function statusClass(status: string) {
  if (status === "published") return "bg-emerald-100 text-emerald-800";
  if (status === "failed") return "bg-rose-100 text-rose-800";
  if (status === "owner_approved" || status === "queued") return "bg-amber-100 text-amber-900";
  return "bg-stone-200 text-stone-700";
}

function PublisherConsole() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const overview = trpc.pinterest.overview.useQuery(undefined, { enabled: Boolean(user?.role === "admin") });
  const setup = trpc.pinterest.connectionSetup.useQuery(undefined, { enabled: Boolean(user?.role === "admin") });
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("https://muslim-babynames.com/");
  const [aiModified, setAiModified] = useState(true);

  const refresh = async () => utils.pinterest.overview.invalidate();
  const createDraft = trpc.pinterest.createDraft.useMutation({ onSuccess: async () => { await refresh(); setShowForm(false); setTitle(""); setDescription(""); toast.success("Draft created for review."); }, onError: error => toast.error(error.message) });
  const sendForReview = trpc.pinterest.sendForReview.useMutation({ onSuccess: refresh, onError: error => toast.error(error.message) });
  const approve = trpc.pinterest.approve.useMutation({ onSuccess: refresh, onError: error => toast.error(error.message) });
  const queue = trpc.pinterest.queue.useMutation({ onSuccess: refresh, onError: error => toast.error(error.message) });

  if (!user) return null;
  if (user.role !== "admin") return <div className="mx-auto max-w-xl border border-rose-200 bg-rose-50 p-8 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-rose-700" /><h1 className="mt-4 font-display text-3xl text-emerald-950">Owner access required</h1><p className="mt-3 text-sm leading-6 text-emerald-950/70">This publishing console is restricted to the site owner. The server also enforces this boundary for every publishing action.</p></div>;
  if (overview.isLoading || setup.isLoading) return <div className="grid min-h-[50vh] place-items-center"><LoaderCircle className="h-7 w-7 animate-spin text-[#0b6e4f]" /></div>;
  if (overview.error || setup.error) return <div className="border border-rose-200 bg-rose-50 p-6"><AlertCircle className="h-5 w-5 text-rose-700" /><p className="mt-3 text-sm text-rose-800">The protected publishing data could not be loaded. Refresh the page or sign in again.</p></div>;

  const drafts = overview.data?.drafts ?? [];
  const connection = overview.data?.connection;
  return <div className="mx-auto max-w-6xl space-y-8 pb-14"><header className="border-b border-emerald-950/10 pb-6"><p className="eyebrow text-[#8b6d22]">Owner workspace</p><div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="font-display text-4xl tracking-[-0.055em] text-emerald-950 sm:text-5xl">Pinterest publisher</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-950/68">Every Pin moves through a logged draft, review, approval, and queue state. No browser-side secret or unattended post is used.</p></div><Button onClick={() => setShowForm(true)} className="bg-[#0b6e4f] text-[#fffdf8] hover:bg-emerald-900"><Plus className="mr-2 h-4 w-4" /> New draft</Button></div></header>

    <section className={`grid gap-5 border p-5 sm:grid-cols-[1fr_auto] ${setup.data?.configured && connection?.status === "connected" ? "border-emerald-200 bg-emerald-50" : "border-[#c9a227]/45 bg-[#fffaf0]"}`}><div><div className="flex items-center gap-2 text-sm font-semibold text-emerald-950">{setup.data?.configured && connection?.status === "connected" ? <CheckCircle2 className="h-5 w-5 text-[#0b6e4f]" /> : <KeyRound className="h-5 w-5 text-[#a57f1f]" />} Pinterest API connection</div><p className="mt-2 text-sm leading-6 text-emerald-950/70">{setup.data?.configured ? connection?.status === "connected" ? `Connected to ${connection.accountName || "the authorized Pinterest account"}.` : "Pinterest credentials are present, but the account authorization has not been completed." : "Add the Pinterest developer app credentials to enable the secure OAuth connection and real publication endpoint."}</p></div><div className="text-sm text-emerald-950/65"><p className="font-semibold text-emerald-950">Required callback URL</p><code className="mt-2 block max-w-xs break-all bg-white/80 p-2 text-xs">{setup.data?.redirectUri}</code></div></section>

    {showForm && <section className="border border-emerald-950/15 bg-[#fffdf8] p-5"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">New Pin draft</p><h2 className="mt-2 font-display text-2xl text-emerald-950">Prepare a reviewed publication</h2></div><button onClick={() => setShowForm(false)} aria-label="Close new draft form"><XCircle className="h-5 w-5 text-emerald-950/50" /></button></div><div className="mt-5 grid gap-4"><Input value={title} onChange={event => setTitle(event.target.value)} maxLength={100} placeholder="Pin title (up to 100 characters)" /><Textarea value={description} onChange={event => setDescription(event.target.value)} maxLength={800} placeholder="Search-led Pin description (up to 800 characters)" className="min-h-28" /><Input value={destinationUrl} onChange={event => setDestinationUrl(event.target.value)} placeholder="https://muslim-babynames.com/..." /><label className="flex items-center gap-3 text-sm text-emerald-950/75"><input type="checkbox" checked={aiModified} onChange={event => setAiModified(event.target.checked)} className="h-4 w-4 accent-[#0b6e4f]" /> This creative is AI-modified and needs the required provider disclosure.</label><div><Button disabled={!title.trim() || !description.trim() || createDraft.isPending} onClick={() => createDraft.mutate({ title, description, destinationUrl, aiModified })} className="bg-[#0b6e4f] text-[#fffdf8] hover:bg-emerald-900">{createDraft.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Save draft</Button></div></div></section>}

    <section><div className="mb-4 flex items-end justify-between gap-3"><div><p className="eyebrow">Publication queue</p><h2 className="mt-2 font-display text-3xl tracking-[-0.04em] text-emerald-950">Approved only, always accountable.</h2></div><p className="text-sm text-emerald-950/55">{drafts.length} record{drafts.length === 1 ? "" : "s"}</p></div>{drafts.length === 0 ? <div className="border border-dashed border-emerald-950/20 bg-[#f0ece1] px-6 py-14 text-center"><Send className="mx-auto h-6 w-6 text-[#a57f1f]" /><p className="mt-4 font-display text-2xl text-emerald-950">No publishing records yet.</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-950/65">Create a draft, attach an approved creative once the API connection is ready, then move it through the review and approval controls.</p></div> : <div className="overflow-hidden border border-emerald-950/12 bg-[#fffdf8]"><div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-emerald-950/10 bg-[#f0ece1] px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-emerald-950/55"><span>Draft</span><span>State</span></div>{drafts.map(({ draft, board, asset, publication }) => <article key={draft.id} className="grid gap-4 border-b border-emerald-950/10 p-4 last:border-0 lg:grid-cols-[minmax(0,1fr)_auto]"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-2xl text-emerald-950">{draft.title}</h3><span className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] ${statusClass(draft.status)}`}>{statusLabel[draft.status]}</span></div><p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-950/65">{draft.description}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-emerald-950/55"><span>{board?.name || "Board pending API sync"}</span><a className="inline-flex items-center gap-1 text-[#0b6e4f] underline underline-offset-2" href={draft.destinationUrl} target="_blank" rel="noreferrer">Destination <ExternalLink className="h-3 w-3" /></a>{asset ? <span>{asset.width} × {asset.height} creative</span> : <span>Creative pending</span>}{publication?.liveUrl && <a className="inline-flex items-center gap-1 text-[#0b6e4f] underline underline-offset-2" href={publication.liveUrl} target="_blank" rel="noreferrer">Live Pin <ExternalLink className="h-3 w-3" /></a>}</div></div><div className="flex flex-wrap items-center gap-2 lg:justify-end">{draft.status === "draft" && <Button variant="outline" size="sm" onClick={() => sendForReview.mutate({ draftId: draft.id })}><Send className="mr-1.5 h-3.5 w-3.5" /> Review</Button>}{draft.status === "ready_for_review" && <Button size="sm" onClick={() => approve.mutate({ draftId: draft.id })} className="bg-[#0b6e4f] text-[#fffdf8] hover:bg-emerald-900"><ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Approve</Button>}{draft.status === "owner_approved" && <Button size="sm" onClick={() => queue.mutate({ draftId: draft.id, scheduledFor: Date.now() + 60 * 60 * 1000 })} className="bg-[#a57f1f] text-white hover:bg-[#8b6d22]"><Clock3 className="mr-1.5 h-3.5 w-3.5" /> Queue</Button>}</div></article>)}</div>}</section>
  </div>;
}

export default function PinterestDashboard() {
  return <DashboardLayout><PublisherConsole /></DashboardLayout>;
}
