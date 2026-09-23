# Ordo — The Agentic Practice Hub

> **Your practice, in perfect order.**
> An AI-native, automation-first CRM and project hub built for *one* — the solo CPA / tax strategist who wants zero manual admin.

---

## 1. What this platform does

Ordo replaces the enterprise CRM with a single, calm command center where **agents do the work and you only approve**. It is deliberately anti-complex: no sprawling tables to maintain, no fields to fill in — every record is written by automations, AI matchers, and connected systems.

Everything a solo practitioner asks each morning is answered on one screen:

| Morning question | Where Ordo answers it |
|---|---|
| What do I need to do today? What's overdue? | **Needs you today** queue (overdue in red, AI-drafted items flagged) |
| What deadlines are coming? | **Deadline Radar** — next 14 days across every task and filing |
| Which clients are waiting on me? | **Ball in your court** panel |
| Who am I waiting on? | **You're waiting on** panel with one-click nudges |
| Which leads need follow-up? | **Follow-ups owed** card + lead aging on the Leads page |
| Where does every active project stand? | **Every engagement at a glance** strip (progress, fee, due, ball) |
| What did the AI do while I slept? | **Ordo's Actions** audit log with per-action **Undo** |

### The two agentic engines

**Inbox Hub** — inbound email arrives pre-triaged, never raw:
- AI matches each message to a client/project at 88–98% confidence (clickable match trail)
- A reply is **already drafted in your voice** — approve & send files everything to the client record
- Commitments inside emails become **extracted tasks** with one click
- "File only" writes it to the right record; handled mail collapses into an audit trail

**Approval queue ("Suggested by Ordo")** — automations propose, you dispose:
- Document Chaser escalations, warm-lead engagement letters, scribe-extracted commitments
- One tap **Approve** → scheduled task under watch; **Not now** → gone, and the model learns

### Connections (the hub architecture)

Nine systems feed one record, through **n8n flows → AI matcher → Ordo records**:
n8n Cloud · Gmail · Google Calendar · QuickBooks Online · Plaid bank feeds · DocuSign · Client Portal · OpenAI API · and a reserved webhook (**`/hooks/ordo/email`**) for the user's own AI email assistant — connect it later and its replies/summaries land on the right client automatically.

---

## 2. Who buys this

**Primary buyer:** the solo CPA / EA / tax strategist or fractional CFO (like Elena) who:
- is drowning in client chases, deadline anxiety, and inbox triage
- refuses to maintain Salesforce/GoHighLevel — "the tool must not create work"
- is comfortable with no-code (n8n, Zapier, Make) and wants AI doing admin, not analytics

**Secondary buyers:**
- Boutique practices of 2–5 staff (one admin, several advisors)
- Solo bookkeepers and enrolled agents running seasonal workloads
- Solo attorneys / advisers with the same "waiting on / ball in court" problem

**Why they choose it:** it eliminates the *update the CRM* chore entirely. Every competitor asks you to feed it; Ordo feeds itself and asks only for verdicts.

---

## 3. Feature inventory

### Core workspaces
- **Today — Command Center**: AI morning brief (regenerable), animated KPIs, needs-you-today queue, waiting panels, follow-ups owed, every-engagement strip, deadline radar, dual feed (Client pulse / Ordo's actions)
- **Inbox Hub** *(agentic triage)* — described above
- **Leads**: AI score, stage stepper, follow-up aging with overdue flags, one-click **convert to client** (onboarding automation narrative), notes, add-lead modal
- **Clients**: searchable cards with health rings & annual fees → full dossier (entities with EIN/state/status, open engagements, per-client open items, communications timeline you can log to, private notes, AI summary + next-best-move)
- **Opportunities**: drag-and-drop kanban (Discovery → Proposal → Negotiation → Won), weighted forecast, hover quick-move, click-through to the person
- **Projects**: progress, at-risk/waiting states, **You/Client ball-in-court toggle**, milestones that recompute progress, waiting notes, "Mark delivered" (Invoice Autopilot drafts the bill)
- **Tasks & Deadlines**: grouped Overdue/Today/Week/Later/Done, AI re-prioritize, filters (today/follow-ups/waiting), snooze, priorities, client chips, add-task modal
- **Automations**: 8 named agents (Smart Intake, Document Chaser, Deadline Sentinel, Meeting Scribe, Follow-up Radar, Meeting Scribe, Invoice Autopilot, Proposal Drafter, K-1 Courier) with live toggles, run counts, savings, and "Run now"
- **Connections**: integration grid with connect/handshake simulation and the email-assistant webhook slot

### Power tools
- **Ask Ordo** — AI assistant (right-edge drawer, portal-rendered so it overlays the current page at any scroll position). Answers live from practice data: inbox status, pipeline math, per-client briefings? ("Where does every project stand", "Who am I waiting on", "Draft an email to David") — including send-it confirmation and typing animation
- **⌘K Command Palette** — fuzzy search over pages, clients, leads, tasks, projects with keyboard navigation
- **Top bar**: search launcher, automation-aware notification feed (mark-all-read), **clickable account menu** (View profile, Connections, Settings, Shortcuts, **Sign out**)
- **Profile modal**: practice identity, live stats, working preference toggles (morning brief, Friday digest, completion chime), **sign out**
- **Cinematic login**: warm office photography, prefilled demo creds, smooth transition; sign-out returns here, resetting the route

### Design system
Dark champagne-luxe: near-black ink surfaces, gradient gold accents, Fraunces serif display + Inter UI, gold-edge gradient borders, grain texture, spring-physics micro-interactions everywhere, count-up numerals, health rings, custom scrollbars, lucide iconography only (no emojis).

---

## 4. Tech stack

### Front-end (this build)
| Layer | Technology |
|---|---|
| Framework | **React 19** + **TypeScript 5** (strict mode) |
| Build tool | **Vite 7** (single-file production bundle) |
| Styling | **Tailwind CSS 4** (CSS-first `@theme` tokens) |
| Animation | **Framer Motion 12** (springs, layout animations, AnimatePresence) |
| Icons | **Lucide React** |
| Typography | Fraunces (serif display) + Inter (UI) via Google Fonts |
| Imagery | Pexels stock photography (portraits, office interior) |
| State | React context + `useReducer` store — 18 domain actions, live selectors |
| Data | **No database by design** — rich in-memory dummy data with runtime-relative dates so the demo is always "live" |

### Architecture (production intent)
| Concern | Tooling |
|---|---|
| Workflow engine | **n8n Cloud** — 24 flows listening to email/calendar/portal/QBO triggers |
| AI/classification | LLM API calls from n8n (summaries, drafts, 90%+ entity matching, task extraction) |
| Ingestion | Gmail API (oAuth: read/send/labels), Calendar API, portal webhooks, Plaid, QuickBooks, DocuSign |
| Extension point | Webhook endpoint `/hooks/ordo/email` for the user's own AI email assistant |
| Data flow | Source events → n8n flows → AI matcher → client/project records → approval surfaces |

---

## 5. Product qualities

- **Zero-maintenance by philosophy** — every screen answers *what requires my verdict*, never *what should you type*
- **One-person scale** — no teams, roles, or enterprise ceremony
- **Explainable agents** — every automation has a name, a reason string, a confidence score, and an undo
- **Luxury restraint** — a calm, dark, gold workspace that feels like a private bank, not an admin panel
- **Forward-compatible** — the inbox, webhook, and matching model are designed so a separately-built AI email assistant plugs in without new screens
- **Demo-grade realism** — dates, briefs, radar, and counts compute live from state, so every click (approve a suggestion, send an AI reply, pass the ball, complete a milestone) visibly rebalances the dashboard

---

## 6. Roadmap hooks (built for, not yet built)

1. Real Gmail sync + the user's AI email assistant via the reserved webhook
2. Stripe/fee collection events → Invoice Autopilot reconciliation
3. IRS e-Services deadline feeds into Deadline Sentinel
4. Voice-note capture → Meeting Scribe pipeline
5. Multi-client brief export (PDF) for quarterly reviews
