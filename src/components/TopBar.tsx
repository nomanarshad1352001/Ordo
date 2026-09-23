import { AlarmClock, Bell, Cable, ChevronDown, Command, FileSearch, Keyboard, LogOut, Mic, Radar, Search, Settings, Sparkles, UserRound, WandSparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useStore, useNav } from "../lib/store";
import { OWNER, fmtDateFull, type Notif } from "../lib/data";
import { Avatar, useToast } from "./ui";

const TITLES: Record<string, { title: string; sub: string }> = {
  today: { title: "Command Center", sub: "What needs you today — and nothing that doesn't" },
  inbox: { title: "Inbox Hub", sub: "Every message matched, drafted and filed by AI — you just approve" },
  leads: { title: "Leads & Prospects", sub: "Every inquiry, scored and chased automatically" },
  clients: { title: "Clients & Entities", sub: "Your whole book of business, one glance" },
  opps: { title: "Opportunities", sub: "Proposals and pipeline value, live" },
  money: { title: "Money", sub: "Collected, outstanding, and forecast — reconciled without you" },
  projects: { title: "Projects & Engagements", sub: "Status, progress, and whose court the ball is in" },
  tasks: { title: "Tasks & Deadlines", sub: "AI-prioritized, automation-maintained" },
  automations: { title: "Automations", sub: "Your invisible staff — working while you sleep" },
  integrations: { title: "Connections", sub: "Every system feeding your hub — including your AI email assistant" },
};

const NOTIF_ICONS: Record<string, React.ElementType> = { FileSearch, Radar, AlarmClock, Mic };

export default function TopBar({ onSearch, onAI, onCapture, onProfile, onSignOut }: { onSearch: () => void; onAI: () => void; onCapture: () => void; onProfile: () => void; onSignOut: () => void }) {
  const { route, go } = useNav();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const meta = TITLES[route.name] ?? TITLES.today;
  const unread = state.notifs.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 -mx-6 mb-8 border-b border-white/6 bg-ink-950/82 px-6 py-4 backdrop-blur-xl lg:-mx-10 lg:px-10">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[22px] leading-tight text-cream-50">{meta.title}</h1>
          <p className="hidden truncate text-[12px] text-cream-600 sm:block">
            {fmtDateFull(new Date().toISOString())} · {meta.sub}
          </p>
        </div>

        <button onClick={onSearch} className="btn-ghost hidden h-10 w-64 items-center gap-2.5 px-3.5 text-[13px] text-cream-500 md:flex">
          <Search size={15} />
          <span className="flex-1 text-left">Search anything…</span>
          <span className="flex items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-cream-500">
            <Command size={10} /> K
          </span>
        </button>
        <button onClick={onSearch} className="btn-ghost flex h-10 w-10 items-center justify-center md:hidden">
          <Search size={16} />
        </button>

        <button onClick={onCapture} className="btn-ghost flex h-10 items-center gap-2 px-4 text-[13px] font-semibold" title="Quick Capture · ⌘J">
          <WandSparkles size={15} className="text-gold-400" />
          <span className="hidden md:inline">Capture</span>
          <span className="hidden items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-cream-500 lg:flex">
            <Command size={10} /> J
          </span>
        </button>

        <button onClick={onAI} className="btn-gold flex h-10 items-center gap-2 px-4 text-[13px]">
          <Sparkles size={15} />
          <span className="hidden sm:inline">Ask Ordo</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="btn-ghost relative flex h-10 w-10 items-center justify-center"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="pulse-ring absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold-500 text-[9.5px] font-bold text-ink-950" style={{ height: 18, width: 18 }}>
                {unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 z-50 mt-2 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-ink-850 shadow-luxe"
                >
                  <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
                    <p className="font-display text-[15px] text-cream-50">Automation feed</p>
                    <button
                      onClick={() => { dispatch({ type: "READ_NOTIFS" }); }}
                      className="text-[11.5px] font-semibold text-gold-400 hover:text-gold-300"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-[380px] overflow-y-auto">
                    {state.notifs.map((n: Notif) => {
                      const Icon = NOTIF_ICONS[n.icon] ?? Bell;
                      return (
                        <div key={n.id} className={`flex gap-3 border-b border-white/4 px-4 py-3.5 transition hover:bg-white/3 ${n.read ? "opacity-55" : ""}`}>
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold-500/12 text-gold-400">
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-cream-100">{n.title}
                              <span className="ml-2 text-[10.5px] font-medium text-cream-600">{n.time} ago</span>
                            </p>
                            <p className="mt-0.5 text-[12px] leading-relaxed text-cream-400">{n.body}</p>
                          </div>
                          {!n.read && <span className="ml-auto mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-400" />}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex items-center gap-1.5 rounded-full p-0.5 pr-1 transition hover:bg-white/5"
            aria-label="Account menu"
          >
            <Avatar src={OWNER.avatar} name={OWNER.name} size={38} ring />
            <ChevronDown size={13} className={`text-cream-500 transition-transform ${showMenu ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 z-50 mt-2 w-[264px] overflow-hidden rounded-2xl border border-white/10 bg-ink-850 shadow-luxe"
                >
                  <div className="flex items-center gap-3 border-b border-white/6 bg-gradient-to-r from-gold-500/10 to-transparent px-4 py-3.5">
                    <Avatar src={OWNER.avatar} name={OWNER.name} size={42} ring />
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold text-cream-50">{OWNER.name}</p>
                      <p className="truncate text-[11px] text-cream-500">elena@vossvale.cpa</p>
                    </div>
                  </div>
                  <div className="p-1.5">
                    {[
                      { icon: UserRound, label: "View profile", fn: () => { setShowMenu(false); onProfile(); } },
                      { icon: Cable, label: "Connections", fn: () => { setShowMenu(false); go({ name: "integrations" }); } },
                      { icon: Settings, label: "Practice settings", fn: () => { setShowMenu(false); toast("Practice settings — handled by your onboarding concierge", <Settings size={14} />); } },
                      { icon: Keyboard, label: "Shortcuts · ⌘K", fn: () => { setShowMenu(false); onSearch(); } },
                    ].map((m) => (
                      <button key={m.label} onClick={m.fn} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12.5px] font-medium text-cream-200 transition hover:bg-white/5 hover:text-cream-50">
                        <m.icon size={14} className="text-gold-400" /> {m.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-white/6 p-1.5">
                    <button
                      onClick={() => { setShowMenu(false); onSignOut(); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12.5px] font-semibold text-clay-300 transition hover:bg-clay-500/10"
                    >
                      <LogOut size={14} /> Sign out of Ordo
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
