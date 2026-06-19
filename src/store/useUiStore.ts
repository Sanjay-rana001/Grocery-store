import { create } from 'zustand';

interface UiState {
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isMobileSearchOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setMobileSearchOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isCartOpen: false,
  isWishlistOpen: false,
  isMobileSearchOpen: false,
  setCartOpen: (open) => set({ isCartOpen: open }),
  setWishlistOpen: (open) => set({ isWishlistOpen: open }),
  setMobileSearchOpen: (open) => set({ isMobileSearchOpen: open }),
}));
