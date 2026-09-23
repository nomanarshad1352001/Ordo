import { useState } from "react";
import { Award, Building2, LogOut, Mail, MapPin, ShieldCheck } from "lucide-react";
import { useStore } from "../lib/store";
import { OWNER } from "../lib/data";
import { Avatar, Badge, Modal, Toggle, useToast } from "./ui";
import { BellRing, Volume2, FileText } from "lucide-react";

export default function ProfileModal({ open, onClose, onSignOut }: { open: boolean; onClose: () => void; onSignOut: () => void }) {
  const { state } = useStore();
  const toast = useToast();
  const [prefs, setPrefs] = useState({ brief: true, digest: true, sound: false });
  const entities = state.clients.reduce((a, c) => a + c.entities.length, 0);
  const runs = state.automations.reduce((a, x) => a + x.runs, 0);

  const flip = (key: keyof typeof prefs, label: string) => {
    const next = !prefs[key];
    setPrefs({ ...prefs, [key]: next });
    toast(`${label} ${next ? "enabled" : "disabled"}`);
  };

  const prefRow = (key: keyof typeof prefs, icon: React.ElementType, label: string, sub: string) => (
    <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-500/12 text-gold-400">
        {(() => { const Icon = icon; return <Icon size={14} />; })()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-cream-100">{label}</p>
        <p className="text-[10.5px] text-cream-600">{sub}</p>
      </div>
      <Toggle on={prefs[key]} onChange={() => flip(key, label)} />
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Your practice profile" width={600}>
      {/* identity */}
      <div className="gold-edge mb-5 flex flex-wrap items-center gap-5 rounded-2xl bg-gradient-to-br from-ink-800 to-ink-900 p-5">
        <Avatar src={OWNER.avatar} name={OWNER.name} size={72} ring />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[20px] text-cream-50">{OWNER.name}</p>
          <p className="text-[12.5px] text-cream-400">{OWNER.role} · {OWNER.firm}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="gold"><Award size={10} /> CPA</Badge>
            <Badge tone="sage"><ShieldCheck size={10} /> SOC 2 discipline</Badge>
            <Badge tone="mute">Solo practice since 2018</Badge>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {[
          { v: `${state.clients.length}`, l: "clients" },
          { v: `${entities}`, l: "entities" },
          { v: `${runs}`, l: "agent runs / mo" },
          { v: "31.5h", l: "saved / mo" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-white/8 bg-white/3 p-3 text-center">
            <p className="font-display text-[19px] text-gold-300">{s.v}</p>
            <p className="text-[9.5px] uppercase tracking-widest text-cream-600">{s.l}</p>
          </div>
        ))}
      </div>

      {/* contact rows */}
      <div className="mb-5 grid gap-2 rounded-2xl border border-white/8 bg-white/2 p-4 text-[12.5px] sm:grid-cols-2">
        <p className="flex items-center gap-2.5 text-cream-300"><Mail size={13} className="text-gold-500" /> elena@vossvale.cpa</p>
        <p className="flex items-center gap-2.5 text-cream-300"><Building2 size={13} className="text-gold-500" /> Fee model: fixed + retainers</p>
        <p className="flex items-center gap-2.5 text-cream-300"><MapPin size={13} className="text-gold-500" /> San Francisco · remote-first</p>
        <p className="flex items-center gap-2.5 text-cream-300"><Award size={13} className="text-gold-500" /> Multi-entity & trust specialist</p>
      </div>

      {/* preferences */}
      <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cream-600">How Ordo works for you</p>
      <div className="mb-6 space-y-2">
        {prefRow("brief", BellRing, "Morning brief at 6:30am", "Daily digest of everything the agents did overnight")}
        {prefRow("digest", FileText, "Friday revenue digest", "Pipeline, fees collected, and hours saved — one page")}
        {prefRow("sound", Volume2, "Completion chime", "A soft note when an agent finishes a piece of work")}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10.5px] text-cream-700">Ordo v2.4 · demo workspace · no data leaves your browser</p>
        <button
          onClick={() => { onClose(); onSignOut(); }}
          className="flex items-center gap-2 rounded-xl border border-clay-400/35 bg-clay-500/10 px-4 py-2.5 text-[12.5px] font-semibold text-clay-300 transition hover:bg-clay-500/20"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </Modal>
  );
}
