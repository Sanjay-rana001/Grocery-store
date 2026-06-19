export interface Review {
  id: string;
  userName: string;
  userId?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  order: number;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string; // Foreign key replacing hardcoded categories. Fallback logic: check `category` if `categoryId` is missing.
  category?: string; // Legacy fallback
  subcategory: string;
  price: number;
  originalPrice?: number; // For discount badges
  description: string;
  unit: string; // e.g. "1kg Bag", "Single", "120g Bag"
  origin: string; // e.g. "Hawkes Bay", "Bay of Plenty"
  organic: boolean;
  bestSeller: boolean;
  seasonal: boolean;
  stock: number;
  images: string[]; // Product image gallery urls
  brand: string; // e.g. "Meadow Fresh", "Pic's"
  ratings: number; // 1-5 average
  reviewsCount: number;
  dietary: ('vegan' | 'gluten-free' | 'keto' | 'organic')[];
  reviews: Review[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface DeliverySlot {
  date: string; // e.g. "2026-05-26"
  time: string; // e.g. "Morning (8AM - 12PM)" | "Afternoon (1PM - 5PM)"
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  isActive: boolean;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userEmail: string;
  userName: string;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number; // 15% GST in New Zealand
  shippingFee: number;
  discount: number;
  total: number;
  address: Address;
  deliverySlot: DeliverySlot;
  couponCode?: string;
  paymentMethod: string; // Dynamic based on pluggable gateway (e.g. 'stripe', 'mock', 'paypal')
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingNumber: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  password?: string; // Standard mock login check
  address?: Address;
  savedAddresses?: Address[]; // Multiple saved addresses for checkout
  profileImage?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  averageBasket: number;
  basketGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  dailyRevenue: { date: string; amount: number }[];
  categorySales: { category: string; amount: number }[];
}
