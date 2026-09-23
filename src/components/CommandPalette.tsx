import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Cable, FolderKanban, Inbox, LayoutDashboard, ListChecks, Search, Sparkles, Target, UserPlus, Users, Workflow } from "lucide-react";
import { useNav, useStore, type Route } from "../lib/store";
import { relDate } from "../lib/data";

interface Item { id: string; label: string; hint: string; icon: React.ElementType; route: Route; keywords: string }

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useStore();
  const { go } = useNav();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: Item[] = useMemo(() => {
    const pages: Item[] = [
      { id: "pg1", label: "Today — Command Center", hint: "Page", icon: LayoutDashboard, route: { name: "today" }, keywords: "home dashboard command" },
      { id: "pg2", label: "Inbox Hub — triaged mail", hint: "Page", icon: Inbox, route: { name: "inbox" }, keywords: "email triage drafts replies" },
      { id: "pg3", label: "Leads & Prospects", hint: "Page", icon: UserPlus, route: { name: "leads" }, keywords: "prospects pipeline inquiries" },
      { id: "pg4", label: "Clients & Entities", hint: "Page", icon: Users, route: { name: "clients" }, keywords: "accounts companies book" },
      { id: "pg5", label: "Opportunities", hint: "Page", icon: Target, route: { name: "opps" }, keywords: "proposals deals board" },
      { id: "pg6", label: "Projects & Engagements", hint: "Page", icon: FolderKanban, route: { name: "projects" }, keywords: "engagements work" },
      { id: "pg7", label: "Tasks & Deadlines", hint: "Page", icon: ListChecks, route: { name: "tasks" }, keywords: "todo deadlines follow-ups" },
      { id: "pg8", label: "Automations", hint: "Page", icon: Workflow, route: { name: "automations" }, keywords: "ai robots workflows" },
      { id: "pg9", label: "Connections — integrations", hint: "Page", icon: Cable, route: { name: "integrations" }, keywords: "integrations n8n api email assistant webhook quickbooks" },
    ];
    const people: Item[] = [
      ...state.clients.map((c) => ({
        id: `c-${c.id}`, label: c.name, hint: `Client · ${c.company}`, icon: Users,
        route: { name: "clients", clientId: c.id } as Route, keywords: `${c.company} ${c.tags.join(" ")} client`,
      })),
      ...state.leads.map((l) => ({
        id: `l-${l.id}`, label: l.name, hint: `Lead · ${l.company}`, icon: UserPlus,
        route: { name: "leads", leadId: l.id } as Route, keywords: `${l.company} ${l.service} lead`,
      })),
    ];
    const work: Item[] = [
      ...state.tasks.filter((t) => !t.done).map((t) => ({
        id: `t-${t.id}`, label: t.title, hint: `Task · ${relDate(t.due)}`, icon: ListChecks,
        route: { name: "tasks" } as Route, keywords: `task ${t.kind}`,
      })),
      ...state.projects.map((p) => ({
        id: `p-${p.id}`, label: p.name, hint: `Project · ${p.progress}% · ${relDate(p.due)}`, icon: FolderKanban,
        route: { name: "projects" } as Route, keywords: `project ${p.type}`,
      })),
    ];
    return [...pages, ...people, ...work];
  }, [state]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items.slice(0, 9);
    return items.filter((i) => `${i.label} ${i.hint} ${i.keywords}`.toLowerCase().includes(needle)).slice(0, 9);
  }, [q, items]);

  useEffect(() => { setIdx(0); }, [q]);
  useEffect(() => { if (open) { setQ(""); setTimeout(() => inputRef.current?.focus(), 40); } }, [open]);

  const choose = (item: Item) => {
    go(item.route);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[80] bg-black/65 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed left-1/2 top-[14vh] z-[81] w-[calc(100vw-2rem)] max-w-[600px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/12 bg-ink-850 shadow-luxe"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === "Enter" && filtered[idx]) choose(filtered[idx]);
            }}
          >
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
              <Search size={17} className="text-gold-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search clients, leads, tasks, projects, pages…"
                className="w-full bg-transparent text-[15px] text-cream-100 outline-none placeholder:text-cream-600"
              />
              <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-cream-500">ESC</kbd>
            </div>
            <div className="max-h-[380px] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <Sparkles size={18} className="mx-auto mb-2 text-gold-400" />
                  <p className="text-sm text-cream-400">Nothing found — try a client name like “Hale” or “Reyes”.</p>
                </div>
              )}
              {filtered.map((item, i) => (
                <button
                  key={item.id}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => choose(item)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition ${i === idx ? "bg-gold-500/12" : ""}`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${i === idx ? "bg-gold-500/18 text-gold-300" : "bg-white/5 text-cream-500"}`}>
                    <item.icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-cream-100">{item.label}</span>
                    <span className="block truncate text-[11px] text-cream-600">{item.hint}</span>
                  </span>
                  {i === idx && <ArrowRight size={14} className="text-gold-400" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t border-white/6 px-5 py-2.5 text-[10.5px] text-cream-600">
              <span>↑↓ navigate</span><span>↵ open</span>
              <span className="ml-auto font-semibold uppercase tracking-[0.14em] text-gold-500/80">Ordo Search</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
