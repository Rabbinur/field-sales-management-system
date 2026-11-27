import { describe, it, expect, beforeEach } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { loginRateLimiter } from "@/lib/auth/rate-limiter";
import { generateSessionToken, hashSessionToken } from "@/lib/auth/session";
import {
  requireRole,
  requirePermission,
  requireDealershipAccess,
} from "@/lib/auth/authorization";
import { resolveTenantScope } from "@/lib/auth/tenant";
import { ForbiddenError } from "@/lib/auth/errors";
import { AuthContext, UserRole } from "@/types/auth";
import { z } from "zod";

describe("Phase 2: Authentication & Password Security", () => {
  it("hashes password with bcrypt and verifies candidate successfully", async () => {
    const plaintext = "SuperSecretPassword2026!";
    const hash = await hashPassword(plaintext);

    expect(hash).not.toBe(plaintext);
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);

    const isValid = await verifyPassword(plaintext, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword("WrongPassword123!", hash);
    expect(isInvalid).toBe(false);
  });

  it("handles empty or malformed inputs without throwing unexpected exceptions", async () => {
    const isValid1 = await verifyPassword("", "somehash");
    expect(isValid1).toBe(false);

    const isValid2 = await verifyPassword("pass", "");
    expect(isValid2).toBe(false);
  });

  it("generates unique salt per hash invocation (preventing rainbow tables)", async () => {
    const pass = "ConsistentPassword2026";
    const hash1 = await hashPassword(pass);
    const hash2 = await hashPassword(pass);

    expect(hash1).not.toBe(hash2);
    expect(await verifyPassword(pass, hash1)).toBe(true);
    expect(await verifyPassword(pass, hash2)).toBe(true);
  });
});

describe("Phase 2: Login Rate Limiter (Brute-Force Protection)", () => {
  const testKey = "test-rate-limit-ip:user@test.com";

  beforeEach(() => {
    loginRateLimiter.reset(testKey);
  });

  it("allows up to 5 attempts then blocks subsequent attempts", () => {
    for (let i = 1; i <= 5; i++) {
      const result = loginRateLimiter.check(testKey);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5 - i);
    }

    // 6th attempt should be blocked
    const blocked = loginRateLimiter.check(testKey);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInSeconds).toBeGreaterThan(0);
  });

  it("resets limit upon successful login", () => {
    loginRateLimiter.check(testKey);
    loginRateLimiter.check(testKey);

    loginRateLimiter.reset(testKey);

    const fresh = loginRateLimiter.check(testKey);
    expect(fresh.allowed).toBe(true);
    expect(fresh.remaining).toBe(4);
  });
});

describe("Phase 2: Session Security", () => {
  it("generates 64-character cryptographically secure hex session tokens", () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it("computes deterministic SHA-256 hash for database storage without leaking raw tokens", () => {
    const rawToken = "e2c0a969b4e6d42125bb7e8f52210ad7c1a8d05e26978184d0b0fe95e4d2bfb9";
    const hash1 = hashSessionToken(rawToken);
    const hash2 = hashSessionToken(rawToken);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).not.toBe(rawToken);
  });
});

describe("Phase 2: Centralized Authorization & Role Boundaries", () => {
  const createMockAuth = (
    role: UserRole,
    dealershipId?: string,
    allowedDealershipIds?: string[],
    permissions: string[] = []
  ): AuthContext => ({
    user: {
      id: "usr-100",
      name: "Test User",
      email: "test@example.com",
      status: "ACTIVE",
    },
    role,
    membership: {
      id: "mem-100",
      role,
      dealershipId,
      allowedDealershipIds,
      permissions,
    },
    sessionId: "sess-100",
  });

  it("allows authorized roles and rejects unauthorized roles with ForbiddenError", () => {
    const dealerAuth = createMockAuth("DEALERSHIP_ADMIN", "dlr-1");

    // Allowed
    expect(() =>
      requireRole(dealerAuth, ["DEALERSHIP_ADMIN", "MOTHER_COMPANY_ADMIN"])
    ).not.toThrow();

    // Disallowed
    expect(() =>
      requireRole(dealerAuth, ["SOFTWARE_SUPER_ADMIN"])
    ).toThrow(ForbiddenError);
  });

  it("verifies granular permissions correctly", () => {
    const auth = createMockAuth("SALES_REPRESENTATIVE", "dlr-1", undefined, [
      "orders:create",
      "outlets:view",
    ]);

    expect(() => requirePermission(auth, "orders:create")).not.toThrow();
    expect(() => requirePermission(auth, "system:diagnostic")).toThrow(
      ForbiddenError
    );
  });
});

describe("Phase 2: Tenant Isolation across 4 User Roles", () => {
  const createAuth = (
    role: UserRole,
    dealershipId?: string,
    allowedDealershipIds?: string[],
    permissions: string[] = []
  ): AuthContext => ({
    user: {
      id: "usr-1",
      name: "User",
      email: "test@user.test",
      status: "ACTIVE",
    },
    role,
    membership: {
      id: "mem-1",
      role,
      dealershipId,
      allowedDealershipIds,
      permissions,
    },
    sessionId: "sess-1",
  });

  // Role 1: SOFTWARE_SUPER_ADMIN
  describe("Role 1: SOFTWARE_SUPER_ADMIN Boundaries", () => {
    it("denies commercial dealership data access by default", () => {
      const superAdminAuth = createAuth(
        "SOFTWARE_SUPER_ADMIN",
        undefined,
        undefined,
        ["system:diagnostic", "system:config"]
      );

      // Attempting to access commercial dealership data
      expect(() =>
        requireDealershipAccess(superAdminAuth, "dlr-1")
      ).toThrow(ForbiddenError);
      expect(() =>
        requireDealershipAccess(superAdminAuth, "dlr-1")
      ).toThrow(/commercial dealership data access/i);
    });

    it("allows diagnostics only when explicit diagnostic override permission is present", () => {
      const privilegedDiagnosticAdmin = createAuth(
        "SOFTWARE_SUPER_ADMIN",
        undefined,
        undefined,
        ["commercial:diagnostics:override"]
      );

      expect(() =>
        requireDealershipAccess(privilegedDiagnosticAdmin, "dlr-1")
      ).not.toThrow();
    });
  });

  // Role 2: MOTHER_COMPANY_ADMIN
  describe("Role 2: MOTHER_COMPANY_ADMIN Boundaries", () => {
    const motherAdmin = createAuth(
      "MOTHER_COMPANY_ADMIN",
      undefined,
      ["dlr-1", "dlr-2"],
      ["reports:view", "dealerships:view"]
    );

    it("allows access to dealerships within their authorized allowlist", () => {
      expect(() => requireDealershipAccess(motherAdmin, "dlr-1")).not.toThrow();
      expect(() => requireDealershipAccess(motherAdmin, "dlr-2")).not.toThrow();
    });

    it("strictly forbids access to dealerships outside their authorized allowlist", () => {
      expect(() => requireDealershipAccess(motherAdmin, "dlr-3")).toThrow(
        ForbiddenError
      );
      expect(() => requireDealershipAccess(motherAdmin, "dlr-999")).toThrow(
        ForbiddenError
      );
    });
  });

  // Role 3: DEALERSHIP_ADMIN
  describe("Role 3: DEALERSHIP_ADMIN Boundaries", () => {
    const dealerAdmin = createAuth(
      "DEALERSHIP_ADMIN",
      "dlr-1",
      undefined,
      ["orders:manage"]
    );

    it("allows access strictly to their assigned dealership", () => {
      expect(() => requireDealershipAccess(dealerAdmin, "dlr-1")).not.toThrow();
    });

    it("strictly rejects tampering with dealershipId parameter", () => {
      // Trying to access another dealership (e.g. dlr-2)
      expect(() => requireDealershipAccess(dealerAdmin, "dlr-2")).toThrow(
        ForbiddenError
      );
      expect(() => requireDealershipAccess(dealerAdmin, "dlr-attacker")).toThrow(
        ForbiddenError
      );
    });
  });

  // Role 4: SALES_REPRESENTATIVE
  describe("Role 4: SALES_REPRESENTATIVE Boundaries", () => {
    const srAuth = createAuth(
      "SALES_REPRESENTATIVE",
      "dlr-1",
      undefined,
      ["orders:create"]
    );

    it("allows access strictly to their assigned dealership", () => {
      expect(() => requireDealershipAccess(srAuth, "dlr-1")).not.toThrow();
    });

    it("strictly forbids access to any other dealership", () => {
      expect(() => requireDealershipAccess(srAuth, "dlr-2")).toThrow(
        ForbiddenError
      );
      expect(() => requireDealershipAccess(srAuth, "dlr-foreign")).toThrow(
        ForbiddenError
      );
    });
  });

  // Tenant Isolation Query Scoping
  describe("Database Query Tenant Scoping (resolveTenantScope)", () => {
    it("locks SR query scope to assigned dealership and ignores client-requested ID", () => {
      const sr = createAuth("SALES_REPRESENTATIVE", "dlr-1");
      const maliciousClientRequestedId = "dlr-malicious-target";

      const scope = resolveTenantScope(sr, maliciousClientRequestedId);
      // Malicious parameter must be completely ignored
      expect(scope.dealershipFilter).toBe("dlr-1");
      expect(scope.dealershipFilter).not.toBe(maliciousClientRequestedId);
    });

    it("locks Dealership Admin query scope to assigned dealership", () => {
      const dealer = createAuth("DEALERSHIP_ADMIN", "dlr-1");
      const scope = resolveTenantScope(dealer, "dlr-other");
      expect(scope.dealershipFilter).toBe("dlr-1");
    });

    it("restricts Mother Company Admin queries to their allowlist", () => {
      const mother = createAuth("MOTHER_COMPANY_ADMIN", undefined, ["dlr-1", "dlr-2"]);

      // Requesting all
      const allScope = resolveTenantScope(mother, "all");
      expect(allScope.dealershipFilter).toEqual({ $in: ["dlr-1", "dlr-2"] });

      // Requesting specific allowed dealership
      const specificScope = resolveTenantScope(mother, "dlr-2");
      expect(specificScope.dealershipFilter).toBe("dlr-2");

      // Requesting forbidden dealership throws
      expect(() => resolveTenantScope(mother, "dlr-999")).toThrow(ForbiddenError);
    });

    it("blocks Software Super Admin queries when no commercial override is granted", () => {
      const superAdmin = createAuth("SOFTWARE_SUPER_ADMIN");
      expect(() => resolveTenantScope(superAdmin, "dlr-1")).toThrow(
        ForbiddenError
      );
    });
  });
});

describe("Phase 2: Zod Input Validation & Data Integrity", () => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  it("accepts valid email and password format", () => {
    const valid = loginSchema.safeParse({
      email: "valid.user@field-sales.test",
      password: "StrongPassword123!",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects invalid email formats", () => {
    const invalidEmail = loginSchema.safeParse({
      email: "not-an-email",
      password: "somepassword",
    });
    expect(invalidEmail.success).toBe(false);
  });

  it("rejects empty passwords", () => {
    const emptyPass = loginSchema.safeParse({
      email: "user@test.com",
      password: "",
    });
    expect(emptyPass.success).toBe(false);
  });
});
