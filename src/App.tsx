import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavProvider, StoreProvider, type Route } from "./lib/store";
import { ToastProvider } from "./components/ui";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import CommandPalette from "./components/CommandPalette";
import AIAssistant from "./components/AIAssistant";
import ProfileModal from "./components/ProfileModal";
import QuickCapture from "./components/QuickCapture";
import Login from "./components/Login";
import Today from "./views/Today";
import Inbox from "./views/Inbox";
import Integrations from "./views/Integrations";
import Leads from "./views/Leads";
import Clients from "./views/Clients";
import Money from "./views/Money";
import Opportunities from "./views/Opportunities";
import Projects from "./views/Projects";
import Tasks from "./views/Tasks";
import Automations from "./views/Automations";

function Shell() {
  const [authed, setAuthed] = useState(false);
  const [route, setRoute] = useState<Route>({ name: "today" });
  const [palette, setPalette] = useState(false);
  const [ai, setAi] = useState(false);
  const [profile, setProfile] = useState(false);
  const [capture, setCapture] = useState(false);

  const go = (r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0 });
  };

  const signOut = () => {
    setAi(false);
    setPalette(false);
    setProfile(false);
    setRoute({ name: "today" });
    setAuthed(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setCapture((p) => !p);
      }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ToastProvider>
      <NavProvider value={{ route, go }}>
        <AnimatePresence mode="wait">
          {!authed ? (
            <Login key="login" onEnter={() => setAuthed(true)} />
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen bg-ink-950"
            >
              {/* ambient glow */}
              <div className="pointer-events-none fixed left-1/2 top-[-300px] z-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gold-500/6 blur-[120px]" />

              <Sidebar onAI={() => setAi(true)} onProfile={() => setProfile(true)} />

              <div className="relative z-10 lg:pl-[232px]">
                <main className="mx-auto max-w-[1340px] px-6 pb-20 lg:px-10">
                  <TopBar
                    onSearch={() => setPalette(true)}
                    onAI={() => setAi(true)}
                    onCapture={() => setCapture(true)}
                    onProfile={() => setProfile(true)}
                    onSignOut={signOut}
                  />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={route.name}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {route.name === "today" && <Today onAI={() => setAi(true)} />}
                      {route.name === "inbox" && <Inbox />}
                      {route.name === "integrations" && <Integrations />}
                      {route.name === "leads" && <Leads />}
                      {route.name === "clients" && <Clients />}
                      {route.name === "opps" && <Opportunities />}
                      {route.name === "money" && <Money />}
                      {route.name === "projects" && <Projects />}
                      {route.name === "tasks" && <Tasks />}
                      {route.name === "automations" && <Automations />}
                    </motion.div>
                  </AnimatePresence>
                </main>
              </div>

              <CommandPalette open={palette} onClose={() => setPalette(false)} />
              <AIAssistant open={ai} onClose={() => setAi(false)} />
              <QuickCapture open={capture} onClose={() => setCapture(false)} />
              <ProfileModal open={profile} onClose={() => setProfile(false)} onSignOut={signOut} />

              {/* floating AI button for mobile */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 18 }}
                onClick={() => setAi(true)}
                className="btn-gold pulse-ring fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full font-display text-[22px] lg:hidden"
                style={{ height: 52, width: 52 }}
                aria-label="Open AI assistant"
              >
                O
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </NavProvider>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
