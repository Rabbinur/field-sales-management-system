import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  createDealershipSchema,
  changeDealershipStatusSchema,
} from "@/types/dealership";
import { DealershipService } from "@/lib/dealership/service";
import { Dealership } from "@/models";
import * as authContextModule from "@/lib/auth/context";
import { AuthContext, UserRole } from "@/types/auth";
import { ForbiddenError, ConflictError } from "@/lib/auth/errors";

// Mock MongoDB connection to prevent network timeouts during unit testing
vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue({}),
  disconnectFromDatabase: vi.fn().mockResolvedValue(undefined),
}));

// Import API Route Handlers
import { GET as getDealerships, POST as createDealershipRoute } from "@/app/api/dealerships/route";
import { GET as getDealershipByIdRoute } from "@/app/api/dealerships/[id]/route";
import { PATCH as changeStatusRoute } from "@/app/api/dealerships/[id]/status/route";

describe("Phase 3: Dealership Schema Validations", () => {
  it("validates valid createDealershipSchema input", () => {
    const validData = {
      name: "Sylhet Regional Hub",
      legalName: "Sylhet Distribution Ltd.",
      code: "DLR-SYL-01",
      erpDealershipCode: "ERP-DLR-005",
      contactPerson: "Jamil Chowdhury",
      phone: "+8801712345678",
      email: "sylhet@dealership.field-sales.test",
      address: "Subidbazar Main Road",
      city: "Sylhet",
      district: "Sylhet",
      region: "North-East",
    };

    const parsed = createDealershipSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("rejects lowercase or invalid characters in dealership code", () => {
    const invalidCode = {
      name: "Sylhet Hub",
      code: "dlr-syl-01!", // lowercase and exclamation mark
      contactPerson: "Jamil Chowdhury",
      phone: "+8801712345678",
      email: "sylhet@dealership.field-sales.test",
      address: "Subidbazar",
      city: "Sylhet",
      district: "Sylhet",
      region: "North-East",
    };

    const parsed = createDealershipSchema.safeParse(invalidCode);
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid status in changeDealershipStatusSchema", () => {
    const invalid = {
      status: "DELETED", // Not in ACTIVE | INACTIVE | SUSPENDED
      reason: "Audit check",
    };

    const parsed = changeDealershipStatusSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects changeDealershipStatusSchema when reason is shorter than 3 characters", () => {
    const invalidReason = {
      status: "SUSPENDED",
      reason: "no",
    };

    const parsed = changeDealershipStatusSchema.safeParse(invalidReason);
    expect(parsed.success).toBe(false);
  });
});

describe("Phase 3: DealershipService Domain & Tenant Boundaries", () => {
  const createMockAuth = (
    role: UserRole,
    dealershipId?: string,
    allowedDealershipIds?: string[],
    businessId: string = "mother-company-corp"
  ): AuthContext => ({
    user: {
      id: `usr-${role.toLowerCase()}`,
      name: `User ${role}`,
      email: `${role.toLowerCase()}@field-sales.test`,
      status: "ACTIVE",
    },
    role,
    membership: {
      id: `mem-${role.toLowerCase()}`,
      role,
      businessId,
      dealershipId,
      allowedDealershipIds,
      permissions: [],
    },
    sessionId: `sess-${role.toLowerCase()}`,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("1. Blocks SOFTWARE_SUPER_ADMIN from listing commercial dealerships (403 Forbidden)", async () => {
    const superAdmin = createMockAuth("SOFTWARE_SUPER_ADMIN");

    await expect(DealershipService.listDealerships(superAdmin)).rejects.toThrow(
      ForbiddenError
    );
  });

  it("2. Rejects Dealership Admin from creating a new dealership (403 Forbidden)", async () => {
    const dealerAdmin = createMockAuth("DEALERSHIP_ADMIN", "dlr-1");

    await expect(
      DealershipService.createDealership(dealerAdmin, {
        name: "Test Hub",
        code: "DLR-TEST-01",
        contactPerson: "Admin",
        phone: "+8801700000000",
        email: "test@hub.com",
        address: "Address",
        city: "City",
        district: "District",
        region: "Region",
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("3. Throws ConflictError (409) if dealership code already exists", async () => {
    const motherAdmin = createMockAuth("MOTHER_COMPANY_ADMIN", undefined, ["dlr-1"]);

    vi.spyOn(Dealership, "findOne").mockResolvedValueOnce({
      _id: "existing-id",
      code: "DLR-DHK-01",
    } as any);

    await expect(
      DealershipService.createDealership(motherAdmin, {
        name: "Duplicate Dhaka Hub",
        code: "DLR-DHK-01",
        contactPerson: "Admin",
        phone: "+8801700000000",
        email: "test@hub.com",
        address: "Address",
        city: "Dhaka",
        district: "Dhaka",
        region: "Central",
      })
    ).rejects.toThrow(ConflictError);
  });

  it("4. Dealership Admin cannot view another dealership (403 Forbidden)", async () => {
    const dealerAdmin1 = createMockAuth("DEALERSHIP_ADMIN", "dlr-1");

    await expect(
      DealershipService.getDealershipById(dealerAdmin1, "dlr-2")
    ).rejects.toThrow(ForbiddenError);
  });

  it("5. Dealership Admin cannot edit another dealership (403 Forbidden)", async () => {
    const dealerAdmin1 = createMockAuth("DEALERSHIP_ADMIN", "dlr-1");

    await expect(
      DealershipService.updateDealership(dealerAdmin1, "dlr-2", {
        phone: "+8801799999999",
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("6. Dealership Admin cannot change dealership status (403 Forbidden)", async () => {
    const dealerAdmin1 = createMockAuth("DEALERSHIP_ADMIN", "dlr-1");

    await expect(
      DealershipService.changeDealershipStatus(dealerAdmin1, "dlr-1", {
        status: "SUSPENDED",
        reason: "Unauthorized attempt",
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("7. Mother Company Admin cannot access dealership outside allowedDealershipIds", async () => {
    const motherAdminScoped = createMockAuth(
      "MOTHER_COMPANY_ADMIN",
      undefined,
      ["dlr-1", "dlr-2"]
    );

    await expect(
      DealershipService.getDealershipById(motherAdminScoped, "dlr-foreign")
    ).rejects.toThrow(ForbiddenError);
  });
});

describe("Phase 3: Dealership API Route Handlers Integration", () => {
  const createMockAuth = (
    role: UserRole,
    dealershipId?: string,
    allowedDealershipIds?: string[]
  ): AuthContext => ({
    user: {
      id: `usr-${role.toLowerCase()}`,
      name: `User ${role}`,
      email: `${role.toLowerCase()}@field-sales.test`,
      status: "ACTIVE",
    },
    role,
    membership: {
      id: `mem-${role.toLowerCase()}`,
      role,
      businessId: "mother-company-corp",
      dealershipId,
      allowedDealershipIds,
      permissions: [],
    },
    sessionId: `sess-${role.toLowerCase()}`,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /api/dealerships rejects unauthenticated request with 401", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/dealerships");
    const res = await getDealerships(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("POST /api/dealerships blocks cross-site request (CSRF check)", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      createMockAuth("MOTHER_COMPANY_ADMIN")
    );

    // Cross-site origin header
    const req = new NextRequest("http://localhost:3000/api/dealerships", {
      method: "POST",
      headers: {
        origin: "http://malicious-site.com",
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const res = await createDealershipRoute(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/Cross-site request blocked/i);
  });

  it("POST /api/dealerships rejects DEALERSHIP_ADMIN with 403 Forbidden", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      createMockAuth("DEALERSHIP_ADMIN", "dlr-1")
    );

    const req = new NextRequest("http://localhost:3000/api/dealerships", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "Illegal Hub",
        code: "DLR-ILLEGAL-01",
        contactPerson: "Dealer",
        phone: "+8801700000000",
        email: "illegal@hub.com",
        address: "Address",
        city: "City",
        district: "District",
        region: "Region",
      }),
    });

    const res = await createDealershipRoute(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("GET /api/dealerships/[id] rejects unauthorized tenant with 403", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      createMockAuth("DEALERSHIP_ADMIN", "dlr-1")
    );

    const req = new NextRequest("http://localhost:3000/api/dealerships/dlr-2");
    const res = await getDealershipByIdRoute(req, {
      params: Promise.resolve({ id: "dlr-2" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("PATCH /api/dealerships/[id]/status rejects DEALERSHIP_ADMIN with 403 Forbidden", async () => {
    vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(
      createMockAuth("DEALERSHIP_ADMIN", "dlr-1")
    );

    const req = new NextRequest("http://localhost:3000/api/dealerships/dlr-1/status", {
      method: "PATCH",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        status: "SUSPENDED",
        reason: "Self suspension attempt",
      }),
    });

    const res = await changeStatusRoute(req, {
      params: Promise.resolve({ id: "dlr-1" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
