import { useMemo } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Banknote, BellRing, CheckCircle2, CircleDollarSign, Clock, FileText, ReceiptText, Send, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useStore, openPipeline, type State } from "../lib/store";
import { moneyFull, relDate, REV_MONTHS, type Invoice } from "../lib/data";
import { Avatar, Badge, CountUp, SectionHead, useToast, type Tone } from "../components/ui";

const STATUS: Record<Invoice["status"], { label: string; tone: Tone }> = {
  paid: { label: "Paid", tone: "sage" },
  sent: { label: "Sent", tone: "sky" },
  draft: { label: "Draft", tone: "mute" },
  overdue: { label: "Overdue", tone: "clay" },
};

const outstanding = (s: State) => s.invoices.filter((v) => v.status === "sent" || v.status === "overdue").reduce((a, v) => a + v.amount, 0);

export default function Money() {
  const { state, dispatch } = useStore();
  const toast = useToast();

  const collected = state.invoices.filter((v) => v.status === "paid").reduce((a, v) => a + v.amount, 0);
  const open = outstanding(state);
  const drafts = state.invoices.filter((v) => v.status === "draft");
  const pipeline = openPipeline(state);
  const overdueTotal = state.invoices.filter((v) => v.status === "overdue").reduce((a, v) => a + v.amount, 0);
  const maxRev = Math.max(...REV_MONTHS.map((m) => m.v));

  const sorted = useMemo(
    () => [...state.invoices].sort((a, b) => {
      const rank: Record<Invoice["status"], number> = { overdue: 0, sent: 1, draft: 2, paid: 3 };
      return rank[a.status] - rank[b.status];
    }),
    [state.invoices]
  );

  const kpis = [
    { icon: BadgeCheck, label: "Collected in work", to: collected, note: "3 invoices settled", tone: "text-sage-400 bg-sage-500/12" },
    { icon: Clock, label: "Outstanding", to: open, note: `${moneyFull(overdueTotal)} overdue — Autopilot nudging`, tone: "text-clay-400 bg-clay-500/12" },
    { icon: FileText, label: "Drafts ready", to: drafts.reduce((a, v) => a + v.amount, 0), note: `${drafts.length} awaiting your send`, tone: "text-gold-400 bg-gold-500/12" },
    { icon: TrendingUp, label: "Pipeline forecast", to: pipeline, note: "probability-weighted deals", tone: "text-sky-400 bg-sky-400/12" },
  ] as const;

  return (
    <div>
      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon as React.ElementType;
          return (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card card-hover p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${k.tone}`}><Icon size={16} /></span>
              </div>
              <p className="font-display text-[24px] leading-none text-cream-50"><CountUp to={k.to} prefix="$" /></p>
              <p className="mt-2 text-[12px] font-medium text-cream-400">{k.label}</p>
              <p className="text-[10.5px] leading-snug text-cream-600">{k.note}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* chart */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 xl:col-span-2">
          <SectionHead title="Billed revenue" sub="Trailing 6 months — fixed fees & retainers" right={<Badge tone="sage"><TrendingUp size={10} /> +18% trend</Badge>} />
          <div className="flex h-48 items-end gap-3 pt-4">
            {REV_MONTHS.map((m, i) => (
              <div key={m.m} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-cream-500 opacity-0 transition group-hover:opacity-100">${(m.v / 1000).toFixed(1)}k</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.v / maxRev) * 100}%` }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`w-full rounded-t-lg transition group-hover:brightness-125 ${i === REV_MONTHS.length - 1 ? "bg-gradient-to-t from-gold-600 to-gold-300 shadow-gold" : "bg-gradient-to-t from-ink-600 to-ink-500"}`}
                  title={`${m.m}: ${moneyFull(m.v)}`}
                />
                <span className="text-[10.5px] font-semibold text-cream-500">{m.m}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-gold-500/20 bg-gold-500/6 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-400"><Sparkles size={11} /> Ordo's read</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-cream-200">
              Feast season is forming: closing Castellano and Delacroix adds <span className="font-semibold text-gold-300">$21k</span> before quarter end. Only drag — the overdue Okafor invoice. One approved nudge usually moves David within 48 hours.
            </p>
          </div>
        </motion.div>

        {/* invoices */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card overflow-hidden xl:col-span-3">
          <div className="flex items-center justify-between px-6 pt-5">
            <SectionHead title="Invoices" sub="Drafted by Invoice Autopilot the moment work lands" />
            <button
              onClick={() => toast("Autopilot is drafting next month's retainers", <Zap size={14} />)}
              className="btn-ghost mb-4 flex items-center gap-2 px-4 py-2 text-[12px] font-semibold"
            >
              <ReceiptText size={14} className="text-gold-400" /> Draft retainer batch
            </button>
          </div>
          <div className="divide-y divide-white/4">
            {sorted.map((v) => {
              const client = v.clientId ? state.clients.find((c) => c.id === v.clientId) : undefined;
              return (
                <div key={v.id} className="flex flex-wrap items-center gap-3.5 px-6 py-4 transition hover:bg-white/2">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${v.status === "overdue" ? "bg-clay-500/12 text-clay-300" : v.status === "paid" ? "bg-sage-500/12 text-sage-300" : "bg-white/6 text-cream-400"}`}>
                    {v.status === "paid" ? <CheckCircle2 size={15} /> : v.status === "overdue" ? <CircleDollarSign size={15} /> : <Banknote size={15} />}
                  </span>
                  <div className="flex min-w-0 items-center gap-3" style={{ flex: "1 1 220px" }}>
                    {client && <Avatar src={client.avatar} name={client.name} size={30} />}
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-cream-100">{v.ref} · {v.to}</p>
                      <p className="truncate text-[11px] text-cream-600">{v.note}</p>
                    </div>
                  </div>
                  <Badge tone={STATUS[v.status].tone} dot={v.status === "overdue"}>{STATUS[v.status].label}</Badge>
                  <p className="min-w-[72px] text-right font-display text-[15px] text-cream-50">{moneyFull(v.amount)}</p>
                  <div className="flex gap-2">
                    {v.status === "draft" && (
                      <button
                        onClick={() => { dispatch({ type: "SEND_INVOICE", id: v.id }); toast(`${v.ref} sent with pay link — filed to record`, <Send size={13} />); }}
                        className="btn-gold flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
                      >
                        <Send size={11} /> Send
                      </button>
                    )}
                    {(v.status === "sent" || v.status === "overdue") && (
                      <>
                        <button
                          onClick={() => toast(`Reminder queued for ${v.to.split(" ")[0]} — tone ${v.status === "overdue" ? "firm but warm" : "gentle"}`, <BellRing size={13} />)}
                          className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold"
                        >
                          <BellRing size={11} /> Nudge
                        </button>
                        <button
                          onClick={() => { dispatch({ type: "PAY_INVOICE", id: v.id }); toast(`${v.ref} marked paid — reconciled in QuickBooks`, <CheckCircle2 size={13} />); }}
                          className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-sage-300"
                        >
                          <CheckCircle2 size={11} /> Paid
                        </button>
                      </>
                    )}
                    {v.status === "paid" && <span className="px-3 py-1.5 text-[11px] text-cream-600">{relDate(v.due) === "Today" ? "settled" : `due ${relDate(v.due)}`}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="flex items-center gap-1.5 border-t border-white/6 px-6 py-3.5 text-[10.5px] text-cream-600">
            <Zap size={11} className="text-gold-500" /> Payments reconcile to QuickBooks the moment clients pay — you never touch a ledger.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
