"use client";

import * as React from "react";
import { Edit2, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IDealership } from "@/types/dealership";
import { UserRole } from "@/types/auth";

interface EditDealershipDialogProps {
  isOpen: boolean;
  dealership: IDealership | null;
  userRole?: UserRole;
  onClose: () => void;
  onUpdated: (dealership: IDealership) => void;
}

export function EditDealershipDialog({
  isOpen,
  dealership,
  userRole,
  onClose,
  onUpdated,
}: EditDealershipDialogProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    legalName: "",
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

  const isMotherAdmin = userRole === "MOTHER_COMPANY_ADMIN";

  React.useEffect(() => {
    if (dealership) {
      setFormData({
        name: dealership.name || "",
        legalName: dealership.legalName || "",
        erpDealershipCode: dealership.erpDealershipCode || "",
        contactPerson: dealership.contactPerson || "",
        phone: dealership.phone || "",
        email: dealership.email || "",
        address: dealership.address || "",
        city: dealership.city || "",
        district: dealership.district || "",
        region: dealership.region || "",
      });
      setErrorMessage(null);
    }
  }, [dealership]);

  if (!isOpen || !dealership) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, any> = {
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        region: formData.region,
      };

      if (isMotherAdmin) {
        payload.name = formData.name;
        payload.legalName = formData.legalName;
        payload.erpDealershipCode = formData.erpDealershipCode;
      }

      const res = await fetch(`/api/dealerships/${dealership.dealershipId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update dealership");
      }

      onUpdated(data.data || data.dealership);
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
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Edit Dealership Profile
              </h3>
              <p className="text-xs text-muted-foreground">
                Updating {dealership.name} ({dealership.code})
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
                Dealership Code (Immutable)
              </label>
              <Input
                value={dealership.code}
                disabled
                className="h-9 text-xs font-mono bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mother ERP Reference Code
              </label>
              <Input
                name="erpDealershipCode"
                value={formData.erpDealershipCode}
                onChange={handleChange}
                placeholder="e.g. ERP-DLR-001"
                disabled={!isMotherAdmin || isSubmitting}
                className={`h-9 text-xs font-mono ${
                  !isMotherAdmin ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Dealership Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isMotherAdmin || isSubmitting}
                required
                className={`h-9 text-xs ${
                  !isMotherAdmin ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""
                }`}
                data-testid="input-edit-dealership-name"
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
                disabled={!isMotherAdmin || isSubmitting}
                className={`h-9 text-xs ${
                  !isMotherAdmin ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""
                }`}
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
                  required
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                  data-testid="input-edit-contact-person"
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
                  required
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                  data-testid="input-edit-phone"
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
                  required
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                  data-testid="input-edit-email"
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
                  required
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                  data-testid="input-edit-address"
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
                    required
                    disabled={isSubmitting}
                    className="h-9 text-xs"
                    data-testid="input-edit-city"
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
                    required
                    disabled={isSubmitting}
                    className="h-9 text-xs"
                    data-testid="input-edit-district"
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
                    required
                    disabled={isSubmitting}
                    className="h-9 text-xs"
                    data-testid="input-edit-region"
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
              data-testid="submit-edit-dealership"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
