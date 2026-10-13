import { IncidentEdit } from "@/components/incidents/incident-edit";

export default async function EditIncidentPage(
  props: PageProps<"/incidents/[id]/edit">,
) {
  const { id } = await props.params;
  return <IncidentEdit ticketId={id} />;
}
