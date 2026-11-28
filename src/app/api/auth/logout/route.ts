import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie, deleteSessionCookie } from "@/lib/auth/cookies";
import { revokeSession } from "@/lib/auth/session";
import { validateCsrfOrigin } from "@/lib/auth/csrf";

export async function POST(req: NextRequest) {
  try {
    // CSRF Origin Verification
    if (!validateCsrfOrigin(req)) {
      return NextResponse.json(
        { success: false, error: "Cross-site request blocked." },
        { status: 403 }
      );
    }

    const token = await getSessionCookie();
    if (token) {
      // Invalidate session in database
      await revokeSession(token);
    }

    // Remove HttpOnly cookie
    await deleteSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (error: any) {
    console.error("Logout API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign out cleanly." },
      { status: 500 }
    );
  }
}
