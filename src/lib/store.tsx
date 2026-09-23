import React, { createContext, useContext, useMemo, useReducer } from "react";
import {
  AI_ACTIONS, AUTOMATIONS, CLIENTS, INBOX, INTEGRATIONS, INVOICES, LEADS, NOTIFS, OPPS, OUTBOX, PROJECTS, SUGGESTIONS, TASKS,
  type AIAction, type Automation, type Client, type Comm, type InboxItem, type Integration, type Invoice,
  type Lead, type LeadStage, type Notif, type Opp, type OppStage, type OutboxItem, type Project, type Suggestion, type Task, daysFrom, moneyFull as moneyFmt,
} from "./data";

export const uid = () => Math.random().toString(36).slice(2, 9);

/* ------------------------------ nav ------------------------------- */

export type ViewName = "today" | "inbox" | "leads" | "clients" | "opps" | "money" | "projects" | "tasks" | "automations" | "integrations";
export interface Route { name: ViewName; clientId?: string; leadId?: string }

const NavCtx = createContext<{ route: Route; go: (r: Route) => void }>({
  route: { name: "today" },
  go: () => {},
});
export const useNav = () => useContext(NavCtx);
export const NavProvider = NavCtx.Provider;

/* ----------------------------- state ------------------------------ */

export interface State {
  clients: Client[]; leads: Lead[]; opps: Opp[]; projects: Project[];
  tasks: Task[]; automations: Automation[]; notifs: Notif[]; briefIdx: number;
  suggestions: Suggestion[]; aiActions: AIAction[]; inbox: InboxItem[]; integrations: Integration[];
  invoices: Invoice[]; outbox: OutboxItem[];
}

const initial: State = {
  clients: CLIENTS, leads: LEADS, opps: OPPS, projects: PROJECTS,
  tasks: TASKS, automations: AUTOMATIONS, notifs: NOTIFS, briefIdx: 0,
  suggestions: SUGGESTIONS, aiActions: AI_ACTIONS, inbox: INBOX, integrations: INTEGRATIONS,
  invoices: INVOICES, outbox: OUTBOX,
};

export type Action =
  | { type: "TOGGLE_TASK"; id: string }
  | { type: "ADD_TASK"; task: Task }
  | { type: "SNOOZE_TASK"; id: string; days: number }
  | { type: "MOVE_OPP"; id: string; stage: OppStage }
  | { type: "ADD_NOTE"; target: "client" | "lead"; id: string; text: string }
  | { type: "ADD_COMM"; clientId: string; comm: Comm }
  | { type: "CONVERT_LEAD"; id: string; client: Client }
  | { type: "ADD_LEAD"; lead: Lead }
  | { type: "ADD_CLIENT"; client: Client }
  | { type: "SET_LEAD_STAGE"; id: string; stage: LeadStage }
  | { type: "TOGGLE_AUTO"; id: string }
  | { type: "RUN_AUTO"; id: string }
  | { type: "SET_BALL"; projectId: string; ball: "me" | "client" }
  | { type: "SET_PROJ_STATUS"; projectId: string; status: Project["status"] }
  | { type: "TOGGLE_MILESTONE"; projectId: string; mId: string }
  | { type: "ADD_PROJECT"; project: Project }
  | { type: "ADD_OPP"; opp: Opp }
  | { type: "CYCLE_BRIEF" }
  | { type: "READ_NOTIFS" }
  | { type: "APPROVE_SUGGESTION"; id: string }
  | { type: "DISMISS_SUGGESTION"; id: string }
  | { type: "UNDO_AI_ACTION"; id: string }
  | { type: "FILE_INBOX"; id: string }
  | { type: "SEND_INBOX"; id: string }
  | { type: "TOGGLE_INTEGRATION"; id: string }
  | { type: "PAY_INVOICE"; id: string }
  | { type: "SEND_INVOICE"; id: string }
  | { type: "SEND_OUTBOX"; id: string };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "TOGGLE_TASK":
      return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, done: !t.done } : t)) };
    case "ADD_TASK":
      return { ...s, tasks: [a.task, ...s.tasks] };
    case "SNOOZE_TASK":
      return {
        ...s,
        tasks: s.tasks.map((t) => {
          if (t.id !== a.id) return t;
          const d = new Date(t.due);
          d.setDate(d.getDate() + a.days);
          return { ...t, due: d.toISOString() };
        }),
      };
    case "MOVE_OPP":
      return { ...s, opps: s.opps.map((o) => (o.id === a.id ? { ...o, stage: a.stage, lastActivity: daysFrom(0) } : o)) };
    case "ADD_NOTE": {
      const note = { id: uid(), date: daysFrom(0), author: "Elena", text: a.text };
      if (a.target === "client")
        return { ...s, clients: s.clients.map((c) => (c.id === a.id ? { ...c, notes: [note, ...c.notes] } : c)) };
      return { ...s, leads: s.leads.map((l) => (l.id === a.id ? { ...l, notes: [note, ...l.notes] } : l)) };
    }
    case "ADD_COMM":
      return { ...s, clients: s.clients.map((c) => (c.id === a.clientId ? { ...c, comms: [a.comm, ...c.comms] } : c)) };
    case "CONVERT_LEAD":
      return {
        ...s,
        clients: [a.client, ...s.clients],
        leads: s.leads.map((l) => (l.id === a.id ? { ...l, stage: "won" as LeadStage } : l)),
      };
    case "ADD_LEAD":
      return { ...s, leads: [a.lead, ...s.leads] };
    case "ADD_CLIENT":
      return { ...s, clients: [a.client, ...s.clients] };
    case "SET_LEAD_STAGE":
      return { ...s, leads: s.leads.map((l) => (l.id === a.id ? { ...l, stage: a.stage } : l)) };
    case "TOGGLE_AUTO":
      return { ...s, automations: s.automations.map((x) => (x.id === a.id ? { ...x, enabled: !x.enabled } : x)) };
    case "RUN_AUTO":
      return { ...s, automations: s.automations.map((x) => (x.id === a.id ? { ...x, runs: x.runs + 1, lastRun: "just now" } : x)) };
    case "SET_BALL":
      return {
        ...s,
        projects: s.projects.map((p) =>
          p.id === a.projectId
            ? { ...p, ball: a.ball, status: a.ball === "client" ? "waiting" : p.status === "waiting" ? "on-track" : p.status }
            : p),
      };
    case "SET_PROJ_STATUS":
      return { ...s, projects: s.projects.map((p) => (p.id === a.projectId ? { ...p, status: a.status } : p)) };
    case "TOGGLE_MILESTONE":
      return {
        ...s,
        projects: s.projects.map((p) => {
          if (p.id !== a.projectId) return p;
          const ms = p.milestones.map((m) => (m.id === a.mId ? { ...m, done: !m.done } : m));
          const progress = Math.round((ms.filter((m) => m.done).length / ms.length) * 100);
          return { ...p, milestones: ms, progress };
        }),
      };
    case "ADD_PROJECT":
      return { ...s, projects: [a.project, ...s.projects] };
    case "ADD_OPP":
      return { ...s, opps: [a.opp, ...s.opps] };
    case "CYCLE_BRIEF":
      return { ...s, briefIdx: s.briefIdx + 1 };
    case "READ_NOTIFS":
      return { ...s, notifs: s.notifs.map((n) => ({ ...n, read: true })) };
    case "APPROVE_SUGGESTION": {
      const sug = s.suggestions.find((x) => x.id === a.id);
      if (!sug) return s;
      const task: Task = {
        id: uid(), title: sug.title, clientId: sug.clientId, due: sug.due,
        priority: sug.priority, done: false, kind: sug.kind, ai: true,
      };
      return { ...s, suggestions: s.suggestions.filter((x) => x.id !== a.id), tasks: [task, ...s.tasks] };
    }
    case "DISMISS_SUGGESTION":
      return { ...s, suggestions: s.suggestions.filter((x) => x.id !== a.id) };
    case "UNDO_AI_ACTION":
      return { ...s, aiActions: s.aiActions.map((x) => (x.id === a.id ? { ...x, undone: true } : x)) };
    case "FILE_INBOX": {
      const item = s.inbox.find((x) => x.id === a.id);
      if (!item) return s;
      const comm: Comm = { id: uid(), type: "email", dir: "in", date: daysFrom(0), summary: `Filed from Inbox Hub: “${item.subject}” (${item.intent})` };
      return {
        ...s,
        inbox: s.inbox.map((x) => (x.id === a.id ? { ...x, status: "filed" as const } : x)),
        clients: item.clientId ? s.clients.map((c) => (c.id === item.clientId ? { ...c, comms: [comm, ...c.comms] } : c)) : s.clients,
      };
    }
    case "SEND_INBOX": {
      const item = s.inbox.find((x) => x.id === a.id);
      if (!item) return s;
      const comm: Comm = { id: uid(), type: "email", dir: "out", date: daysFrom(0), summary: `Ordo reply sent re: “${item.subject}” — written in your voice` };
      const withClients = item.clientId ? s.clients.map((c) => (c.id === item.clientId ? { ...c, comms: [comm, ...c.comms] } : c)) : s.clients;
      const extraTasks = item.extractedTask
        ? [{ id: uid(), title: item.extractedTask, clientId: item.clientId, due: daysFrom(1), priority: "medium" as const, done: false, kind: "followup" as const, ai: true }, ...s.tasks]
        : s.tasks;
      return {
        ...s,
        inbox: s.inbox.map((x) => (x.id === a.id ? { ...x, status: "replied" as const } : x)),
        clients: withClients,
        tasks: extraTasks,
      };
    }
    case "TOGGLE_INTEGRATION":
      return { ...s, integrations: s.integrations.map((x) => (x.id === a.id ? { ...x, connected: !x.connected, lastSync: !x.connected ? "live" : "—" } : x)) };
    case "PAY_INVOICE":
      return { ...s, invoices: s.invoices.map((v) => (v.id === a.id ? { ...v, status: "paid" as const } : v)) };
    case "SEND_INVOICE": {
      const inv = s.invoices.find((v) => v.id === a.id);
      const comm: Comm | null = inv?.clientId
        ? { id: uid(), type: "email", dir: "out", date: daysFrom(0), summary: `Invoice ${inv.ref} sent — ${moneyFmt(inv.amount)}, pay link inside` }
        : null;
      return {
        ...s,
        invoices: s.invoices.map((v) => (v.id === a.id ? { ...v, status: "sent" as const } : v)),
        clients: comm ? s.clients.map((c) => (c.id === inv!.clientId ? { ...c, comms: [comm, ...c.comms] } : c)) : s.clients,
      };
    }
    case "SEND_OUTBOX": {
      const item = s.outbox.find((x) => x.id === a.id);
      if (!item) return s;
      let clients = s.clients;
      let leads = s.leads;
      if (item.refType === "client" && item.refId) {
        const comm: Comm = { id: uid(), type: "email", dir: "out", date: daysFrom(0), summary: `${item.kind} sent: “${item.subject}” — drafted by ${item.agent}, approved by you` };
        clients = s.clients.map((c) => (c.id === item.refId ? { ...c, comms: [comm, ...c.comms] } : c));
      }
      if (item.refType === "lead" && item.refId) {
        leads = s.leads.map((l) =>
          l.id === item.refId
            ? { ...l, stage: l.stage === "new" ? ("contacted" as LeadStage) : l.stage, lastContact: daysFrom(0), notes: [{ id: uid(), date: daysFrom(0), author: item.agent, text: `Sent: “${item.subject}”` }, ...l.notes] }
            : l);
      }
      return { ...s, clients, leads, outbox: s.outbox.map((x) => (x.id === a.id ? { ...x, sent: true, eta: "sent just now" } : x)) };
    }
    default:
      return s;
  }
}

const StoreCtx = createContext<{ state: State; dispatch: React.Dispatch<Action> }>({
  state: initial,
  dispatch: () => {},
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);

/* ---------------------------- selectors ---------------------------- */

export const byClient = (s: State, id?: string) => s.clients.find((c) => c.id === id);
export const openTasks = (s: State) => s.tasks.filter((t) => !t.done);
export const overdueTasks = (s: State) =>
  openTasks(s).filter((t) => new Date(t.due).setHours(23, 59, 59) < Date.now() && rel(t.due) !== "Today");
export const todayTasks = (s: State) => openTasks(s).filter((t) => rel(t.due) === "Today");
export const waitingOnClients = (s: State) => s.projects.filter((p) => p.ball === "client" && p.status !== "done");
export const myBall = (s: State) => s.projects.filter((p) => p.ball === "me" && p.status !== "done");
export const waitingTasks = (s: State) => openTasks(s).filter((t) => t.waitingOn);
export const openPipeline = (s: State) =>
  s.opps.filter((o) => o.stage !== "won" && o.stage !== "lost").reduce((a, o) => a + o.value, 0);
export const activeClients = (s: State) => s.clients.filter((c) => c.status === "active").length;
export const pendingInbox = (s: State) => s.inbox.filter((i) => (i.status ?? "pending") === "pending");

function rel(iso: string) {
  const days = Math.round((new Date(iso).setHours(12, 0, 0, 0) - new Date().setHours(12, 0, 0, 0)) / 86400000);
  if (days === 0) return "Today";
  return `${days}`;
}
export const isTodayIso = (iso: string) => rel(iso) === "Today";
