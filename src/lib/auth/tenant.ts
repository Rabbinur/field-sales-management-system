import { AuthContext } from "@/types/auth";
import { ForbiddenError } from "./errors";

export interface TenantScope {
  dealershipFilter: string | { $in: string[] };
}

/**
 * Resolves authoritative dealership tenant scope for database queries.
 *
 * GUARANTEES:
 * - Client-provided `dealershipId` is NEVER trusted for DEALERSHIP_ADMIN or SR.
 * - SR is locked to their server-resolved assigned dealership.
 * - DEALERSHIP_ADMIN is locked to their assigned dealership.
 * - MOTHER_COMPANY_ADMIN can only query within their allowedDealershipIds.
 * - SOFTWARE_SUPER_ADMIN cannot query commercial tenant data without explicit permission.
 */
export function resolveTenantScope(
  auth: AuthContext,
  clientRequestedDealershipId?: string
): TenantScope {
  switch (auth.role) {
    case "DEALERSHIP_ADMIN":
    case "SALES_REPRESENTATIVE": {
      // Completely ignore any client-supplied dealership ID
      const assignedId = auth.membership.dealershipId;
      if (!assignedId) {
        throw new ForbiddenError("User is not assigned to an active dealership.");
      }
      return { dealershipFilter: assignedId };
    }

    case "MOTHER_COMPANY_ADMIN": {
      const allowed = auth.membership.allowedDealershipIds || [];
      if (allowed.length === 0) {
        throw new ForbiddenError(
          "Mother Company Admin has no authorized dealerships assigned."
        );
      }

      // If client requests a specific dealership, ensure it is in the allowlist
      if (clientRequestedDealershipId && clientRequestedDealershipId !== "all") {
        if (!allowed.includes(clientRequestedDealershipId)) {
          throw new ForbiddenError(
            `Unauthorized access to dealership '${clientRequestedDealershipId}'.`
          );
        }
        return { dealershipFilter: clientRequestedDealershipId };
      }

      // Otherwise, filter by all allowed dealerships
      return { dealershipFilter: { $in: allowed } };
    }

    case "SOFTWARE_SUPER_ADMIN": {
      // Deny commercial tenant queries by default
      if (!auth.membership.permissions.includes("commercial:diagnostics:override")) {
        throw new ForbiddenError(
          "Software Super Admin is restricted from accessing commercial tenant data."
        );
      }

      if (clientRequestedDealershipId && clientRequestedDealershipId !== "all") {
        return { dealershipFilter: clientRequestedDealershipId };
      }
      return { dealershipFilter: { $in: [] } };
    }

    default:
      throw new ForbiddenError("Unauthorized role for tenant scoping.");
  }
}
