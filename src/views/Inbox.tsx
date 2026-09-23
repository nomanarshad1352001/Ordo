import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive, CheckCheck, ChevronDown, FileText, Inbox as InboxIcon, MailCheck, Plus, Quote, Send, Sparkles, Target, UserPlus, X,
} from "lucide-react";
import { byClient, uid, useNav, useStore } from "../lib/store";
import { relDate, type InboxItem } from "../lib/data";
import { Avatar, Badge, SectionHead, useToast, type Tone } from "../components/ui";

const INTENT_TONES: Record<string, Tone> = {
  "Document delivery + question": "sage",
  "Buying question — pricing": "gold",
  "Document delivery": "sage",
  "Technical question": "sky",
  "System alert": "clay",
  "Deal accepted": "gold",
};

export default function Inbox() {
  const { state, dispatch } = useStore();
  const { go } = useNav();
  const toast = useToast();
  const [openDraft, setOpenDraft] = useState<string | null>(null);

  const pending = state.inbox.filter((i) => (i.status ?? "pending") === "pending");
  const handled = state.inbox.filter((i) => (i.status ?? "pending") !== "pending");
  const avgConf = Math.round(state.inbox.reduce((a, i) => a + i.confidence, 0) / state.inbox.length);

  const leadFor = (item: InboxItem) =>
    state.leads.find((l) => l.email.toLowerCase() === item.email.toLowerCase() || l.name === item.from);

  const queueTask = (item: InboxItem) => {
    if (!item.extractedTask) return;
    dispatch({
      type: "ADD_TASK",
      task: { id: uid(), title: item.extractedTask, clientId: item.clientId, due: new Date(Date.now() + 86400000).toISOString(), priority: "medium", done: false, kind: "followup", ai: true },
    });
    toast("Extracted task queued — Sentinel is watching it", <Plus size={14} />);
  };

  const send = (item: InboxItem) => {
    dispatch({ type: "SEND_INBOX", id: item.id });
    toast(`Reply sent to ${item.from.split(" ")[0]} — voice-matched, filed to record`, <Send size={14} />);
  };

  const file = (item: InboxItem) => {
    dispatch({ type: "FILE_INBOX", id: item.id });
    toast(`Filed to ${item.clientId ? byClient(state, item.clientId)?.name ?? "record" : "general files"}`, <Archive size={14} />);
  };

  return (
    <div>
      {/* stats */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone={pending.length ? "gold" : "sage"} dot>{pending.length} awaiting your verdict</Badge>
        <Badge tone="sage">{handled.length} handled by Ordo this week</Badge>
        <Badge tone="sky"><Target size={10} /> {avgConf}% avg match confidence</Badge>
        <span className="ml-auto text-[11.5px] text-cream-600">
          Nothing here requires typing — only approval.
        </span>
      </div>

      {/* pending */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {pending.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-dashed border-sage-500/30 bg-sage-500/5 px-6 py-20 text-center">
              <MailCheck className="mx-auto mb-3 text-sage-400" size={26} />
              <p className="font-display text-xl text-cream-100">Inbox zero — without touching an email.</p>
              <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-cream-500">
                Every message has been matched, drafted or filed. New arrivals appear here triaged, never raw.
              </p>
            </motion.div>
          )}
          {pending.map((item, idx) => {
            const client = item.clientId ? byClient(state, item.clientId) : undefined;
            const lead = !client ? leadFor(item) : undefined;
            const project = item.projectId ? state.projects.find((p) => p.id === item.projectId) : undefined;
            const expanded = openDraft === item.id;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 60, transition: { duration: 0.3 } }}
                transition={{ delay: idx * 0.04 }}
                className="card overflow-hidden"
              >
                <div className="flex flex-wrap items-start gap-4 p-5">
                  <Avatar src={client?.avatar ?? lead?.avatar} name={item.from} size={46} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14px] font-semibold text-cream-50">{item.from}</p>
                      <span className="text-[11px] text-cream-600">{relDate(item.received)}</span>
                      <Badge tone={INTENT_TONES[item.intent] ?? "mute"}>{item.intent}</Badge>
                    </div>
                    <p className="mt-1 text-[13px] font-medium text-cream-100">{item.subject}</p>
                    <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-cream-400">{item.snippet}</p>

                    {/* AI match trail */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gold-500">
                        <Sparkles size={10} /> Ordo matched
                      </span>
                      {client && (
                        <button onClick={() => go({ name: "clients", clientId: client.id })} className="chip transition hover:border-gold-500/50 hover:text-gold-300">
                          <Avatar src={client.avatar} name={client.name} size={14} /> {client.name} · {item.confidence}%
                        </button>
                      )}
                      {lead && (
                        <button onClick={() => go({ name: "leads", leadId: lead.id })} className="chip transition hover:border-gold-500/50 hover:text-gold-300">
                          <UserPlus size={11} /> Lead: {lead.name} · {item.confidence}%
                        </button>
                      )}
                      {!client && !lead && (
                        <button onClick={() => go({ name: "leads" })} className="chip transition hover:border-gold-500/50 hover:text-gold-300">
                          <UserPlus size={11} /> New contact suggested
                        </button>
                      )}
                      {project && (
                        <button onClick={() => go({ name: "projects" })} className="chip border-sky-400/30 bg-sky-400/10 text-sky-300 transition hover:border-sky-400/60">
                          → {project.name}
                        </button>
                      )}
                      {item.extractedTask && (
                        <button onClick={() => queueTask(item)} className="chip border-gold-500/30 bg-gold-500/10 text-gold-300 transition hover:border-gold-400/60">
                          <Plus size={10} /> task: {item.extractedTask.length > 44 ? item.extractedTask.slice(0, 44) + "…" : item.extractedTask}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex w-16 flex-col items-end">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                        <div className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300" style={{ width: `${item.confidence}%` }} />
                      </div>
                      <span className="mt-1 text-[10px] font-medium text-cream-500">{item.confidence}% sure</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => send(item)} className="btn-gold flex items-center gap-1.5 px-3.5 py-2 text-[11.5px]">
                        <Send size={12} /> Send AI reply
                      </button>
                      <button onClick={() => file(item)} className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 text-[11.5px] font-semibold">
                        <Archive size={12} /> File
                      </button>
                      <button
                        onClick={() => setOpenDraft(expanded ? null : item.id)}
                        className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 text-[11.5px] font-semibold"
                      >
                        <Quote size={12} />
                        <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* draft preview */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gold-500/15 bg-gold-500/5 px-5 py-4">
                        <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gold-400">
                          <FileText size={11} /> Drafted reply — in your voice
                        </p>
                        <p className="max-w-3xl text-[13px] leading-relaxed text-cream-200">{item.draft}</p>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => send(item)} className="btn-gold flex items-center gap-1.5 px-4 py-2 text-[11.5px]"><Send size={12} /> Approve & send</button>
                          <button onClick={() => toast("Regenerated — softer tone, same facts", <Sparkles size={13} />)} className="btn-ghost px-4 py-2 text-[11.5px] font-semibold">Regenerate</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* handled */}
      {handled.length > 0 && (
        <div className="mt-8">
          <SectionHead title="Handled — auto-filed" sub="Ordo already took care of these. Undo lives on each client record." />
          <div className="card divide-y divide-white/4 overflow-hidden">
            {handled.map((item) => {
              const client = item.clientId ? byClient(state, item.clientId) : undefined;
              return (
                <div key={item.id} className="flex items-center gap-3.5 px-5 py-3.5 opacity-70 transition hover:opacity-100">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.status === "replied" ? "bg-sage-500/12 text-sage-300" : "bg-white/6 text-cream-400"}`}>
                    {item.status === "replied" ? <CheckCheck size={14} /> : <Archive size={14} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-cream-100">{item.subject}</p>
                    <p className="truncate text-[11px] text-cream-600">
                      {item.from}{client ? ` → ${client.name}` : ""} · {item.status === "replied" ? "AI reply sent & filed" : "filed to record"}
                    </p>
                  </div>
                  {client && (
                    <button onClick={() => go({ name: "clients", clientId: client.id })} className="chip transition hover:border-gold-500/40 hover:text-gold-300">
                      View record
                    </button>
                  )}
                  <button onClick={() => toast("Restored to triage", <InboxIcon size={14} />)} className="rounded-lg p-1.5 text-cream-600 transition hover:bg-white/8 hover:text-cream-200" title="Undo">
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
