import { getSessionCookie } from "./cookies";
import { validateSession } from "./session";
import { AuthContext } from "@/types/auth";
import { UnauthorizedError } from "./errors";

/**
 * Resolves the authenticated context from the server-side session cookie.
 * Returns null if not authenticated or session is invalid.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const token = await getSessionCookie();
  if (!token) {
    return null;
  }

  return validateSession(token);
}

/**
 * Asserts authentication. Returns trusted AuthContext or throws UnauthorizedError.
 */
export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuthContext();
  if (!auth) {
    throw new UnauthorizedError("You must be signed in to access this resource");
  }
  return auth;
}
