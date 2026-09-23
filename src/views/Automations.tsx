import { motion } from "framer-motion";
import {
  AlarmClock, ArrowRight, Bot, FileSearch, Inbox, Mic, PenLine, Play, Radar, Receipt, Send, Sparkles, Zap,
} from "lucide-react";
import { useStore } from "../lib/store";
import { Badge, CountUp, Toggle, useToast } from "../components/ui";

const ICONS: Record<string, React.ElementType> = {
  Inbox, FileSearch, AlarmClock, Mic, Receipt, Radar, PenLine, Send,
};

export default function Automations() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const total = state.automations.reduce((a, x) => a + x.runs, 0);
  const enabled = state.automations.filter((a) => a.enabled).length;

  return (
    <div>
      {/* hero */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="gold-edge mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 p-7 sm:p-8">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex-1" style={{ minWidth: 260 }}>
            <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400">
              <Bot size={13} /> The invisible staff
            </p>
            <h2 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-cream-50">
              {enabled} automations are working right now. <span className="gold-text italic">You hired none of them.</span>
            </h2>
            <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-cream-400">
              Every nudge, filing reminder, meeting summary and invoice draft happens without a click. This page is the only admin panel you'll ever need.
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="font-display text-[36px] leading-none text-gold-300"><CountUp to={31.5} decimals={1} /></p>
              <p className="mt-1.5 text-[10.5px] uppercase tracking-widest text-cream-600">hours saved / month</p>
            </div>
            <div>
              <p className="font-display text-[36px] leading-none text-cream-50"><CountUp to={total} /></p>
              <p className="mt-1.5 text-[10.5px] uppercase tracking-widest text-cream-600">runs this month</p>
            </div>
            <div>
              <p className="font-display text-[36px] leading-none text-sage-300"><CountUp to={0} /></p>
              <p className="mt-1.5 text-[10.5px] uppercase tracking-widest text-cream-600">hours babysitting it</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {state.automations.map((a, i) => {
          const Icon = ICONS[a.icon] ?? Zap;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card card-hover relative overflow-hidden p-6 transition ${!a.enabled ? "opacity-60" : ""}`}
            >
              {a.enabled && <span className="absolute right-0 top-0 h-24 w-24 rounded-full bg-gold-500/8 blur-2xl" />}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${a.enabled ? "bg-gold-500/14 text-gold-300" : "bg-white/6 text-cream-500"}`}>
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="font-display text-[16.5px] text-cream-50">{a.name}</p>
                    <Badge tone={a.enabled ? "sage" : "mute"} dot={a.enabled}>{a.enabled ? "Live" : "Paused"}</Badge>
                  </div>
                </div>
                <Toggle
                  on={a.enabled}
                  onChange={() => {
                    dispatch({ type: "TOGGLE_AUTO", id: a.id });
                    toast(a.enabled ? `${a.name} paused` : `${a.name} is live again`, <Zap size={14} />);
                  }}
                />
              </div>
              <p className="mb-4 text-[13px] leading-relaxed text-cream-300">{a.desc}</p>
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/6 bg-white/2 px-3.5 py-2.5 text-[11px] text-cream-400">
                <span className="font-semibold text-cream-200">{a.trigger}</span>
                <ArrowRight size={11} className="text-gold-500" />
                <span className="font-semibold text-gold-300">{a.action}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/6 pt-4">
                <div className="flex gap-4 text-[11px] text-cream-500">
                  <span><span className="font-display text-[14px] text-cream-100">{a.runs}</span> runs</span>
                  <span>last: <span className="text-cream-200">{a.lastRun}</span></span>
                  <span className="text-sage-300">{a.saves}</span>
                </div>
                <button
                  onClick={() => { dispatch({ type: "RUN_AUTO", id: a.id }); toast(`${a.name} ran — output filed where it belongs`, <Play size={13} />); }}
                  disabled={!a.enabled}
                  className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 text-[11.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Play size={12} /> Run now
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-7 flex items-center justify-center gap-2 text-center text-[12px] text-cream-600">
        <Sparkles size={13} className="text-gold-500" />
        Built on everyday no-code tools — your email, calendar, portal and AI models talking to each other. No enterprise software, no IT department.
      </motion.p>
    </div>
  );
}
