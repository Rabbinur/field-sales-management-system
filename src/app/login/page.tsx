"use client";

import * as React from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const DEMO_ACCOUNTS = [
  {
    roleLabel: "Super Admin",
    email: "superadmin@field-sales.test",
    password: "SuperAdmin@Secure2026!",
    badgeVariant: "destructive" as const,
    scopeDesc: "Infrastructure Diagnostics",
  },
  {
    roleLabel: "Mother Co. Admin",
    email: "motheradmin@field-sales.test",
    password: "MotherAdmin@Secure2026!",
    badgeVariant: "default" as const,
    scopeDesc: "Multi-Dealership Scope",
  },
  {
    roleLabel: "Dealership Admin",
    email: "dealershipadmin@field-sales.test",
    password: "DealerAdmin@Secure2026!",
    badgeVariant: "secondary" as const,
    scopeDesc: "Dhaka Central (dlr-1)",
  },
  {
    roleLabel: "Sales Representative",
    email: "sr@field-sales.test",
    password: "SalesRep@Secure2026!",
    badgeVariant: "outline" as const,
    scopeDesc: "Assigned Outlet Territory",
  },
];

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Authentication failed. Please verify credentials.");
        setIsLoading(false);
        return;
      }

      // Successful login -> Redirect to dashboard
      window.location.href = "/dashboard";
    } catch {
      setErrorMessage("Network error occurred. Please check your connection.");
      setIsLoading(false);
    }
  };

  const handleSelectDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md mb-3">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Field Sales Management
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Independent Multi-Dealership Distribution Platform
        </p>
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md shadow-lg border-slate-200 bg-white">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900">
            Sign In to Operations
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Enter your authorized corporate credentials to access the operational console.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Alert Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in duration-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700"
              >
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs h-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 text-xs h-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                "Authenticate & Open Shell"
              )}
            </Button>
          </form>

          {/* Development Quick-Select Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                Phase 2 Bootstrap Test Accounts
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectDemoAccount(acc.email, acc.password)}
                  className="flex items-center justify-between p-2 rounded-md border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-left group"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                        {acc.roleLabel}
                      </span>
                      <span className="text-[10px] text-slate-400">({acc.scopeDesc})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {acc.email}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Footer Notice */}
      <footer className="mt-6 text-center text-[11px] text-slate-500 max-w-sm">
        Protected by corporate multi-tenant session isolation. Public registration is disabled.
      </footer>
    </div>
  );
}
