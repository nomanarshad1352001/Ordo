/* ------------------------------------------------------------------ */
/*  Ordo — data layer (no database; rich in-memory dummy data)        */
/* ------------------------------------------------------------------ */

const NOW = new Date();
export const daysFrom = (n: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + n);
  d.setHours(10 + ((n * 7) % 8), 30, 0, 0);
  return d.toISOString();
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const fmtDateFull = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export const relDate = (iso: string) => {
  const days = Math.round((new Date(iso).setHours(12, 0, 0, 0) - new Date().setHours(12, 0, 0, 0)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < -1) return `${Math.abs(days)}d overdue`;
  return `in ${days}d`;
};

export const isOverdue = (iso: string) => new Date(iso).setHours(23, 59, 59) < Date.now();
export const isToday = (iso: string) => relDate(iso) === "Today";
export const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;
export const moneyFull = (n: number) => `$${n.toLocaleString("en-US")}`;

const px = (id: number, size = 160) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${size}&h=${size}`;

export const OWNER = {
  name: "Elena Voss",
  role: "CPA · Tax Strategist",
  avatar: px(33680700),
  firm: "Voss & Vale Advisory",
};

export const LOGIN_BG =
  "https://images.pexels.com/photos/36126284/pexels-photo-36126284.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1800&h=1200";

/* ------------------------------- types ----------------------------- */

export interface Note { id: string; date: string; author: string; text: string }

export interface Comm {
  id: string; type: "email" | "call" | "meeting" | "portal" | "note";
  dir: "in" | "out" | "self"; date: string; summary: string; needsReply?: boolean;
}

export interface Entity {
  id: string; name: string; type: "S-Corp" | "LLC" | "C-Corp" | "Partnership" | "Trust" | "Individual";
  ein: string; state: string; status: "active" | "pending" | "dissolved";
}

export interface Client {
  id: string; name: string; company: string; email: string; phone: string; avatar?: string;
  status: "active" | "on-hold" | "at-risk"; health: number; since: string; revenue: number;
  tags: string[]; services: string[]; entities: Entity[]; comms: Comm[]; notes: Note[];
  aiSummary: string; aiNext: string; ball: "me" | "client";
}

export type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export interface Lead {
  id: string; name: string; company: string; email: string; phone: string; avatar?: string;
  source: string; service: string; value: number; stage: LeadStage; score: number;
  lastContact: string; nextFollow: string; aiInsight: string; notes: Note[];
}

export type OppStage = "discovery" | "proposal" | "negotiation" | "won" | "lost";
export interface Opp {
  id: string; title: string; person: string; refId?: string; kind: "lead" | "client";
  value: number; prob: number; stage: OppStage; expected: string; services: string[];
  lastActivity: string; avatar?: string;
}

export interface Milestone { id: string; title: string; done: boolean; due: string }
export interface Project {
  id: string; name: string; clientId: string; type: string; fee: number;
  status: "on-track" | "waiting" | "at-risk" | "done"; progress: number; due: string;
  ball: "me" | "client"; waitingNote?: string; milestones: Milestone[];
}

export interface Task {
  id: string; title: string; clientId?: string; projectId?: string; due: string;
  priority: "high" | "medium" | "low"; done: boolean;
  kind: "deadline" | "followup" | "deliverable" | "review" | "admin";
  waitingOn?: string; ai?: boolean;
}

export interface Automation {
  id: string; name: string; desc: string; trigger: string; action: string;
  icon: string; enabled: boolean; runs: number; lastRun: string; saves: string;
}

export interface Notif { id: string; icon: string; title: string; body: string; time: string; read: boolean }

/* ------------------------------ clients ---------------------------- */

export const CLIENTS: Client[] = [
  {
    id: "c1", name: "Marcus Hale", company: "Hale & Harbor Hospitality", email: "marcus@haleharbor.com",
    phone: "(415) 555-0132", avatar: px(38740728), status: "active", health: 92, since: "2021",
    revenue: 38400, ball: "me",
    tags: ["Restaurant group", "Multi-entity"], services: ["S-Corp returns", "Bookkeeping", "Advisory"],
    entities: [
      { id: "e1", name: "Hale & Harbor Group, Inc.", type: "S-Corp", ein: "47-2209153", state: "CA", status: "active" },
      { id: "e2", name: "Harbor Table Co. LLC", type: "LLC", ein: "84-3310872", state: "CA", status: "active" },
      { id: "e3", name: "H&H Real Estate Holdings LLC", type: "LLC", ein: "92-1187430", state: "NV", status: "active" },
    ],
    comms: [
      { id: "m1", type: "portal", dir: "in", date: daysFrom(-1), summary: "Uploaded November P&Ls for all three locations to the portal.", needsReply: false },
      { id: "m2", type: "email", dir: "out", date: daysFrom(-2), summary: "Sent Q4 estimated payment schedule and Section 179 note for the new kitchen build-out." },
      { id: "m3", type: "call", dir: "in", date: daysFrom(-5), summary: "Marcus called re: second location liquor license entity — advised keeping it under Harbor Table." },
      { id: "m4", type: "meeting", dir: "out", date: daysFrom(-12), summary: "Year-end planning: agreed to accelerate $48k of equipment purchases into this fiscal year." },
    ],
    notes: [
      { id: "n1", date: daysFrom(-2), author: "AI Scribe", text: "Marcus prefers decisions framed as tax-dollar outcomes, not accounting terms. Key motivator: funding a third location in Q3." },
      { id: "n2", date: daysFrom(-10), author: "Elena", text: "Flag: Harbor Table payroll service charges creeping up — review at Q1 close." },
    ],
    aiSummary: "Three-entity restaurant group in excellent standing. Q4 estimates filed on time, books 94% reconciled. Expansion-minded — responsive to proactive strategy.",
    aiNext: "Pre-draft the 1120-S for H&H Group now that Nov P&Ls are in; Marcus signs quickly when returns arrive early.",
  },
  {
    id: "c2", name: "Dr. Priya Raman", company: "Raman Medspa", email: "priya@ramanmedspa.com",
    phone: "(628) 555-0177", avatar: px(7717254), status: "active", health: 88, since: "2022",
    revenue: 27900, ball: "client",
    tags: ["Medical", "High-growth"], services: ["Bookkeeping", "Payroll", "Tax planning"],
    entities: [
      { id: "e4", name: "Raman Medspa LLC", type: "S-Corp", ein: "88-2041947", state: "CA", status: "active" },
      { id: "e5", name: "Raman Skin Science LLC", type: "LLC", ein: "93-4412095", state: "CA", status: "pending" },
    ],
    comms: [
      { id: "m5", type: "email", dir: "out", date: daysFrom(-3), summary: "Sent document request list for December close — still waiting on merchant processor statements." },
      { id: "m6", type: "call", dir: "in", date: daysFrom(-8), summary: "Priya is weighing a reasonable-comp adjustment before year end. Model sent for review." },
    ],
    notes: [{ id: "n3", date: daysFrom(-4), author: "AI Scribe", text: "Response pattern: replies within a day to texts, slower on email. Use SMS-style nudges for doc collection." }],
    aiSummary: "Fast-growing medspa, second product entity in formation. Books healthy; reasonable-comp study in flight. Currently waiting on processor statements.",
    aiNext: "Send a Document Chaser nudge for the merchant statements — close can't finish without them.",
  },
  {
    id: "c3", name: "David Okafor", company: "Okafor Dental Partners", email: "david@okafordental.com",
    phone: "(510) 555-0119", avatar: px(10836222), status: "at-risk", health: 64, since: "2019",
    revenue: 41200, ball: "client",
    tags: ["Dental", "Two locations"], services: ["Tax returns", "Advisory", "Cost segregation"],
    entities: [
      { id: "e6", name: "Okafor Dental Partners PC", type: "S-Corp", ein: "32-1098246", state: "CA", status: "active" },
      { id: "e7", name: "ODP Realty LLC", type: "LLC", ein: "81-3302847", state: "CA", status: "active" },
    ],
    comms: [
      { id: "m7", type: "email", dir: "in", date: daysFrom(-6), summary: "Asked whether the new cone-beam scanner qualifies for full expensing — answered yes under current limits.", needsReply: false },
      { id: "m8", type: "portal", dir: "out", date: daysFrom(-9), summary: "Re-requested September–November bank statements (2nd request). No response yet." },
    ],
    notes: [{ id: "n4", date: daysFrom(-6), author: "Elena", text: "David is deal-focused, hates admin. Keep asks to ONE action per email or they stall." }],
    aiSummary: "Long-tenured, high-value client. Cost-seg study opportunity on the realty entity. Engagement risk: document collection has stalled twice.",
    aiNext: "Escalate with a single-ask email for bank statements — phrase as the only thing between him and finished returns.",
  },
  {
    id: "c4", name: "Sofia Lindqvist", company: "Lindqvist Interiors", email: "sofia@lindqvist.design",
    phone: "(415) 555-0148", avatar: px(11701102), status: "active", health: 84, since: "2023",
    revenue: 12600, ball: "me",
    tags: ["Design studio"], services: ["1040 + Schedule C", "Quarterly estimates"],
    entities: [{ id: "e8", name: "Lindqvist Interiors", type: "Individual", ein: "—", state: "CA", status: "active" }],
    comms: [
      { id: "m9", type: "email", dir: "out", date: daysFrom(-1), summary: "Sent Q4 safe-harbor voucher and a note on her new studio lease deduction." },
    ],
    notes: [],
    aiSummary: "Solo design studio, pristine records, low-touch. Candidate for an S-corp election analysis once profit crosses ~$120k.",
    aiNext: "Nothing blocking. Next touchpoint: January organize-early note pointing at her P&L trend.",
  },
  {
    id: "c5", name: "Tom Beckett", company: "Beckett Construction", email: "tom@beckettbuilds.com",
    phone: "(707) 555-0162", avatar: px(31422830), status: "on-hold", health: 58, since: "2020",
    revenue: 19800, ball: "client",
    tags: ["Construction", "Job costing"], services: ["Payroll cleanup", "1099s", "Sales tax"],
    entities: [
      { id: "e9", name: "Beckett Construction Inc.", type: "S-Corp", ein: "45-7731902", state: "CA", status: "active" },
      { id: "e10", name: "Beckett Equipment Leasing LLC", type: "LLC", ein: "87-2201648", state: "CA", status: "active" },
    ],
    comms: [
      { id: "m10", type: "call", dir: "in", date: daysFrom(-11), summary: "Tom disputed the payroll cleanup scope — agreed to pause at his request until the Martinez job closes." },
    ],
    notes: [{ id: "n5", date: daysFrom(-11), author: "Elena", text: "Scope conversation got tense. Follow up in writing only, summarize everything." }],
    aiSummary: "Payroll cleanup paused at client request. Relationship needs a careful re-open; revenue concentration makes him worth saving.",
    aiNext: "Send the written scope recap Tom asked for — automation has it drafted and waiting for your approval.",
  },
  {
    id: "c6", name: "Jordan Reyes", company: "Reyes Capital Management", email: "jordan@reyescap.com",
    phone: "(628) 555-0121", avatar: px(33799456), status: "active", health: 95, since: "2022",
    revenue: 54000, ball: "me",
    tags: ["RIA", "CFO retainer"], services: ["Monthly CFO advisory", "Entity tax", "K-1 review"],
    entities: [
      { id: "e11", name: "Reyes Capital Management LLC", type: "LLC", ein: "85-1149820", state: "CA", status: "active" },
      { id: "e12", name: "Reyes Family Partners LP", type: "Partnership", ein: "92-5501337", state: "DE", status: "active" },
    ],
    comms: [
      { id: "m11", type: "meeting", dir: "out", date: daysFrom(-2), summary: "Monthly CFO call — reviewed burn multiple and 2026 distribution strategy. Minutes filed by AI Scribe." },
      { id: "m12", type: "email", dir: "in", date: daysFrom(-4), summary: "Forwarded a K-1 from an outside fund; asked for basis-tracking treatment." },
    ],
    notes: [],
    aiSummary: "Highest-value relationship. Retainer client, refers aggressively. Wants a quarterly strategy memo — the first one is due this week.",
    aiNext: "Deliver the Q1 strategy memo early; Jordan forwards impressive work to two prospective LPs.",
  },
  {
    id: "c7", name: "William Ashford", company: "Ashford Family Office", email: "w.ashford@ashfordfo.com",
    phone: "(415) 555-0104", avatar: px(27412592), status: "active", health: 91, since: "2018",
    revenue: 62000, ball: "me",
    tags: ["Family office", "Trusts"], services: ["1041 trust returns", "Gift tax", "Charitable strategy"],
    entities: [
      { id: "e13", name: "Ashford Revocable Trust", type: "Trust", ein: "94-6201183", state: "CA", status: "active" },
      { id: "e14", name: "Ashford Dynasty Trust", type: "Trust", ein: "94-6201191", state: "SD", status: "active" },
      { id: "e15", name: "Ashford Holdings LP", type: "Partnership", ein: "26-3378190", state: "DE", status: "active" },
      { id: "e16", name: "Ashford Foundation", type: "C-Corp", ein: "20-8812455", state: "CA", status: "active" },
    ],
    comms: [
      { id: "m13", type: "portal", dir: "in", date: daysFrom(-1), summary: "Trustee signed the 1041 engagement letters electronically." },
      { id: "m14", type: "email", dir: "out", date: daysFrom(-6), summary: "Sent CRT feasibility memo for the planned art donation." },
    ],
    notes: [],
    aiSummary: "Four-entity family office, decade-strong relationship. All engagement letters signed. Trust returns in progress and ahead of schedule.",
    aiNext: "K-1s from the LP arrive mid-January — pre-build the 1041 workpapers now to impress with a February delivery.",
  },
  {
    id: "c8", name: "Grace Nakamura", company: "Nakamura Law PLLC", email: "grace@nakamuralaw.com",
    phone: "(650) 555-0188", avatar: px(34761515), status: "active", health: 78, since: "2023",
    revenue: 9800, ball: "me",
    tags: ["Law firm"], services: ["1040", "Estimate vouchers"],
    entities: [{ id: "e17", name: "Nakamura Law PLLC", type: "LLC", ein: "87-9021534", state: "CA", status: "active" }],
    comms: [
      { id: "m15", type: "email", dir: "in", date: daysFrom(-2), summary: "Confirmed extension was filed; asked about the Q1 estimate amount." },
    ],
    notes: [],
    aiSummary: "Newer solo-practice client. Extension filed correctly; safe-harbor estimates set. Watch trust-account commingling question from intake.",
    aiNext: "Answer the Q1 estimate question today — 2-minute reply, high perceived responsiveness.",
  },
];

/* ------------------------------- leads ----------------------------- */

export const LEADS: Lead[] = [
  {
    id: "l1", name: "Noah Kim", company: "Kim's Kitchen (3-unit franchise)", email: "noah@kimskitchen.co",
    phone: "(415) 555-0169", avatar: px(31420959), source: "Client referral — Marcus Hale", service: "S-Corp setup + annual tax",
    value: 4800, stage: "qualified", score: 91, lastContact: daysFrom(-1), nextFollow: daysFrom(0),
    aiInsight: "Referred by your happiest client and opening a third unit. Score is high because he replied within 2 hours — strike now.",
    notes: [{ id: "nl1", date: daysFrom(-2), author: "AI Intake", text: "Wants fees fixed, not hourly. Currently on a national chain tax prep service; switching for strategy, not price." }],
  },
  {
    id: "l2", name: "Rosa Castellano", company: "Castellano Auto Group", email: "rosa@castellanoauto.com",
    phone: "(510) 555-0142", avatar: px(7752809), source: "Chamber mixer", service: "Multi-entity tax + dealership accounting",
    value: 12000, stage: "proposal", score: 84, lastContact: daysFrom(-2), nextFollow: daysFrom(1),
    aiInsight: "Proposal viewed 4 times since Tuesday and forwarded once — likely to a business partner. Follow up while it's warm.",
    notes: [],
  },
  {
    id: "l3", name: "Victor Delacroix", company: "Delacroix Winery", email: "victor@delacroixwine.com",
    phone: "(707) 555-0127", source: "Attorney referral", service: "Ag accounting + vineyard entity",
    value: 9000, stage: "negotiation", score: 77, lastContact: daysFrom(-3), nextFollow: daysFrom(0),
    aiInsight: "Negotiating on fee, not fit. Offer a phased start (books first, tax in January) to protect the engagement value.",
    notes: [{ id: "nl2", date: daysFrom(-3), author: "Elena", text: "Wife handles books; she'll be the real champion. Address onboarding email to both." }],
  },
  {
    id: "l4", name: "Anita Whelan", company: "The Whelan Family", email: "anita.whelan@gmail.com",
    phone: "(628) 555-0150", avatar: px(7752818), source: "Website", service: "Estate, trust + personal returns",
    value: 7500, stage: "proposal", score: 72, lastContact: daysFrom(-4), nextFollow: daysFrom(2),
    aiInsight: "Comparing you against a large trust company. Your edge is access to the principal — say so plainly.",
    notes: [],
  },
  {
    id: "l5", name: "Harper Quinn", company: "Quinn Goods (e-commerce)", email: "harper@quinngoods.shop",
    phone: "(415) 555-0195", avatar: px(7752788), source: "Cold inbound", service: "Sales tax cleanup + 1040",
    value: 3200, stage: "contacted", score: 58, lastContact: daysFrom(-6), nextFollow: daysFrom(3),
    aiInsight: "Sales-tax exposure discussion made her quiet. Send the calm, plain-English remediation plan email the AI drafted.",
    notes: [],
  },
  {
    id: "l6", name: "Lena Marsh", company: "Marsh Photography LLC", email: "lena@marshphoto.com",
    phone: "(650) 555-0113", avatar: px(36434829), source: "Instagram", service: "Bookkeeping + entity setup",
    value: 2400, stage: "new", score: 64, lastContact: daysFrom(0), nextFollow: daysFrom(1),
    aiInsight: "Brand-new and organized — signed the intake form within the hour. Small fee but likely a decade-long client.",
    notes: [],
  },
  {
    id: "l7", name: "Maya Sorensen", company: "Sorensen Yoga Collective", email: "maya@sorensenyoga.com",
    phone: "(415) 555-0171", avatar: px(8837498), source: "Website", service: "New studio tax package",
    value: 1800, stage: "contacted", score: 41, lastContact: daysFrom(-8), nextFollow: daysFrom(-2),
    aiInsight: "Follow-up is 2 days overdue and the trail is cooling. One warm, specific nudge or consciously deprioritize.",
    notes: [],
  },
];

/* --------------------------- opportunities -------------------------- */

export const OPPS: Opp[] = [
  { id: "o1", title: "Franchise S-corp + tax package", person: "Noah Kim", kind: "lead", refId: "l1", value: 4800, prob: 60, stage: "discovery", expected: daysFrom(9), services: ["Entity setup", "1120-S", "Payroll"], lastActivity: daysFrom(-1), avatar: px(31420959) },
  { id: "o2", title: "New studio tax package", person: "Maya Sorensen", kind: "lead", refId: "l7", value: 1800, prob: 35, stage: "discovery", expected: daysFrom(14), services: ["1040", "Bookkeeping"], lastActivity: daysFrom(-4), avatar: px(8837498) },
  { id: "o3", title: "Dealership multi-entity engagement", person: "Rosa Castellano", kind: "lead", refId: "l2", value: 12000, prob: 70, stage: "proposal", expected: daysFrom(6), services: ["Multi-entity tax", "Advisory"], lastActivity: daysFrom(-1), avatar: px(7752809) },
  { id: "o4", title: "Sales tax remediation + 1040", person: "Harper Quinn", kind: "lead", refId: "l5", value: 3200, prob: 45, stage: "proposal", expected: daysFrom(10), services: ["Sales tax", "1040"], lastActivity: daysFrom(-2), avatar: px(7752788) },
  { id: "o5", title: "Winery ag accounting engagement", person: "Victor Delacroix", kind: "lead", refId: "l3", value: 9000, prob: 65, stage: "negotiation", expected: daysFrom(4), services: ["Ag accounting", "Entity tax"], lastActivity: daysFrom(-1) },
  { id: "o6", title: "Whelan estate & trust prep", person: "Anita Whelan", kind: "lead", refId: "l4", value: 7500, prob: 55, stage: "negotiation", expected: daysFrom(7), services: ["1041", "Gift tax"], lastActivity: daysFrom(0), avatar: px(7752818) },
  { id: "o7", title: "Medspa Q1 advisory sprint", person: "Dr. Priya Raman", kind: "client", refId: "c2", value: 6000, prob: 100, stage: "won", expected: daysFrom(-2), services: ["Advisory"], lastActivity: daysFrom(-2), avatar: px(7717254) },
  { id: "o8", title: "Quarterly sales tax filing", person: "Beachside Boutique", kind: "lead", value: 1200, prob: 0, stage: "lost", expected: daysFrom(-9), services: ["Sales tax"], lastActivity: daysFrom(-9) },
];

/* ------------------------------ projects --------------------------- */

export const PROJECTS: Project[] = [
  {
    id: "p1", name: "2025 S-Corp Returns (×3 entities)", clientId: "c1", type: "Tax returns", fee: 6800,
    status: "on-track", progress: 72, due: daysFrom(5), ball: "me",
    milestones: [
      { id: "p1m1", title: "Books reconciled through Nov", done: true, due: daysFrom(-6) },
      { id: "p1m2", title: "Fixed-asset schedules", done: true, due: daysFrom(-2) },
      { id: "p1m3", title: "Draft returns to review", done: false, due: daysFrom(2) },
      { id: "p1m4", title: "Client review & e-sign", done: false, due: daysFrom(4) },
    ],
  },
  {
    id: "p2", name: "December close + Q4 estimates", clientId: "c2", type: "Bookkeeping", fee: 2400,
    status: "waiting", progress: 45, due: daysFrom(9), ball: "client",
    waitingNote: "Waiting on merchant processor statements (requested 3 days ago)",
    milestones: [
      { id: "p2m1", title: "Bank feeds reconciled", done: true, due: daysFrom(-4) },
      { id: "p2m2", title: "Merchant statements received", done: false, due: daysFrom(-1) },
      { id: "p2m3", title: "Close packet to Priya", done: false, due: daysFrom(8) },
    ],
  },
  {
    id: "p3", name: "2025 tax plan + cost-seg scoping", clientId: "c3", type: "Advisory", fee: 5500,
    status: "at-risk", progress: 30, due: daysFrom(12), ball: "client",
    waitingNote: "Bank statements requested twice — 9 days silent",
    milestones: [
      { id: "p3m1", title: "Prior-year review", done: true, due: daysFrom(-8) },
      { id: "p3m2", title: "Bank statements received", done: false, due: daysFrom(-5) },
      { id: "p3m3", title: "Cost-seg proposal", done: false, due: daysFrom(10) },
    ],
  },
  {
    id: "p4", name: "Q1 CFO strategy memo", clientId: "c6", type: "Advisory", fee: 3000,
    status: "on-track", progress: 55, due: daysFrom(3), ball: "me",
    milestones: [
      { id: "p4m1", title: "KPI dashboard refreshed", done: true, due: daysFrom(-3) },
      { id: "p4m2", title: "Distribution scenarios modeled", done: false, due: daysFrom(1) },
      { id: "p4m3", title: "Memo delivered", done: false, due: daysFrom(3) },
    ],
  },
  {
    id: "p5", name: "2025 Trust returns (1041 ×2)", clientId: "c7", type: "Tax returns", fee: 7200,
    status: "on-track", progress: 80, due: daysFrom(4), ball: "me",
    milestones: [
      { id: "p5m1", title: "Engagement letters signed", done: true, due: daysFrom(-7) },
      { id: "p5m2", title: "Trust ledgers imported", done: true, due: daysFrom(-3) },
      { id: "p5m3", title: "K-1 packages to beneficiaries", done: false, due: daysFrom(3) },
    ],
  },
  {
    id: "p6", name: "Payroll cleanup & 1099 run", clientId: "c5", type: "Cleanup", fee: 4600,
    status: "waiting", progress: 20, due: daysFrom(15), ball: "client",
    waitingNote: "Paused at client request — scope recap owed to Tom",
    milestones: [
      { id: "p6m1", title: "Q1–Q3 filings pulled", done: true, due: daysFrom(-14) },
      { id: "p6m2", title: "Scope recap approved", done: false, due: daysFrom(2) },
      { id: "p6m3", title: "1099 vendor list reconciled", done: false, due: daysFrom(13) },
    ],
  },
  {
    id: "p7", name: "2025 1040 extension + estimates", clientId: "c8", type: "Tax returns", fee: 1850,
    status: "done", progress: 100, due: daysFrom(-3), ball: "me",
    milestones: [
      { id: "p7m1", title: "Extension e-filed", done: true, due: daysFrom(-9) },
      { id: "p7m2", title: "Safe-harbor vouchers issued", done: true, due: daysFrom(-3) },
    ],
  },
];

/* ------------------------------- tasks ----------------------------- */

export const TASKS: Task[] = [
  { id: "t1", title: "Answer Grace's Q1 estimate question (2-min reply)", clientId: "c8", due: daysFrom(-1), priority: "high", done: false, kind: "followup", ai: true },
  { id: "t2", title: "Approve the Beckett scope recap drafted by automation", clientId: "c5", projectId: "p6", due: daysFrom(-2), priority: "high", done: false, kind: "review", ai: true },
  { id: "t3", title: "Review draft 1120-S — Hale & Harbor Group", clientId: "c1", projectId: "p1", due: daysFrom(0), priority: "high", done: false, kind: "review" },
  { id: "t4", title: "Follow up with Noah Kim — franchise S-corp engagement", clientId: undefined, due: daysFrom(0), priority: "high", done: false, kind: "followup", ai: true },
  { id: "t5", title: "Model Reyes Capital distribution scenarios", clientId: "c6", projectId: "p4", due: daysFrom(0), priority: "medium", done: false, kind: "deliverable" },
  { id: "t6", title: "Send single-ask email to David Okafor (bank statements)", clientId: "c3", projectId: "p3", due: daysFrom(0), priority: "high", done: false, kind: "followup", ai: true },
  { id: "t7", title: "Nudge Dr. Raman for merchant statements", clientId: "c2", projectId: "p2", due: daysFrom(1), priority: "medium", done: false, kind: "followup" },
  { id: "t8", title: "Sign and return Delacroix phased-start proposal", due: daysFrom(1), priority: "high", done: false, kind: "deliverable" },
  { id: "t9", title: "Draft Ashford beneficiary K-1 packages", clientId: "c7", projectId: "p5", due: daysFrom(2), priority: "medium", done: false, kind: "deliverable" },
  { id: "t10", title: "Warm nudge to Maya Sorensen (cooling lead)", due: daysFrom(2), priority: "low", done: false, kind: "followup", ai: true },
  { id: "t11", title: "Quarterly sales-tax check: Harbor Table Co.", clientId: "c1", due: daysFrom(3), priority: "medium", done: false, kind: "deadline" },
  { id: "t12", title: "Record CPA license renewal attestation", due: daysFrom(4), priority: "low", done: false, kind: "admin" },
  { id: "t13", title: "Review AI-drafted remediation plan for Harper Quinn", due: daysFrom(3), priority: "medium", done: false, kind: "review", ai: true },
  { id: "t14", title: "Pre-build Ashford 1041 workpapers", clientId: "c7", projectId: "p5", due: daysFrom(6), priority: "low", done: false, kind: "deliverable" },
  { id: "t15", title: "January organizer notes: Sofia Lindqvist", clientId: "c4", due: daysFrom(8), priority: "low", done: false, kind: "admin" },
  { id: "t16", title: "File Hale & Harbor Q4 estimate confirmations", clientId: "c1", due: daysFrom(-4), priority: "medium", done: true, kind: "admin" },
  { id: "t17", title: "Send Nakamura extension confirmation letter", clientId: "c8", due: daysFrom(-3), priority: "medium", done: true, kind: "deliverable" },
  { id: "t18", title: "Weekly pipeline review (auto-compiled by Ordo)", due: daysFrom(-1), priority: "low", done: true, kind: "review", ai: true },
  { id: "t19", title: "Waiting: Marcus to sign engagement addendum", clientId: "c1", due: daysFrom(5), priority: "low", done: false, kind: "followup", waitingOn: "Marcus Hale" },
  { id: "t20", title: "Waiting: outside fund K-1 for Reyes basis schedule", clientId: "c6", due: daysFrom(10), priority: "low", done: false, kind: "followup", waitingOn: "Fund administrator" },
];

/* ---------------------------- automations --------------------------- */

export const AUTOMATIONS: Automation[] = [
  { id: "a1", name: "Smart Intake", desc: "Scores every new inquiry, drafts a warm reply, and opens a follow-up task — before you even see the email.", trigger: "New inquiry received", action: "Score + draft reply + create task", icon: "Inbox", enabled: true, runs: 34, lastRun: "2h ago", saves: "~25 min/wk" },
  { id: "a2", name: "Document Chaser", desc: "Politely nudges clients for missing documents on a 3-day cadence, escalating tone only when ignored.", trigger: "Document request unanswered", action: "Send graduated nudge sequence", icon: "FileSearch", enabled: true, runs: 51, lastRun: "44m ago", saves: "~3.5 hrs/wk" },
  { id: "a3", name: "Deadline Sentinel", desc: "Watches every filing date across all entities and reshuffles your task list 14, 7 and 2 days out.", trigger: "Approaching deadline", action: "Re-prioritize tasks + brief you", icon: "AlarmClock", enabled: true, runs: 118, lastRun: "6h ago", saves: "~2 hrs/wk" },
  { id: "a4", name: "Meeting Scribe", desc: "Transcribes calls, files a summary on the client record, and pulls out commitments you made — as tasks.", trigger: "Call or meeting ends", action: "File summary + extract tasks", icon: "Mic", enabled: true, runs: 22, lastRun: "1d ago", saves: "~2 hrs/wk" },
  { id: "a5", name: "Invoice Autopilot", desc: "Drafts the invoice the moment a project hits 'delivered', matched to the engagement letter terms.", trigger: "Project marked delivered", action: "Draft invoice for approval", icon: "Receipt", enabled: true, runs: 19, lastRun: "3d ago", saves: "~1 hr/wk" },
  { id: "a6", name: "Follow-up Radar", desc: "Flags any lead or client going quiet for 5+ days and drafts the exact re-engagement message.", trigger: "5 days of silence", action: "Flag + draft nudge", icon: "Radar", enabled: true, runs: 27, lastRun: "5h ago", saves: "~1.5 hrs/wk" },
  { id: "a7", name: "Proposal Drafter", desc: "Turns your call notes into a branded proposal with fixed-fee pricing pulled from your rate card.", trigger: "Discovery call logged", action: "Generate proposal draft", icon: "PenLine", enabled: false, runs: 8, lastRun: "1w ago", saves: "~45 min each" },
  { id: "a8", name: "K-1 Courier", desc: "Delivers K-1s through the secure portal and chases e-signatures so you never do.", trigger: "Return marked complete", action: "Deliver + chase signatures", icon: "Send", enabled: false, runs: 12, lastRun: "2w ago", saves: "~2 hrs/filing season weekly" },
];

/* ---------------------------- notifications ------------------------- */

export const NOTIFS: Notif[] = [
  { id: "no1", icon: "FileSearch", title: "Document Chaser", body: "Dr. Raman viewed your statement request — a nudge is scheduled if no upload by tonight.", time: "44m", read: false },
  { id: "no2", icon: "Radar", title: "Follow-up Radar", body: "Rosa Castellano re-opened your proposal for the 4th time. Suggested nudge is drafted.", time: "2h", read: false },
  { id: "no3", icon: "AlarmClock", title: "Deadline Sentinel", body: "Hale & Harbor draft returns moved up your queue — filing date in 5 days.", time: "6h", read: false },
  { id: "no4", icon: "Mic", title: "Meeting Scribe", body: "Reyes Capital call summary filed; 2 commitments extracted as tasks.", time: "1d", read: true },
];

/* ------------------------------ briefs ----------------------------- */

export const BRIEF_CLOSERS = [
  "Move the two overdue replies first — they unblock four people downstream.",
  "Your highest-leverage hour today is the Reyes memo; everything else is noise.",
  "Three follow-ups are sitting in draft waiting for your approval — clear those and the day runs itself.",
  "Noah Kim is your warmest opportunity in months. One personal note today likely closes it.",
];

/* ------------------------- ai suggestion queue ------------------------ */

export interface Suggestion {
  id: string; title: string; reason: string; agent: string;
  clientId?: string; kind: Task["kind"]; due: string; priority: Task["priority"]; confidence: number;
}

export const SUGGESTIONS: Suggestion[] = [
  { id: "s1", title: "Re-ask David Okafor for bank statements — single-ask email ready", reason: "Document Chaser: 9 days silent, drafting slate blue. Escalation window hit this morning.", agent: "Document Chaser", clientId: "c3", kind: "followup", due: daysFrom(0), priority: "high", confidence: 94 },
  { id: "s2", title: "Send Noah Kim the fixed-fee engagement letter while he's warm", reason: "Opened your last email 6 minutes after it landed. Follow-up Radar flags a 3-day decay curve.", agent: "Follow-up Radar", kind: "followup", due: daysFrom(0), priority: "high", confidence: 91 },
  { id: "s3", title: "Review costing model before the Reyes CFO memo goes out Friday", reason: "Meeting Scribe extracted 2 commitments you made on the call — this one is due first.", agent: "Meeting Scribe", clientId: "c6", kind: "review", due: daysFrom(1), priority: "medium", confidence: 88 },
  { id: "s4", title: "December estimated payment confirmation letters — 3 entities", reason: "Deadline Sentinel: confirmations usually go out before month-end; none logged yet.", agent: "Deadline Sentinel", clientId: "c1", kind: "admin", due: daysFrom(2), priority: "low", confidence: 82 },
];

/* ---------------------------- ai action log ---------------------------- */

export interface AIAction {
  id: string; agent: string; text: string; clientId?: string; time: string; canUndo: boolean; undone?: boolean;
}

export const AI_ACTIONS: AIAction[] = [
  { id: "x1", agent: "Inbox Watcher", text: "Filed Raman's merchant-statements thread to the Medspa project (96% match) and marked the close unblocked", clientId: "c2", time: "26m", canUndo: true },
  { id: "x2", agent: "Smart Intake", text: "Scored new inquiry from Lena Marsh (64), drafted welcome, queued discovery-call link", time: "1h", canUndo: true },
  { id: "x3", agent: "Meeting Scribe", text: "Filed Reyes Capital call summary and extracted 2 commitments as tasks", clientId: "c6", time: "3h", canUndo: true },
  { id: "x4", agent: "Document Chaser", text: "Sent nudge #2 to Beckett Construction re: payroll scope recap", clientId: "c5", time: "5h", canUndo: true },
  { id: "x5", agent: "K-1 Courier", text: "Delivered Ashford engagement letters to the portal; both e-signed within the hour", clientId: "c7", time: "1d", canUndo: false },
  { id: "x6", agent: "Invoice Autopilot", text: "Drafted invoice RV-1042 for the Nakamura extension engagement — awaiting your approval", clientId: "c8", time: "1d", canUndo: true },
];

/* ------------------------------ inbox hub ------------------------------ */

export interface InboxItem {
  id: string; from: string; email: string; subject: string; snippet: string; received: string;
  clientId?: string; projectId?: string; confidence: number; intent: string;
  draft: string; extractedTask?: string; status?: "pending" | "filed" | "replied";
}

export const INBOX: InboxItem[] = [
  {
    id: "i1", from: "Dr. Priya Raman", email: "priya@ramanmedspa.com", subject: "Merchant statements — finally!", snippet: "Attached are Nov and Dec from Stripe and the Amex portal. Also — do I need to do anything about the new product entity before January?", received: daysFrom(0),
    clientId: "c2", projectId: "p2", confidence: 96, intent: "Document delivery + question",
    draft: "Wonderful — statements received and already reconciled, Priya. On the product entity: nothing required this year; we elect treatment in January. I'll fold it into the Q1 planning call.",
    extractedTask: "Attach statements to project p2 and mark milestone received",
  },
  {
    id: "i2", from: "Noah Kim", email: "noah@kimskitchen.co", subject: "Re: Franchise S-corp numbers", snippet: "This looks great. Two questions: does the fee cover the payroll setup too, and how fast can we be live before my Q1 payroll run?", received: daysFrom(0),
    clientId: undefined, confidence: 88, intent: "Buying question — pricing",
    draft: "It does — payroll registration and the first filing are inside the fixed fee, Noah. From signature to live payroll is typically 10 business days, so a signature this week protects your Q1 run comfortably.",
    extractedTask: "Send fixed-fee engagement letter to Noah Kim",
  },
  {
    id: "i3", from: "William Ashford", email: "w.ashford@ashfordfo.com", subject: "Art donation appraisal received", snippet: "The CRT appraisal came in at $612k. Forwarding for your records — let me know if it changes the gifting timeline we discussed.", received: daysFrom(-1),
    clientId: "c7", confidence: 93, intent: "Document delivery",
    draft: "Received and filed, William. $612k holds the timeline exactly as modeled — no change to the December CRT window. I'll confirm once the trustee countersigns.",
  },
  {
    id: "i4", from: "Jordan Reyes", email: "jordan@reyescap.com", subject: "FW: Fund III K-1 draft", snippet: "Draft K-1 from the outside fund — box 1 looks off to me. Worth a look before your memo?", received: daysFrom(-1),
    clientId: "c6", projectId: "p4", confidence: 91, intent: "Technical question",
    draft: "Agreed — the operating-loss treatment in box 1 ignores the guaranteed payments. I'll reconcile it against the LPA and note the correction in Friday's memo.",
    extractedTask: "Reconcile Fund III draft K-1 against LPA before CFO memo",
  },
  {
    id: "i5", from: "QuickBooks Online", email: "no-reply@quickbooks.intuit.com", subject: "Bank feed disconnected: Harbor Table Co.", snippet: "The Chase connection for Harbor Table Co. LLC needs re-authorization. Transactions will stop importing until reconnected.", received: daysFrom(-1),
    clientId: "c1", confidence: 98, intent: "System alert",
    draft: "Re-authorization link sent to Marcus with a one-tap walkthrough — auto-replied on your behalf.",
    extractedTask: "Verify Chase feed resumed for Harbor Table Co.",
  },
  {
    id: "i6", from: "Rosa Castellano", email: "rosa@castellanoauto.com", subject: "Proposal — moving forward", snippet: "My partner and I reviewed it last night. We're in. Send the engagement letter whenever you're ready and we'll get you the prior-year returns Friday.", received: daysFrom(-2),
    clientId: undefined, confidence: 97, intent: "Deal accepted",
    draft: "Fantastic news, Rosa — engagement letter is on its way now, with the document checklist already pre-filled for Friday. Welcome aboard.",
    status: "pending" as const,
  },
];

/* ----------------------------- integrations ---------------------------- */

export interface Integration {
  id: string; name: string; category: "Workflow engine" | "Inbox & calendar" | "Money" | "Documents" | "Intelligence";
  desc: string; connected: boolean; icon: string; lastSync: string; flows: number; note: string;
}

export const INTEGRATIONS: Integration[] = [
  { id: "g1", name: "n8n Cloud", category: "Workflow engine", desc: "24 active flows watching Gmail, portal and calendar triggers — the nervous system of the hub.", connected: true, icon: "Workflow", lastSync: "live", flows: 412, note: "v1.72 · 0 failed runs this week" },
  { id: "g2", name: "Gmail", category: "Inbox & calendar", desc: "Inbound mail is read, matched to clients at 90%+ confidence, and drafted on arrival.", connected: true, icon: "Mail", lastSync: "2m ago", flows: 168, note: "oauth2 · scopes: read, send, labels" },
  { id: "g3", name: "Google Calendar", category: "Inbox & calendar", desc: "Meetings auto-log to client records; invite links flow into every welcome sequence.", connected: true, icon: "Calendar", lastSync: "9m ago", flows: 44, note: "oauth2 · primary calendar" },
  { id: "g4", name: "Your AI Email Assistant", category: "Intelligence", desc: "Plug the assistant you're building straight into the hub — replies, summaries and tasks land on the right client automatically.", connected: false, icon: "Bot", lastSync: "—", flows: 0, note: "webhook endpoint ready: /hooks/ordo/email" },
  { id: "g5", name: "QuickBooks Online", category: "Money", desc: "Bank feeds and P&Ls sync nightly; reconciliation deltas appear on project cards.", connected: true, icon: "BookOpen", lastSync: "1h ago", flows: 87, note: "realm: Voss & Vale · 9 entities" },
  { id: "g6", name: "Plaid Bank Feeds", category: "Money", desc: "Alerts like feed disconnects arrive in the hub and become tasks without touching email.", connected: true, icon: "Landmark", lastSync: "31m ago", flows: 12, note: "4 institutions linked" },
  { id: "g7", name: "DocuSign", category: "Documents", desc: "Engagement letters and K-1s couriered for e-signature; status writes back to projects.", connected: true, icon: "PenLine", lastSync: "3h ago", flows: 26, note: "2 envelopes in flight" },
  { id: "g8", name: "Client Portal", category: "Documents", desc: "Uploads are classified by AI and filed to the right entity's checklist instantly.", connected: true, icon: "FolderLock", lastSync: "live", flows: 59, note: "custom · sso with Gmail" },
  { id: "g9", name: "OpenAI API", category: "Intelligence", desc: "The drafting and classification brain — every agent above calls it through n8n.", connected: true, icon: "Brain", lastSync: "live", flows: 1030, note: "gpt-class models · 38k tokens/day" },
];

/* ------------------------------- invoices ------------------------------ */

export interface Invoice {
  id: string; ref: string; to: string; clientId?: string; amount: number;
  status: "paid" | "sent" | "draft" | "overdue"; issued: string; due: string; note: string;
}

export const INVOICES: Invoice[] = [
  { id: "v1", ref: "RV-1036", to: "Hale & Harbor Group", clientId: "c1", amount: 6800, status: "paid", issued: daysFrom(-20), due: daysFrom(-6), note: "1120-S ×3 entities — interim billing" },
  { id: "v2", ref: "RV-1041", to: "Nakamura Law PLLC", clientId: "c8", amount: 1850, status: "paid", issued: daysFrom(-8), due: daysFrom(2), note: "Extension + safe-harbor estimates" },
  { id: "v3", ref: "RV-1040", to: "Ashford Family Office", clientId: "c7", amount: 3600, status: "paid", issued: daysFrom(-10), due: daysFrom(0), note: "1041 work — first installment" },
  { id: "v4", ref: "RV-1042", to: "Reyes Capital Management", clientId: "c6", amount: 3000, status: "sent", issued: daysFrom(-3), due: daysFrom(9), note: "Q1 CFO strategy memo" },
  { id: "v5", ref: "RV-1039", to: "Okafor Dental Partners", clientId: "c3", amount: 2750, status: "overdue", issued: daysFrom(-18), due: daysFrom(-4), note: "Advisory — tax plan phase 1" },
  { id: "v6", ref: "RV-1043", to: "Raman Medspa", clientId: "c2", amount: 2400, status: "draft", issued: daysFrom(0), due: daysFrom(14), note: "December close — awaits final packet" },
  { id: "v7", ref: "RV-1044", to: "Lindqvist Interiors", clientId: "c4", amount: 950, status: "draft", issued: daysFrom(0), due: daysFrom(16), note: "Q4 estimate vouchers + lease review" },
];

export const REV_MONTHS = [
  { m: "Jul", v: 18200 }, { m: "Aug", v: 21050 }, { m: "Sep", v: 16400 },
  { m: "Oct", v: 24900 }, { m: "Nov", v: 23750 }, { m: "Dec", v: 28600 },
];

/* -------------------------------- outbox ------------------------------- */

export interface OutboxItem {
  id: string; kind: "Follow-up" | "Proposal" | "Engagement letter" | "Reminder" | "Welcome" | "Invoice link";
  refType: "client" | "lead"; refId?: string; toName: string; subject: string;
  preview: string; agent: string; sent?: boolean; eta: string;
}

export const OUTBOX: OutboxItem[] = [
  { id: "ob1", kind: "Engagement letter", refType: "lead", refId: "l1", toName: "Noah Kim", subject: "Kim's Kitchen — fixed-fee S-corp engagement", preview: "Noah — the letter is attached exactly as scoped: payroll registration, first filing, and quarterly touchpoints inside the fixed fee. Signature this week protects your Q1 payroll run…", agent: "Proposal Drafter", eta: "send this morning — heat score decaying" },
  { id: "ob2", kind: "Follow-up", refType: "lead", refId: "l7", toName: "Maya Sorensen", subject: "Re: New studio tax package — one small thing", preview: "Maya, no pressure sequence — just one question: is tax season timing or budget the blocker? Either way I'll point you right. Thirteen studios started exactly where you are…", agent: "Follow-up Radar", eta: "2 days overdue — trail cooling" },
  { id: "ob3", kind: "Reminder", refType: "client", refId: "c3", toName: "David Okafor", subject: "One file between you and finished", preview: "David — the bank statements (Sept–Nov) are literally the only open item. Upload via the portal link below; everything else is done and queued…", agent: "Document Chaser", eta: "escalation window now" },
  { id: "ob4", kind: "Proposal", refType: "lead", refId: "l4", toName: "Anita Whelan", subject: "Estate & trust engagement — Voss & Vale proposal", preview: "Unlike a trust company, you get the principal on every question, Anita. Inside: fixed scope for the 1041s, gift filings, and the CRT advisory with plain-English milestones…", agent: "Proposal Drafter", eta: "comparing you against a trust co. — send today" },
  { id: "ob5", kind: "Welcome", refType: "lead", refId: "l6", toName: "Lena Marsh", subject: "Welcome aboard — three things happen now", preview: "Lena — first, your portal invite (2-minute setup). Second, a discovery call link. Third, your bookkeeping checklist is already pre-filled from your intake form…", agent: "Smart Intake", eta: "send within 1h of intake for wow effect" },
  { id: "ob6", kind: "Invoice link", refType: "client", refId: "c5", toName: "Tom Beckett", subject: "Scope recap + progress invoice — Beckett cleanup", preview: "Tom — as agreed on the call: the recap in writing (attached), plus the phase-one invoice so we can resume the moment the Martinez job closes. No surprises…", agent: "Invoice Autopilot", eta: "you approved the recap yesterday" },
];
