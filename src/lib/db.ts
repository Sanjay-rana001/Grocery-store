import { Product, User, Order, OrderStatus, Coupon, DashboardStats, Review } from './types';

// Client-side helper to make API requests to Next.js route handlers.
// Since these functions run on the client, they make relative HTTP requests.

const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  // Prevent aggressive browser/Next.js caching by appending a timestamp to GET requests
  const isGet = !options || !options.method || options.method === 'GET';
  const fetchUrl = isGet ? `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}` : url;
  
  const res = await fetch(fetchUrl, {
    ...options,
    cache: 'no-store', // explicitly tell Next.js not to cache this
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errorText || res.statusText}`);
  }
  return res.json();
};

export const initDatabase = () => {
  // Database initialization is handled automatically on the server side now.
};

// ==========================================
// PRODUCTS CRUD OPERATIONS
// ==========================================

export const getProducts = async (): Promise<Product[]> => {
  return fetchJson<Product[]>('/api/products');
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    return await fetchJson<Product>(`/api/products/${id}`);
  } catch {
    return undefined;
  }
};

export const saveProduct = async (product: Product): Promise<Product> => {
  return fetchJson<Product>('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const result = await fetchJson<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
    return result.success;
  } catch {
    return false;
  }
};

export const decrementStock = async (productId: string, quantity: number): Promise<boolean> => {
  // Handled on server side automatically when order is created, but kept for compatibility
  return true;
};

export const addProductReview = async (productId: string, review: Omit<Review, 'id' | 'date'>): Promise<Review | null> => {
  try {
    return await fetchJson<Review>(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
  } catch {
    return null;
  }
};

export const editProductReview = async (productId: string, reviewId: string, userId: string, rating: number, comment: string): Promise<Review | null> => {
  try {
    return await fetchJson<Review>(`/api/products/${productId}/reviews`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, userId, rating, comment }),
    });
  } catch {
    return null;
  }
};

// ==========================================
// USERS CRUD OPERATIONS
// ==========================================

export const getUsers = async (): Promise<User[]> => {
  return fetchJson<User[]>('/api/users');
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const saveUser = async (user: User): Promise<User> => {
  // Update address endpoint or generic user save
  return fetchJson<User>('/api/users/address', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, address: user.address }),
  });
};

// ==========================================
// COUPONS CRUD OPERATIONS
// ==========================================

export const getCoupons = async (): Promise<Coupon[]> => {
  return fetchJson<Coupon[]>('/api/coupons');
};

export const saveCoupon = async (coupon: Coupon): Promise<Coupon> => {
  return fetchJson<Coupon>('/api/coupons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coupon),
  });
};

export const deleteCoupon = async (code: string): Promise<boolean> => {
  try {
    const result = await fetchJson<{ success: boolean }>(`/api/coupons/${code}`, {
      method: 'DELETE',
    });
    return result.success;
  } catch {
    return false;
  }
};

export const validateCoupon = async (code: string, subtotal: number): Promise<{ success: boolean; discount: number; message: string }> => {
  return fetchJson<{ success: boolean; discount: number; message: string }>('/api/coupons/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal }),
  });
};

// ==========================================
// ORDERS CRUD OPERATIONS
// ==========================================

export const getOrders = async (): Promise<Order[]> => {
  return fetchJson<Order[]>('/api/orders');
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  try {
    return await fetchJson<Order>(`/api/orders/${id}`);
  } catch {
    return undefined;
  }
};

export const getOrdersByEmail = async (email: string): Promise<Order[]> => {
  return fetchJson<Order[]>(`/api/orders?email=${encodeURIComponent(email)}`);
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber' | 'paymentStatus'>): Promise<Order> => {
  return fetchJson<Order>('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
  try {
    const result = await fetchJson<{ success: boolean }>(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return result.success;
  } catch {
    return false;
  }
};

export const updateOrder = async (orderId: string, orderData: Partial<Order>): Promise<boolean> => {
  try {
    const result = await fetchJson<{ success: boolean }>(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return result.success;
  } catch {
    return false;
  }
};

export const deleteOrder = async (orderId: string): Promise<boolean> => {
  try {
    const result = await fetchJson<{ success: boolean }>(`/api/orders/${orderId}`, {
      method: 'DELETE',
    });
    return result.success;
  } catch {
    return false;
  }
};

// ==========================================
// DASHBOARD ANALYTICS GENERATION
// ==========================================

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return fetchJson<DashboardStats>('/api/stats');
};
