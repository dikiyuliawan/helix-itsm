"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { RequestStateBadge } from "@/components/badges";
import { EmptyState } from "@/components/empty-state";
import { FilterSelect } from "@/components/filter-select";
import { IconByName } from "@/components/icon-by-name";
import { PageHeader } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currency, smartDate } from "@/lib/format";
import { permissionsFor } from "@/lib/rbac";
import { useCurrentUser, useStore } from "@/lib/store";
import type { RequestState, ServiceRequest } from "@/lib/types";
import { cn } from "cn";

const STATES: RequestState[] = [
  "Submitted",
  "Approved",
  "In Fulfillment",
  "Fulfilled",
  "Rejected",
];

export function RequestsView() {
  const user = useCurrentUser();
  const permissions = permissionsFor(user);
  const requests = useStore((state) => state.requests);
  const users = useStore((state) => state.users);
  const updateRequestState = useStore((state) => state.updateRequestState);
  const [stateFilter, setStateFilter] = useState("all");

  const scoped = useMemo(() => {
    if (permissions.canFulfillRequests) return requests;
    if (!user) return [];
    return requests.filter(
      (request) =>
        request.requestedById === user.id || request.requestedForId === user.id,
    );
  }, [requests, permissions.canFulfillRequests, user]);

  const filtered = useMemo(() => {
    const list =
      stateFilter === "all"
        ? scoped
        : scoped.filter((request) => request.state === stateFilter);
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [scoped, stateFilter]);

  const stateOptions = [
    { value: "all", label: "All states", count: scoped.length },
    ...STATES.map((state) => ({
      value: state,
      label: state,
      count: scoped.filter((request) => request.state === state).length,
    })),
  ];

  return (
    <div>
      <PageHeader
        eyebrow={permissions.canFulfillRequests ? "IT Service Management" : "Self-service"}
        title="Service Requests"
        description={
          permissions.canFulfillRequests
            ? "Fulfill and track requests raised from the service catalog."
            : "Track the requests you have submitted."
        }
      >
        <Link href="/catalog" className={cn(buttonVariants({ size: "sm" }))}>
          Browse catalog
        </Link>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterSelect
          value={stateFilter}
          onChange={setStateFilter}
          options={stateOptions}
          ariaLabel="Filter by state"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={scoped.length === 0 ? "No requests yet" : "No matching requests"}
          description={
            scoped.length === 0
              ? "Request something from the service catalog to get started."
              : "Try a different state filter."
          }
        >
          {scoped.length === 0 ? (
            <Link href="/catalog" className={cn(buttonVariants({ size: "sm" }))}>
              Browse catalog
            </Link>
          ) : null}
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[7.5rem]">Number</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="w-[11rem]">Requested for</TableHead>
                <TableHead className="w-[9rem]">State</TableHead>
                <TableHead className="w-[6rem]">Cost</TableHead>
                <TableHead className="w-[9rem]">Created</TableHead>
                {permissions.canFulfillRequests ? (
                  <TableHead className="w-[3rem] text-right">Actions</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  canFulfill={permissions.canFulfillRequests}
                  requestedFor={
                    users.find((entry) => entry.id === request.requestedForId) ?? null
                  }
                  onStateChange={(state) => {
                    updateRequestState(request.id, state);
                    toast.success(`${request.number} marked ${state}`);
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function RequestRow({
  request,
  requestedFor,
  canFulfill,
  onStateChange,
}: {
  request: ServiceRequest;
  requestedFor: { id: string; name: string; avatarColor: string } | null;
  canFulfill: boolean;
  onStateChange: (state: RequestState) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium text-primary">{request.number}</TableCell>
      <TableCell>
        <span className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <IconByName name={request.itemIcon} className="size-4" />
          </span>
          <span className="font-medium text-foreground">{request.itemName}</span>
        </span>
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-2">
          <UserAvatar user={requestedFor} className="size-6" />
          <span className="truncate text-sm">{requestedFor?.name ?? "Unknown"}</span>
        </span>
      </TableCell>
      <TableCell>
        <RequestStateBadge state={request.state} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {currency(request.price)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {smartDate(request.createdAt)}
      </TableCell>
      {canFulfill ? (
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Request actions"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Set state</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STATES.map((state) => (
                <DropdownMenuItem
                  key={state}
                  disabled={state === request.state}
                  onClick={() => onStateChange(state)}
                >
                  {state}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      ) : null}
    </TableRow>
  );
}
