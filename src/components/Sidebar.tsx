import { Cable, FolderKanban, Inbox, LayoutDashboard, ListChecks, Sparkles, Target, UserPlus, Users, Workflow, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { pendingInbox, useNav, useStore, type ViewName } from "../lib/store";
import { OWNER } from "../lib/data";
import { Avatar } from "./ui";

const NAV: { name: ViewName; label: string; icon: React.ElementType; count?: (s: any) => number }[] = [
  { name: "today", label: "Today", icon: LayoutDashboard },
  { name: "inbox", label: "Inbox Hub", icon: Inbox, count: (s) => pendingInbox(s).length },
  { name: "leads", label: "Leads", icon: UserPlus, count: (s) => s.leads.filter((l: any) => l.stage !== "won" && l.stage !== "lost").length },
  { name: "clients", label: "Clients", icon: Users, count: (s) => s.clients.length },
  { name: "opps", label: "Opportunities", icon: Target, count: (s) => s.opps.filter((o: any) => o.stage !== "won" && o.stage !== "lost").length },
  { name: "projects", label: "Projects", icon: FolderKanban, count: (s) => s.projects.filter((p: any) => p.status !== "done").length },
  { name: "tasks", label: "Tasks", icon: ListChecks, count: (s) => s.tasks.filter((t: any) => !t.done).length },
  { name: "automations", label: "Automations", icon: Workflow, count: (s) => s.automations.filter((a: any) => a.enabled).length },
  { name: "integrations", label: "Connections", icon: Cable, count: (s) => s.integrations.filter((i: any) => i.connected).length },
];

export default function Sidebar({ onAI, onProfile }: { onAI: () => void; onProfile: () => void }) {
  const { route, go } = useNav();
  const { state } = useStore();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[232px] flex-col border-r border-white/6 bg-ink-900/80 px-4 py-6 backdrop-blur-xl lg:flex">
      {/* brand */}
      <button onClick={() => go({ name: "today" })} className="mb-9 flex items-center gap-3 px-2 text-left">
        <div className="gold-edge flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 font-display text-lg font-semibold text-ink-950 shadow-gold">
          O
        </div>
        <div>
          <p className="font-display text-[17px] tracking-wide text-cream-50">Ordo</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-cream-600">Practice Hub</p>
        </div>
      </button>

      {/* nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = route.name === item.name;
          const n = item.count ? item.count(state) : undefined;
          return (
            <button
              key={item.name}
              onClick={() => go({ name: item.name })}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-all duration-200 ${
                active ? "text-cream-50" : "text-cream-500 hover:bg-white/4 hover:text-cream-100"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-xl border border-gold-500/25 bg-gradient-to-r from-gold-500/14 to-gold-500/4"
                />
              )}
              <item.icon size={17} className={`relative transition-colors ${active ? "text-gold-400" : "text-cream-600 group-hover:text-cream-300"}`} />
              <span className="relative font-medium">{item.label}</span>
              {n !== undefined && (
                <span className={`relative ml-auto rounded-full px-2 py-0.5 text-[10.5px] font-semibold tabular-nums ${active ? "bg-gold-500/20 text-gold-300" : "bg-white/6 text-cream-500"}`}>
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI card */}
      <button onClick={onAI} className="gold-edge group mb-4 rounded-2xl bg-ink-800/80 p-4 text-left transition hover:bg-ink-800">
        <div className="mb-2 flex items-center gap-2 text-gold-400">
          <Sparkles size={15} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Ordo AI</span>
        </div>
        <p className="text-[12.5px] leading-relaxed text-cream-300">
          {pendingInbox(state).length + state.suggestions.length} items are triaged and awaiting your verdict. Ask me anything.
        </p>
        <span className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-gold-300">
          Open assistant <Zap size={13} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </button>

      {/* user */}
      <button onClick={onProfile} className="group flex w-full items-center gap-3 rounded-2xl border border-white/6 bg-white/3 px-3 py-2.5 text-left transition hover:border-gold-500/35 hover:bg-gold-500/6" title="Open your profile">
        <Avatar src={OWNER.avatar} name={OWNER.name} size={36} ring />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-cream-100">{OWNER.name}</p>
          <p className="truncate text-[11px] text-cream-600">{OWNER.firm}</p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-cream-700 transition group-hover:text-gold-400">You</span>
      </button>
    </aside>
  );
}
