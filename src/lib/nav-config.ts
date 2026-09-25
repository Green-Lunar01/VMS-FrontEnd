import type { IconSvgElement } from "@hugeicons/react";
import {
  Home09Icon,
  UserGroup03Icon,
  PrisonGuardIcon,
  Briefcase01Icon,
  Motorbike01Icon,
  Analytics01Icon,
  UserFullViewIcon,
  Building06Icon,
  DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";
import type { Role } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  icon: IconSvgElement;
}

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  institution_admin: [
    { label: "Home", href: "/admin/home", icon: Home09Icon },
    { label: "Visitors Log", href: "/admin/visitors", icon: UserGroup03Icon },
    { label: "Residents", href: "/admin/officers", icon: PrisonGuardIcon },
    { label: "Contractors", href: "/admin/contractors", icon: Briefcase01Icon },
    { label: "Dispatcher", href: "/admin/dispatcher", icon: Motorbike01Icon },
    { label: "Analytics", href: "/admin/analytics", icon: Analytics01Icon },
    { label: "Admins/Users", href: "/admin/admins", icon: UserFullViewIcon },
  ],
  security_officer: [
    { label: "Home", href: "/security/home", icon: Home09Icon },
    { label: "Visitors Log", href: "/security/visitors", icon: UserGroup03Icon },
    { label: "Residents", href: "/security/officers", icon: PrisonGuardIcon },
    { label: "Contractors", href: "/security/contractors", icon: Briefcase01Icon },
    { label: "Dispatcher", href: "/security/dispatcher", icon: Motorbike01Icon },
  ],
  host: [
    { label: "Dashboard", href: "/host/dashboard", icon: Home09Icon },
  ],
  super_admin: [
    { label: "Dashboard", href: "/super-admin/dashboard", icon: DashboardSquare01Icon },
    { label: "Institutions", href: "/super-admin/institutions", icon: Building06Icon },
    { label: "Admin", href: "/super-admin/admins", icon: UserFullViewIcon },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  institution_admin: "Institution Admin",
  security_officer: "Security Officer",
  host: "Resident",
  super_admin: "Super Admin",
};
