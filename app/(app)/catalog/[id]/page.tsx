import { CatalogItemDetail } from "@/components/catalog/catalog-item-detail";

export default async function CatalogItemPage(
  props: PageProps<"/catalog/[id]">,
) {
  const { id } = await props.params;
  return <CatalogItemDetail itemId={id} />;
}
