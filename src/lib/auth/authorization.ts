import { AuthContext, UserRole } from "@/types/auth";
import { ForbiddenError } from "./errors";

/**
 * Require the authenticated user to hold one of the allowed roles.
 */
export function requireRole(
  auth: AuthContext,
  allowedRoles: UserRole[]
): void {
  if (!allowedRoles.includes(auth.role)) {
    throw new ForbiddenError(
      `Role '${auth.role}' is not authorized to perform this operation.`
    );
  }
}

/**
 * Require a specific granular permission code.
 */
export function requirePermission(
  auth: AuthContext,
  permission: string
): void {
  if (!auth.membership.permissions.includes(permission)) {
    throw new ForbiddenError(
      `Missing required permission '${permission}'.`
    );
  }
}

/**
 * Enforce strict Dealership Data Access boundaries across all 4 user categories:
 *
 * 1. SOFTWARE_SUPER_ADMIN:
 *    - Strictly infrastructural. Has NO automatic unrestricted access to commercial
 *      dealership data. Denies commercial data access unless explicitly permitted.
 *
 * 2. MOTHER_COMPANY_ADMIN:
 *    - Allowed ONLY for dealerships in their authorized allowedDealershipIds list.
 *
 * 3. DEALERSHIP_ADMIN:
 *    - Allowed ONLY for their assigned dealershipId.
 *
 * 4. SALES_REPRESENTATIVE:
 *    - Allowed ONLY for their assigned dealershipId.
 */
export function requireDealershipAccess(
  auth: AuthContext,
  targetDealershipId: string
): void {
  if (!targetDealershipId) {
    throw new ForbiddenError("Target dealership ID is required for access validation.");
  }

  switch (auth.role) {
    case "SOFTWARE_SUPER_ADMIN":
      // Software Super Admin operates software infrastructure only.
      // Must NOT automatically access commercial dealership orders, sales, or finances.
      if (!auth.membership.permissions.includes("commercial:diagnostics:override")) {
        throw new ForbiddenError(
          "Software Super Admin role does not have commercial dealership data access."
        );
      }
      break;

    case "MOTHER_COMPANY_ADMIN":
      // Allowed only if targetDealershipId is explicitly in allowedDealershipIds
      const allowedList = auth.membership.allowedDealershipIds || [];
      if (!allowedList.includes(targetDealershipId)) {
        throw new ForbiddenError(
          `Mother Company Admin is not authorized to access dealership '${targetDealershipId}'.`
        );
      }
      break;

    case "DEALERSHIP_ADMIN":
      // Allowed only for their own dealership
      if (auth.membership.dealershipId !== targetDealershipId) {
        throw new ForbiddenError(
          `Dealership Admin cannot access dealership '${targetDealershipId}'.`
        );
      }
      break;

    case "SALES_REPRESENTATIVE":
      // SR is locked strictly to their assigned dealership
      if (auth.membership.dealershipId !== targetDealershipId) {
        throw new ForbiddenError(
          `Sales Representative cannot access dealership '${targetDealershipId}'.`
        );
      }
      break;

    default:
      throw new ForbiddenError("Unknown user role access denied.");
  }
}
