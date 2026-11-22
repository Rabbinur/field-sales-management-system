import * as React from "react";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  phase: string;
  description: string;
}

export function PlaceholderPage({
  title,
  phase,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white p-8 text-center shadow-xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-xs">
        <Construction className="h-7 w-7" />
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 mb-2 border border-slate-200">
        <span>Roadmap Target:</span>
        <span className="text-primary font-mono">{phase}</span>
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">{title}</h2>
      <p className="text-xs text-muted-foreground max-w-md mb-6">{description}</p>
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Return to Overview
        </Link>
      </Button>
    </div>
  );
}
