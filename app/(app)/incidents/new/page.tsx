import type { Metadata } from "next";

import { IncidentForm } from "@/components/incidents/incident-form";

export const metadata: Metadata = { title: "New incident" };

export default function NewIncidentPage() {
  return <IncidentForm mode="create" />;
}
