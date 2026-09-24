"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

/**
 * The logged-in user's own institution — used for the sidebar crest/wordmark
 * everywhere, plus the contractor permit template (Institution Admin only,
 * where `address` is always populated since that flow reads the full
 * Institution record rather than the lightweight /me/brand endpoint).
 */
export interface InstitutionBrand {
  name: string;
  logoUrl?: string;
  address?: string;
}

const InstitutionBrandContext = createContext<InstitutionBrand | null>(null);

export function InstitutionBrandProvider({
  value,
  children,
}: {
  value: InstitutionBrand | null;
  children: ReactNode;
}) {
  return <InstitutionBrandContext.Provider value={value}>{children}</InstitutionBrandContext.Provider>;
}

/**
 * Null for Super Admin (not scoped to one institution) and while the current
 * institution's own name/logo is still loading.
 */
export function useInstitutionBrand(): InstitutionBrand | null {
  return useContext(InstitutionBrandContext);
}
