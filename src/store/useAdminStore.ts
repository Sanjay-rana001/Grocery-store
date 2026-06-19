import { create } from 'zustand';
import { Product, Order, User, Coupon, DashboardStats, OrderStatus, Review, Category } from '../lib/types';
import * as db from '../lib/db';
import { subscribeToOrders, deleteOrder as firebaseDeleteOrder, updateOrderStatus as firebaseUpdateOrderStatus, updateOrder as firebaseUpdateOrder } from '../lib/firebaseServices';

interface AdminState {
  products: Product[];
  orders: Order[];
  users: User[];
  coupons: Coupon[];
  categories: Category[];
  stats: DashboardStats | null;
  isLoading: boolean;

  loadAllData: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  updateOrder: (orderId: string, orderData: Partial<Order>) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  initializeRealtimeOrders: () => () => void;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber' | 'paymentStatus'>) => Promise<Order | null>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<boolean>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (code: string) => Promise<boolean>;
  addReview: (productId: string, rating: number, comment: string, userName: string, userId: string) => Promise<Review | null>;
  editReview: (productId: string, reviewId: string, userId: string, rating: number, comment: string) => Promise<Review | null>;
  deleteReview: (productId: string, reviewId: string, userId: string) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  products: [],
  orders: [],
  users: [],
  coupons: [],
  categories: [],
  stats: null,
  isLoading: false,

  loadAllData: async () => {
    set({ isLoading: true });
    try {
      const [products, users, coupons, categories, stats] = await Promise.all([
        db.getProducts(),
        db.getUsers(),
        db.getCoupons(),
        db.getCategories(),
        db.getDashboardStats()
      ]);

      set({
        products,
        users,
        coupons,
        categories,
        stats,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
      set({ isLoading: false });
    }
  },

  initializeRealtimeOrders: () => {
    const unsubscribe = subscribeToOrders((orders) => {
      set({ orders });
    });
    return unsubscribe;
  },

  updateOrderStatus: async (orderId, status) => {
    // Optimistic UI update
    set((state) => ({
      orders: state.orders.map(o => 
        o.id === orderId ? { ...o, status, ...(status === 'delivered' ? { paymentStatus: 'paid' } : {}) } : o
      )
    }));
    
    const success = await firebaseUpdateOrderStatus(orderId, status);
    
    if (!success) {
      // Revert on failure (will be handled by next realtime snapshot anyway)
      get().loadAllData();
    }
    return success;
  },

  updateOrder: async (orderId, orderData) => {
    const success = await firebaseUpdateOrder(orderId, orderData);
    return success;
  },

  deleteOrder: async (orderId) => {
    const success = await firebaseDeleteOrder(orderId);
    return success;
  },

  createOrder: async (orderData) => {
    try {
      const newOrder = await db.createOrder(orderData);
      return newOrder;
    } catch (e) {
      return null;
    }
  },

  saveCategory: async (category) => {
    await db.saveCategory(category);
    await get().loadAllData();
  },

  deleteCategory: async (categoryId) => {
    // Validate that no products are using this category
    const productsUsingCategory = get().products.filter(p => p.categoryId === categoryId || p.category === categoryId);
    if (productsUsingCategory.length > 0) {
      alert(`Cannot delete category! ${productsUsingCategory.length} product(s) are currently assigned to it.`);
      return false;
    }

    const success = await db.deleteCategory(categoryId);
    if (success) {
      await get().loadAllData();
    }
    return success;
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
  },

  deleteReview: async (productId, reviewId, userId) => {
    const success = await db.deleteProductReview(productId, reviewId, userId);
    if (success) {
      await get().loadAllData();
    }
    return success;
  }
}));
