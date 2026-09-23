import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight, BadgeCheck, Calendar, Check, FolderKanban, Hourglass, Plus, Scale, Sparkles, User, Users, X,
} from "lucide-react";
import { byClient, uid, useNav, useStore } from "../lib/store";
import { daysFrom, fmtDate, moneyFull, relDate, type Project } from "../lib/data";
import { Avatar, Badge, Drawer, Field, Modal, Progress, SectionHead, useToast, type Tone } from "../components/ui";

const STATUS: Record<Project["status"], { label: string; tone: Tone }> = {
  "on-track": { label: "On track", tone: "sage" },
  waiting: { label: "Waiting on client", tone: "cream" },
  "at-risk": { label: "At risk", tone: "clay" },
  done: { label: "Delivered", tone: "gold" },
};

export default function Projects() {
  const { state, dispatch } = useStore();
  const { go } = useNav();
  const toast = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [f, setF] = useState({ name: "", clientId: state.clients[0]?.id ?? "", type: "Tax returns", fee: "3000", due: "14" });

  const active = state.projects.filter((p) => p.status !== "done");
  const done = state.projects.filter((p) => p.status === "done");
  const inFlight = active.reduce((a, p) => a + p.fee, 0);
  const atRisk = active.filter((p) => p.status === "at-risk").length;
  const onClient = active.filter((p) => p.ball === "client").length;
  const sel = state.projects.find((p) => p.id === selected);
  const selClient = sel ? byClient(state, sel.clientId) : undefined;

  const toggleBall = (p: Project, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = p.ball === "me" ? "client" : "me";
    dispatch({ type: "SET_BALL", projectId: p.id, ball: next });
    toast(next === "client" ? "Ball passed to client — Chaser will nudge" : "Ball is yours — added to your court", <ArrowLeftRight size={14} />);
  };

  const addProject = () => {
    if (!f.name.trim() || !f.clientId) return;
    const due = daysFrom(Number(f.due) || 14);
    const p: Project = {
      id: uid(), name: f.name, clientId: f.clientId, type: f.type, fee: Number(f.fee) || 3000,
      status: "on-track", progress: 0, due, ball: "me",
      milestones: [
        { id: uid(), title: "Kickoff & document request sent", done: false, due: daysFrom(2) },
        { id: uid(), title: "Work in progress", done: false, due: daysFrom(Math.max(3, (Number(f.due) || 14) - 4)) },
        { id: uid(), title: "Delivered & invoiced", done: false, due },
      ],
    };
    dispatch({ type: "ADD_PROJECT", project: p });
    setAddOpen(false);
    setF({ name: "", clientId: state.clients[0]?.id ?? "", type: "Tax returns", fee: "3000", due: "14" });
    toast("Project created — doc request auto-sent to the client", <Sparkles size={14} />);
  };

  return (
    <div>
      {/* stats */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone="gold" dot>{moneyFull(inFlight)} fees in flight</Badge>
        <Badge tone="sage">{active.length} active engagements</Badge>
        <Badge tone="cream"><Hourglass size={10} /> {onClient} waiting on clients</Badge>
        <Badge tone="clay">{atRisk} at risk</Badge>
        <span className="ml-auto">
          <button onClick={() => setAddOpen(true)} className="btn-gold flex items-center gap-2 px-4 py-2.5 text-[12.5px]">
            <Plus size={15} /> New project
          </button>
        </span>
      </div>

      {/* list */}
      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[2.3fr_1.3fr_0.9fr_1.4fr_0.8fr_1.1fr_0.8fr] items-center gap-4 border-b border-white/6 px-6 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cream-600 lg:grid">
          <span>Engagement</span><span>Client</span><span>Status</span><span>Progress</span><span>Due</span><span>Ball in court</span><span className="text-right">Fee</span>
        </div>
        {[...active, ...done].map((p, i) => {
          const c = byClient(state, p.clientId);
          if (!c) return null;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(p.id)}
              className={`grid cursor-pointer grid-cols-1 items-center gap-4 border-b border-white/4 px-6 py-4 transition last:border-0 hover:bg-white/3 lg:grid-cols-[2.3fr_1.3fr_0.9fr_1.4fr_0.8fr_1.1fr_0.8fr] ${p.status === "done" ? "opacity-55" : ""}`}
            >
              <div>
                <p className="text-[13.5px] font-semibold text-cream-100">{p.name}</p>
                <p className="mt-0.5 text-[11px] text-cream-600">{p.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <Avatar src={c.avatar} name={c.name} size={26} />
                <span className="truncate text-[12.5px] text-cream-300">{c.company}</span>
              </div>
              <div><Badge tone={STATUS[p.status].tone} dot={p.status === "at-risk"}>{STATUS[p.status].label}</Badge></div>
              <div className="flex items-center gap-2.5">
                <Progress value={p.progress} tone={p.status === "at-risk" ? "clay" : p.status === "done" ? "sage" : "gold"} />
                <span className="w-8 text-[11.5px] font-semibold tabular-nums text-cream-300">{p.progress}%</span>
              </div>
              <p className={`text-[12px] font-medium ${relDate(p.due).includes("overdue") ? "text-clay-300" : "text-cream-400"}`}>{relDate(p.due)}</p>
              <div onClick={(e) => e.stopPropagation()}>
                <div className="flex w-fit items-center rounded-full border border-white/10 bg-ink-800 p-0.5 text-[10.5px] font-semibold">
                  <button
                    onClick={(e) => toggleBall(p, e)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition ${p.ball === "me" ? "bg-gold-500/20 text-gold-300" : "text-cream-600 hover:text-cream-300"}`}
                  >
                    <User size={10} /> You
                  </button>
                  <button
                    onClick={(e) => toggleBall(p, e)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition ${p.ball === "client" ? "bg-cream-100/15 text-cream-100" : "text-cream-600 hover:text-cream-300"}`}
                  >
                    <Users size={10} /> Client
                  </button>
                </div>
              </div>
              <p className="text-right font-display text-[14.5px] text-gold-300">{moneyFull(p.fee)}</p>
            </motion.div>
          );
        })}
      </div>

      {/* drawer */}
      <Drawer open={!!sel} onClose={() => setSelected(null)}>
        {sel && selClient && (
          <div className="p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <Badge tone={STATUS[sel.status].tone} dot={sel.status === "at-risk"}>{STATUS[sel.status].label}</Badge>
                <h3 className="mt-3 font-display text-[22px] leading-tight text-cream-50">{sel.name}</h3>
                <button
                  onClick={() => { setSelected(null); go({ name: "clients", clientId: selClient.id }); }}
                  className="mt-2 flex items-center gap-2 text-[12.5px] text-cream-400 transition hover:text-gold-300"
                >
                  <Avatar src={selClient.avatar} name={selClient.name} size={22} /> {selClient.name} · {selClient.company}
                </button>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full p-2 text-cream-500 hover:bg-white/8 hover:text-cream-100"><X size={17} /></button>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-3.5 text-center">
                <p className="font-display text-xl text-gold-300">{moneyFull(sel.fee)}</p>
                <p className="text-[10px] uppercase tracking-widest text-cream-600">Fee</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 p-3.5 text-center">
                <p className="font-display text-xl text-cream-50">{sel.progress}%</p>
                <p className="text-[10px] uppercase tracking-widest text-cream-600">Progress</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 p-3.5 text-center">
                <p className="font-display text-xl text-cream-50">{relDate(sel.due)}</p>
                <p className="text-[10px] uppercase tracking-widest text-cream-600">Due</p>
              </div>
            </div>

            {sel.waitingNote && sel.ball === "client" && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-clay-500/25 bg-clay-500/8 p-4">
                <Hourglass size={15} className="mt-0.5 shrink-0 text-clay-300" />
                <div>
                  <p className="text-[12.5px] font-semibold text-clay-300">Waiting on client</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-cream-200">{sel.waitingNote}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-cream-500"><Sparkles size={10} className="text-gold-500" /> Document Chaser nudges every 3 days automatically</p>
                </div>
              </div>
            )}

            <SectionHead title="Milestones" sub="Check them off — progress recalculates itself" />
            <div className="space-y-2">
              {sel.milestones.map((m) => (
                <button
                  key={m.id}
                  onClick={() => dispatch({ type: "TOGGLE_MILESTONE", projectId: sel.id, mId: m.id })}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${m.done ? "border-sage-500/25 bg-sage-500/6" : "border-white/8 bg-white/2 hover:border-gold-500/25"}`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${m.done ? "border-sage-400 bg-sage-500/25 text-sage-300" : "border-gold-500/50 text-transparent"}`}>
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className={`flex-1 text-[13px] ${m.done ? "text-cream-500 line-through" : "text-cream-100"}`}>{m.title}</span>
                  <span className="text-[11px] text-cream-600">{fmtDate(m.due)}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button onClick={() => toggleBall(sel)} className="btn-ghost flex items-center justify-center gap-2 px-4 py-3 text-[12.5px] font-semibold">
                <Scale size={14} className="text-gold-400" /> Pass ball to {sel.ball === "me" ? "client" : "you"}
              </button>
              {sel.status !== "done" ? (
                <button
                  onClick={() => { dispatch({ type: "SET_PROJ_STATUS", projectId: sel.id, status: "done" }); toast("Delivered — Invoice Autopilot drafted the invoice", <BadgeCheck size={14} />); setSelected(null); }}
                  className="btn-gold flex items-center justify-center gap-2 px-4 py-3 text-[12.5px]"
                >
                  <BadgeCheck size={15} /> Mark delivered
                </button>
              ) : (
                <button
                  onClick={() => { dispatch({ type: "SET_PROJ_STATUS", projectId: sel.id, status: "on-track" }); toast("Project reopened"); }}
                  className="btn-ghost flex items-center justify-center gap-2 px-4 py-3 text-[12.5px] font-semibold"
                >
                  Reopen project
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Start a new engagement">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Project name"><input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" placeholder="2025 1120-S preparation" /></Field>
          </div>
          <Field label="Client">
            <select value={f.clientId} onChange={(e) => setF({ ...f, clientId: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm">
              {state.clients.map((c) => <option key={c.id} value={c.id} className="bg-ink-800">{c.name} — {c.company}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm">
              {["Tax returns", "Bookkeeping", "Advisory", "Tax planning", "Cleanup", "Payroll"].map((t) => <option key={t} className="bg-ink-800">{t}</option>)}
            </select>
          </Field>
          <Field label="Fee ($)"><input type="number" value={f.fee} onChange={(e) => setF({ ...f, fee: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" /></Field>
          <Field label="Due in (days)"><input type="number" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" /></Field>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[11px] text-cream-600"><Calendar size={12} className="text-gold-500" /> Deadline Sentinel starts watching instantly</p>
          <button onClick={addProject} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-[13px]"><FolderKanban size={15} /> Create</button>
        </div>
      </Modal>
    </div>
  );
}
