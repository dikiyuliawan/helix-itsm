"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownWideNarrow,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  TriangleAlert,
} from "lucide-react";

import { PriorityBadge, SlaBadge, StateBadge } from "@/components/badges";
import { EmptyState } from "@/components/empty-state";
import { FilterSelect } from "@/components/filter-select";
import { PageHeader } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATEGORIES, PRIORITIES, PRIORITY_META, TICKET_STATES } from "@/lib/constants";
import { smartDate } from "@/lib/format";
import { permissionsFor } from "@/lib/rbac";
import { computeSla } from "@/lib/sla";
import { useCurrentUser, useStore } from "@/lib/store";
import type { Ticket } from "@/lib/types";
import { cn } from "cn";

const PAGE_SIZE = 10;

type SortKey = "updated" | "priority" | "number";

export function IncidentList({ scopedToMe = false }: { scopedToMe?: boolean }) {
  const router = useRouter();
  const user = useCurrentUser();
  const permissions = permissionsFor(user);
  const tickets = useStore((state) => state.tickets);
  const users = useStore((state) => state.users);

  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const restrictToMe = scopedToMe || !permissions.canViewAllTickets;

  const scoped = useMemo(() => {
    if (restrictToMe && user) {
      return tickets.filter((ticket) => ticket.callerId === user.id);
    }
    return tickets;
  }, [tickets, restrictToMe, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped.filter((ticket) => {
      if (stateFilter !== "all" && ticket.state !== stateFilter) return false;
      if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;
      if (categoryFilter !== "all" && ticket.category !== categoryFilter) return false;
      if (assigneeFilter === "mine" && ticket.assigneeId !== user?.id) return false;
      if (assigneeFilter === "unassigned" && ticket.assigneeId) return false;
      if (
        assigneeFilter !== "all" &&
        assigneeFilter !== "mine" &&
        assigneeFilter !== "unassigned" &&
        ticket.assigneeId !== assigneeFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        ticket.number.toLowerCase().includes(q) ||
        ticket.shortDescription.toLowerCase().includes(q) ||
        ticket.category.toLowerCase().includes(q) ||
        ticket.assignmentGroup.toLowerCase().includes(q)
      );
    });
  }, [scoped, query, stateFilter, priorityFilter, categoryFilter, assigneeFilter, user]);

  const sorted = useMemo(() => {
    const direction = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "priority") {
        return (PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank) * direction;
      }
      if (sortKey === "number") {
        return a.number.localeCompare(b.number) * direction;
      }
      return (
        (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * direction
      );
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilterCount = [stateFilter, priorityFilter, assigneeFilter, categoryFilter].filter(
    (value) => value !== "all",
  ).length;

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "number" ? "asc" : "desc");
    }
    setPage(1);
  }

  function resetFilters() {
    setStateFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setCategoryFilter("all");
    setQuery("");
    setPage(1);
  }

  const assigneeOptions = useMemo(() => {
    const staff = users.filter((u) => u.role !== "user");
    return [
      { value: "all", label: "All assignees" },
      { value: "mine", label: "Assigned to me" },
      { value: "unassigned", label: "Unassigned" },
      ...staff.map((u) => ({ value: u.id, label: u.name })),
    ];
  }, [users]);

  const stateOptions = [
    { value: "all", label: "All states", count: scoped.length },
    ...TICKET_STATES.map((state) => ({
      value: state,
      label: state,
      count: scoped.filter((ticket) => ticket.state === state).length,
    })),
  ];

  const priorityOptions = [
    { value: "all", label: "All priorities" },
    ...PRIORITIES.map((priority) => ({
      value: priority,
      label: priority,
      count: scoped.filter((ticket) => ticket.priority === priority).length,
    })),
  ];

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...CATEGORIES.map((category) => ({ value: category, label: category })),
  ];

  return (
    <div>
      <PageHeader
        eyebrow={restrictToMe ? "Self-service" : "IT Service Management"}
        title={restrictToMe ? "My Incidents" : "Incidents"}
        description={
          restrictToMe
            ? "Incidents you have reported. Track progress and add comments."
            : "Track, prioritise, and resolve service disruptions across the organisation."
        }
      >
        <Link href="/incidents/new" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="size-3.5" />
          New incident
        </Link>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[14rem] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by number, description, or group…"
              className="h-8 w-full rounded-lg border border-input bg-background pr-3 pl-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 dark:bg-input/30"
            />
          </div>
          <FilterSelect
            value={stateFilter}
            onChange={(value) => {
              setStateFilter(value);
              setPage(1);
            }}
            options={stateOptions}
            ariaLabel="Filter by state"
          />
          <FilterSelect
            value={priorityFilter}
            onChange={(value) => {
              setPriorityFilter(value);
              setPage(1);
            }}
            options={priorityOptions}
            ariaLabel="Filter by priority"
          />
          {!restrictToMe ? (
            <FilterSelect
              value={assigneeFilter}
              onChange={(value) => {
                setAssigneeFilter(value);
                setPage(1);
              }}
              options={assigneeOptions}
              className="min-w-[11rem]"
              ariaLabel="Filter by assignee"
            />
          ) : null}
          <FilterSelect
            value={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
            options={categoryOptions}
            className="min-w-[10rem]"
            ariaLabel="Filter by category"
          />
          {activeFilterCount > 0 || query ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {scoped.length === 0 ? (
        <EmptyState
          icon={TriangleAlert}
          title="No incidents yet"
          description="When incidents are raised they will appear here."
        >
          <Link href="/incidents/new" className={cn(buttonVariants({ size: "sm" }))}>
            <Plus className="size-3.5" />
            Raise an incident
          </Link>
        </EmptyState>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching incidents"
          description="Try adjusting your search or filters."
        >
          <button
            type="button"
            onClick={resetFilters}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Clear filters
          </button>
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[7.5rem]">
                  <SortButton active={sortKey === "number"} dir={sortDir} onClick={() => toggleSort("number")}>
                    Number
                  </SortButton>
                </TableHead>
                <TableHead>Short description</TableHead>
                <TableHead className="w-[8.5rem]">
                  <SortButton active={sortKey === "priority"} dir={sortDir} onClick={() => toggleSort("priority")}>
                    Priority
                  </SortButton>
                </TableHead>
                <TableHead className="w-[8rem]">State</TableHead>
                <TableHead className="w-[11rem]">Assignee</TableHead>
                <TableHead className="w-[10rem]">SLA</TableHead>
                <TableHead className="w-[9rem]">
                  <SortButton active={sortKey === "updated"} dir={sortDir} onClick={() => toggleSort("updated")}>
                    Updated
                  </SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((ticket) => (
                <IncidentRow
                  key={ticket.id}
                  ticket={ticket}
                  onOpen={() => router.push(`/incidents/${ticket.id}`)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {sorted.length > PAGE_SIZE ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, sorted.length)}
            </span>{" "}
            of <span className="font-medium text-foreground">{sorted.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IncidentRow({ ticket, onOpen }: { ticket: Ticket; onOpen: () => void }) {
  const assignee = useStore((state) =>
    ticket.assigneeId
      ? state.users.find((user) => user.id === ticket.assigneeId) ?? null
      : null,
  );
  const sla = computeSla(ticket);

  return (
    <TableRow className="cursor-pointer" onClick={onOpen}>
      <TableCell>
        <Link
          href={`/incidents/${ticket.id}`}
          className="font-medium text-primary hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {ticket.number}
        </Link>
      </TableCell>
      <TableCell className="max-w-0">
        <div className="flex flex-col">
          <span className="truncate font-medium text-foreground">
            {ticket.shortDescription}
          </span>
          <span className="text-xs text-muted-foreground">
            {ticket.category} · {ticket.assignmentGroup}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <PriorityBadge priority={ticket.priority} />
      </TableCell>
      <TableCell>
        <StateBadge state={ticket.state} />
      </TableCell>
      <TableCell>
        {assignee ? (
          <span className="flex items-center gap-2">
            <UserAvatar user={assignee} className="size-6" />
            <span className="truncate text-sm">{assignee.name}</span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )}
      </TableCell>
      <TableCell>
        <SlaBadge status={sla.status} label={sla.dueLabel} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {smartDate(ticket.updatedAt)}
      </TableCell>
    </TableRow>
  );
}

function SortButton({
  active,
  dir,
  onClick,
  children,
}: {
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {children}
      <ArrowDownWideNarrow
        className={cn(
          "size-3.5 transition-transform",
          active ? "opacity-100" : "opacity-0",
          active && dir === "asc" ? "rotate-180" : "",
        )}
      />
    </button>
  );
}
