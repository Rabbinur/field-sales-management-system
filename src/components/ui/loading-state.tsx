import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading operational data...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center space-y-3 p-8 text-center",
        className
      )}
    >
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="text-xs font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
