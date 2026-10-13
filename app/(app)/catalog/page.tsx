import type { Metadata } from "next";

import { CatalogView } from "@/components/catalog/catalog-view";

export const metadata: Metadata = { title: "Service Catalog" };

export default function CatalogPage() {
  return <CatalogView />;
}
