import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, BookOpen, Bot, Brain, Cable, Calendar, CheckCircle2, CircleDashed, FolderLock, Landmark, Loader2, Mail, PenLine, Sparkles, Workflow, Zap,
} from "lucide-react";
import { useStore } from "../lib/store";
import { Badge, useToast } from "../components/ui";

const ICONS: Record<string, React.ElementType> = {
  Workflow, Mail, Calendar, Bot, BookOpen, Landmark, PenLine, FolderLock, Brain,
};
const CATEGORIES = ["Workflow engine", "Inbox & calendar", "Intelligence", "Money", "Documents"];

export default function Integrations() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [testing, setTesting] = useState<string | null>(null);

  const connected = state.integrations.filter((i) => i.connected);
  const flows = connected.reduce((a, i) => a + i.flows, 0);

  const groups = useMemo(
    () => CATEGORIES.map((c) => ({ name: c, items: state.integrations.filter((i) => i.category === c) })).filter((g) => g.items.length),
    [state.integrations]
  );

  const connect = (id: string, name: string) => {
    const isOn = state.integrations.find((i) => i.id === id)?.connected;
    if (isOn) {
      dispatch({ type: "TOGGLE_INTEGRATION", id });
      toast(`${name} disconnected — flows paused gracefully`, <Cable size={14} />);
      return;
    }
    setTesting(id);
    toast(`Testing handshake with ${name}…`, <Loader2 size={14} className="animate-spin" />);
    setTimeout(() => {
      dispatch({ type: "TOGGLE_INTEGRATION", id });
      setTesting(null);
      toast(`${name} connected — history ingested and matched to clients`, <CheckCircle2 size={14} />);
    }, 1600);
  };

  return (
    <div>
      {/* hero */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="gold-edge mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 p-7 sm:p-8">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex-1" style={{ minWidth: 280 }}>
            <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400">
              <Cable size={13} /> The central hub
            </p>
            <h2 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-cream-50">
              {connected.length} systems feed one record. <span className="gold-text italic">You update none of them.</span>
            </h2>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-cream-400">
              n8n flows listen to your email, calendar, portal and QuickBooks, then an AI layer matches everything to the right client and project. What's left for you is decisions — not data entry.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-cream-300">
              <span className="chip">Source events</span><ArrowRight size={12} className="text-gold-500" />
              <span className="chip">n8n flows · 24 live</span><ArrowRight size={12} className="text-gold-500" />
              <span className="chip">AI matcher · 90%+ confidence</span><ArrowRight size={12} className="text-gold-500" />
              <span className="chip border-gold-500/40 bg-gold-500/12 text-gold-300">Ordo records</span>
            </div>
          </div>
          <div className="flex gap-10">
            <div>
              <p className="font-display text-[36px] leading-none text-gold-300">{flows.toLocaleString()}</p>
              <p className="mt-1.5 text-[10.5px] uppercase tracking-widest text-cream-600">events flowed this week</p>
            </div>
            <div>
              <p className="font-display text-[36px] leading-none text-cream-50">0</p>
              <p className="mt-1.5 text-[10.5px] uppercase tracking-widest text-cream-600">manual updates needed</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* categories */}
      {groups.map((g, gi) => (
        <div key={g.name} className="mb-7">
          <h3 className="mb-3 flex items-center gap-2 font-display text-[15px] text-cream-100">
            <span className="h-px w-5 bg-gold-500/50" /> {g.name}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {g.items.map((item, i) => {
              const Icon = ICONS[item.icon] ?? Zap;
              const isAssistant = item.id === "g4";
              const busy = testing === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.06 + i * 0.05 }}
                  className={`relative overflow-hidden rounded-2xl border p-5 transition ${
                    isAssistant && !item.connected
                      ? "gold-edge border-gold-500/30 bg-gradient-to-br from-gold-500/8 to-transparent"
                      : item.connected ? "card card-hover" : "card opacity-75"
                  }`}
                >
                  <div className="mb-3.5 flex items-start justify-between">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.connected ? "bg-gold-500/14 text-gold-300" : "bg-white/6 text-cream-500"}`}>
                      {busy ? <Loader2 size={17} className="animate-spin text-gold-400" /> : <Icon size={17} />}
                    </span>
                    <Badge tone={item.connected ? "sage" : isAssistant ? "gold" : "mute"} dot={item.connected}>
                      {busy ? "Handshaking…" : item.connected ? "Connected" : isAssistant ? "Ready for you" : "Not connected"}
                    </Badge>
                  </div>
                  <p className="font-display text-[15.5px] text-cream-50">{item.name}</p>
                  <p className="mt-1.5 min-h-[54px] text-[12.5px] leading-relaxed text-cream-400">{item.desc}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-3.5 text-[11px] text-cream-500">
                    <span>{item.connected ? <>sync <span className="text-sage-300">{item.lastSync}</span> · <span className="text-cream-200">{item.flows}</span> events/wk</> : <span className="italic">{item.note}</span>}</span>
                    <button
                      onClick={() => connect(item.id, item.name)}
                      disabled={busy}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
                        item.connected ? "border border-white/12 text-cream-400 hover:border-clay-400/40 hover:text-clay-300" : "btn-gold"
                      }`}
                    >
                      {busy ? <Loader2 size={11} className="animate-spin" /> : <CircleDashed size={11} />}
                      {busy ? "Testing" : item.connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex items-center justify-center gap-2 text-center text-[12px] text-cream-600">
        <Sparkles size={13} className="text-gold-500" />
        Anything that emits an event — your AI email assistant included — can plug in through the n8n webhook layer.
      </motion.p>
    </div>
  );
}
