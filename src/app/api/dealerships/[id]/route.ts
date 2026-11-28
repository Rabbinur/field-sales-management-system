import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/context";
import { DealershipService } from "@/lib/dealership/service";
import { updateDealershipSchema } from "@/types/dealership";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
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
    const dealership = await DealershipService.getDealershipById(auth, dealershipId);

    return NextResponse.json({
      success: true,
      data: dealership,
      dealership,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    console.error("Get dealership API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. CSRF Protection
    if (!validateCsrfOrigin(req)) {
      return NextResponse.json(
        { success: false, error: "Cross-site request blocked." },
        { status: 403 }
      );
    }

    // 2. Authentication check
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: dealershipId } = await context.params;

    // 3. Zod validation
    const body = await req.json();
    const parseResult = updateDealershipSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 4. Update via domain service
    const dealership = await DealershipService.updateDealership(
      auth,
      dealershipId,
      parseResult.data
    );

    return NextResponse.json({
      success: true,
      data: dealership,
      dealership,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    console.error("Update dealership API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
