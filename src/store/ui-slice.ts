import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUserDTO } from "@/types/auth";

export interface UIState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  selectedDealership: string; // 'all' or specific dealership id
  activeOrderDrawerId: string | null;
  currentUser?: AuthUserDTO | null;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  selectedDealership: "all",
  activeOrderDrawerId: null,
  currentUser: null,
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
    setCurrentUser: (state, action: PayloadAction<AuthUserDTO | null>) => {
      state.currentUser = action.payload;
      // Automatically lock dealership selection if user is tied to a specific dealership
      if (action.payload?.dealershipId) {
        state.selectedDealership = action.payload.dealershipId;
      }
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
  setCurrentUser,
} = uiSlice.actions;

export default uiSlice.reducer;

