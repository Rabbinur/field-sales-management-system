import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/context";
import { requireDealershipAccess } from "@/lib/auth/authorization";
import { AuthError } from "@/lib/auth/errors";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: dealershipId } = await context.params;

    // Enforces dealership data isolation
    requireDealershipAccess(auth, dealershipId);

    // Return dealership summary for authorized tenant
    return NextResponse.json({
      success: true,
      dealershipId,
      authorizedRole: auth.role,
      message: `Access granted to dealership '${dealershipId}' under role '${auth.role}'`,
      data: {
        id: dealershipId,
        region: "Dhaka Metro",
        activeSRs: 8,
        todayOrdersCount: 42,
        syncStatus: "synced",
      },
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
