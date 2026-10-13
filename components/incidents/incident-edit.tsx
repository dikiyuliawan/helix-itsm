"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { IncidentForm } from "@/components/incidents/incident-form";
import { buttonVariants } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "cn";

export function IncidentEdit({ ticketId }: { ticketId: string }) {
  const ticket = useStore(
    (state) => state.tickets.find((item) => item.id === ticketId) ?? null,
  );

  if (!ticket) {
    return (
      <EmptyState
        icon={TriangleAlert}
        title="Incident not found"
        description="This incident may have been removed."
      >
        <Link href="/incidents" className={cn(buttonVariants({ size: "sm" }))}>
          Back to incidents
        </Link>
      </EmptyState>
    );
  }

  return <IncidentForm mode="edit" ticket={ticket} />;
}
