"use client";

import * as React from "react";
import { ShieldAlert, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IDealership, DealershipStatus } from "@/types/dealership";
import { DealershipStatusBadge } from "@/components/shared/status-badge";

interface StatusTransitionDialogProps {
  isOpen: boolean;
  dealership: IDealership | null;
  onClose: () => void;
  onStatusChanged: (dealership: IDealership) => void;
}

export function StatusTransitionDialog({
  isOpen,
  dealership,
  onClose,
  onStatusChanged,
}: StatusTransitionDialogProps) {
  const [targetStatus, setTargetStatus] = React.useState<DealershipStatus>("ACTIVE");
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (dealership) {
      // Pick another status as default target
      if (dealership.status === "ACTIVE") {
        setTargetStatus("INACTIVE");
      } else {
        setTargetStatus("ACTIVE");
      }
      setReason("");
      setErrorMessage(null);
    }
  }, [dealership]);

  if (!isOpen || !dealership) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) {
      setErrorMessage("A valid audit reason of at least 3 characters is mandatory.");
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/dealerships/${dealership.dealershipId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: targetStatus,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to transition dealership status");
      }

      onStatusChanged(data.data || data.dealership);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-slate-50/75">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Transition Hub Status
              </h3>
              <p className="text-xs text-muted-foreground">
                Audited governance state change for {dealership.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div
              className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Current Status:</span>
              <DealershipStatusBadge status={dealership.status} />
            </div>
            <div className="text-xs text-muted-foreground">
              Dealership: <span className="font-medium text-slate-800">{dealership.name}</span> ({dealership.code})
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Target Status *
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as DealershipStatus)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-input bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="select-target-status"
            >
              <option value="ACTIVE">ACTIVE (Operational & dispatch-ready)</option>
              <option value="INACTIVE">INACTIVE (Dormant / Offboarded)</option>
              <option value="SUSPENDED">SUSPENDED (Compliance / Governance Hold)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Mandatory Audit Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a justified reason for this governance state change (min 3 characters)..."
              required
              rows={3}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-input bg-white p-3 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="input-status-reason"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              This reason is permanently appended to the dealership audit trail metadata.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
              data-testid="submit-status-transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Applying Transition...
                </>
              ) : (
                "Apply Status Transition"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
