import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, ChevronRight, Plus, Sparkles, Target, TrendingUp, Trophy } from "lucide-react";
import { uid, useNav, useStore } from "../lib/store";
import { fmtDate, money, moneyFull, type Opp, type OppStage } from "../lib/data";
import { Avatar, Badge, Field, Modal, useToast, type Tone } from "../components/ui";

const COLS: { key: OppStage; label: string; tone: Tone }[] = [
  { key: "discovery", label: "Discovery", tone: "sky" },
  { key: "proposal", label: "Proposal sent", tone: "cream" },
  { key: "negotiation", label: "Negotiation", tone: "gold" },
  { key: "won", label: "Won", tone: "sage" },
];

export default function Opportunities() {
  const { state, dispatch } = useStore();
  const { go } = useNav();
  const toast = useToast();
  const [over, setOver] = useState<OppStage | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [f, setF] = useState({ title: "", person: "", value: "5000", stage: "discovery" as OppStage });

  const open = state.opps.filter((o) => o.stage !== "won" && o.stage !== "lost");
  const openVal = open.reduce((a, o) => a + o.value, 0);
  const weighted = open.reduce((a, o) => a + (o.value * o.prob) / 100, 0);
  const wonVal = state.opps.filter((o) => o.stage === "won").reduce((a, o) => a + o.value, 0);

  const move = (o: Opp, dir: 1 | -1) => {
    const idx = COLS.findIndex((c) => c.key === o.stage);
    const next = COLS[idx + dir];
    if (!next) return;
    dispatch({ type: "MOVE_OPP", id: o.id, stage: next.key });
    toast(`${o.person.split(" ")[0]}'s deal → ${next.label}`, next.key === "won" ? <Trophy size={14} /> : <ChevronRight size={14} />);
  };

  const openCard = (o: Opp) => {
    if (o.kind === "lead" && o.refId) go({ name: "leads", leadId: o.refId });
    else if (o.kind === "client" && o.refId) go({ name: "clients", clientId: o.refId });
    else toast("No contact record linked yet", <Target size={14} />);
  };

  const addOpportunity = () => {
    if (!f.title.trim() || !f.person.trim()) return;
    const o: Opp = {
      id: uid(), title: f.title, person: f.person, kind: "lead", value: Number(f.value) || 5000,
      prob: f.stage === "discovery" ? 35 : f.stage === "proposal" ? 55 : 70,
      stage: f.stage, expected: new Date(Date.now() + 10 * 86400000).toISOString(),
      services: [], lastActivity: new Date().toISOString(),
    };
    dispatch({ type: "ADD_OPP", opp: o });
    setAddOpen(false);
    setF({ title: "", person: "", value: "5000", stage: "discovery" });
    toast("Opportunity added — Follow-up Radar is watching it", <Sparkles size={14} />);
  };

  return (
    <div>
      {/* stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Target, label: "Open pipeline", value: moneyFull(openVal), note: `${open.length} live opportunities`, tone: "text-gold-400 bg-gold-500/12" },
          { icon: TrendingUp, label: "Weighted forecast", value: moneyFull(Math.round(weighted)), note: "probability-adjusted", tone: "text-sky-400 bg-sky-400/12" },
          { icon: Trophy, label: "Won this quarter", value: moneyFull(wonVal), note: "Proposal Drafter wrote 2 of them", tone: "text-sage-400 bg-sage-500/12" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card flex items-center gap-4 p-5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.tone}`}><s.icon size={18} /></span>
            <div>
              <p className="font-display text-[22px] leading-tight text-cream-50">{s.value}</p>
              <p className="text-[11.5px] text-cream-500">{s.label} · {s.note}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[12px] text-cream-500">Drag cards between stages, or use the hover arrows. Click a card to open the person.</p>
        <button onClick={() => setAddOpen(true)} className="btn-gold flex items-center gap-2 px-4 py-2.5 text-[12.5px]">
          <Plus size={15} /> New opportunity
        </button>
      </div>

      {/* board */}
      <div className="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-4">
        {COLS.map((col) => {
          const cards = state.opps.filter((o) => o.stage === col.key);
          const total = cards.reduce((a, o) => a + o.value, 0);
          return (
            <div
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); setOver(col.key); }}
              onDragLeave={() => setOver((v) => (v === col.key ? null : v))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("opp-id");
                const o = state.opps.find((x) => x.id === id);
                if (o && o.stage !== col.key) {
                  dispatch({ type: "MOVE_OPP", id, stage: col.key });
                  toast(`${o.person.split(" ")[0]}'s deal → ${col.label}`, col.key === "won" ? <Trophy size={14} /> : undefined);
                }
                setOver(null);
              }}
              className={`min-h-[420px] rounded-2xl border p-3 transition-colors ${over === col.key ? "border-gold-500/45 bg-gold-500/6" : "border-white/6 bg-white/2"}`}
            >
              <div className="mb-3 flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2">
                  <Badge tone={col.tone} dot>{col.label}</Badge>
                  <span className="text-[11px] font-semibold text-cream-600">{cards.length}</span>
                </div>
                <span className="text-[11.5px] font-semibold text-gold-400/90">{money(total)}</span>
              </div>
              <div className="space-y-3">
                {cards.map((o, i) => (
                  <motion.div
                    key={o.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("opp-id", o.id)}
                      onClick={() => openCard(o)}
                      className="group cursor-grab rounded-2xl border border-white/8 bg-ink-800/90 p-4 transition hover:border-gold-500/35 active:cursor-grabbing"
                    >
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <Avatar src={o.avatar} name={o.person} size={30} />
                      <p className="truncate text-[12px] font-semibold text-cream-300">{o.person}</p>
                      <span className="ml-auto flex gap-1 opacity-0 transition group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => move(o, -1)} className="rounded-md p-1 text-cream-500 hover:bg-white/8 hover:text-gold-300"><ArrowLeft size={12} /></button>
                        <button onClick={() => move(o, 1)} className="rounded-md p-1 text-cream-500 hover:bg-white/8 hover:text-gold-300"><ArrowRight size={12} /></button>
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold leading-snug text-cream-100">{o.title}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <p className="font-display text-[16px] text-gold-300">{moneyFull(o.value)}</p>
                      <span className="flex items-center gap-1 text-[10.5px] text-cream-500"><Calendar size={10} /> {fmtDate(o.expected)}</span>
                    </div>
                    <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/8">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${o.prob}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300" />
                    </div>
                    <p className="mt-1.5 text-right text-[10px] font-medium text-cream-600">{o.prob}% likely</p>
                    </div>
                  </motion.div>
                ))}
                {cards.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 px-3 py-8 text-center text-[11.5px] text-cream-600">
                    Drop deals here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New opportunity">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Deal title"><input autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" placeholder="Multi-entity tax engagement" /></Field>
          </div>
          <Field label="Person"><input value={f.person} onChange={(e) => setF({ ...f, person: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" placeholder="Jordan Ellis" /></Field>
          <Field label="Value ($)"><input type="number" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" /></Field>
          <Field label="Stage">
            <select value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value as OppStage })} className="input-luxe h-11 w-full px-4 text-sm">
              {COLS.map((c) => <option key={c.key} value={c.key} className="bg-ink-800">{c.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[11px] text-cream-600"><Sparkles size={12} className="text-gold-500" /> Probability auto-set from stage</p>
          <button onClick={addOpportunity} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-[13px]"><Plus size={15} /> Add to board</button>
        </div>
      </Modal>
    </div>
  );
}
