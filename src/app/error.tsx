"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client-side runtime errors
    console.error("Dashboard caught error:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-red-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">
        Operational View Exception
      </h3>
      <p className="text-xs text-muted-foreground max-w-md mb-6">
        {error.message || "An unexpected error occurred while rendering this interface."}
      </p>
      <Button variant="outline" size="sm" onClick={() => reset()}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Reload View
      </Button>
    </div>
  );
}
