/**
 * Database Seed Script for Field Sales Management System
 * Bootstraps 4 distinct initial accounts for Phase 2:
 * 1. SOFTWARE_SUPER_ADMIN
 * 2. MOTHER_COMPANY_ADMIN
 * 3. DEALERSHIP_ADMIN
 * 4. SALES_REPRESENTATIVE
 *
 * Usage:
 *   node --env-file=.env scripts/seed.mjs
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URL ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/field_sales_db";

const SEED_ACCOUNTS = [
  {
    name: "Alex Vance (SuperAdmin)",
    email: process.env.SEED_SUPERADMIN_EMAIL || "superadmin@field-sales.test",
    password: process.env.SEED_SUPERADMIN_PASSWORD || "SuperAdmin@Secure2026!",
    role: "SOFTWARE_SUPER_ADMIN",
    status: "ACTIVE",
    permissions: ["system:diagnostic", "system:config", "users:support"],
  },
  {
    name: "Rahim Chowdhury (MotherAdmin)",
    email: process.env.SEED_MOTHER_ADMIN_EMAIL || "motheradmin@field-sales.test",
    password: process.env.SEED_MOTHER_ADMIN_PASSWORD || "MotherAdmin@Secure2026!",
    role: "MOTHER_COMPANY_ADMIN",
    businessId: "mother-company-corp",
    allowedDealershipIds: ["dlr-1", "dlr-2"],
    status: "ACTIVE",
    permissions: ["reports:view", "dealerships:view", "orders:audit"],
  },
  {
    name: "Karim Ahmed (DealerAdmin)",
    email: process.env.SEED_DEALER_ADMIN_EMAIL || "dealershipadmin@field-sales.test",
    password: process.env.SEED_DEALER_ADMIN_PASSWORD || "DealerAdmin@Secure2026!",
    role: "DEALERSHIP_ADMIN",
    dealershipId: "dlr-1",
    status: "ACTIVE",
    permissions: ["orders:manage", "inventory:view", "srs:manage"],
  },
  {
    name: "Tanvir Hasan (SalesRep)",
    email: process.env.SEED_SR_EMAIL || "sr@field-sales.test",
    password: process.env.SEED_SR_PASSWORD || "SalesRep@Secure2026!",
    role: "SALES_REPRESENTATIVE",
    dealershipId: "dlr-1",
    status: "ACTIVE",
    permissions: ["orders:create", "outlets:view", "visits:log"],
  },
];

async function seed() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    if (process.env.ALLOW_PRODUCTION_SEED !== "true") {
      throw new Error(
        "SAFETY ERROR: Running seed against a production environment is blocked by default. Set ALLOW_PRODUCTION_SEED=true to proceed."
      );
    }

    // Guard against default dev passwords in production
    for (const acc of SEED_ACCOUNTS) {
      if (acc.password.includes("Secure2026!")) {
        throw new Error(
          `SAFETY ERROR: Default dev password detected for ${acc.role} in production. Provide strong, custom environment variables.`
        );
      }
    }
  }

  // Mask sensitive parts of connection URI
  const maskedUri = MONGODB_URI.replace(/:[^:@]+@/, ":****@");
  console.log("Connecting to MongoDB:", maskedUri);
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB successfully.");

  const db = mongoose.connection.db;

  const usersCollection = db.collection("users");
  const membershipsCollection = db.collection("memberships");

  // Ensure unique index on email
  await usersCollection.createIndex({ email: 1 }, { unique: true });
  await membershipsCollection.createIndex({ userId: 1, status: 1 });
  await membershipsCollection.createIndex({ dealershipId: 1, role: 1 });

  for (const account of SEED_ACCOUNTS) {
    const normalizedEmail = account.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(account.password, 12);

    // Upsert User
    const userResult = await usersCollection.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          name: account.name,
          email: normalizedEmail,
          passwordHash,
          status: account.status,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    const userDoc = userResult;
    const userId = userDoc._id;

    // Upsert Membership
    await membershipsCollection.findOneAndUpdate(
      { userId: userId, role: account.role },
      {
        $set: {
          userId: userId,
          role: account.role,
          businessId: account.businessId || undefined,
          dealershipId: account.dealershipId || undefined,
          allowedDealershipIds: account.allowedDealershipIds || [],
          permissions: account.permissions,
          status: "ACTIVE",
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`✓ Bootstrapped ${account.role}: ${normalizedEmail}`);
  }

  // --- Phase 3: Bootstrap Organization & Initial Dealerships ---
  const orgsCollection = db.collection("organizations");
  const dealershipsCollection = db.collection("dealerships");

  await orgsCollection.createIndex({ organizationId: 1 }, { unique: true });
  await dealershipsCollection.createIndex({ dealershipId: 1 }, { unique: true });
  await dealershipsCollection.createIndex({ code: 1 }, { unique: true });
  await dealershipsCollection.createIndex({ businessId: 1, status: 1 });

  // Organization
  await orgsCollection.findOneAndUpdate(
    { organizationId: "mother-company-corp" },
    {
      $set: {
        organizationId: "mother-company-corp",
        name: "Apex Consumer Goods PLC",
        code: "APEX-HQ",
        status: "ACTIVE",
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log("✓ Bootstrapped Organization: Apex Consumer Goods PLC (mother-company-corp)");

  // Dealerships
  const INITIAL_DEALERSHIPS = [
    {
      dealershipId: "dlr-1",
      name: "Dhaka Central Distribution Hub",
      legalName: "Dhaka Central Distribution Agency Ltd.",
      code: "DLR-DHK-01",
      businessId: "mother-company-corp",
      erpDealershipCode: "ERP-DLR-001",
      contactPerson: "Karim Ahmed",
      phone: "+8801711000001",
      email: "dhaka-central@dealership.field-sales.test",
      address: "Plot 14, Tejgaon Industrial Area",
      city: "Dhaka",
      district: "Dhaka",
      region: "Central",
      status: "ACTIVE",
      metadata: {
        statusHistory: [
          {
            from: "INITIAL",
            to: "ACTIVE",
            changedAt: new Date(),
            changedBy: "system",
            reason: "Initial seed bootstrapping",
          },
        ],
      },
    },
    {
      dealershipId: "dlr-2",
      name: "Chittagong Port Distribution Hub",
      legalName: "Agrabad Commercial Sales & Distribution",
      code: "DLR-CTG-01",
      businessId: "mother-company-corp",
      erpDealershipCode: "ERP-DLR-002",
      contactPerson: "Nusrat Jahan",
      phone: "+8801811000002",
      email: "ctg-port@dealership.field-sales.test",
      address: "Agrabad Commercial Area, Road 3",
      city: "Chittagong",
      district: "Chittagong",
      region: "South-East",
      status: "ACTIVE",
      metadata: {
        statusHistory: [
          {
            from: "INITIAL",
            to: "ACTIVE",
            changedAt: new Date(),
            changedBy: "system",
            reason: "Initial seed bootstrapping",
          },
        ],
      },
    },
  ];

  for (const dealer of INITIAL_DEALERSHIPS) {
    await dealershipsCollection.findOneAndUpdate(
      { dealershipId: dealer.dealershipId },
      {
        $set: {
          ...dealer,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log(`✓ Bootstrapped Dealership: ${dealer.name} [${dealer.dealershipId}] (${dealer.code})`);
  }

  console.log("All Phase 2 & Phase 3 seed records created/updated successfully.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
