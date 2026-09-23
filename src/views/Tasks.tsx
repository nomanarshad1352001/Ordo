import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, Check, Clock, Flag, Hourglass, ListChecks, Plus, Sparkles, Zap } from "lucide-react";
import { byClient, uid, useStore } from "../lib/store";
import { fmtDate, relDate, type Task } from "../lib/data";
import { Avatar, Badge, Field, Modal, SectionHead, useToast, type Tone } from "../components/ui";

type Filter = "all" | "today" | "followups" | "waiting" | "done";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All open" },
  { key: "today", label: "Due today" },
  { key: "followups", label: "Follow-ups" },
  { key: "waiting", label: "Waiting on others" },
  { key: "done", label: "Completed" },
];
const PRI: Record<Task["priority"], { tone: Tone; label: string }> = {
  high: { tone: "clay", label: "High" },
  medium: { tone: "gold", label: "Med" },
  low: { tone: "mute", label: "Low" },
};

export default function Tasks() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [f, setF] = useState({ title: "", clientId: "", due: "1", priority: "medium" as Task["priority"], kind: "deliverable" as Task["kind"] });

  const list = useMemo(() => {
    let t = [...state.tasks];
    if (filter === "done") t = t.filter((x) => x.done);
    else {
      t = t.filter((x) => !x.done);
      if (filter === "today") t = t.filter((x) => relDate(x.due) === "Today" || relDate(x.due).includes("overdue") || relDate(x.due) === "Yesterday");
      if (filter === "followups") t = t.filter((x) => x.kind === "followup");
      if (filter === "waiting") t = t.filter((x) => !!x.waitingOn);
    }
    const weight = { high: 0, medium: 1, low: 2 };
    return t.sort((a, b) => {
      if (shuffleKey > 0 && a.priority !== b.priority) return weight[a.priority] - weight[b.priority];
      return +new Date(a.due) - +new Date(b.due);
    });
  }, [state.tasks, filter, shuffleKey]);

  const groups = useMemo(() => {
    const label = (t: Task) => {
      if (t.done) return "Completed";
      const r = relDate(t.due);
      if (r === "Today") return "Today";
      if (r.includes("overdue") || r === "Yesterday") return "Overdue";
      if (r === "Tomorrow") return "Tomorrow";
      const d = (new Date(t.due).getTime() - Date.now()) / 86400000;
      return d <= 7 ? "This week" : "Later";
    };
    const order = ["Overdue", "Today", "Tomorrow", "This week", "Later", "Completed"];
    const map = new Map<string, Task[]>();
    list.forEach((t) => {
      const g = label(t);
      map.set(g, [...(map.get(g) ?? []), t]);
    });
    return order.filter((o) => map.has(o)).map((o) => ({ name: o, tasks: map.get(o)! }));
  }, [list]);

  const openCount = state.tasks.filter((t) => !t.done).length;
  const aiCount = state.tasks.filter((t) => t.ai && !t.done).length;
  const waitingCount = state.tasks.filter((t) => t.waitingOn && !t.done).length;

  const addTask = () => {
    if (!f.title.trim()) return;
    const d = new Date();
    d.setDate(d.getDate() + (Number(f.due) || 1));
    dispatch({
      type: "ADD_TASK",
      task: { id: uid(), title: f.title, clientId: f.clientId || undefined, due: d.toISOString(), priority: f.priority, done: false, kind: f.kind },
    });
    setAddOpen(false);
    setF({ title: "", clientId: "", due: "1", priority: "medium", kind: "deliverable" });
    toast("Task added — Deadline Sentinel filed it", <Sparkles size={14} />);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone="gold" dot>{openCount} open</Badge>
        <Badge tone="sky"><Sparkles size={10} /> {aiCount} AI-drafted</Badge>
        <Badge tone="cream"><Hourglass size={10} /> {waitingCount} waiting on others</Badge>
        <span className="ml-auto flex gap-2.5">
          <button
            onClick={() => { setShuffleKey((k) => k + 1); toast("AI re-prioritized your queue by impact", <Zap size={14} />); }}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold"
          >
            <ArrowUpDown size={14} className="text-gold-400" /> AI re-prioritize
          </button>
          <button onClick={() => setAddOpen(true)} className="btn-gold flex items-center gap-2 px-4 py-2.5 text-[12.5px]">
            <Plus size={15} /> New task
          </button>
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((x) => (
          <button key={x.key} onClick={() => setFilter(x.key)} className={`chip cursor-pointer transition ${filter === x.key ? "border-gold-500/50 bg-gold-500/15 text-gold-300" : "hover:border-white/20 hover:text-cream-100"}`}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="space-y-7">
        {groups.length === 0 && (
          <div className="rounded-2xl border border-dashed border-sage-500/30 bg-sage-500/5 px-6 py-16 text-center">
            <ListChecks className="mx-auto mb-3 text-sage-400" size={24} />
            <p className="font-display text-lg text-cream-100">Nothing here — genuinely.</p>
            <p className="mt-1 text-xs text-cream-500">The queue rebuilds itself the moment anything lands.</p>
          </div>
        )}
        {groups.map((g) => (
          <div key={g.name}>
            <SectionHead title={g.name} sub={`${g.tasks.length} item${g.tasks.length === 1 ? "" : "s"}`} />
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {g.tasks.map((t) => {
                  const c = t.clientId ? byClient(state, t.clientId) : undefined;
                  const late = g.name === "Overdue";
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 26, transition: { duration: 0.25 } }}
                      className={`group flex items-center gap-3.5 rounded-2xl border px-5 py-3.5 transition ${
                        t.done ? "border-white/4 bg-white/1 opacity-60" : late ? "border-clay-500/25 bg-clay-500/6" : "border-white/6 bg-white/2 hover:border-gold-500/25"
                      }`}
                    >
                      <button
                        onClick={() => {
                          dispatch({ type: "TOGGLE_TASK", id: t.id });
                          if (!t.done) toast("Done. That's the practice running itself.", <Check size={14} />);
                        }}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition hover:scale-110 ${
                          t.done ? "border-sage-400 bg-sage-500/25 text-sage-300" : "border-gold-500/60 text-transparent hover:text-gold-300"
                        }`}
                      >
                        <Check size={13} strokeWidth={3} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-[13.5px] font-medium ${t.done ? "text-cream-500 line-through" : "text-cream-100"}`}>{t.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {c && (
                            <span className="flex items-center gap-1.5 text-[11px] text-gold-400/90">
                              <Avatar src={c.avatar} name={c.name} size={14} /> {c.name}
                            </span>
                          )}
                          {t.waitingOn && <Badge tone="cream"><Hourglass size={9} /> {t.waitingOn}</Badge>}
                          {t.ai && <Badge tone="sky"><Sparkles size={9} /> AI</Badge>}
                          <Badge tone="mute">{t.kind}</Badge>
                        </div>
                      </div>
                      <Badge tone={PRI[t.priority].tone}><Flag size={9} /> {PRI[t.priority].label}</Badge>
                      <span className={`w-20 text-right text-[12px] font-medium ${late ? "text-clay-300" : "text-cream-400"}`}>
                        {t.done ? fmtDate(t.due) : relDate(t.due)}
                      </span>
                      {!t.done && (
                        <button
                          onClick={() => { dispatch({ type: "SNOOZE_TASK", id: t.id, days: 1 }); toast("Snoozed one day", <Clock size={14} />); }}
                          className="rounded-lg p-1.5 text-cream-700 opacity-0 transition hover:bg-white/8 hover:text-cream-200 group-hover:opacity-100"
                          title="Snooze +1 day"
                        >
                          <Clock size={14} />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New task">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="What needs doing?"><input autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" placeholder="Review draft K-1s for…" /></Field>
          </div>
          <Field label="Client (optional)">
            <select value={f.clientId} onChange={(e) => setF({ ...f, clientId: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm">
              <option value="" className="bg-ink-800">— None —</option>
              {state.clients.map((c) => <option key={c.id} value={c.id} className="bg-ink-800">{c.name}</option>)}
            </select>
          </Field>
          <Field label="Due (days from now)"><input type="number" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} className="input-luxe h-11 w-full px-4 text-sm" /></Field>
          <Field label="Priority">
            <select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as Task["priority"] })} className="input-luxe h-11 w-full px-4 text-sm">
              {["high", "medium", "low"].map((p) => <option key={p} className="bg-ink-800">{p}</option>)}
            </select>
          </Field>
          <Field label="Kind">
            <select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as Task["kind"] })} className="input-luxe h-11 w-full px-4 text-sm">
              {["deadline", "followup", "deliverable", "review", "admin"].map((k) => <option key={k} className="bg-ink-800">{k}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={addTask} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-[13px]"><Plus size={15} /> Add task</button>
        </div>
      </Modal>
    </div>
  );
}
