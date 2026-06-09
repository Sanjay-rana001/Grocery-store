import { create } from 'zustand';
import { Product, CartItem, Coupon } from '../lib/types';
import { validateCoupon } from '../lib/db';

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  couponDiscount: number;
  couponError: string | null;

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => boolean;
  removeCouponCode: () => void;

  getTotals: () => {
    subtotal: number;
    tax: number;
    shippingFee: number;
    discount: number;
    total: number;
    itemsCount: number;
  };
}

const isBrowser = typeof window !== 'undefined';

const getInitialCart = (): CartItem[] => {
  if (!isBrowser) return [];
  try {
    const cart = localStorage.getItem('freshmart_cart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  if (isBrowser) {
    localStorage.setItem('freshmart_cart', JSON.stringify(items));
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: getInitialCart(),
  coupon: null,
  couponDiscount: 0,
  couponError: null,

  addItem: (product, quantity = 1) => {
    const { items } = get();
    const existingIndex = items.findIndex(item => item.product.id === product.id);
    let newItems = [...items];

    if (existingIndex >= 0) {
      const newQty = newItems[existingIndex].quantity + quantity;
      // Cap at product stock
      newItems[existingIndex].quantity = Math.min(newQty, product.stock);
    } else {
      newItems.push({ product, quantity: Math.min(quantity, product.stock) });
    }

    saveCart(newItems);
    set({ items: newItems });
    // Re-verify coupon discount with new subtotal
    get().applyCouponCode(get().coupon?.code || '');
  },

  removeItem: (productId) => {
    const { items } = get();
    const newItems = items.filter(item => item.product.id !== productId);
    
    saveCart(newItems);
    set({ items: newItems });
    
    // Re-verify coupon discount
    if (get().coupon) {
      get().applyCouponCode(get().coupon!.code);
    }
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const { items } = get();
    const newItems = items.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.min(quantity, item.product.stock) };
      }
      return item;
    });

    saveCart(newItems);
    set({ items: newItems });

    // Re-verify coupon discount
    if (get().coupon) {
      get().applyCouponCode(get().coupon!.code);
    }
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [], coupon: null, couponDiscount: 0, couponError: null });
  },

  applyCouponCode: (code) => {
    if (!code) {
      set({ coupon: null, couponDiscount: 0, couponError: null });
      return false;
    }

    const subtotal = get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const result = validateCoupon(code, subtotal);

    if (result.success) {
      set({
        coupon: { code: code.toUpperCase(), type: result.discount === 5 ? 'fixed' : 'percentage', value: result.discount === 5 ? 5 : 10, isActive: true },
        couponDiscount: result.discount,
        couponError: null
      });
      return true;
    } else {
      set({ coupon: null, couponDiscount: 0, couponError: result.message });
      return false;
    }
  },

  removeCouponCode: () => {
    set({ coupon: null, couponDiscount: 0, couponError: null });
  },

  getTotals: () => {
    const { items, couponDiscount } = get();
    
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    // 15% GST is calculated out of the subtotal (included in pricing, standard NZ retail style)
    const tax = parseFloat((subtotal * 0.15).toFixed(2));
    
    // Flat $5.00 shipping, FREE for orders over $75.00 NZD
    const shippingFee = subtotal > 75 || subtotal === 0 ? 0 : 5.00;
    
    const discount = parseFloat(couponDiscount.toFixed(2));
    const total = parseFloat(Math.max(0, subtotal + shippingFee - discount).toFixed(2));

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax,
      shippingFee,
      discount,
      total,
      itemsCount
    };
  }
}));
