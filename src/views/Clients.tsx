import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, Building2, CalendarClock, Check, FileText, Landmark, Mail, Mic, Phone, Plus, Search, Send, Sparkles, StickyNote, Users,
} from "lucide-react";
import { uid, useNav, useStore } from "../lib/store";
import { daysFrom, fmtDate, moneyFull, relDate, type Client, type Comm } from "../lib/data";
import { Avatar, Badge, Field, Modal, Progress, Ring, SectionHead, useToast, type Tone } from "../components/ui";

const STATUS: Record<Client["status"], { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "sage" },
  "on-hold": { label: "On hold", tone: "cream" },
  "at-risk": { label: "At risk", tone: "clay" },
};

const COMM_ICON: Record<Comm["type"], React.ElementType> = {
  email: Mail, call: Phone, meeting: Users, portal: Send, note: StickyNote,
};

export default function Clients() {
  const { state, dispatch } = useStore();
  const { route, go } = useNav();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Client["status"]>("all");
  const [selected, setSelected] = useState<string | null>(route.clientId ?? null);
  const [addOpen, setAddOpen] = useState(false);
  const [nf, setNf] = useState({ name: "", company: "", email: "", service: "Tax returns", revenue: "8000" });

  useEffect(() => { setSelected(route.clientId ?? null); }, [route.clientId]);

  const filtered = useMemo(
    () =>
      state.clients.filter((c) => {
        const q = query.trim().toLowerCase();
        const hit = !q || `${c.name} ${c.company} ${c.tags.join(" ")}`.toLowerCase().includes(q);
        return hit && (statusFilter === "all" || c.status === statusFilter);
      }),
    [state.clients, query, statusFilter]
  );

  const client = state.clients.find((c) => c.id === selected);

  const totalRevenue = state.clients.reduce((a, c) => a + c.revenue, 0);
  const entityCount = state.clients.reduce((a, c) => a + c.entities.length, 0);

  const addClient = () => {
    if (!nf.name.trim()) return;
    const c: Client = {
      id: uid(), name: nf.name, company: nf.company || "—", email: nf.email || "—", phone: "",
      status: "active", health: 85, since: `${new Date().getFullYear()}`, revenue: Number(nf.revenue) || 8000,
      ball: "me", tags: ["New client"], services: [nf.service], entities: [], comms: [], notes: [],
      aiSummary: "Newly onboarded. Ordo drafted the engagement letter, created the portal, and queued the organizer checklist.",
      aiNext: "Send the engagement letter while the onboarding energy is high.",
    };
    dispatch({ type: "ADD_CLIENT", client: c });
    setAddOpen(false);
    setNf({ name: "", company: "", email: "", service: "Tax returns", revenue: "8000" });
    toast("Client added — onboarding automation is running", <Sparkles size={15} />);
    setSelected(c.id);
  };

  /* --------------------------- detail view --------------------------- */
  if (client) {
    return <ClientDetail client={client} onBack={() => { setSelected(null); go({ name: "clients" }); }} />;
  }

  /* ----------------------------- grid view --------------------------- */
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone="gold" dot>{moneyFull(totalRevenue)} annual fees</Badge>
        <Badge tone="sage">{state.clients.length} clients</Badge>
        <Badge tone="sky">{entityCount} entities managed</Badge>
        <span className="ml-auto">
          <button onClick={() => setAddOpen(true)} className="btn-gold flex items-center gap-2 px-4 py-2.5 text-[12.5px]">
            <Plus size={15} /> New client
          </button>
        </span>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 md:max-w-sm">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-600" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clients or companies…" className="input-luxe h-11 w-full pl-11 pr-4 text-[13px]" />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "at-risk", "on-hold"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`chip cursor-pointer transition ${statusFilter === s ? "border-gold-500/50 bg-gold-500/15 text-gold-300" : "hover:border-white/20 hover:text-cream-100"}`}>
              {s === "all" ? "All" : STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((c, i) => {
          const openProjs = state.projects.filter((p) => p.clientId === c.id && p.status !== "done").length;
          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(c.id)}
              className="card card-hover group p-6 text-left"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <Avatar src={c.avatar} name={c.name} size={52} ring={c.health >= 85} />
                  <div>
                    <p className="font-display text-[16.5px] leading-tight text-cream-50">{c.name}</p>
                    <p className="mt-0.5 text-[12px] text-cream-500">{c.company}</p>
                  </div>
                </div>
                <ArrowUpRight size={15} className="mt-1 text-cream-700 transition group-hover:translate-x-0.5 group-hover:text-gold-400" />
              </div>
              <div className="mb-4 flex flex-wrap gap-1.5">
                <Badge tone={STATUS[c.status].tone} dot={c.status === "at-risk"}>{STATUS[c.status].label}</Badge>
                <Badge tone="mute"><Building2 size={9} /> {c.entities.length} entit{c.entities.length === 1 ? "y" : "ies"}</Badge>
                <Badge tone={c.ball === "me" ? "gold" : "cream"}>{c.ball === "me" ? "Ball: you" : "Ball: client"}</Badge>
              </div>
              <div className="flex items-center justify-between border-t border-white/6 pt-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-cream-600">Annual fees</p>
                  <p className="font-display text-[17px] text-gold-300">{moneyFull(c.revenue)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-cream-600">Open work</p>
                  <p className="font-display text-[17px] text-cream-100">{openProjs} proj.</p>
                </div>
                <div className="text-center">
                  <Ring value={c.health} size={48} />
                  <p className="mt-0.5 text-[9px] uppercase tracking-widest text-cream-600">health</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-white/12 px-6 py-14 text-center">
          <Users className="mx-auto mb-3 text-gold-400" size={22} />
          <p className="font-display text-base text-cream-100">No clients match</p>
          <p className="mt-1 text-xs text-cream-500">Try a different search — or add the client you're picturing.</p>
        </div>
      )}

      {/* add client */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Onboard a new client">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name"><input autoFocus value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" placeholder="Jordan Ellis" /></Field>
          <Field label="Company"><input value={nf.company} onChange={(e) => setNf({ ...nf, company: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" placeholder="Ellis Interiors LLC" /></Field>
          <Field label="Email"><input value={nf.email} onChange={(e) => setNf({ ...nf, email: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" placeholder="jordan@ellis.com" /></Field>
          <Field label="Annual fees ($)"><input value={nf.revenue} onChange={(e) => setNf({ ...nf, revenue: e.target.value })} type="number" className="input-luxe h-11 w-full px-4 text-sm" /></Field>
          <div className="col-span-2">
            <Field label="Primary service">
              <select value={nf.service} onChange={(e) => setNf({ ...nf, service: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm">
                {["Tax returns", "Bookkeeping", "Advisory", "Tax planning", "Payroll", "Trust & estate"].map((s) => <option key={s} className="bg-ink-800">{s}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[11px] text-cream-600"><Sparkles size={12} className="text-gold-500" /> Ordo builds their portal & checklist</p>
          <button onClick={addClient} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-[13px]"><Plus size={15} /> Onboard</button>
        </div>
      </Modal>
    </div>
  );
}

/* ============================ detail ============================== */

function ClientDetail({ client, onBack }: { client: Client; onBack: () => void }) {
  const { state, dispatch } = useStore();
  const { go } = useNav();
  const toast = useToast();
  const [tab, setTab] = useState<"overview" | "activity" | "notes">("overview");
  const [note, setNote] = useState("");
  const [comm, setComm] = useState("");
  const [callOpen, setCallOpen] = useState(false);

  const endCall = (secs: number, rawNotes: string) => {
    const mins = Math.max(1, Math.round(secs / 60));
    const spoken = rawNotes.split("\n").find((l) => l.trim() && !l.toLowerCase().startsWith("task:"));
    dispatch({
      type: "ADD_COMM",
      clientId: client.id,
      comm: { id: uid(), type: "call", dir: "out", date: daysFrom(0), summary: `Strategy call (${mins}m): ${spoken?.trim() || "agenda covered"}. Filed live by Meeting Scribe.` },
    });
    const extracted = rawNotes.split("\n").filter((l) => l.toLowerCase().startsWith("task:")).map((l) => l.replace(/task:/i, "").trim()).filter(Boolean);
    extracted.forEach((title) =>
      dispatch({ type: "ADD_TASK", task: { id: uid(), title, clientId: client.id, due: daysFrom(2), priority: "medium", done: false, kind: "deliverable", ai: true } }));
    setCallOpen(false);
    toast(`Call filed to ${client.name.split(" ")[0]}'s record — ${extracted.length} action${extracted.length === 1 ? "" : "s"} extracted`, <Mic size={14} />);
  };

  const projects = state.projects.filter((p) => p.clientId === client.id && p.status !== "done");
  const tasks = state.tasks.filter((t) => t.clientId === client.id && !t.done);
  const dueNext = projects.map((p) => p.due).sort()[0];

  const TABS = [
    { key: "overview" as const, label: "Overview" },
    { key: "activity" as const, label: `Communications (${client.comms.length})` },
    { key: "notes" as const, label: `Notes (${client.notes.length})` },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
      <button onClick={onBack} className="mb-5 flex items-center gap-2 text-[12.5px] font-semibold text-cream-400 transition hover:text-gold-300">
        <ArrowLeft size={15} /> All clients
      </button>

      {/* header */}
      <div className="gold-edge mb-6 rounded-3xl bg-gradient-to-br from-ink-800 to-ink-900 p-7">
        <div className="flex flex-wrap items-center gap-6">
          <Avatar src={client.avatar} name={client.name} size={84} ring />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-[26px] text-cream-50">{client.name}</h2>
              <Badge tone={STATUS[client.status].tone} dot={client.status === "at-risk"}>{STATUS[client.status].label}</Badge>
              <Badge tone={client.ball === "me" ? "gold" : "cream"}>{client.ball === "me" ? "Ball in your court" : "Waiting on client"}</Badge>
            </div>
            <p className="mt-1 text-[13.5px] text-cream-400">{client.company} · client since {client.since}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {client.services.map((s) => <Badge key={s} tone="mute">{s}</Badge>)}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-display text-[24px] text-gold-300">{moneyFull(client.revenue)}</p>
              <p className="text-[10px] uppercase tracking-widest text-cream-600">annual fees</p>
            </div>
            <div className="text-center">
              <Ring value={client.health} size={64} />
              <p className="mt-1 text-[10px] uppercase tracking-widest text-cream-600">health</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {[
            { icon: Mail, label: "Email", fn: () => toast(`Email to ${client.name.split(" ")[0]} drafted by Ordo`, <Mail size={14} />) },
            { icon: Phone, label: "Call", fn: () => setCallOpen(true) },
            { icon: CalendarClock, label: "Schedule", fn: () => toast("Calendar link sent", <CalendarClock size={14} />) },
            { icon: Sparkles, label: "AI: next best move", fn: () => toast(client.aiNext, <Sparkles size={14} />) },
          ].map((a) => (
            <button key={a.label} onClick={a.fn} className={`flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold transition ${a.label === "Call" ? "border border-gold-500/40 bg-gold-500/12 text-gold-300 hover:bg-gold-500/20" : "btn-ghost"}`}>
              <a.icon size={14} className={a.label === "Call" ? "text-gold-300" : "text-gold-400"} /> {a.label === "Call" ? "Start call mode" : a.label}
            </button>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div className="mb-6 flex gap-1 border-b border-white/8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-2.5 text-[13px] font-semibold transition ${tab === t.key ? "text-gold-300" : "text-cream-500 hover:text-cream-100"}`}
          >
            {t.label}
            {tab === t.key && <motion.span layoutId="client-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold-400" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {tab === "overview" && (
            <div className="grid gap-6 xl:grid-cols-2">
              {/* AI + entities */}
              <div className="space-y-6">
                <div className="gold-edge rounded-2xl bg-gold-500/6 p-5">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-400"><Sparkles size={12} /> Ordo read on this client</p>
                  <p className="text-[13.5px] leading-relaxed text-cream-200">{client.aiSummary}</p>
                  <p className="mt-3 border-t border-gold-500/15 pt-3 text-[13px] leading-relaxed text-cream-100">
                    <span className="font-semibold text-gold-300">Next best move: </span>{client.aiNext}
                  </p>
                </div>
                <div className="card p-5">
                  <SectionHead title="Entities & structure" sub={`${client.entities.length} under management`} right={<Building2 size={16} className="text-gold-500" />} />
                  <div className="space-y-2.5">
                    {client.entities.length === 0 && <p className="text-[12.5px] italic text-cream-600">Sole prop — no separate entities.</p>}
                    {client.entities.map((e) => (
                      <div key={e.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
                          {e.type === "Trust" ? <Landmark size={15} /> : <Building2 size={15} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-cream-100">{e.name}</p>
                          <p className="text-[11px] text-cream-500">{e.type} · {e.state} · EIN {e.ein}</p>
                        </div>
                        <Badge tone={e.status === "active" ? "sage" : e.status === "pending" ? "gold" : "mute"}>{e.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* projects + open items */}
              <div className="space-y-6">
                <div className="card p-5">
                  <SectionHead title="Open engagements" sub={dueNext ? `Nearest deadline ${relDate(dueNext)}` : "Nothing in flight"} />
                  <div className="space-y-3">
                    {projects.length === 0 && <p className="text-[12.5px] italic text-cream-600">No open projects — a lovely place to be.</p>}
                    {projects.map((p) => (
                      <button key={p.id} onClick={() => go({ name: "projects" })} className="block w-full rounded-xl border border-white/6 bg-white/2 p-4 text-left transition hover:border-gold-500/25">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="truncate text-[13.5px] font-semibold text-cream-100">{p.name}</p>
                          <Badge tone={p.status === "at-risk" ? "clay" : p.status === "waiting" ? "cream" : "sage"}>{p.status}</Badge>
                        </div>
                        <Progress value={p.progress} tone={p.status === "at-risk" ? "clay" : "gold"} />
                        <div className="mt-2 flex items-center justify-between text-[11px] text-cream-500">
                          <span>{p.progress}% · due {fmtDate(p.due)}</span>
                          <span className={p.ball === "me" ? "font-semibold text-gold-300" : ""}>{p.ball === "me" ? "Ball: you" : "Ball: client"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="card p-5">
                  <SectionHead title="Open items for this client" />
                  <div className="space-y-2">
                    {tasks.length === 0 && <p className="text-[12.5px] italic text-cream-600">All clear for this client.</p>}
                    {tasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-2.5">
                        <button onClick={() => { dispatch({ type: "TOGGLE_TASK", id: t.id }); toast("Done — and off your plate.", <Check size={14} />); }} className="flex h-5 w-5 items-center justify-center rounded-full border border-gold-500/50 text-transparent transition hover:text-gold-300">
                          <Check size={11} strokeWidth={3} />
                        </button>
                        <p className="min-w-0 flex-1 truncate text-[12.5px] text-cream-200">{t.title}</p>
                        <Badge tone={relDate(t.due).includes("overdue") ? "clay" : "mute"}>{relDate(t.due)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "activity" && (
            <div className="card p-6">
              <SectionHead title="Communications" sub="Auto-filed by Meeting Scribe and the inbox watcher" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!comm.trim()) return;
                  dispatch({ type: "ADD_COMM", clientId: client.id, comm: { id: uid(), type: "note", dir: "self", date: daysFrom(0), summary: comm.trim() } });
                  setComm("");
                  toast("Logged on the client record");
                }}
                className="mb-5 flex gap-2"
              >
                <input value={comm} onChange={(e) => setComm(e.target.value)} placeholder="Log a call, email, or meeting note…" className="input-luxe h-11 flex-1 px-4 text-[13px]" />
                <button className="btn-gold flex h-11 items-center gap-2 px-5 text-[12.5px]"><FileText size={14} /> Log</button>
              </form>
              <div className="relative space-y-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-white/8">
                {client.comms.map((m) => {
                  const Icon = COMM_ICON[m.type];
                  return (
                    <div key={m.id} className="relative flex gap-4 pl-1">
                      <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-ink-800 text-gold-400">
                        <Icon size={13} />
                      </span>
                      <div className="min-w-0 flex-1 rounded-xl border border-white/6 bg-white/2 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="mute">{m.type}</Badge>
                          <span className="text-[10.5px] text-cream-600">{m.dir === "in" ? "received" : m.dir === "out" ? "sent" : "internal note"} · {fmtDate(m.date)} · {relDate(m.date)}</span>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-cream-200">{m.summary}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "notes" && (
            <div className="card p-6">
              <SectionHead title="Private notes" sub="Yours, plus what the AI scribe noticed" />
              <form
                onSubmit={(e) => { e.preventDefault(); if (!note.trim()) return; dispatch({ type: "ADD_NOTE", target: "client", id: client.id, text: note.trim() }); setNote(""); toast("Note saved to the record"); }}
                className="mb-5 flex gap-2"
              >
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write a note…" className="input-luxe h-11 flex-1 px-4 text-[13px]" />
                <button className="btn-gold flex h-11 items-center gap-2 px-5 text-[12.5px]"><Plus size={14} /> Add</button>
              </form>
              <div className="grid gap-3 md:grid-cols-2">
                {client.notes.length === 0 && <p className="text-[12.5px] italic text-cream-600">No notes yet.</p>}
                {client.notes.map((n) => (
                  <div key={n.id} className="rounded-xl border border-white/8 bg-white/2 p-4">
                    <p className="mb-1.5 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-widest text-cream-600">
                      <StickyNote size={11} className="text-gold-500" /> {n.author} · {relDate(n.date)}
                    </p>
                    <p className="text-[13px] leading-relaxed text-cream-200">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <MeetingMode open={callOpen} client={client} onEnd={endCall} onClose={() => setCallOpen(false)} />
    </motion.div>
  );
}

/* ============================ meeting mode ============================ */

function MeetingMode({ open, client, onEnd, onClose }: { open: boolean; client: Client; onEnd: (secs: number, notes: string) => void; onClose: () => void }) {
  const { state } = useStore();
  const [secs, setSecs] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setSecs(0);
    setNotes("");
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!open) return null;

  const waiting = state.projects.filter((p) => p.clientId === client.id && p.ball === "client" && p.status !== "done");
  const mine = state.tasks.filter((t) => t.clientId === client.id && !t.done);
  const points: string[] = [
    client.aiNext,
    ...waiting.map((p) => `They owe you: ${p.waitingNote ?? p.name}`),
    ...mine.filter((t) => t.priority === "high").map((t) => `Your side: ${t.title}`),
    `Revenue at stake: ${moneyFull(client.revenue)}/yr — relationship is ${client.health >= 80 ? "strong" : client.health >= 65 ? "fair" : "delicate"}`,
  ].slice(0, 5);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="gold-edge relative w-full max-w-3xl overflow-hidden rounded-3xl bg-ink-850 p-7 shadow-luxe"
      >
        {/* header */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-400" />
          </span>
          <div className="flex-1">
            <p className="font-display text-[20px] text-cream-50">Call with {client.name}</p>
            <p className="flex items-center gap-1.5 text-[11.5px] text-cream-500">
              <Mic size={11} className="text-gold-400" /> Meeting Scribe is listening — notes file themselves when you hang up
            </p>
          </div>
          <p className="font-display text-[34px] tabular-nums tracking-wide text-gold-300">{mm}:{ss}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-[240px_1fr]">
          {/* left: context */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-3.5">
              <Avatar src={client.avatar} name={client.name} size={44} ring />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-cream-100">{client.company}</p>
                <p className="text-[10.5px] text-cream-600">since {client.since} · {moneyFull(client.revenue)}/yr</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-3.5 text-center">
              <Ring value={client.health} size={62} />
              <p className="mt-1 text-[9.5px] uppercase tracking-widest text-cream-600">relationship health</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-white/8 bg-white/3 p-2.5">
                <p className="font-display text-lg text-cream-50">{mine.length}</p>
                <p className="text-[9px] uppercase tracking-widest text-cream-600">open items</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/3 p-2.5">
                <p className="font-display text-lg text-gold-300">{waiting.length}</p>
                <p className="text-[9px] uppercase tracking-widest text-cream-600">owed by them</p>
              </div>
            </div>
          </div>

          {/* right: points + notes */}
          <div className="space-y-3.5">
            <div className="rounded-2xl border border-gold-500/20 bg-gold-500/6 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gold-400">
                <Sparkles size={11} /> Talking points — prepared for this moment
              </p>
              <ul className="space-y-1.5">
                {points.map((p, i) => (
                  <li key={i} className="flex gap-2 text-[12.5px] leading-snug text-cream-200">
                    <span className="mt-1.5 h-1 w-4 shrink-0 rounded-full bg-gold-500/60" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <textarea
              autoFocus
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={"Jot as you talk…\nA line starting with  task:  becomes a real task\n\ne.g.  task: send CRT timelines to trustee"}
              className="input-luxe h-36 w-full resize-none p-4 text-[13px] leading-relaxed"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-[10.5px] text-cream-600">Last touch filed: {client.comms[0] ? relDate(client.comms[0].date) : "—"}</p>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="btn-ghost px-4 py-2.5 text-[12.5px] font-semibold">Silent close</button>
            <button onClick={() => onEnd(secs, notes)} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-[13px]">
              <Mic size={14} /> End call — file & extract tasks
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
