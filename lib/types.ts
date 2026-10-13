export type Role = "admin" | "agent" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  department: string;
  location: string;
  avatarColor: string;
  active: boolean;
}

export type TicketState =
  | "New"
  | "In Progress"
  | "On Hold"
  | "Resolved"
  | "Closed";

export type Priority = "Critical" | "High" | "Moderate" | "Low";

export type Impact = "1 - High" | "2 - Medium" | "3 - Low";
export type Urgency = "1 - High" | "2 - Medium" | "3 - Low";

export type Channel = "Self-service" | "Email" | "Phone" | "Walk-in" | "Chat";

export interface Activity {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  kind: "comment" | "work_note" | "activity";
  createdAt: string;
}

export interface Ticket {
  id: string;
  number: string;
  shortDescription: string;
  description: string;
  state: TicketState;
  priority: Priority;
  impact: Impact;
  urgency: Urgency;
  category: string;
  assignmentGroup: string;
  assigneeId: string | null;
  callerId: string;
  channel: Channel;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  slaDueAt: string;
  relatedArticleIds: string[];
}

export type CatalogFieldType = "text" | "textarea" | "select" | "number";

export interface CatalogField {
  name: string;
  label: string;
  type: CatalogFieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  icon: string;
  price: number;
  deliveryTime: string;
  popular: boolean;
  fields: CatalogField[];
}

export type RequestState =
  | "Submitted"
  | "Approved"
  | "In Fulfillment"
  | "Fulfilled"
  | "Rejected";

export interface ServiceRequest {
  id: string;
  number: string;
  itemId: string;
  itemName: string;
  itemIcon: string;
  requestedForId: string;
  requestedById: string;
  state: RequestState;
  values: Record<string, string>;
  price: number;
  createdAt: string;
  updatedAt: string;
  dueAt: string;
}

export interface Article {
  id: string;
  number: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  tags: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  helpful: number;
  notHelpful: number;
}
