import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .default(
      process.env.MONGODB_URL ||
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/field_sales_db"
    ),
  SESSION_SECRET: z
    .string()
    .min(16, "SESSION_SECRET must be at least 16 characters long")
    .default("dev-session-secret-field-sales-management-system-2026-secure-key"),
  SESSION_COOKIE_NAME: z
    .string()
    .default("fsms_session"),
  SESSION_MAX_AGE_DAYS: z
    .coerce
    .number()
    .int()
    .positive()
    .default(7),
  SEED_SUPERADMIN_EMAIL: z
    .string()
    .email()
    .default("superadmin@field-sales.test"),
  SEED_SUPERADMIN_PASSWORD: z
    .string()
    .min(8)
    .default("SuperAdmin@Secure2026!"),
  SEED_MOTHER_ADMIN_EMAIL: z
    .string()
    .email()
    .default("motheradmin@field-sales.test"),
  SEED_MOTHER_ADMIN_PASSWORD: z
    .string()
    .min(8)
    .default("MotherAdmin@Secure2026!"),
  SEED_DEALER_ADMIN_EMAIL: z
    .string()
    .email()
    .default("dealershipadmin@field-sales.test"),
  SEED_DEALER_ADMIN_PASSWORD: z
    .string()
    .min(8)
    .default("DealerAdmin@Secure2026!"),
  SEED_SR_EMAIL: z
    .string()
    .email()
    .default("sr@field-sales.test"),
  SEED_SR_PASSWORD: z
    .string()
    .min(8)
    .default("SalesRep@Secure2026!"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGODB_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_DAYS: process.env.SESSION_MAX_AGE_DAYS,
  SEED_SUPERADMIN_EMAIL: process.env.SEED_SUPERADMIN_EMAIL,
  SEED_SUPERADMIN_PASSWORD: process.env.SEED_SUPERADMIN_PASSWORD,
  SEED_MOTHER_ADMIN_EMAIL: process.env.SEED_MOTHER_ADMIN_EMAIL,
  SEED_MOTHER_ADMIN_PASSWORD: process.env.SEED_MOTHER_ADMIN_PASSWORD,
  SEED_DEALER_ADMIN_EMAIL: process.env.SEED_DEALER_ADMIN_EMAIL,
  SEED_DEALER_ADMIN_PASSWORD: process.env.SEED_DEALER_ADMIN_PASSWORD,
  SEED_SR_EMAIL: process.env.SEED_SR_EMAIL,
  SEED_SR_PASSWORD: process.env.SEED_SR_PASSWORD,
});

export type Env = z.infer<typeof envSchema>;
