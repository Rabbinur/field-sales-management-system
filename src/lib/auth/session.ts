import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Session, User, Membership } from "@/models";
import { AuthContext } from "@/types/auth";
import { env } from "@/lib/config/env";

/**
 * Generate cryptographically secure random session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash session token using SHA-256 for persistent database storage.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Create and persist a new user session in MongoDB.
 */
export async function createSession(
  userId: string,
  metadata?: { userAgent?: string; ipAddress?: string }
): Promise<string> {
  await connectToDatabase();

  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(
    Date.now() + env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  );

  await Session.create({
    userId,
    tokenHash,
    expiresAt,
    isRevoked: false,
    lastActivityAt: new Date(),
    userAgent: metadata?.userAgent,
    ipAddress: metadata?.ipAddress,
  });

  // Update user's last login timestamp
  await User.findByIdAndUpdate(userId, { lastLoginAt: new Date() });

  return rawToken;
}

/**
 * Validate a raw session token against MongoDB.
 * Returns verified AuthContext or null if invalid, expired, or revoked.
 */
export async function validateSession(
  rawToken: string
): Promise<AuthContext | null> {
  if (!rawToken || typeof rawToken !== "string") {
    return null;
  }

  await connectToDatabase();
  const tokenHash = hashSessionToken(rawToken);

  const session = await Session.findOne({
    tokenHash,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  // Update last activity periodically
  await Session.findByIdAndUpdate(session._id, {
    lastActivityAt: new Date(),
  });

  // Resolve user
  const user = await User.findById(session.userId);
  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  // Resolve active membership
  const membership = await Membership.findOne({
    userId: user._id,
    status: "ACTIVE",
    isActive: true,
  });

  if (!membership) {
    return null;
  }

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      status: user.status,
    },
    role: membership.role,
    membership: {
      id: membership._id.toString(),
      role: membership.role,
      businessId: membership.businessId,
      dealershipId: membership.dealershipId,
      allowedDealershipIds: membership.allowedDealershipIds || [],
      permissions: membership.permissions || [],
    },
    sessionId: session._id.toString(),
  };
}

/**
 * Revoke a session in MongoDB.
 */
export async function revokeSession(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;

  await connectToDatabase();
  const tokenHash = hashSessionToken(rawToken);

  const result = await Session.findOneAndUpdate(
    { tokenHash, isRevoked: false },
    {
      isRevoked: true,
      revokedAt: new Date(),
    }
  );

  return !!result;
}
