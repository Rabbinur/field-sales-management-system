import { z } from "zod";

export type DealershipStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface IDealership {
  _id: string;
  dealershipId: string;
  name: string;
  legalName?: string;
  code: string;
  businessId: string;
  erpDealershipCode?: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  region: string;
  status: DealershipStatus;
  metadata?: Record<string, any>;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganization {
  _id: string;
  organizationId: string;
  name: string;
  code: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

// Zod schemas for validated API inputs
export const createDealershipSchema = z.object({
  name: z.string().min(2, "Dealership name must be at least 2 characters").max(120),
  legalName: z.string().max(150).optional(),
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, and underscores"),
  contactPerson: z.string().min(2, "Contact person is required").max(100),
  phone: z.string().min(6, "Valid phone number is required").max(20),
  email: z.string().email("Valid email address is required"),
  address: z.string().min(5, "Address must be at least 5 characters").max(250),
  city: z.string().min(2, "City is required").max(60),
  district: z.string().min(2, "District is required").max(60),
  region: z.string().min(2, "Region is required").max(60),
  erpDealershipCode: z.string().max(30).optional(),
});

export const updateDealershipSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  legalName: z.string().max(150).optional(),
  contactPerson: z.string().min(2).max(100).optional(),
  phone: z.string().min(6).max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().min(5).max(250).optional(),
  city: z.string().min(2).max(60).optional(),
  district: z.string().min(2).max(60).optional(),
  region: z.string().min(2).max(60).optional(),
  erpDealershipCode: z.string().max(30).optional(),
});

export const changeDealershipStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"], {
    errorMap: () => ({ message: "Status must be ACTIVE, INACTIVE, or SUSPENDED" }),
  }),
  reason: z.string().min(3, "A valid reason is required for status transitions").max(250).optional(),
});

export type CreateDealershipInput = z.infer<typeof createDealershipSchema>;
export type UpdateDealershipInput = z.infer<typeof updateDealershipSchema>;
export type ChangeDealershipStatusInput = z.infer<typeof changeDealershipStatusSchema>;

export interface DealershipPaginationResult {
  items: IDealership[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
