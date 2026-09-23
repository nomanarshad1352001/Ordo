import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bot, Sparkles, X } from "lucide-react";
import { useStore, todayTasks, overdueTasks, waitingOnClients, waitingTasks, openPipeline, type State } from "../lib/store";
import { BRIEF_CLOSERS, fmtDate, money, moneyFull, relDate } from "../lib/data";
import { Avatar } from "./ui";

interface Msg { role: "ai" | "me"; text: string }

/* ------------------------- the answer engine ------------------------ */

function findPerson(s: State, q: string) {
  const lower = q.toLowerCase();
  const client = s.clients.find((c) => c.name.toLowerCase().split(" ").some((w) => w.length > 2 && lower.includes(w)) || lower.includes(c.company.toLowerCase()));
  const lead = client ? undefined : s.leads.find((l) => l.name.toLowerCase().split(" ").some((w) => w.length > 2 && lower.includes(w)) || lower.includes(l.company.toLowerCase()));
  return { client, lead };
}

function answer(q: string, s: State): string {
  const lower = q.toLowerCase();

  if (/send it|send that|go ahead|ship it/.test(lower))
    return "Done — sent, and filed to the client's record by Meeting Scribe. A follow-up task exists already, so nothing slips. Anything else?";

  if (/\b(hi|hello|hey)\b/.test(lower) && lower.length < 20)
    return "Good to see you, Elena. I have your day mapped — three items need you before noon, and I've already drafted everything routine. What would you like to know?";

  if (/draft|write|email|message|note to/.test(lower)) {
    const { client, lead } = findPerson(s, q);
    const p = client ?? lead;
    if (p) {
      const first = p.name.split(" ")[0];
      return `Here's a draft, ready to send:\n\nSubject: One quick thing between you and finished\n\nHi ${first},\n\nHope the week is treating you well. I'm at the final step on your engagement — the only piece I still need is your confirmation on the outstanding item in your portal.\n\nOnce that's in, everything is finished and filed within 48 hours. No homework, I promise.\n\nWarmly,\nElena Voss, CPA\nVoss & Vale Advisory\n\n— Say "send it" and it's out the door.`;
    }
    return "Tell me who to write to — for example “draft an email to Marcus” or “write to the Castellano lead”.";
  }

  if (/waiting on (me|you)|my court|owe|on me/.test(lower)) {
    const mine = s.projects.filter((p) => p.ball === "me" && p.status !== "done");
    const t = todayTasks(s);
    if (!mine.length && !t.length) return "Remarkably — nothing. Every ball is in a client court and your task queue is clean. This is what the automations are for.";
    return `The ball is in your court on ${mine.length + t.length} things:\n\n${mine.map((p) => `• ${p.name} — ${s.clients.find((c) => c.id === p.clientId)?.company} (due ${relDate(p.due)}, ${p.progress}% done)`).join("\n")}\n${t.slice(0, 4).map((x) => `• ${x.title} — due today`).join("\n")}\n\nStart with the Hale draft review; it unblocks e-signature.`;
  }

  if (/inbox|email|mail|triage|message/.test(lower)) {
    const pending = s.inbox.filter((i) => (i.status ?? "pending") === "pending");
    if (!pending.length) return "Inbox Hub is at zero — everything's matched, drafted or filed. New mail lands there pre-triaged, never raw.";
    return `Inbox Hub has ${pending.length} message${pending.length === 1 ? "" : "s"} awaiting your verdict — no typing needed, just approval:\n\n${pending.map((i) => `• ${i.from} — “${i.subject}” (${i.intent.toLowerCase()}, ${i.confidence}% match${i.extractedTask ? ", task extracted" : ""})`).join("\n")}\n\nEach has a reply already drafted in your voice. The Rosa Castellano one says “we're in” — I'd approve that reply first.`;
  }

  if (/integrat|connect|n8n|webhook|api|assistant|system/.test(lower)) {
    const on = s.integrations.filter((i) => i.connected);
    const assistant = s.integrations.find((i) => i.id === "g4")!;
    return `${on.length} systems are plugged into the hub: ${on.map((i) => i.name).join(", ")}. Together they flowed ${on.reduce((a, i) => a + i.flows, 0).toLocaleString()} events this week — filed automatically, zero manual updates.\n\nYour AI email assistant has a reserved webhook (${assistant.connected ? "live and ingesting" : "/hooks/ordo/email — ready when you are"}). The moment you connect it, its replies and summaries land on the right client record like everything else.`;
  }

  if (/every project|all projects|where does|engagement stand|status of every/.test(lower)) {
    const act = s.projects.filter((p) => p.status !== "done");
    return `Where every engagement stands:\n\n${act.map((p) => { const c = s.clients.find((c) => c.id === p.clientId); return `• ${p.name} — ${c?.company}: ${p.progress}%, ${p.status.replace("-", " ")}, ball with ${p.ball === "me" ? "you" : "client"}, due ${relDate(p.due)}`; }).join("\n")}\n\nThe only one genuinely stuck is Okafor — everything else is moving on schedule or waiting on a nudge I already sent.`;
  }

  if (/waiting on (them|clients|others|client)/.test(lower) || /who am i waiting/.test(lower)) {
    const w = waitingOnClients(s);
    const wt = waitingTasks(s);
    if (!w.length && !wt.length) return "You're not waiting on anyone right now. Unusual — enjoy it.";
    return `You're waiting on ${w.length + wt.length} parties:\n\n${w.map((p) => { const c = s.clients.find((c) => c.id === p.clientId)!; return `• ${c.name} (${c.company}) — ${p.waitingNote ?? "client deliverable pending"}`; }).join("\n")}\n${wt.map((t) => `• ${t.waitingOn} — ${t.title.replace("Waiting: ", "")}`).join("\n")}\n\nDocument Chaser is already nudging most of these. Want me to escalate any?`;
  }

  if (/today|due|deadline|overdue|urgent|priority|prioritize|plan my day|plan/.test(lower)) {
    const t = todayTasks(s);
    const o = overdueTasks(s);
    return `Here is your day, ranked by what actually moves money:\n\n${o.length ? `Overdue:\n${o.map((x) => `• ${x.title} (${relDate(x.due)})`).join("\n")}\n\n` : ""}Today:\n${t.map((x) => `• ${x.title}${x.clientId ? ` — ${s.clients.find((c) => c.id === x.clientId)?.name}` : ""}`).join("\n") || "• Clear — nothing due today."}\n\nDo the two overdue replies first; each takes under five minutes and unblocks waiting clients. ${BRIEF_CLOSERS[s.briefIdx % BRIEF_CLOSERS.length]}`;
  }

  if (/pipeline|revenue|forecast|worth|value|opportunit|deals/.test(lower)) {
    const open = s.opps.filter((x) => x.stage !== "won" && x.stage !== "lost");
    const weighted = open.reduce((a, o) => a + (o.value * o.prob) / 100, 0);
    const byStage = (["discovery", "proposal", "negotiation"] as const).map((st) => {
      const list = open.filter((o) => o.stage === st);
      return `• ${st[0].toUpperCase() + st.slice(1)}: ${list.length} deal${list.length === 1 ? "" : "s"} · ${money(list.reduce((a, o) => a + o.value, 0))}`;
    });
    return `Your open pipeline is ${money(openPipeline(s))} across ${open.length} opportunities — ${money(Math.round(weighted))} probability-weighted.\n\n${byStage.join("\n")}\n\nThe Castellano deal (${moneyFull(12000)}) is the biggest and warmest — their proposal was re-opened 4 times. Close that and Q1 recurring is up 22%.`;
  }

  if (/lead|prospect|follow.?up|new business|intake/.test(lower)) {
    const act = s.leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
    const late = act.filter((l) => new Date(l.nextFollow) < new Date());
    return `${act.length} active leads, ${money(act.reduce((a, l) => a + l.value, 0))} combined. ${late.length ? `${late.length} follow-up${late.length > 1 ? "s are" : " is"} overdue — ${late.map((l) => l.name).join(", ")}.` : "Every follow-up is on schedule."}\n\nWarmest right now:\n${act.sort((a, b) => b.score - a.score).slice(0, 3).map((l) => `• ${l.name} — score ${l.score}, ${money(l.value)}, next touch ${relDate(l.nextFollow)}`).join("\n")}\n\nSmart Intake drafted each nudge already; they're one approval away.`;
  }

  if (/automation|hours|saved|robots|working/.test(lower)) {
    const on = s.automations.filter((a) => a.enabled);
    const runs = s.automations.reduce((a, x) => a + x.runs, 0);
    return `${on.length} of ${s.automations.length} automations are live — ${runs} runs this month, roughly 31.5 hours handed back to you.\n\nBiggest contributor: Document Chaser (${s.automations.find((a) => a.id === "a2")?.runs} runs — you haven't manually chased a document in 6 weeks).\n\nTwo are paused: Proposal Drafter and K-1 Courier. Flip them on from the Automations page if you'd like.`;
  }

  if (/who is|tell me about|how is|summary of|status of|brief me on/.test(lower)) {
    const { client, lead } = findPerson(s, q);
    if (client) {
      const projs = s.projects.filter((p) => p.clientId === client.id && p.status !== "done");
      return `${client.name} — ${client.company}\n\nHealth ${client.health}/100 · ${client.status} · ${moneyFull(client.revenue)}/yr · client since ${client.since}\n${client.entities.length} entit${client.entities.length === 1 ? "y" : "ies"}: ${client.entities.map((e) => `${e.name} (${e.type})`).join(", ")}\n\n${client.aiSummary}\n\nOpen work: ${projs.length ? projs.map((p) => `${p.name} (${p.progress}%, ball with ${p.ball === "me" ? "you" : "them"})`).join("; ") : "none"}.\nNext best move: ${client.aiNext}`;
    }
    if (lead)
      return `${lead.name} — ${lead.company}\nLead score ${lead.score}/100 · stage: ${lead.stage} · worth ${moneyFull(lead.value)}\nSource: ${lead.source} · Service wanted: ${lead.service}\nNext follow-up: ${fmtDate(lead.nextFollow)} (${relDate(lead.nextFollow)})\n\n${lead.aiInsight}`;
    return "I couldn't place that name — try a client like “Marcus”, “Priya”, or a lead like “Noah” or “Rosa”.";
  }

  if (/thank/.test(lower)) return "Always. That's what I'm here for — you do the strategy, I'll carry the admin.";

  return `I can answer from your live practice data. Try:\n\n• “What needs my attention today?”\n• “Who am I waiting on?”\n• “How's my pipeline and revenue?”\n• “Brief me on Marcus Hale”\n• “Draft an email to David Okafor”\n• “Which leads need follow-up?”`;
}

const SUGGESTIONS = [
  "What's in my Inbox Hub?",
  "Where does every project stand?",
  "Which leads need follow-up?",
  "How do my systems connect?",
  "Draft an email to David Okafor",
];

/* ------------------------------ component --------------------------- */

export default function AIAssistant({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Evening or morning, Elena — I run the admin so you run the strategy. Ask me anything about your practice, or tap a suggestion below." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, open]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMsgs((m) => [...m, { role: "me", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: answer(q, stateRef.current) }]);
      setTyping(false);
    }, 900 + Math.random() * 500);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[74] bg-black/45 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 z-[75] flex h-full w-[min(440px,100vw)] flex-col border-l border-gold-500/20 bg-ink-850 shadow-luxe"
          >
          {/* header */}
          <div className="flex items-center gap-3 border-b border-white/8 bg-gradient-to-r from-gold-500/12 to-transparent px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950 shadow-gold">
              <Bot size={17} />
            </div>
            <div className="flex-1">
              <p className="font-display text-[15px] text-cream-50">Ordo Intelligence</p>
              <p className="flex items-center gap-1.5 text-[11px] text-cream-500">
                <span className="h-1.5 w-1.5 rounded-full bg-sage-400" /> Connected to your practice data
              </p>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-cream-500 transition hover:bg-white/8 hover:text-cream-100">
              <X size={16} />
            </button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {msgs.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${m.role === "me" ? "flex-row-reverse" : ""}`}>
                {m.role === "ai" ? (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-500/15 text-gold-400">
                    <Sparkles size={13} />
                  </div>
                ) : (
                  <Avatar name="Elena Voss" src={undefined} size={28} />
                )}
                <div
                  className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                    m.role === "ai"
                      ? "rounded-tl-md border border-white/8 bg-white/4 text-cream-100"
                      : "rounded-tr-md bg-gradient-to-br from-gold-400 to-gold-600 font-medium text-ink-950"
                  }`}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg bg-gold-500/15 text-gold-400">
                  <Sparkles size={13} />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/8 bg-white/4 px-4 py-3.5">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gold-400" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gold-400" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gold-400" />
                </div>
              </div>
            )}
          </div>

          {/* suggestions */}
          <div className="flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="chip shrink-0 transition hover:border-gold-500/40 hover:text-gold-300">
                {s}
              </button>
            ))}
          </div>

          {/* input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 border-t border-white/8 bg-ink-900/60 px-4 py-3.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about clients, tasks, pipeline…"
              className="input-luxe h-10 flex-1 px-4 text-[13px]"
            />
            <button type="submit" className="btn-gold flex h-10 w-10 items-center justify-center rounded-xl">
              <ArrowUp size={16} />
            </button>
          </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
