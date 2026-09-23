import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

/* ------------------------------ toasts ----------------------------- */

interface Toast { id: number; msg: string; icon?: React.ReactNode }
const ToastCtx = createContext<(msg: string, icon?: React.ReactNode) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const push = (msg: string, icon?: React.ReactNode) => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, msg, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex items-center gap-3 rounded-2xl border border-gold-500/30 bg-ink-800/95 px-5 py-3 shadow-luxe backdrop-blur-xl"
            >
              <span className="text-gold-400">{t.icon ?? <CheckCircle2 size={17} />}</span>
              <span className="text-sm font-medium text-cream-100 whitespace-nowrap">{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ------------------------------ avatar ----------------------------- */

const AV_TONES = ["from-[#c9a45c] to-[#7d6330]", "from-[#8fbc96] to-[#3f6a4b]", "from-[#d98d6f] to-[#7a4630]", "from-[#7fa5c7] to-[#3d5875]"];
export function Avatar({ src, name, size = 40, ring = false }: { src?: string; name: string; size?: number; ring?: boolean }) {
  const [err, setErr] = useState(false);
  const initials = name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const tone = AV_TONES[name.length % AV_TONES.length];
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${ring ? "ring-2 ring-gold-500/40" : "ring-1 ring-white/10"}`}
      style={{ width: size, height: size }}
    >
      {src && !err ? (
        <img src={src} alt={name} onError={() => setErr(true)} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${tone} font-display font-medium text-ink-950`} style={{ fontSize: size * 0.38 }}>
          {initials}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ badges ----------------------------- */

export type Tone = "gold" | "sage" | "clay" | "sky" | "mute" | "cream";
const TONES: Record<Tone, string> = {
  gold: "border-gold-500/35 bg-gold-500/12 text-gold-300",
  sage: "border-sage-500/35 bg-sage-500/12 text-sage-300",
  clay: "border-clay-500/35 bg-clay-500/12 text-clay-300",
  sky: "border-sky-400/35 bg-sky-400/12 text-sky-300",
  mute: "border-white/10 bg-white/5 text-cream-400",
  cream: "border-cream-300/25 bg-cream-300/10 text-cream-200",
};
export function Badge({ tone = "mute", children, dot }: { tone?: Tone; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={`chip border ${TONES[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ---------------------------- progress ------------------------------ */

export function Progress({ value, tone = "gold", h = 5 }: { value: number; tone?: "gold" | "sage" | "clay"; h?: number }) {
  const colors = {
    gold: "from-gold-600 to-gold-300",
    sage: "from-sage-500 to-sage-300",
    clay: "from-clay-500 to-clay-300",
  };
  return (
    <div className="w-full overflow-hidden rounded-full bg-white/8" style={{ height: h }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className={`h-full rounded-full bg-gradient-to-r ${colors[tone]}`}
      />
    </div>
  );
}

export function Ring({ value, size = 52, stroke = 4 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = value >= 80 ? "#8fbc96" : value >= 65 ? "#ddc180" : "#d98d6f";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * value) / 100 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" transform={`rotate(90 ${size / 2} ${size / 2})`} className="fill-cream-100 font-display" fontSize={size * 0.28} fontWeight={500}>
        {value}
      </text>
    </svg>
  );
}

/* ----------------------------- countup ------------------------------ */

export function CountUp({ to, prefix = "", suffix = "", decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setV(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <span>
      {prefix}{v.toFixed(decimals)}{suffix}
    </span>
  );
}

/* ------------------------------ modal ------------------------------- */

export function Modal({ open, onClose, title, children, width = 560 }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-[71] max-h-[86vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/10 bg-ink-850 p-7 shadow-luxe"
            style={{ maxWidth: width }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-xl text-cream-50">{title}</h3>
              <button onClick={onClose} className="rounded-full p-2 text-cream-400 transition hover:bg-white/8 hover:text-cream-100">
                <X size={17} />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ drawer ------------------------------ */

export function Drawer({ open, onClose, children, width = 520 }: { open: boolean; onClose: () => void; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm" />
          <motion.div
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="fixed right-0 top-0 z-[71] h-screen w-[calc(100vw-1rem)] overflow-y-auto border-l border-white/10 bg-ink-900 shadow-luxe"
            style={{ maxWidth: width }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ toggle ------------------------------ */

export function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${on ? "bg-gradient-to-r from-gold-600 to-gold-400" : "bg-white/12"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream-50 shadow ${on ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}

/* --------------------------- section head --------------------------- */

export function SectionHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-lg text-cream-50">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-cream-500">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* ---------------------------- empty state --------------------------- */

export function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 px-6 py-12 text-center">
      <div className="mb-3 rounded-2xl bg-gold-500/10 p-3 text-gold-400">{icon}</div>
      <p className="font-display text-base text-cream-100">{title}</p>
      {sub && <p className="mt-1 max-w-xs text-xs leading-relaxed text-cream-500">{sub}</p>}
    </div>
  );
}

/* ---------------------------- form bits ----------------------------- */

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-cream-500">{label}</span>
      {children}
    </label>
  );
}
