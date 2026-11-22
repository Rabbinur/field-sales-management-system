import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  selectedDealership: string; // 'all' or specific dealership id
  activeOrderDrawerId: string | null;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  selectedDealership: "all",
  activeOrderDrawerId: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    setSelectedDealership: (state, action: PayloadAction<string>) => {
      state.selectedDealership = action.payload;
    },
    setActiveOrderDrawer: (state, action: PayloadAction<string | null>) => {
      state.activeOrderDrawerId = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileMenu,
  setMobileMenuOpen,
  setSelectedDealership,
  setActiveOrderDrawer,
} = uiSlice.actions;

export default uiSlice.reducer;
