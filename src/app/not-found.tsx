import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-primary mb-4 shadow-xs">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Page Not Found</h2>
      <p className="text-xs text-muted-foreground max-w-sm mb-6">
        The requested operational route or resource does not exist in the Field Sales platform.
      </p>
      <Button asChild size="sm">
        <Link href="/dashboard">Return to Dashboard Overview</Link>
      </Button>
    </div>
  );
}
