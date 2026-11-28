import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getDealershipSummary } from "@/app/api/dealerships/[id]/summary/route";
import * as authContextModule from "@/lib/auth/context";
import { AuthContext, UserRole } from "@/types/auth";

describe("Real Tenant-Isolation API Route Tests (/api/dealerships/[id]/summary)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockUserContext = (
    role: UserRole,
    dealershipId?: string,
    allowedDealershipIds?: string[],
    permissions: string[] = []
  ): AuthContext => ({
    user: {
      id: "usr-tenant-test",
      name: "Tenant Test User",
      email: "tenant@test.com",
      status: "ACTIVE",
    },
    role,
    membership: {
      id: "mem-tenant-test",
      role,
      dealershipId,
      allowedDealershipIds,
      permissions,
    },
    sessionId: "sess-test",
  });

  it("1. Rejects unauthenticated requests with HTTP 401 Unauthorized", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/dealerships/dlr-1/summary");
    const res = await getDealershipSummary(req, {
      params: Promise.resolve({ id: "dlr-1" }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/Authentication required/i);
  });

  it("2. Dealership Admin A can access their assigned Dealership A (dlr-1)", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      mockUserContext("DEALERSHIP_ADMIN", "dlr-1")
    );

    const req = new NextRequest("http://localhost:3000/api/dealerships/dlr-1/summary");
    const res = await getDealershipSummary(req, {
      params: Promise.resolve({ id: "dlr-1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.dealershipId).toBe("dlr-1");
  });

  it("3. Dealership Admin A CANNOT access Dealership B (dlr-2) -> 403 Forbidden", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      mockUserContext("DEALERSHIP_ADMIN", "dlr-1")
    );

    // Attempt to access dlr-2 via URL parameter
    const req = new NextRequest("http://localhost:3000/api/dealerships/dlr-2/summary");
    const res = await getDealershipSummary(req, {
      params: Promise.resolve({ id: "dlr-2" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe("FORBIDDEN");
    expect(body.error).toMatch(/Dealership Admin cannot access dealership 'dlr-2'/i);
  });

  it("4. Sales Representative A CANNOT access Dealership B (dlr-2) -> 403 Forbidden", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      mockUserContext("SALES_REPRESENTATIVE", "dlr-1")
    );

    const req = new NextRequest("http://localhost:3000/api/dealerships/dlr-2/summary");
    const res = await getDealershipSummary(req, {
      params: Promise.resolve({ id: "dlr-2" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe("FORBIDDEN");
    expect(body.error).toMatch(/Sales Representative cannot access dealership 'dlr-2'/i);
  });

  it("5. Supplying foreign dealershipId in query parameters does not bypass URL scope validation", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      mockUserContext("SALES_REPRESENTATIVE", "dlr-1")
    );

    // Attacker passes ?dealershipId=dlr-1 while targeting /api/dealerships/dlr-2/summary
    const req = new NextRequest(
      "http://localhost:3000/api/dealerships/dlr-2/summary?dealershipId=dlr-1"
    );
    const res = await getDealershipSummary(req, {
      params: Promise.resolve({ id: "dlr-2" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("6. Mother Company Admin can access allowlisted dealerships (dlr-1, dlr-2)", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      mockUserContext("MOTHER_COMPANY_ADMIN", undefined, ["dlr-1", "dlr-2"])
    );

    const req1 = new NextRequest("http://localhost:3000/api/dealerships/dlr-1/summary");
    const res1 = await getDealershipSummary(req1, {
      params: Promise.resolve({ id: "dlr-1" }),
    });
    expect(res1.status).toBe(200);

    const req2 = new NextRequest("http://localhost:3000/api/dealerships/dlr-2/summary");
    const res2 = await getDealershipSummary(req2, {
      params: Promise.resolve({ id: "dlr-2" }),
    });
    expect(res2.status).toBe(200);
  });

  it("7. Mother Company Admin CANNOT access non-allowlisted dealership (dlr-3) -> 403 Forbidden", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      mockUserContext("MOTHER_COMPANY_ADMIN", undefined, ["dlr-1", "dlr-2"])
    );

    const req = new NextRequest("http://localhost:3000/api/dealerships/dlr-3/summary");
    const res = await getDealershipSummary(req, {
      params: Promise.resolve({ id: "dlr-3" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/not authorized to access dealership 'dlr-3'/i);
  });

  it("8. Software Super Admin CANNOT access commercial dealership data by default -> 403 Forbidden", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      mockUserContext("SOFTWARE_SUPER_ADMIN", undefined, undefined, [
        "system:diagnostic",
        "system:config",
      ])
    );

    const req = new NextRequest("http://localhost:3000/api/dealerships/dlr-1/summary");
    const res = await getDealershipSummary(req, {
      params: Promise.resolve({ id: "dlr-1" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/Software Super Admin role does not have commercial dealership data access/i);
  });

  it("9. Software Super Admin can access with explicit diagnostic override permission", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      mockUserContext("SOFTWARE_SUPER_ADMIN", undefined, undefined, [
        "commercial:diagnostics:override",
      ])
    );

    const req = new NextRequest("http://localhost:3000/api/dealerships/dlr-1/summary");
    const res = await getDealershipSummary(req, {
      params: Promise.resolve({ id: "dlr-1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("10. API response payload never exposes sensitive fields or session secrets", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      mockUserContext("DEALERSHIP_ADMIN", "dlr-1")
    );

    const req = new NextRequest("http://localhost:3000/api/dealerships/dlr-1/summary");
    const res = await getDealershipSummary(req, {
      params: Promise.resolve({ id: "dlr-1" }),
    });

    const body = await res.json();
    expect(body).not.toHaveProperty("passwordHash");
    expect(body).not.toHaveProperty("tokenHash");
    expect(body).not.toHaveProperty("rawToken");
    expect(body.data).toBeDefined();
  });
});
