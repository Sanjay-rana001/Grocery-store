import { create } from 'zustand';
import { Product } from '../lib/types';

interface WishlistState {
  items: Product[];
  
  toggleWishlist: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const isBrowser = typeof window !== 'undefined';

const getInitialWishlist = (): Product[] => {
  if (!isBrowser) return [];
  try {
    const wishlist = localStorage.getItem('freshmart_wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (items: Product[]) => {
  if (isBrowser) {
    localStorage.setItem('freshmart_wishlist', JSON.stringify(items));
  }
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: getInitialWishlist(),

  toggleWishlist: (product) => {
    const { items } = get();
    const exists = items.some(item => item.id === product.id);
    let newItems = [];

    if (exists) {
      newItems = items.filter(item => item.id !== product.id);
    } else {
      newItems = [...items, product];
    }

    saveWishlist(newItems);
    set({ items: newItems });
  },

  removeItem: (productId) => {
    const { items } = get();
    const newItems = items.filter(item => item.id !== productId);
    
    saveWishlist(newItems);
    set({ items: newItems });
  },

  isInWishlist: (productId) => {
    const { items } = get();
    return items.some(item => item.id === productId);
  }
}));
