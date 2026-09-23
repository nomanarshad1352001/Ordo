import { AnimatePresence, motion } from "framer-motion";
import {
  AlarmClock, ArrowRight, BellRing, Check, CheckCircle2, Clock, Flame, FolderKanban, Hourglass, Mail, MoonStar, Phone, RefreshCw, RotateCcw, Send, Sparkles, Sun, ThumbsUp, TrendingUp, Users, X, Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  activeClients, byClient, openPipeline, overdueTasks, todayTasks, useNav, useStore, waitingOnClients,
} from "../lib/store";
import { BRIEF_CLOSERS, fmtDate, isOverdue, isToday, money, moneyFull, relDate } from "../lib/data";
import { Avatar, Badge, CountUp, Progress, SectionHead, useToast } from "../components/ui";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function Today({ onAI }: { onAI: () => void }) {
  const { state, dispatch } = useStore();
  const { go } = useNav();
  const toast = useToast();
  const [briefSpin, setBriefSpin] = useState(false);
  const [feedTab, setFeedTab] = useState<"pulse" | "actions">("pulse");

  const overdue = overdueTasks(state);
  const today = todayTasks(state);
  const waiting = waitingOnClients(state);
  const myBall = state.projects.filter((p) => p.ball === "me" && p.status !== "done");
  const followUps = state.leads.filter((l) => l.stage !== "won" && l.stage !== "lost" && (isOverdue(l.nextFollow) || isToday(l.nextFollow)));
  const activeProjects = state.projects.filter((p) => p.status !== "done");
  const weekCount = state.tasks.filter((t) => !t.done && (new Date(t.due).getTime() - Date.now()) / 86400000 < 7).length;
  const pipeline = openPipeline(state);
  const clients = activeClients(state);
  const runs = state.automations.reduce((a, x) => a + x.runs, 0);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const radar = useMemo(() => {
    const items: { id: string; label: string; who?: string; due: string; kind: "task" | "project" }[] = [
      ...state.tasks.filter((t) => !t.done).map((t) => ({
        id: `r-${t.id}`, label: t.title, who: t.clientId ? byClient(state, t.clientId)?.name : undefined, due: t.due, kind: "task" as const,
      })),
      ...state.projects.filter((p) => p.status !== "done").map((p) => ({
        id: `r-${p.id}`, label: p.name, who: byClient(state, p.clientId)?.company, due: p.due, kind: "project" as const,
      })),
    ];
    return items
      .filter((i) => {
        const d = (new Date(i.due).getTime() - Date.now()) / 86400000;
        return d > -2 && d < 14;
      })
      .sort((a, b) => +new Date(a.due) - +new Date(b.due))
      .slice(0, 9);
  }, [state]);

  const activity = useMemo(
    () =>
      state.clients
        .flatMap((c) => c.comms.map((m) => ({ ...m, client: c })))
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .slice(0, 6),
    [state.clients]
  );

  const pendingMail = state.inbox.filter((i) => (i.status ?? "pending") === "pending").length;
  const brief = `You have ${overdue.length + today.length} items needing attention — ${overdue.length} overdue. You're waiting on ${waiting.length} clients, and Document Chaser is nudging ${waiting.length > 1 ? "all of them" : "it"} without you lifting a finger. Inbox Hub holds ${pendingMail} messages with replies already drafted, and ${state.suggestions.length} agent suggestions await your one-word verdict. Pipeline sits at ${money(pipeline)}; the Castellano proposal was re-opened four times last night. ${BRIEF_CLOSERS[state.briefIdx % BRIEF_CLOSERS.length]}`;

  const kpis = [
    { label: "Open pipeline", to: Math.round(pipeline / 100) / 10, decimals: 1, prefix: "$", suffix: "k", icon: TrendingUp, note: "6 open deals", tone: "text-gold-400 bg-gold-500/12" },
    { label: "Active clients", to: clients, decimals: 0, prefix: "", suffix: "", icon: Users, note: "2 at-risk flags", tone: "text-sage-400 bg-sage-500/12" },
    { label: "Due in 7 days", to: weekCount, decimals: 0, prefix: "", suffix: "", icon: AlarmClock, note: "auto-prioritized", tone: "text-clay-400 bg-clay-500/12" },
    { label: "Hours saved · mo", to: 31.5, decimals: 1, prefix: "", suffix: "", icon: Zap, note: `${runs} automation runs`, tone: "text-sky-400 bg-sky-400/12" },
  ];

  return (
    <div className="space-y-6">
      {/* greeting + brief */}
      <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="gold-edge relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-40 h-56 w-56 rounded-full bg-gold-500/6 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400">
              {hour < 18 ? <Sun size={13} /> : <MoonStar size={13} />}
              {fmtDate(new Date().toISOString())} · The daily brief
            </p>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] leading-tight text-cream-50">
              {greet}, Elena. <span className="gold-text italic">The admin is handled.</span>
            </h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={state.briefIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 max-w-xl text-[14px] leading-relaxed text-cream-300"
              >
                {brief}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex flex-col gap-2.5">
            <button onClick={onAI} className="btn-gold flex items-center gap-2 px-5 py-3 text-[13px]">
              <Sparkles size={15} /> Plan my day with AI
            </button>
            <button
              onClick={() => { setBriefSpin(true); dispatch({ type: "CYCLE_BRIEF" }); setTimeout(() => setBriefSpin(false), 700); }}
              className="btn-ghost flex items-center justify-center gap-2 px-5 py-2.5 text-[12.5px]"
            >
              <RefreshCw size={13} className={briefSpin ? "animate-spin" : ""} /> Regenerate brief
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} {...fadeUp} transition={{ delay: 0.06 * i, duration: 0.5 }} className="card card-hover cursor-pointer p-5" onClick={() => go({ name: i === 0 ? "opps" : i === 1 ? "clients" : i === 2 ? "tasks" : "automations" })}>
            <div className="mb-4 flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${k.tone}`}>
                <k.icon size={16} />
              </span>
              <ArrowRight size={14} className="text-cream-700" />
            </div>
            <p className="font-display text-[28px] leading-none text-cream-50">
              <CountUp to={k.to} decimals={k.decimals} prefix={k.prefix} suffix={k.suffix} />
            </p>
            <p className="mt-2 text-[12px] font-medium text-cream-400">{k.label}</p>
            <p className="text-[10.5px] text-cream-600">{k.note}</p>
          </motion.div>
        ))}
      </div>

      {/* AI approval queue */}
      {state.suggestions.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="gold-edge rounded-3xl bg-gradient-to-r from-gold-500/8 via-ink-850 to-ink-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="flex items-center gap-2 font-display text-lg text-cream-50">
                <Sparkles size={16} className="text-gold-400" /> Suggested by Ordo — awaiting your yes
              </p>
              <p className="mt-0.5 text-xs text-cream-500">The agents wrote the work up. Approve and it's scheduled; dismiss and it's gone.</p>
            </div>
            <Badge tone="gold">{state.suggestions.length} pending</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {state.suggestions.map((sug) => {
              const c = sug.clientId ? byClient(state, sug.clientId) : undefined;
              return (
                <motion.div layout key={sug.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} className="flex flex-col rounded-2xl border border-white/10 bg-ink-800/90 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge tone="sky"><Zap size={9} /> {sug.agent}</Badge>
                    <span className="text-[10.5px] font-semibold text-gold-400/90">{sug.confidence}% sure</span>
                  </div>
                  <p className="text-[12.5px] font-semibold leading-snug text-cream-100">{sug.title}</p>
                  <p className="mt-1.5 flex-1 text-[11px] leading-relaxed text-cream-500">{sug.reason}</p>
                  {c && <p className="mt-1.5 text-[10.5px] font-medium text-gold-400/80">{c.name}</p>}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => { dispatch({ type: "APPROVE_SUGGESTION", id: sug.id }); toast("Approved — scheduled and under watch", <ThumbsUp size={13} />); }}
                      className="btn-gold flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-[11px]"
                    >
                      <ThumbsUp size={11} /> Approve
                    </button>
                    <button
                      onClick={() => { dispatch({ type: "DISMISS_SUGGESTION", id: sug.id }); toast("Dismissed — noted for future suggestions", <X size={13} />); }}
                      className="btn-ghost flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold"
                    >
                      <X size={11} /> Not now
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* every engagement at a glance */}
      <motion.div {...fadeUp} transition={{ delay: 0.14 }} className="card p-5">
        <SectionHead
          title="Every engagement at a glance"
          sub="Where all active work stands — no check-ins needed, the machines know"
          right={<button onClick={() => go({ name: "projects" })} className="flex items-center gap-1.5 text-[12px] font-semibold text-gold-400 transition hover:text-gold-300">All projects <ArrowRight size={12} /></button>}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {activeProjects.slice(0, 4).map((p) => {
            const c = byClient(state, p.clientId);
            return (
              <button key={p.id} onClick={() => go({ name: "projects" })} className="rounded-2xl border border-white/6 bg-white/2 p-4 text-left transition hover:border-gold-500/30">
                <div className="mb-2 flex items-center gap-2">
                  <FolderKanban size={13} className={p.status === "at-risk" ? "text-clay-300" : p.status === "waiting" ? "text-cream-400" : "text-sage-400"} />
                  <p className="truncate text-[12.5px] font-semibold text-cream-100">{p.name}</p>
                </div>
                <p className="mb-2.5 truncate text-[11px] text-cream-500">{c?.company} · {moneyFull(p.fee)}</p>
                <Progress value={p.progress} tone={p.status === "at-risk" ? "clay" : "gold"} />
                <div className="mt-2 flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-cream-300">{p.progress}%</span>
                  <span className="text-cream-500">{relDate(p.due)}</span>
                  <span className={`font-semibold ${p.ball === "me" ? "text-gold-300" : "text-cream-400"}`}>{p.ball === "me" ? "You" : "Client"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* needs you today */}
        <motion.div {...fadeUp} transition={{ delay: 0.14 }} className="card p-6 xl:col-span-3">
          <SectionHead
            title="Needs you today"
            sub="Checked off here = checked off everywhere"
            right={<Badge tone="gold">{overdue.length + today.length} open</Badge>}
          />
          <div className="space-y-2">
            {[...overdue, ...today].length === 0 && (
              <div className="rounded-2xl border border-dashed border-sage-500/30 bg-sage-500/5 px-5 py-8 text-center">
                <CheckCircle2 className="mx-auto mb-2 text-sage-400" size={20} />
                <p className="font-display text-base text-cream-100">All clear.</p>
                <p className="mt-1 text-xs text-cream-500">Deadline Sentinel will reshuffle the moment anything lands.</p>
              </div>
            )}
            {[...overdue, ...today].map((t, i) => {
              const c = t.clientId ? byClient(state, t.clientId) : undefined;
              const late = i < overdue.length;
              return (
                <motion.div layout key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition ${late ? "border-clay-500/25 bg-clay-500/6" : "border-white/6 bg-white/2 hover:border-gold-500/25"}`}>
                  <button
                    onClick={() => { dispatch({ type: "TOGGLE_TASK", id: t.id }); toast("Beautiful. One less thing.", <Check size={15} />); }}
                    className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border transition hover:scale-110 ${late ? "border-clay-400/60 text-clay-300" : "border-gold-500/50 text-transparent hover:text-gold-300"}`}
                    style={{ height: 22, width: 22 }}
                  >
                    <Check size={13} strokeWidth={3} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-cream-100">{t.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-cream-500">
                      {c && <span className="text-gold-400/90">{c.name}</span>}
                      {t.ai && <Badge tone="gold"><Sparkles size={9} /> AI-drafted</Badge>}
                    </p>
                  </div>
                  <Badge tone={late ? "clay" : "gold"} dot={late}>{relDate(t.due)}</Badge>
                  <button
                    onClick={() => { dispatch({ type: "SNOOZE_TASK", id: t.id, days: 1 }); toast("Snoozed to tomorrow", <Clock size={15} />); }}
                    className="rounded-lg p-1.5 text-cream-700 opacity-0 transition hover:bg-white/8 hover:text-cream-200 group-hover:opacity-100"
                    title="Snooze +1 day"
                  >
                    <Clock size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
          <button onClick={() => go({ name: "tasks" })} className="mt-4 flex items-center gap-1.5 text-[12.5px] font-semibold text-gold-400 transition hover:text-gold-300">
            View full task list <ArrowRight size={13} />
          </button>
        </motion.div>

        {/* waiting panels */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="space-y-6 xl:col-span-2">
          <div className="card p-6">
            <SectionHead title="You're waiting on" sub="Ball in their court — all auto-nudged" />
            <div className="space-y-2.5">
              {waiting.map((p) => {
                const c = byClient(state, p.clientId)!;
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-3.5 py-3 transition hover:border-gold-500/25">
                    <Avatar src={c.avatar} name={c.name} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-cream-100">{c.name}</p>
                      <p className="truncate text-[11px] text-cream-500">{p.waitingNote ?? p.name}</p>
                    </div>
                    <button
                      onClick={() => toast(`Nudge sent to ${c.name.split(" ")[0]} via Document Chaser`, <Send size={14} />)}
                      className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold"
                    >
                      <BellRing size={12} /> Nudge
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[10.5px] text-cream-600">
              <Zap size={11} className="text-gold-500" /> Document Chaser handles cadence — you never chase manually.
            </p>
          </div>

          <div className="card p-6">
            <SectionHead title="Ball in your court" sub="Projects only you can move forward" />
            <div className="space-y-2.5">
              {myBall.map((p) => {
                const c = byClient(state, p.clientId)!;
                return (
                  <button key={p.id} onClick={() => go({ name: "projects" })} className="block w-full rounded-xl border border-white/6 bg-white/2 px-3.5 py-3 text-left transition hover:border-gold-500/25">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-semibold text-cream-100">{p.name}</p>
                      <Badge tone={p.status === "at-risk" ? "clay" : "sage"}>{p.progress}%</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-cream-500">{c.company} · due {relDate(p.due)}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* follow-ups owed */}
          <div className="card p-6">
            <SectionHead title="Follow-ups owed" sub="Leads going quiet — drafts already written" right={<Badge tone={followUps.length ? "clay" : "sage"}>{followUps.length || "none"}</Badge>} />
            <div className="space-y-2.5">
              {followUps.length === 0 && (
                <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-[12px] italic text-cream-600">
                  Every lead has been touched. Radar will flag the next one.
                </p>
              )}
              {followUps.slice(0, 3).map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-3.5 py-3 transition hover:border-gold-500/25">
                  <Avatar src={l.avatar} name={l.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-cream-100">
                      {l.name} {l.score >= 80 && <Flame size={12} className="text-clay-400" />}
                    </p>
                    <p className="truncate text-[11px] text-cream-500">{l.company} · follow-up {relDate(l.nextFollow)}</p>
                  </div>
                  <button
                    onClick={() => { go({ name: "leads", leadId: l.id }); }}
                    className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold"
                  >
                    <Hourglass size={12} /> Open
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => go({ name: "leads" })} className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-gold-400 transition hover:text-gold-300">
              See all leads <ArrowRight size={12} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* radar */}
        <motion.div {...fadeUp} transition={{ delay: 0.24 }} className="card p-6 xl:col-span-3">
          <SectionHead title="Deadline radar" sub="Next 14 days across everything — tasks and filings" right={<Badge tone="sage"><AlarmClock size={10} /> Sentinel watching</Badge>} />
          <div className="space-y-1">
            {radar.map((r, i) => {
              const late = relDate(r.due).includes("overdue") || relDate(r.due) === "Yesterday";
              const soon = relDate(r.due) === "Today" || relDate(r.due) === "Tomorrow";
              return (
                <div key={r.id} className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition hover:bg-white/3">
                  <span className="w-20 shrink-0 text-right text-[11.5px] font-semibold tabular-nums" style={{ color: late ? "#edb39f" : soon ? "#ddc180" : "#7c7668" }}>
                    {fmtDate(r.due)}
                  </span>
                  <div className="relative flex flex-col items-center">
                    <span className={`h-2.5 w-2.5 rounded-full ${late ? "bg-clay-400" : soon ? "bg-gold-400" : "bg-ink-500"}`} />
                    {i < radar.length - 1 && <span className="absolute top-3 h-6 w-px bg-white/8" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-cream-100">{r.label}</p>
                    <p className="truncate text-[10.5px] text-cream-600">{r.who ?? (r.kind === "project" ? "Engagement" : "Internal")}</p>
                  </div>
                  <Badge tone={r.kind === "project" ? "sky" : "mute"}>{r.kind}</Badge>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* activity + ai actions */}
        <motion.div {...fadeUp} transition={{ delay: 0.28 }} className="card p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex gap-1 rounded-full border border-white/10 bg-ink-800 p-0.5 text-[11.5px] font-semibold">
              <button onClick={() => setFeedTab("pulse")} className={`rounded-full px-3.5 py-1.5 transition ${feedTab === "pulse" ? "bg-gold-500/20 text-gold-300" : "text-cream-500 hover:text-cream-200"}`}>Client pulse</button>
              <button onClick={() => setFeedTab("actions")} className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition ${feedTab === "actions" ? "bg-gold-500/20 text-gold-300" : "text-cream-500 hover:text-cream-200"}`}>
                <Zap size={11} /> Ordo's actions
              </button>
            </div>
            <span className="text-[10.5px] text-cream-600">{feedTab === "pulse" ? "auto-filed" : "audit trail"}</span>
          </div>

          {feedTab === "pulse" ? (
            <>
              <div className="space-y-3.5">
                {activity.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <span className="mt-0.5 flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-white/5 text-cream-400" style={{ height: 30, width: 30 }}>
                      {a.type === "email" ? <Mail size={13} /> : a.type === "call" ? <Phone size={13} /> : a.type === "portal" ? <Send size={13} /> : <Users size={13} />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] leading-snug text-cream-200">{a.summary}</p>
                      <p className="mt-1 text-[10.5px] text-cream-600">
                        <span className="text-gold-400/90">{a.client.name.split(" ")[0]}</span> · {relDate(a.date) === "Today" || relDate(a.date) === "Yesterday" ? relDate(a.date) : fmtDate(a.date)} · {a.dir === "in" ? "received" : a.dir === "out" ? "sent" : "logged"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[10.5px] text-cream-600">
                <Sparkles size={11} className="text-gold-500" /> Meeting Scribe filed 4 of these without you asking.
              </p>
            </>
          ) : (
            <>
              <div className="space-y-2.5">
                {state.aiActions.map((x) => {
                  const c = x.clientId ? byClient(state, x.clientId) : undefined;
                  return (
                    <div key={x.id} className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 transition ${x.undone ? "border-white/4 opacity-45" : "border-white/6 bg-white/2"}`}>
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-500/12 text-gold-400">
                        <Zap size={12} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[12px] leading-snug ${x.undone ? "text-cream-500 line-through" : "text-cream-200"}`}>{x.text}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-cream-600">
                          <span className="font-semibold text-gold-400/80">{x.agent}</span> · {x.time} ago{c ? ` · ${c.name}` : ""}
                          {x.undone && <Badge tone="mute">undone</Badge>}
                        </p>
                      </div>
                      {x.canUndo && !x.undone && (
                        <button
                          onClick={() => { dispatch({ type: "UNDO_AI_ACTION", id: x.id }); toast("Undone — Ordo logged the correction", <RotateCcw size={13} />); }}
                          className="btn-ghost flex items-center gap-1 px-2.5 py-1.5 text-[10.5px] font-semibold"
                        >
                          <RotateCcw size={11} /> Undo
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[10.5px] text-cream-600">
                <Sparkles size={11} className="text-gold-500" /> Everything the agents do is logged here with an undo switch.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
