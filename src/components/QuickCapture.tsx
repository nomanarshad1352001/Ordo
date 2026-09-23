import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ListChecks, Sparkles, StickyNote, UserPlus, WandSparkles } from "lucide-react";
import { uid, useStore, type State } from "../lib/store";
import { daysFrom, relDate } from "../lib/data";
import { Avatar, Badge, Modal, useToast, type Tone } from "../components/ui";

interface Parsed {
  kind: "task" | "lead" | "note";
  title: string; detail: string; clientId?: string; person?: string;
  due: string; priority: "high" | "medium" | "low";
}

function findPerson(s: State, text: string) {
  const lower = text.toLowerCase();
  const c = s.clients.find((c) => c.name.toLowerCase().split(" ").some((w) => w.length > 3 && lower.includes(w)));
  const l = c ? undefined : s.leads.find((l) => l.name.toLowerCase().split(" ").some((w) => w.length > 3 && lower.includes(w)));
  return { client: c, lead: l };
}

function parseDue(text: string): string {
  const lower = text.toLowerCase();
  const inDays = lower.match(/in (\d+) days?/);
  if (inDays) return daysFrom(Number(inDays[1]));
  if (lower.includes("today")) return daysFrom(0);
  if (lower.includes("tomorrow")) return daysFrom(1);
  if (lower.includes("friday")) {
    const d = new Date();
    const diff = (5 - d.getDay() + 7) % 7 || 7;
    return daysFrom(diff);
  }
  if (lower.includes("next week")) return daysFrom(7);
  return daysFrom(2);
}

function parse(text: string, s: State): Parsed {
  const t = text.trim();
  const lower = t.toLowerCase();
  const { client, lead } = findPerson(s, t);
  const person = client?.name ?? lead?.name;
  const priority = /urgent|asap|important|critical/.test(lower) ? "high" : /whenever|someday|low/.test(lower) ? "low" : "medium";
  const due = parseDue(t);

  const leadMatch = t.match(/lead[:\-\s]+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
  if (/new lead|add lead|^lead/.test(lower)) {
    const name = leadMatch?.[1] ?? "New inquiry";
    const companySplit = t.split(/[—–-]\s*/);
    return {
      kind: "lead", title: name, detail: companySplit[1] ?? "Captured via Quick Capture",
      person: name, due: daysFrom(1), priority: "medium",
    };
  }
  const noteMatch = t.match(/^note\s*(?:for|about)?\s*(.+?):\s*(.+)$/i);
  if (noteMatch || /^(note|remember that)/.test(lower)) {
    return {
      kind: "note",
      title: noteMatch ? noteMatch[2] : t.replace(/^(note|remember that)\s*/i, ""),
      detail: person ? `Filed on ${person}'s record` : "General note",
      clientId: client?.id, person, due, priority,
    };
  }
  const isFollow = /call|email|follow.?up|remind|nudge|text|chase/.test(lower);
  return {
    kind: "task",
    title: t.replace(/^(remind me to|task:?|todo:?)\s*/i, ""),
    detail: `${isFollow ? "Follow-up" : "Deliverable"}${person ? ` · linked to ${person}` : ""} · due ${relDate(due)}`,
    clientId: client?.id, person, due, priority,
  };
}

const EXAMPLES = [
  "Remind me to call Marcus about the liquor license tomorrow",
  "New lead: Dana Cole — bakery group S-corp conversion",
  "Note for Ashford: trustees strongly prefer email",
  "Follow up with Priya about merchant statements friday, urgent",
];

const KIND_META: Record<Parsed["kind"], { icon: React.ElementType; tone: Tone; label: string }> = {
  task: { icon: ListChecks, tone: "gold", label: "Task — Deadline Sentinel will watch it" },
  lead: { icon: UserPlus, tone: "sky", label: "Lead — Smart Intake will score & draft" },
  note: { icon: StickyNote, tone: "sage", label: "Note — filed to the client record" },
};

export default function QuickCapture({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);

  const interpret = () => { if (text.trim().length > 2) setParsed(parse(text, state)); };

  const commit = () => {
    if (!parsed) return;
    if (parsed.kind === "task") {
      dispatch({
        type: "ADD_TASK",
        task: { id: uid(), title: parsed.title, clientId: parsed.clientId, due: parsed.due, priority: parsed.priority, done: false, kind: /follow/i.test(parsed.detail) ? "followup" : "deliverable", ai: true },
      });
      toast("Task created from your words — filed and dated", <ListChecks size={14} />);
    } else if (parsed.kind === "lead") {
      dispatch({
        type: "ADD_LEAD",
        lead: {
          id: uid(), name: parsed.title, company: parsed.detail, email: "—", phone: "",
          source: "Quick Capture", service: parsed.detail, value: 2500, stage: "new", score: 55,
          lastContact: daysFrom(0), nextFollow: parsed.due,
          aiInsight: "Captured in your own words. Smart Intake drafted the welcome and is gathering context — score will refine with the first reply.",
          notes: [],
        },
      });
      toast("Lead created — Smart Intake is on it", <UserPlus size={14} />);
    } else if (parsed.kind === "note" && parsed.clientId) {
      dispatch({ type: "ADD_NOTE", target: "client", id: parsed.clientId, text: parsed.title });
      toast(`Note filed to ${parsed.person}'s record`, <StickyNote size={14} />);
    } else {
      toast("Note needs a client name — try 'Note for Hale: …'", <StickyNote size={14} />);
      return;
    }
    setParsed(null);
    setText("");
    onClose();
  };

  const meta = parsed ? KIND_META[parsed.kind] : null;
  const person = parsed?.person ? [...state.clients, ...state.leads].find((p) => p.name === parsed.person) : undefined;

  return (
    <Modal open={open} onClose={() => { onClose(); setParsed(null); }} title="Quick Capture" width={620}>
      <p className="-mt-3 mb-4 text-[12.5px] leading-relaxed text-cream-500">
        Speak plainly. Ordo parses people, dates, priority and intent — then files it where it belongs. <span className="text-gold-400">⌘J</span> from anywhere.
      </p>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => { setText(e.target.value); setParsed(null); }}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) interpret(); }}
        placeholder="e.g. Remind me to call Marcus about the liquor license tomorrow"
        className="input-luxe h-24 w-full resize-none p-4 text-[14px] leading-relaxed"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((x) => (
          <button key={x} onClick={() => { setText(x); setParsed(parse(x, state)); }} className="chip transition hover:border-gold-500/40 hover:text-gold-300">
            {x.length > 46 ? x.slice(0, 46) + "…" : x}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {parsed && meta && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="gold-edge mt-4 rounded-2xl bg-ink-800/80 p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <Badge tone={meta.tone}><meta.icon size={10} /> {meta.label}</Badge>
              <span className="flex items-center gap-1 text-[10.5px] font-semibold text-gold-400"><WandSparkles size={11} /> parsed from your sentence</span>
            </div>
            <div className="flex items-start gap-3.5">
              {person && <Avatar src={person.avatar} name={person.name} size={40} />}
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-snug text-cream-50">{parsed.title}</p>
                <p className="mt-1 text-[12px] text-cream-400">{parsed.detail}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {parsed.kind !== "lead" && <Badge tone="mute">due {relDate(parsed.due)} · {new Date(parsed.due).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</Badge>}
                  {parsed.kind === "task" && <Badge tone={parsed.priority === "high" ? "clay" : "mute"}>{parsed.priority} priority</Badge>}
                  {parsed.person && <Badge tone="gold">{parsed.person}</Badge>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[10.5px] text-cream-600"><Sparkles size={11} className="text-gold-500" /> Nothing typed here ever needs re-typing</p>
        <div className="flex gap-2.5">
          {parsed ? (
            <button onClick={commit} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-[13px]">
              <Check size={15} /> Commit it — done
            </button>
          ) : (
            <button onClick={interpret} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-[13px]">
              <WandSparkles size={15} /> Interpret
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
