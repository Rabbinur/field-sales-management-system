import { describe, it, expect } from "vitest";
import uiReducer, {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileMenu,
  setMobileMenuOpen,
  setSelectedDealership,
  setActiveOrderDrawer,
} from "@/store/ui-slice";

describe("Redux uiSlice", () => {
  const initial = {
    sidebarCollapsed: false,
    mobileMenuOpen: false,
    selectedDealership: "all",
    activeOrderDrawerId: null,
  };

  it("toggles sidebar collapsed state", () => {
    const state1 = uiReducer(initial, toggleSidebar());
    expect(state1.sidebarCollapsed).toBe(true);

    const state2 = uiReducer(state1, toggleSidebar());
    expect(state2.sidebarCollapsed).toBe(false);
  });

  it("sets sidebar collapsed explicitly", () => {
    const state = uiReducer(initial, setSidebarCollapsed(true));
    expect(state.sidebarCollapsed).toBe(true);
  });

  it("toggles mobile menu open state", () => {
    const state1 = uiReducer(initial, toggleMobileMenu());
    expect(state1.mobileMenuOpen).toBe(true);

    const state2 = uiReducer(state1, setMobileMenuOpen(false));
    expect(state2.mobileMenuOpen).toBe(false);
  });

  it("updates selected dealership filter", () => {
    const state = uiReducer(initial, setSelectedDealership("dlr-2"));
    expect(state.selectedDealership).toBe("dlr-2");
  });

  it("manages active order drawer ID", () => {
    const state = uiReducer(initial, setActiveOrderDrawer("ord-101"));
    expect(state.activeOrderDrawerId).toBe("ord-101");
  });
});
