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

  loadAllData: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  updateOrder: (orderId: string, orderData: Partial<Order>) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber' | 'paymentStatus'>) => Promise<Order | null>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<boolean>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (code: string) => Promise<boolean>;
  addReview: (productId: string, rating: number, comment: string, userName: string, userId: string) => Promise<Review | null>;
  editReview: (productId: string, reviewId: string, userId: string, rating: number, comment: string) => Promise<Review | null>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  products: [],
  orders: [],
  users: [],
  coupons: [],
  stats: null,
  isLoading: false,

  loadAllData: async () => {
    set({ isLoading: true });
    try {
      const [products, orders, users, coupons, stats] = await Promise.all([
        db.getProducts(),
        db.getOrders(),
        db.getUsers(),
        db.getCoupons(),
        db.getDashboardStats()
      ]);

      set({
        products,
        orders,
        users,
        coupons,
        stats,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
      set({ isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    const success = await db.updateOrderStatus(orderId, status);
    if (success) {
      await get().loadAllData();
    }
    return success;
  },

  updateOrder: async (orderId, orderData) => {
    const success = await db.updateOrder(orderId, orderData);
    if (success) {
      await get().loadAllData();
    }
    return success;
  },

  deleteOrder: async (orderId) => {
    const success = await db.deleteOrder(orderId);
    if (success) {
      await get().loadAllData();
    }
    return success;
  },

  createOrder: async (orderData) => {
    try {
      const newOrder = await db.createOrder(orderData);
      if (newOrder) {
        await get().loadAllData();
      }
      return newOrder;
    } catch (e) {
      return null;
    }
  },

  saveProduct: async (product) => {
    await db.saveProduct(product);
    await get().loadAllData();
  },

  deleteProduct: async (productId) => {
    const success = await db.deleteProduct(productId);
    if (success) {
      await get().loadAllData();
    }
    return success;
  },

  saveCoupon: async (coupon) => {
    await db.saveCoupon(coupon);
    await get().loadAllData();
  },

  deleteCoupon: async (code) => {
    const success = await db.deleteCoupon(code);
    if (success) {
      await get().loadAllData();
    }
    return success;
  },

  addReview: async (productId, rating, comment, userName, userId) => {
    const review = await db.addProductReview(productId, { rating, comment, userName, userId });
    if (review) {
      await get().loadAllData();
    }
    return review;
  },

  editReview: async (productId, reviewId, userId, rating, comment) => {
    const review = await db.editProductReview(productId, reviewId, userId, rating, comment);
    if (review) {
      await get().loadAllData();
    }
    return review;
  }
}));
