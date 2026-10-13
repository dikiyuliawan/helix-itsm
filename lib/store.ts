"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { derivePriority } from "./constants";
import { buildSeedRequests, buildSeedTickets, seedArticles, seedCatalogItems, seedUsers } from "./seed";
import { slaDueFrom } from "./sla";
import type {
  Activity,
  Article,
  CatalogItem,
  Channel,
  Impact,
  RequestState,
  ServiceRequest,
  Ticket,
  TicketState,
  Urgency,
  User,
} from "./types";

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

export interface NewTicketInput {
  shortDescription: string;
  description: string;
  category: string;
  impact: Impact;
  urgency: Urgency;
  callerId: string;
  channel: Channel;
  assignmentGroup: string;
  assigneeId: string | null;
}

export interface NewRequestInput {
  item: CatalogItem;
  requestedForId: string;
  requestedById: string;
  values: Record<string, string>;
}

interface Counters {
  ticket: number;
  request: number;
  article: number;
}

interface StoreState {
  users: User[];
  currentUserId: string | null;
  tickets: Ticket[];
  activities: Activity[];
  catalogItems: CatalogItem[];
  requests: ServiceRequest[];
  articles: Article[];
  counters: Counters;

  login: (userId: string) => void;
  logout: () => void;

  createTicket: (input: NewTicketInput) => Ticket;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  setTicketState: (id: string, state: TicketState, authorId: string) => void;
  assignTicket: (id: string, assigneeId: string | null, authorId: string) => void;
  addActivity: (
    ticketId: string,
    entry: { authorId: string; body: string; kind: Activity["kind"] },
  ) => void;

  createRequest: (input: NewRequestInput) => ServiceRequest;
  updateRequestState: (id: string, state: RequestState) => void;

  recordArticleView: (id: string) => void;
  rateArticle: (id: string, helpful: boolean) => void;

  resetDemoData: () => void;
}

function createSeed() {
  const { tickets, activities } = buildSeedTickets();
  const requests = buildSeedRequests();
  return {
    users: seedUsers,
    currentUserId: null,
    tickets,
    activities,
    catalogItems: seedCatalogItems,
    requests,
    articles: seedArticles,
    counters: {
      ticket: tickets.length,
      request: requests.length,
      article: seedArticles.length,
    },
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createSeed(),

      login: (userId) => set({ currentUserId: userId }),

      logout: () => set({ currentUserId: null }),

      createTicket: (input) => {
        const priority = derivePriority(input.impact, input.urgency);
        const createdAt = new Date().toISOString();
        const seq = get().counters.ticket + 1;
        const ticket: Ticket = {
          id: `t-${uid()}`,
          number: `INC00${String(10000 + seq)}`,
          shortDescription: input.shortDescription,
          description: input.description,
          state: "New",
          priority,
          impact: input.impact,
          urgency: input.urgency,
          category: input.category,
          assignmentGroup: input.assignmentGroup,
          assigneeId: input.assigneeId,
          callerId: input.callerId,
          channel: input.channel,
          createdAt,
          updatedAt: createdAt,
          resolvedAt: null,
          closedAt: null,
          slaDueAt: slaDueFrom(createdAt, priority),
          relatedArticleIds: [],
        };

        const opening: Activity = {
          id: uid(),
          ticketId: ticket.id,
          authorId: input.callerId,
          body: `Incident created from ${input.channel.toLowerCase()}. Priority set to ${priority}.`,
          kind: "activity",
          createdAt,
        };

        set((state) => ({
          tickets: [ticket, ...state.tickets],
          activities: [opening, ...state.activities],
          counters: { ...state.counters, ticket: seq },
        }));

        return ticket;
      },

      updateTicket: (id, patch) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === id
              ? { ...ticket, ...patch, updatedAt: new Date().toISOString() }
              : ticket,
          ),
        }));
      },

      setTicketState: (id, nextState, authorId) => {
        const now = new Date().toISOString();
        const ticket = get().tickets.find((t) => t.id === id);
        if (!ticket || ticket.state === nextState) return;

        const activity: Activity = {
          id: uid(),
          ticketId: id,
          authorId,
          body: `State changed from ${ticket.state} to ${nextState}.`,
          kind: "activity",
          createdAt: now,
        };

        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  state: nextState,
                  updatedAt: now,
                  resolvedAt:
                    nextState === "Resolved" || nextState === "Closed"
                      ? t.resolvedAt ?? now
                      : null,
                  closedAt: nextState === "Closed" ? now : null,
                }
              : t,
          ),
          activities: [activity, ...state.activities],
        }));
      },

      assignTicket: (id, assigneeId, authorId) => {
        const now = new Date().toISOString();
        const user = get().users.find((u) => u.id === assigneeId);
        const activity: Activity = {
          id: uid(),
          ticketId: id,
          authorId,
          body: user ? `Assigned to ${user.name}.` : "Assignment cleared.",
          kind: "activity",
          createdAt: now,
        };
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, assigneeId, updatedAt: now } : t,
          ),
          activities: [activity, ...state.activities],
        }));
      },

      addActivity: (ticketId, entry) => {
        const now = new Date().toISOString();
        const activity: Activity = {
          id: uid(),
          ticketId,
          authorId: entry.authorId,
          body: entry.body,
          kind: entry.kind,
          createdAt: now,
        };
        set((state) => ({
          activities: [activity, ...state.activities],
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, updatedAt: now } : t,
          ),
        }));
      },

      createRequest: (input) => {
        const now = new Date().toISOString();
        const seq = get().counters.request + 1;
        const request: ServiceRequest = {
          id: `req-${uid()}`,
          number: `REQ00${String(10000 + seq)}`,
          itemId: input.item.id,
          itemName: input.item.name,
          itemIcon: input.item.icon,
          requestedForId: input.requestedForId,
          requestedById: input.requestedById,
          state: "Submitted",
          values: input.values,
          price: input.item.price,
          createdAt: now,
          updatedAt: now,
          dueAt: new Date(Date.now() + 2 * 86_400_000).toISOString(),
        };
        set((state) => ({
          requests: [request, ...state.requests],
          counters: { ...state.counters, request: seq },
        }));
        return request;
      },

      updateRequestState: (id, nextState) => {
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id
              ? { ...request, state: nextState, updatedAt: new Date().toISOString() }
              : request,
          ),
        }));
      },

      recordArticleView: (id) => {
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id ? { ...article, views: article.views + 1 } : article,
          ),
        }));
      },

      rateArticle: (id, helpful) => {
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  helpful: article.helpful + (helpful ? 1 : 0),
                  notHelpful: article.notHelpful + (helpful ? 0 : 1),
                }
              : article,
          ),
        }));
      },

      resetDemoData: () => set({ ...createSeed(), currentUserId: get().currentUserId }),
    }),
    {
      name: "sn-clone-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useStore.persist.onFinishHydration(onStoreChange),
    () => useStore.persist.hasHydrated(),
    () => false,
  );
}

export function useCurrentUser(): User | null {
  return useStore((state) =>
    state.currentUserId
      ? state.users.find((user) => user.id === state.currentUserId) ?? null
      : null,
  );
}

export function useUserById(id: string | null | undefined): User | null {
  return useStore((state) =>
    id ? state.users.find((user) => user.id === id) ?? null : null,
  );
}
