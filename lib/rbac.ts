import type { Role, User } from "./types";

export function isStaff(user: User | null | undefined): boolean {
  return user?.role === "agent" || user?.role === "admin";
}

export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === "admin";
}

export interface Permissions {
  canManageTickets: boolean;
  canAssign: boolean;
  canChangeState: boolean;
  canAddWorkNote: boolean;
  canComment: boolean;
  canFulfillRequests: boolean;
  canResetData: boolean;
  canViewAllTickets: boolean;
}

export function permissionsFor(user: User | null | undefined): Permissions {
  const staff = isStaff(user);
  return {
    canManageTickets: staff,
    canAssign: staff,
    canChangeState: staff,
    canAddWorkNote: staff,
    canComment: Boolean(user),
    canFulfillRequests: staff,
    canResetData: isAdmin(user),
    canViewAllTickets: staff,
  };
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  agent: "ITIL Agent",
  user: "Employee",
};
