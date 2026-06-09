import { create } from 'zustand';
import { Product, Order, User, Coupon, DashboardStats, OrderStatus, Review } from '../lib/types';
import * as db from '../lib/db';

interface AdminState {
  products: Product[];
  orders: Order[];
  users: User[];
  coupons: Coupon[];
  stats: DashboardStats | null;
  isLoading: boolean;

  loadAllData: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => boolean;
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => boolean;
  saveCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => boolean;
  addReview: (productId: string, rating: number, comment: string, userName: string) => Review | null;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  products: [],
  orders: [],
  users: [],
  coupons: [],
  stats: null,
  isLoading: false,

  loadAllData: () => {
    set({ isLoading: true });
    
    // In-memory or localStorage pull
    const products = db.getProducts();
    const orders = db.getOrders();
    const users = db.getUsers();
    const coupons = db.getCoupons();
    const stats = db.getDashboardStats();

    set({
      products,
      orders,
      users,
      coupons,
      stats,
      isLoading: false
    });
  },

  updateOrderStatus: (orderId, status) => {
    const success = db.updateOrderStatus(orderId, status);
    if (success) {
      get().loadAllData();
    }
    return success;
  },

  saveProduct: (product) => {
    db.saveProduct(product);
    get().loadAllData();
  },

  deleteProduct: (productId) => {
    const success = db.deleteProduct(productId);
    if (success) {
      get().loadAllData();
    }
    return success;
  },

  saveCoupon: (coupon) => {
    db.saveCoupon(coupon);
    get().loadAllData();
  },

  deleteCoupon: (code) => {
    const success = db.deleteCoupon(code);
    if (success) {
      get().loadAllData();
    }
    return success;
  },

  addReview: (productId, rating, comment, userName) => {
    const review = db.addProductReview(productId, { rating, comment, userName });
    if (review) {
      get().loadAllData();
    }
    return review;
  }
}));
