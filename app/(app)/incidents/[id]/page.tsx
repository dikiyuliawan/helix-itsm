import { IncidentDetail } from "@/components/incidents/incident-detail";

export default async function IncidentDetailPage(
  props: PageProps<"/incidents/[id]">,
) {
  const { id } = await props.params;
  return <IncidentDetail ticketId={id} />;
}
