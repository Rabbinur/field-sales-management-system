import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User, Membership } from "@/models";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";
import { loginRateLimiter } from "@/lib/auth/rate-limiter";
import { validateCsrfOrigin } from "@/lib/auth/csrf";

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    // 0. CSRF Origin Verification
    if (!validateCsrfOrigin(req)) {
      return NextResponse.json(
        { success: false, error: "Cross-site request blocked." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Rate limiting by IP and email to prevent brute-force attacks
    const clientIp =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const rateLimitKey = `${clientIp}:${normalizedEmail}`;
    const rateLimit = loginRateLimiter.check(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed login attempts. Please try again later.",
          retryAfterSeconds: rateLimit.resetInSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Connect to database
    await connectToDatabase();

    // 3. Find user by normalized email, explicitly including passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash"
    );

    // Generic error to prevent user account enumeration
    const genericAuthError = "Invalid email or password";

    if (!user) {
      return NextResponse.json(
        { success: false, error: genericAuthError },
        { status: 401 }
      );
    }

    // 4. Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: genericAuthError },
        { status: 401 }
      );
    }

    // 5. Account status check
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: `Your account is ${user.status.toLowerCase()}. Please contact technical support.`,
        },
        { status: 403 }
      );
    }

    // 6. Find active membership
    const membership = await Membership.findOne({
      userId: user._id,
      status: "ACTIVE",
      isActive: true,
    });

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          error: "No active membership found for this user account.",
        },
        { status: 403 }
      );
    }

    // Reset rate limiter on successful authentication
    loginRateLimiter.reset(rateLimitKey);

    // 7. Create persistent server session
    const userAgent = req.headers.get("user-agent") || undefined;
    const sessionToken = await createSession(user._id.toString(), {
      userAgent,
      ipAddress: clientIp,
    });

    // 8. Set HttpOnly secure cookie
    await setSessionCookie(sessionToken);

    // Return safe user DTO (never returning passwords or raw session secrets)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        status: user.status,
        role: membership.role,
        dealershipId: membership.dealershipId,
        allowedDealershipIds: membership.allowedDealershipIds || [],
      },
    });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
