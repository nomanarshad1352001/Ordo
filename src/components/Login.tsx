import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles, Workflow, Zap } from "lucide-react";
import { LOGIN_BG } from "../lib/data";

export default function Login({ onEnter }: { onEnter: () => void }) {
  const [email, setEmail] = useState("elena@vossvale.cpa");
  const [pass, setPass] = useState("ordo-demo");
  const [leaving, setLeaving] = useState(false);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLeaving(true);
    setTimeout(onEnter, 650);
  };

  return (
    <motion.div exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.6 }} className="grain relative flex min-h-screen bg-ink-950">
      {/* left: form */}
      <div className="relative z-10 flex w-full flex-col justify-between px-8 py-10 sm:px-14 lg:w-[46%]">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3">
          <div className="gold-edge flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 font-display text-xl font-semibold text-ink-950 shadow-gold">
            O
          </div>
          <div>
            <p className="font-display text-xl tracking-wide text-cream-50">Ordo</p>
            <p className="text-[10px] uppercase tracking-[0.26em] text-cream-600">Practice OS</p>
          </div>
        </motion.div>

        <div className="mx-auto w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400">
              <Sparkles size={13} /> AI-native · built for one
            </p>
            <h1 className="font-display text-[clamp(2.4rem,4vw,3.4rem)] leading-[1.05] text-cream-50">
              Your practice,<br /><span className="gold-text italic">on autopilot.</span>
            </h1>
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-cream-400">
              One calm command center for leads, clients, deadlines, and follow-ups — with automations doing the admin you'd rather never touch.
            </p>
          </motion.div>

          <motion.form initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.7 }} onSubmit={submit} className="mt-9 space-y-4">
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-600" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="input-luxe h-12 w-full pl-11 pr-4 text-sm" placeholder="you@firm.com" />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-600" />
              <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" className="input-luxe h-12 w-full pl-11 pr-4 text-sm" placeholder="Password" />
            </div>
            <button type="submit" className="btn-gold flex h-12 w-full items-center justify-center gap-2 text-sm">
              {leaving ? "Opening your workspace…" : "Enter your workspace"} <ArrowRight size={16} className={leaving ? "animate-pulse" : ""} />
            </button>
            <p className="text-center text-[11.5px] text-cream-600">Demo workspace — any credentials work. No database, nothing stores.</p>
          </motion.form>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-cream-600">
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-gold-500" /> SOC 2 discipline</span>
          <span className="flex items-center gap-1.5"><Workflow size={13} className="text-gold-500" /> 9 systems connected via n8n</span>
          <span className="flex items-center gap-1.5"><Zap size={13} className="text-gold-500" /> 0 manual CRM updates</span>
        </motion.div>
      </div>

      {/* right: image */}
      <div className="relative hidden flex-1 lg:block">
        <motion.img
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          src={LOGIN_BG}
          alt="Warm, elegant office interior"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-ink-950/30" />
        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9 }}
          className="absolute bottom-14 right-12 max-w-sm text-right"
        >
          <p className="font-display text-2xl italic leading-snug text-cream-100">
            “I stopped chasing documents. Ordo does the chasing — I do the advising.”
          </p>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-300">Elena Voss · CPA, Tax Strategist</p>
        </motion.blockquote>
      </div>
    </motion.div>
  );
}
