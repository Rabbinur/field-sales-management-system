"use client";

import * as React from "react";
import { Building2, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IDealership } from "@/types/dealership";

interface CreateDealershipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (dealership: IDealership) => void;
}

export function CreateDealershipDialog({
  isOpen,
  onClose,
  onCreated,
}: CreateDealershipDialogProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    legalName: "",
    code: "",
    erpDealershipCode: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    region: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase().trim() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/dealerships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create dealership");
      }

      onCreated(data.data || data.dealership);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-white shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-slate-50/75">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Register New Dealership
              </h3>
              <p className="text-xs text-muted-foreground">
                Provision a regional distribution hub under Mother Company governance.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div
              className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Dealership Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sylhet Mega Hub"
                required
                disabled={isSubmitting}
                className="h-9 text-xs"
                data-testid="input-dealership-name"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Legal Registered Name
              </label>
              <Input
                name="legalName"
                value={formData.legalName}
                onChange={handleChange}
                placeholder="e.g. Sylhet Distribution Agency Ltd."
                disabled={isSubmitting}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Dealership Code *
              </label>
              <Input
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. DLR-SYL-01"
                required
                disabled={isSubmitting}
                className="h-9 text-xs font-mono uppercase"
                data-testid="input-dealership-code"
              />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Uppercase alphanumeric, hyphen, underscore only.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mother ERP Reference Code
              </label>
              <Input
                name="erpDealershipCode"
                value={formData.erpDealershipCode}
                onChange={handleChange}
                placeholder="e.g. ERP-DLR-003"
                disabled={isSubmitting}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Operational Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Contact Person *
                </label>
                <Input
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                  data-testid="input-contact-person"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Phone *
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+8801..."
                  required
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                  data-testid="input-phone"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hub@dealership.field-sales.test"
                  required
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                  data-testid="input-email"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Location & Jurisdiction
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Physical Address *
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street / Warehouse / Plot address"
                  required
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                  data-testid="input-address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    City *
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Sylhet"
                    required
                    disabled={isSubmitting}
                    className="h-9 text-xs"
                    data-testid="input-city"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    District *
                  </label>
                  <Input
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Sylhet"
                    required
                    disabled={isSubmitting}
                    className="h-9 text-xs"
                    data-testid="input-district"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Region *
                  </label>
                  <Input
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    placeholder="e.g. North-East"
                    required
                    disabled={isSubmitting}
                    className="h-9 text-xs"
                    data-testid="input-region"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
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
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="submit-create-dealership"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Registering...
                </>
              ) : (
                "Provision Dealership"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
