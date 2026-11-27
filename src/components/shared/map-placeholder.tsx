"use client";

import * as React from "react";
import { MapPin, Navigation, Compass, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MapPlaceholder() {
  return (
    <div className="relative h-[340px] w-full rounded-xl border border-border bg-slate-900 overflow-hidden shadow-xs">
      {/* Grid line background overlay mimicking vector map tiles */}
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:2rem_2rem]" />

      {/* Floating Map Operational Controls - Explicitly labeled as UI Layout Demonstration */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/90 backdrop-blur-md px-3 py-1.5 text-xs text-white border border-slate-700">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          <span className="font-semibold text-slate-200">Dispatch Map Pattern</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-mono text-[11px]">Phase 11 Leaflet Target</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
          title="Layer controls (UI Placeholder)"
        >
          <Layers className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
          title="Orientation controls (UI Placeholder)"
        >
          <Compass className="h-4 w-4" />
        </Button>
      </div>

      {/* Simulated Territory Pins & Route Vectors (Demonstration Layout Only) */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="relative w-full max-w-md h-48 border border-dashed border-blue-500/30 rounded-2xl flex flex-col items-center justify-center text-center p-4 bg-slate-800/40 backdrop-blur-xs">
          {/* Demonstration SR Marker Pin */}
          <div className="absolute -top-3 left-1/4 flex items-center gap-1.5 rounded-full bg-blue-600/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
            <Navigation className="h-3 w-3" />
            <span>Demonstration Pin: SR En Route</span>
          </div>

          {/* Demonstration Retailer Marker Pin */}
          <div className="absolute bottom-4 right-1/4 flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
            <MapPin className="h-3 w-3" />
            <span>Demonstration Pin: Retail Outlet</span>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 mb-2">
            <MapPin className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold text-white">
            Dispatch Map Layout Direction
          </h4>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Visual pattern prepared for territory beats and outlet visualization. Live GPS telemetry and Leaflet integration will be implemented in Phase 11.
          </p>
        </div>
      </div>

      {/* Bottom Dispatch Status Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>UI Simulation: <strong className="text-slate-200">Demonstration Beat Bounds</strong></span>
        <span className="text-slate-400">No active GPS connection • Static layout container</span>
      </div>
    </div>
  );
}
