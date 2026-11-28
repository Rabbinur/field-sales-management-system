import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/context";
import { DealershipService } from "@/lib/dealership/service";
import { createDealershipSchema } from "@/types/dealership";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { AuthError } from "@/lib/auth/errors";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await DealershipService.listDealerships(auth, {
      search,
      status,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    console.error("List dealerships API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    // 3. Zod validation
    const body = await req.json();
    const parseResult = createDealershipSchema.safeParse(body);
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

    // 4. Create dealership through domain service
    const dealership = await DealershipService.createDealership(
      auth,
      parseResult.data
    );

    return NextResponse.json(
      { success: true, data: dealership, dealership },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    console.error("Create dealership API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
