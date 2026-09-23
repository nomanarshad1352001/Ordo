import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Calendar, Flame, Mail, Phone, Plus, Send, Sparkles, StickyNote, TrendingUp, UserPlus, X,
} from "lucide-react";
import { uid, useNav, useStore } from "../lib/store";
import { daysFrom, fmtDate, isOverdue, moneyFull, relDate, type Lead, type LeadStage } from "../lib/data";
import { Avatar, Badge, Drawer, Field, Modal, SectionHead, useToast, type Tone } from "../components/ui";

const STAGES: { key: LeadStage; label: string; tone: Tone }[] = [
  { key: "new", label: "New", tone: "sky" },
  { key: "contacted", label: "Contacted", tone: "cream" },
  { key: "qualified", label: "Qualified", tone: "sage" },
  { key: "proposal", label: "Proposal", tone: "gold" },
  { key: "negotiation", label: "Negotiation", tone: "gold" },
  { key: "won", label: "Won", tone: "sage" },
  { key: "lost", label: "Lost", tone: "mute" },
];
const ACTIVE_STAGES: LeadStage[] = ["new", "contacted", "qualified", "proposal", "negotiation"];

export default function Leads() {
  const { state, dispatch } = useStore();
  const { route } = useNav();
  const toast = useToast();
  const [filter, setFilter] = useState<LeadStage | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  // form state
  const [f, setF] = useState({ name: "", company: "", email: "", service: "", value: "3600", source: "Website" });

  useEffect(() => { if (route.leadId) setSelected(route.leadId); }, [route.leadId]);

  const leads = useMemo(
    () => state.leads.filter((l) => (filter === "all" ? l.stage !== "won" && l.stage !== "lost" : l.stage === filter)),
    [state.leads, filter]
  );

  const sel = state.leads.find((l) => l.id === selected);
  const totalValue = state.leads.filter((l) => l.stage !== "won" && l.stage !== "lost").reduce((a, l) => a + l.value, 0);
  const hot = state.leads.filter((l) => l.score >= 80 && l.stage !== "won" && l.stage !== "lost").length;

  const stageOf = (k: LeadStage) => STAGES.find((s) => s.key === k)!;

  const addLead = () => {
    if (!f.name.trim()) return;
    const lead: Lead = {
      id: uid(), name: f.name, company: f.company || "—", email: f.email || "—", phone: "",
      source: f.source, service: f.service || "General tax", value: Number(f.value) || 2000,
      stage: "new", score: 65, lastContact: daysFrom(0), nextFollow: daysFrom(1),
      aiInsight: "Fresh intake — Smart Intake has queued a warm welcome and a discovery-call link. Score pending more signal.",
      notes: [],
    };
    dispatch({ type: "ADD_LEAD", lead });
    setAddOpen(false);
    setF({ name: "", company: "", email: "", service: "", value: "3600", source: "Website" });
    toast("Lead added — Smart Intake drafted the welcome email", <Sparkles size={15} />);
  };

  const convert = (lead: Lead) => {
    const client = {
      id: uid(), name: lead.name, company: lead.company, email: lead.email, phone: lead.phone,
      avatar: lead.avatar, status: "active" as const, health: 90, since: `${new Date().getFullYear()}`,
      revenue: lead.value, ball: "me" as const, tags: ["New client", lead.source], services: [lead.service],
      entities: [], comms: [], notes: [...lead.notes],
      aiSummary: `Freshly converted from the ${lead.source.toLowerCase()} pipeline for ${lead.service.toLowerCase()}. Onboarding checklist auto-created; engagement letter drafted for signature.`,
      aiNext: "Send the portal invite and engagement letter — fastest path to a raving first impression.",
    };
    dispatch({ type: "CONVERT_LEAD", id: lead.id, client });
    toast(`${lead.name} is now a client — onboarding automation started`, <Sparkles size={15} />);
    setSelected(null);
  };

  return (
    <div>
      {/* stats */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone="gold" dot>{moneyFull(totalValue)} in play</Badge>
        <Badge tone="sage">{state.leads.filter((l) => ACTIVE_STAGES.includes(l.stage)).length} active leads</Badge>
        <Badge tone="clay"><Flame size={10} /> {hot} hot right now</Badge>
        <span className="ml-auto">
          <button onClick={() => setAddOpen(true)} className="btn-gold flex items-center gap-2 px-4 py-2.5 text-[12.5px]">
            <Plus size={15} /> New lead
          </button>
        </span>
      </div>

      {/* filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {[{ key: "all" as const, label: "All active" }, ...STAGES.filter((s) => s.key !== "won" && s.key !== "lost")].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`chip cursor-pointer transition ${filter === s.key ? "border-gold-500/50 bg-gold-500/15 text-gold-300" : "hover:border-white/20 hover:text-cream-100"}`}
          >
            {s.label}
            <span className="opacity-60">{s.key === "all" ? state.leads.filter((l) => ACTIVE_STAGES.includes(l.stage)).length : state.leads.filter((l) => l.stage === s.key).length}</span>
          </button>
        ))}
      </div>

      {/* list */}
      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[2.2fr_1.6fr_1fr_0.9fr_1fr_1fr] gap-4 border-b border-white/6 px-6 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cream-600 md:grid">
          <span>Lead</span><span>Service wanted</span><span>Stage</span><span>AI score</span><span>Next follow-up</span><span className="text-right">Value</span>
        </div>
        {leads.length === 0 && (
          <div className="px-6 py-14 text-center">
            <UserPlus className="mx-auto mb-3 text-gold-400" size={22} />
            <p className="font-display text-base text-cream-100">No leads at this stage</p>
            <p className="mt-1 text-xs text-cream-500">Smart Intake will place new inquiries here automatically.</p>
          </div>
        )}
        {leads.map((l, i) => (
          <motion.button
            layout
            key={l.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelected(l.id)}
            className="grid w-full grid-cols-2 items-center gap-4 border-b border-white/4 px-6 py-4 text-left transition last:border-0 hover:bg-white/3 md:grid-cols-[2.2fr_1.6fr_1fr_0.9fr_1fr_1fr]"
          >
            <div className="flex items-center gap-3">
              <Avatar src={l.avatar} name={l.name} size={40} />
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-cream-100">{l.name}</p>
                <p className="truncate text-[11.5px] text-cream-500">{l.company}</p>
              </div>
            </div>
            <p className="hidden truncate text-[12.5px] text-cream-300 md:block">{l.service}</p>
            <div><Badge tone={stageOf(l.stage).tone}>{stageOf(l.stage).label}</Badge></div>
            <div className="hidden items-center gap-2 md:flex">
              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/8">
                <div className={`h-full rounded-full ${l.score >= 80 ? "bg-gradient-to-r from-gold-500 to-gold-300" : l.score >= 60 ? "bg-gold-600" : "bg-cream-600"}`} style={{ width: `${l.score}%` }} />
              </div>
              <span className="text-[12px] font-semibold tabular-nums text-cream-200">{l.score}</span>
            </div>
            <p className={`hidden text-[12px] font-medium md:block ${isOverdue(l.nextFollow) ? "text-clay-300" : "text-cream-400"}`}>
              {fmtDate(l.nextFollow)} · {relDate(l.nextFollow)}
            </p>
            <p className="text-right font-display text-[15px] text-gold-300">{moneyFull(l.value)}</p>
          </motion.button>
        ))}
      </div>

      {/* ------------------------------ drawer ------------------------------ */}
      <Drawer open={!!sel} onClose={() => setSelected(null)}>
        {sel && (
          <div className="p-7">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar src={sel.avatar} name={sel.name} size={64} ring />
                <div>
                  <h3 className="font-display text-[22px] text-cream-50">{sel.name}</h3>
                  <p className="text-[13px] text-cream-400">{sel.company}</p>
                  <p className="mt-1 text-[11px] text-cream-600">Source: {sel.source}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full p-2 text-cream-500 hover:bg-white/8 hover:text-cream-100"><X size={17} /></button>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-3.5 text-center">
                <p className="font-display text-xl text-gold-300">{sel.score}</p>
                <p className="text-[10px] uppercase tracking-widest text-cream-600">AI score</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 p-3.5 text-center">
                <p className="font-display text-xl text-cream-50">{moneyFull(sel.value)}</p>
                <p className="text-[10px] uppercase tracking-widest text-cream-600">Est. value</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 p-3.5 text-center">
                <p className={`font-display text-xl ${isOverdue(sel.nextFollow) ? "text-clay-300" : "text-cream-50"}`}>{relDate(sel.nextFollow)}</p>
                <p className="text-[10px] uppercase tracking-widest text-cream-600">Follow-up</p>
              </div>
            </div>

            {/* stage stepper */}
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cream-600">Stage — click to move</p>
            <div className="mb-6 flex flex-wrap gap-1.5">
              {ACTIVE_STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => { dispatch({ type: "SET_LEAD_STAGE", id: sel.id, stage: s }); toast(`${sel.name.split(" ")[0]} moved to ${stageOf(s).label}`); }}
                  className={`chip cursor-pointer transition ${sel.stage === s ? "border-gold-500/60 bg-gold-500/18 text-gold-300" : "hover:border-white/20 hover:text-cream-100"}`}
                >
                  {stageOf(s).label}
                </button>
              ))}
            </div>

            {/* AI insight */}
            <div className="gold-edge mb-6 rounded-2xl bg-gold-500/6 p-4">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-400">
                <Sparkles size={12} /> Ordo insight
              </p>
              <p className="text-[13px] leading-relaxed text-cream-200">{sel.aiInsight}</p>
            </div>

            {/* quick actions */}
            <div className="mb-6 grid grid-cols-2 gap-2.5">
              {[
                { icon: Phone, label: "Log a call", fn: () => toast("Call logged — Scribe attached the summary", <Phone size={14} />) },
                { icon: Mail, label: "Send AI email", fn: () => toast("Draft sent — written in your voice", <Send size={14} />) },
                { icon: Calendar, label: "Book discovery", fn: () => toast("Calendar link sent to " + sel.name.split(" ")[0], <Calendar size={14} />) },
                { icon: TrendingUp, label: "Convert to client", fn: () => convert(sel) },
              ].map((a) => (
                <button key={a.label} onClick={a.fn} className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[12.5px] font-semibold transition ${a.label === "Convert to client" ? "border-gold-500/40 bg-gold-500/12 text-gold-300 hover:bg-gold-500/20" : "border-white/10 bg-white/3 text-cream-200 hover:border-gold-500/30"}`}>
                  <a.icon size={15} /> {a.label}
                </button>
              ))}
            </div>

            {/* details */}
            <div className="mb-6 space-y-2 rounded-2xl border border-white/8 bg-white/2 p-4 text-[12.5px]">
              <p className="flex justify-between"><span className="text-cream-500">Service</span><span className="font-medium text-cream-100">{sel.service}</span></p>
              <p className="flex justify-between"><span className="text-cream-500">Email</span><span className="font-medium text-cream-100">{sel.email}</span></p>
              <p className="flex justify-between"><span className="text-cream-500">Phone</span><span className="font-medium text-cream-100">{sel.phone || "—"}</span></p>
              <p className="flex justify-between"><span className="text-cream-500">Last contact</span><span className="font-medium text-cream-100">{fmtDate(sel.lastContact)} · {relDate(sel.lastContact)}</span></p>
            </div>

            {/* notes */}
            <SectionHead title="Notes" sub="Written by you and your AI intake" />
            <div className="space-y-2.5">
              {sel.notes.length === 0 && <p className="text-[12.5px] italic text-cream-600">No notes yet — the AI intake will append its research here.</p>}
              {sel.notes.map((n) => (
                <div key={n.id} className="rounded-xl border border-white/8 bg-white/2 p-3.5">
                  <p className="mb-1 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-widest text-cream-600">
                    <StickyNote size={11} className="text-gold-500" /> {n.author} · {relDate(n.date)}
                  </p>
                  <p className="text-[12.5px] leading-relaxed text-cream-200">{n.text}</p>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); if (!noteText.trim()) return; dispatch({ type: "ADD_NOTE", target: "lead", id: sel.id, text: noteText.trim() }); setNoteText(""); toast("Note saved"); }}
              className="mt-3 flex gap-2"
            >
              <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note…" className="input-luxe h-10 flex-1 px-4 text-[12.5px]" />
              <button className="btn-gold flex h-10 items-center gap-1.5 px-4 text-[12px]">Add <ArrowRight size={13} /></button>
            </form>
          </div>
        )}
      </Drawer>

      {/* add lead modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a new lead">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name"><input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" placeholder="Jordan Ellis" /></Field>
          <Field label="Company"><input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" placeholder="Ellis Interiors LLC" /></Field>
          <Field label="Email"><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" placeholder="jordan@ellis.com" /></Field>
          <Field label="Estimated value ($)"><input value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} type="number" className="input-luxe h-11 w-full px-4 text-sm" /></Field>
          <Field label="Service wanted"><input value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" placeholder="S-corp + tax" /></Field>
          <Field label="Source">
            <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm">
              {["Website", "Referral", "Chamber mixer", "Instagram", "Cold inbound"].map((s) => <option key={s} className="bg-ink-800">{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-[11px] text-cream-600"><Sparkles size={12} className="text-gold-500" /> Smart Intake will score & draft the reply</p>
          <button onClick={addLead} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-[13px]">
            <Plus size={15} /> Add lead
          </button>
        </div>
      </Modal>
    </div>
  );
}
