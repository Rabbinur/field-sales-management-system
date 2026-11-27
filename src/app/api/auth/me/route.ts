import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/context";

export async function GET() {
  try {
    const auth = await getAuthContext();

    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: auth.user.id,
        name: auth.user.name,
        email: auth.user.email,
        status: auth.user.status,
        role: auth.role,
        dealershipId: auth.membership.dealershipId,
        allowedDealershipIds: auth.membership.allowedDealershipIds,
        permissions: auth.membership.permissions,
      },
    });
  } catch (error: any) {
    console.error("Me API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
