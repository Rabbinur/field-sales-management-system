import { connectToDatabase } from "@/lib/db/mongodb";
import { Dealership, Membership } from "@/models";
import { AuthContext } from "@/types/auth";
import {
  CreateDealershipInput,
  UpdateDealershipInput,
  ChangeDealershipStatusInput,
  DealershipPaginationResult,
  IDealership,
} from "@/types/dealership";
import {
  requireRole,
  requireDealershipAccess,
} from "@/lib/auth/authorization";
import { resolveTenantScope } from "@/lib/auth/tenant";
import {
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "@/lib/auth/errors";

export interface ListDealershipsOptions {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Dealership Domain Service
 * Encapsulates domain logic, tenant scoping, lifecycle transitions, and data integrity.
 */
export class DealershipService {
  /**
   * List authorized dealerships with server-side pagination, search, and filtering.
   */
  public static async listDealerships(
    auth: AuthContext,
    options: ListDealershipsOptions = {}
  ): Promise<DealershipPaginationResult> {
    // 1. Authoritative tenant scoping (Fail fast)
    const scope = resolveTenantScope(auth);

    await connectToDatabase();

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    // 2. Build MongoDB query
    const query: Record<string, any> = {
      dealershipId: scope.dealershipFilter,
    };

    // Filter by status if requested and valid
    if (
      options.status &&
      ["ACTIVE", "INACTIVE", "SUSPENDED"].includes(options.status.toUpperCase())
    ) {
      query.status = options.status.toUpperCase();
    }

    // Search by name, code, or city (case-insensitive)
    if (options.search && options.search.trim().length > 0) {
      const sanitized = options.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: sanitized, $options: "i" } },
        { code: { $regex: sanitized, $options: "i" } },
        { city: { $regex: sanitized, $options: "i" } },
        { region: { $regex: sanitized, $options: "i" } },
      ];
    }

    // 3. Query database with count & pagination
    const [items, total] = await Promise.all([
      Dealership.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dealership.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items.map((doc: any) => ({
        ...doc,
        _id: doc._id.toString(),
      })) as IDealership[],
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  /**
   * Get dealership details by unique ID with tenant isolation verification.
   */
  public static async getDealershipById(
    auth: AuthContext,
    dealershipId: string
  ): Promise<IDealership> {
    // 1. Enforce tenant boundary (Fail fast)
    requireDealershipAccess(auth, dealershipId);

    await connectToDatabase();

    const dealership = await Dealership.findOne({ dealershipId }).lean();
    if (!dealership) {
      throw new NotFoundError(`Dealership with ID '${dealershipId}' not found.`);
    }

    return {
      ...dealership,
      _id: (dealership as any)._id.toString(),
    } as IDealership;
  }

  /**
   * Create a new dealership.
   * Restricted to MOTHER_COMPANY_ADMIN with valid organizational scope.
   */
  public static async createDealership(
    auth: AuthContext,
    input: CreateDealershipInput
  ): Promise<IDealership> {
    // 1. Role validation (Fail fast): Only Mother Company Admin can register new dealerships
    requireRole(auth, ["MOTHER_COMPANY_ADMIN"]);

    await connectToDatabase();

    // 2. Validate code uniqueness
    const normalizedCode = input.code.trim().toUpperCase();
    const existingByCode = await Dealership.findOne({ code: normalizedCode });
    if (existingByCode) {
      throw new ConflictError(
        `A dealership with code '${normalizedCode}' already exists.`
      );
    }

    // 3. Generate deterministic, unique dealershipId
    const baseSlug = normalizedCode.toLowerCase().replace(/[^a-z0-9]/g, "-");
    let dealershipId = `dlr-${baseSlug}`;

    // Verify dealershipId collision
    const existingById = await Dealership.findOne({ dealershipId });
    if (existingById) {
      dealershipId = `dlr-${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    // 4. Derive authoritative businessId from authenticated session
    // NEVER trust client-provided organization/businessId
    const businessId = auth.membership.businessId || "mother-company-corp";

    // 5. Create Dealership
    const newDealership = await Dealership.create({
      dealershipId,
      name: input.name.trim(),
      legalName: input.legalName?.trim(),
      code: normalizedCode,
      businessId,
      erpDealershipCode: input.erpDealershipCode?.trim(),
      contactPerson: input.contactPerson.trim(),
      phone: input.phone.trim(),
      email: input.email.trim().toLowerCase(),
      address: input.address.trim(),
      city: input.city.trim(),
      district: input.district.trim(),
      region: input.region.trim(),
      status: "ACTIVE",
      createdBy: auth.user.id,
      updatedBy: auth.user.id,
      metadata: {
        creatorRole: auth.role,
        creationTimestamp: new Date().toISOString(),
      },
    });

    // 6. Automatically add new dealershipId to creator's membership allowlist
    await Membership.findByIdAndUpdate(auth.membership.id, {
      $addToSet: { allowedDealershipIds: dealershipId },
    });

    return {
      ...newDealership.toObject(),
      _id: newDealership._id.toString(),
    } as IDealership;
  }

  /**
   * Edit dealership details.
   * - MOTHER_COMPANY_ADMIN: Can update full profile (cannot change businessId or dealershipId).
   * - DEALERSHIP_ADMIN: Can update only contact info for their own dealership.
   */
  public static async updateDealership(
    auth: AuthContext,
    dealershipId: string,
    input: UpdateDealershipInput
  ): Promise<IDealership> {
    // 1. Authoritative access check (Fail fast)
    requireDealershipAccess(auth, dealershipId);
    if (auth.role !== "DEALERSHIP_ADMIN" && auth.role !== "MOTHER_COMPANY_ADMIN") {
      throw new ForbiddenError("Your role is not authorized to edit dealerships.");
    }

    await connectToDatabase();

    const dealership = await Dealership.findOne({ dealershipId });
    if (!dealership) {
      throw new NotFoundError(`Dealership with ID '${dealershipId}' not found.`);
    }

    // 2. Role-specific field authorization
    if (auth.role === "DEALERSHIP_ADMIN") {
      // Dealership Admin may only update operational contact details
      if (input.contactPerson !== undefined) dealership.contactPerson = input.contactPerson.trim();
      if (input.phone !== undefined) dealership.phone = input.phone.trim();
      if (input.email !== undefined) dealership.email = input.email.trim().toLowerCase();
      if (input.address !== undefined) dealership.address = input.address.trim();
      if (input.city !== undefined) dealership.city = input.city.trim();
      if (input.district !== undefined) dealership.district = input.district.trim();
      if (input.region !== undefined) dealership.region = input.region.trim();
    } else if (auth.role === "MOTHER_COMPANY_ADMIN") {
      // Mother Company Admin can update all profile fields
      if (input.name !== undefined) dealership.name = input.name.trim();
      if (input.legalName !== undefined) dealership.legalName = input.legalName?.trim();
      if (input.contactPerson !== undefined) dealership.contactPerson = input.contactPerson.trim();
      if (input.phone !== undefined) dealership.phone = input.phone.trim();
      if (input.email !== undefined) dealership.email = input.email.trim().toLowerCase();
      if (input.address !== undefined) dealership.address = input.address.trim();
      if (input.city !== undefined) dealership.city = input.city.trim();
      if (input.district !== undefined) dealership.district = input.district.trim();
      if (input.region !== undefined) dealership.region = input.region.trim();
      if (input.erpDealershipCode !== undefined) dealership.erpDealershipCode = input.erpDealershipCode?.trim();
    } else {
      throw new ForbiddenError("Your role is not authorized to edit dealerships.");
    }

    dealership.updatedBy = auth.user.id;
    await dealership.save();

    return {
      ...dealership.toObject(),
      _id: dealership._id.toString(),
    } as IDealership;
  }

  /**
   * Safely transition dealership lifecycle status (ACTIVE, INACTIVE, SUSPENDED).
   * Restricted to MOTHER_COMPANY_ADMIN.
   */
  public static async changeDealershipStatus(
    auth: AuthContext,
    dealershipId: string,
    input: ChangeDealershipStatusInput
  ): Promise<IDealership> {
    // 1. Role validation (Fail fast): Only Mother Company Admin can change dealership lifecycle states
    requireRole(auth, ["MOTHER_COMPANY_ADMIN"]);
    requireDealershipAccess(auth, dealershipId);

    await connectToDatabase();

    const dealership = await Dealership.findOne({ dealershipId });
    if (!dealership) {
      throw new NotFoundError(`Dealership with ID '${dealershipId}' not found.`);
    }

    if (dealership.status === input.status) {
      return {
        ...dealership.toObject(),
        _id: dealership._id.toString(),
      } as IDealership;
    }

    // 2. Audit status transition in metadata
    const previousStatus = dealership.status;
    dealership.status = input.status;
    dealership.updatedBy = auth.user.id;

    if (!dealership.metadata) {
      dealership.metadata = {};
    }
    if (!Array.isArray(dealership.metadata.statusHistory)) {
      dealership.metadata.statusHistory = [];
    }

    dealership.metadata.statusHistory.push({
      from: previousStatus,
      to: input.status,
      changedBy: auth.user.id,
      timestamp: new Date().toISOString(),
      reason: input.reason || "Administrative lifecycle status update",
    });

    dealership.markModified("metadata");
    await dealership.save();

    return {
      ...dealership.toObject(),
      _id: dealership._id.toString(),
    } as IDealership;
  }
}
