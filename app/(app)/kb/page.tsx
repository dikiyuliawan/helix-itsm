import type { Metadata } from "next";

import { KbView } from "@/components/kb/kb-view";

export const metadata: Metadata = { title: "Knowledge Base" };

export default function KnowledgePage() {
  return <KbView />;
}
