import { Product, User, Order, OrderStatus, Coupon, DashboardStats, Review } from './types';
import { mockProducts, mockCoupons } from './mockData';

// Safe LocalStorage helpers that prevent SSR/Hydration mismatch crashes
const isBrowser = typeof window !== 'undefined';

const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (!isBrowser) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading localStorage key:', key, error);
    return defaultValue;
  }
};

const setLocalStorage = <T>(key: string, value: T): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing localStorage key:', key, error);
  }
};

// Database Initializers
const KEYS = {
  PRODUCTS: 'freshmart_products',
  USERS: 'freshmart_users',
  ORDERS: 'freshmart_orders',
  COUPONS: 'freshmart_coupons',
};

// Default Administrator and Customer accounts for testing
const defaultUsers: User[] = [
  {
    id: 'u-admin',
    name: 'Admin FreshMart',
    email: 'admin@freshmart.co.nz',
    role: 'admin',
    password: 'password123',
    address: {
      fullName: 'Admin FreshMart',
      street: '100 Queen Street',
      city: 'Auckland',
      postalCode: '1010',
      country: 'New Zealand',
      phone: '09 123 4567'
    }
  },
  {
    id: 'u-customer',
    name: 'Khushal Shah',
    email: 'user@freshmart.co.nz',
    role: 'customer',
    password: 'password123',
    address: {
      fullName: 'Khushal Shah',
      street: '20 Courtenay Place',
      city: 'Wellington',
      postalCode: '6011',
      country: 'New Zealand',
      phone: '021 987 6543'
    }
  }
];

// Default historical orders for Admin panel analytics charts
const createDefaultOrders = (products: Product[]): Order[] => {
  const dates = [
    '2026-05-19T10:30:00Z',
    '2026-05-20T14:45:00Z',
    '2026-05-21T09:15:00Z',
    '2026-05-22T16:20:00Z',
    '2026-05-23T11:05:00Z',
    '2026-05-24T13:50:00Z',
    '2026-05-25T08:12:00Z',
  ];

  return [
    {
      id: 'FM-1001',
      userEmail: 'user@freshmart.co.nz',
      userName: 'Khushal Shah',
      items: [
        { product: products[0], quantity: 2 }, // Gala Apples
        { product: products[1], quantity: 3 }  // Hass Avocado
      ],
      status: 'delivered',
      subtotal: 18.50,
      tax: 2.78,
      shippingFee: 5.00,
      discount: 0,
      total: 26.28,
      address: defaultUsers[1].address!,
      deliverySlot: { date: '2026-05-20', time: 'Morning (8AM - 12PM)' },
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      trackingNumber: 'TRK928174',
      createdAt: dates[0]
    },
    {
      id: 'FM-1002',
      userEmail: 'alice@gmail.com',
      userName: 'Alice Cooper',
      items: [
        { product: products[6], quantity: 1 }, // Beef Ribeye
        { product: products[9], quantity: 2 }, // Lewis Road Butter
        { product: products[16], quantity: 1 } // Sourdough
      ],
      status: 'delivered',
      subtotal: 44.00,
      tax: 6.60,
      shippingFee: 5.00,
      discount: 4.40, // KIWI10
      total: 51.20,
      address: {
        fullName: 'Alice Cooper',
        street: '88 Riccarton Road',
        city: 'Christchurch',
        postalCode: '8011',
        country: 'New Zealand',
        phone: '027 123 9876'
      },
      deliverySlot: { date: '2026-05-21', time: 'Afternoon (1PM - 5PM)' },
      couponCode: 'KIWI10',
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      trackingNumber: 'TRK048291',
      createdAt: dates[1]
    },
    {
      id: 'FM-1003',
      userEmail: 'bob@yahoo.com',
      userName: 'Bob Marley',
      items: [
        { product: products[5], quantity: 4 }, // Baby Spinach
        { product: products[13], quantity: 1 } // Pic's Peanut Butter
      ],
      status: 'delivered',
      subtotal: 24.80,
      tax: 3.72,
      shippingFee: 5.00,
      discount: 5.00, // FRESH5
      total: 28.52,
      address: {
        fullName: 'Bob Marley',
        street: '45 George Street',
        city: 'Dunedin',
        postalCode: '9016',
        country: 'New Zealand',
        phone: '022 555 4321'
      },
      deliverySlot: { date: '2026-05-22', time: 'Morning (8AM - 12PM)' },
      couponCode: 'FRESH5',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      trackingNumber: 'TRK184729',
      createdAt: dates[2]
    },
    {
      id: 'FM-1004',
      userEmail: 'user@freshmart.co.nz',
      userName: 'Khushal Shah',
      items: [
        { product: products[2], quantity: 2 }, // Bunch Carrots
        { product: products[3], quantity: 2 }, // Head Broccoli
        { product: products[15], quantity: 1 } // Manuka Honey
      ],
      status: 'shipping',
      subtotal: 37.00,
      tax: 5.55,
      shippingFee: 5.00,
      discount: 0,
      total: 47.55,
      address: defaultUsers[1].address!,
      deliverySlot: { date: '2026-05-24', time: 'Afternoon (1PM - 5PM)' },
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      trackingNumber: 'TRK992817',
      createdAt: dates[3]
    },
    {
      id: 'FM-1005',
      userEmail: 'sam@gmail.com',
      userName: 'Sam Smith',
      items: [
        { product: products[12], quantity: 2 }, // Kapiti Ice Cream
        { product: products[18], quantity: 4 }  // Ginger Beer
      ],
      status: 'packing',
      subtotal: 37.98,
      tax: 5.70,
      shippingFee: 5.00,
      discount: 7.60, // EASTER20
      total: 41.08,
      address: {
        fullName: 'Sam Smith',
        street: '15 High Street',
        city: 'Hamilton',
        postalCode: '3204',
        country: 'New Zealand',
        phone: '027 888 7777'
      },
      deliverySlot: { date: '2026-05-25', time: 'Morning (8AM - 12PM)' },
      couponCode: 'EASTER20',
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      trackingNumber: 'TRK384910',
      createdAt: dates[4]
    },
    {
      id: 'FM-1006',
      userEmail: 'lucy@live.com',
      userName: 'Lucy Heart',
      items: [
        { product: products[10], quantity: 3 } // Organic Milk
      ],
      status: 'pending',
      subtotal: 15.60,
      tax: 2.34,
      shippingFee: 5.00,
      discount: 0,
      total: 22.94,
      address: {
        fullName: 'Lucy Heart',
        street: '72 Victoria Street',
        city: 'Auckland',
        postalCode: '1010',
        country: 'New Zealand',
        phone: '021 444 8888'
      },
      deliverySlot: { date: '2026-05-26', time: 'Morning (8AM - 12PM)' },
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      trackingNumber: 'TRK471928',
      createdAt: dates[5]
    }
  ];
};

// Initialize DB collections
export const initDatabase = () => {
  if (!isBrowser) return;

  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    setLocalStorage(KEYS.PRODUCTS, mockProducts);
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    setLocalStorage(KEYS.USERS, defaultUsers);
  }
  if (!localStorage.getItem(KEYS.COUPONS)) {
    setLocalStorage(KEYS.COUPONS, mockCoupons);
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    const products = getLocalStorage<Product[]>(KEYS.PRODUCTS, mockProducts);
    setLocalStorage(KEYS.ORDERS, createDefaultOrders(products));
  }
};

// Trigger database initialization on import in browser
initDatabase();

// ==========================================
// PRODUCTS CRUD OPERATIONS
// ==========================================

export const getProducts = (): Product[] => {
  return getLocalStorage<Product[]>(KEYS.PRODUCTS, mockProducts);
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const saveProduct = (product: Product): Product => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);

  if (index >= 0) {
    products[index] = product;
  } else {
    // Generate new ID
    const newId = (Math.max(...products.map(p => parseInt(p.id) || 0)) + 1).toString();
    product.id = newId;
    products.push(product);
  }

  setLocalStorage(KEYS.PRODUCTS, products);
  return product;
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  setLocalStorage(KEYS.PRODUCTS, filtered);
  return true;
};

export const decrementStock = (productId: string, quantity: number): boolean => {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product || product.stock < quantity) return false;

  product.stock -= quantity;
  setLocalStorage(KEYS.PRODUCTS, products);
  return true;
};

export const addProductReview = (productId: string, review: Omit<Review, 'id' | 'date'>): Review | null => {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return null;

  const newReview: Review = {
    id: `r-${Date.now()}`,
    userName: review.userName,
    rating: review.rating,
    comment: review.comment,
    date: new Date().toISOString().split('T')[0]
  };

  product.reviews = [newReview, ...product.reviews];
  product.reviewsCount = product.reviews.length;
  // Recalculate average rating
  const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.ratings = parseFloat((totalRating / product.reviews.length).toFixed(1));

  setLocalStorage(KEYS.PRODUCTS, products);
  return newReview;
};

// ==========================================
// USERS CRUD OPERATIONS
// ==========================================

export const getUsers = (): User[] => {
  return getLocalStorage<User[]>(KEYS.USERS, defaultUsers);
};

export const getUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const saveUser = (user: User): User => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());

  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    user.id = user.id || `u-${Date.now()}`;
    user.role = user.role || 'customer';
    users.push(user);
  }

  setLocalStorage(KEYS.USERS, users);
  return user;
};

// ==========================================
// COUPONS CRUD OPERATIONS
// ==========================================

export const getCoupons = (): Coupon[] => {
  return getLocalStorage<Coupon[]>(KEYS.COUPONS, mockCoupons);
};

export const saveCoupon = (coupon: Coupon): Coupon => {
  const coupons = getCoupons();
  const index = coupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());

  if (index >= 0) {
    coupons[index] = coupon;
  } else {
    coupons.push(coupon);
  }

  setLocalStorage(KEYS.COUPONS, coupons);
  return coupon;
};

export const deleteCoupon = (code: string): boolean => {
  const coupons = getCoupons();
  const filtered = coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
  if (filtered.length === coupons.length) return false;
  setLocalStorage(KEYS.COUPONS, filtered);
  return true;
};

export const validateCoupon = (code: string, subtotal: number): { success: boolean; discount: number; message: string } => {
  const coupons = getCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);

  if (!coupon) {
    return { success: false, discount: 0, message: 'Invalid or expired coupon code.' };
  }

  if (coupon.minAmount && subtotal < coupon.minAmount) {
    return { success: false, discount: 0, message: `Minimum subtotal of $${coupon.minAmount.toFixed(2)} required for this coupon.` };
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  // Cap discount at subtotal
  discount = Math.min(discount, subtotal);

  return { success: true, discount, message: 'Coupon applied successfully!' };
};

// ==========================================
// ORDERS CRUD OPERATIONS
// ==========================================

export const getOrders = (): Order[] => {
  const defaultProds = getLocalStorage<Product[]>(KEYS.PRODUCTS, mockProducts);
  return getLocalStorage<Order[]>(KEYS.ORDERS, createDefaultOrders(defaultProds));
};

export const getOrderById = (id: string): Order | undefined => {
  const orders = getOrders();
  return orders.find(o => o.id === id);
};

export const getOrdersByEmail = (email: string): Order[] => {
  const orders = getOrders();
  return orders.filter(o => o.userEmail.toLowerCase() === email.toLowerCase());
};

export const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber' | 'paymentStatus'>): Order => {
  const orders = getOrders();
  
  // Calculate next Order ID (e.g. FM-1007)
  const numericIds = orders
    .map(o => parseInt(o.id.replace('FM-', '')))
    .filter(id => !isNaN(id));
  const nextNumId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1007;
  const newId = `FM-${nextNumId}`;

  // Generate tracking number
  const trackingNumber = `TRK${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder: Order = {
    ...orderData,
    id: newId,
    status: 'pending',
    paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
    trackingNumber,
    createdAt: new Date().toISOString()
  };

  // Decrement stock for all items
  newOrder.items.forEach(item => {
    decrementStock(item.product.id, item.quantity);
  });

  orders.unshift(newOrder); // Add to the beginning of the list
  setLocalStorage(KEYS.ORDERS, orders);
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): boolean => {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return false;

  order.status = status;
  if (status === 'delivered') {
    order.paymentStatus = 'paid';
  }
  
  setLocalStorage(KEYS.ORDERS, orders);
  return true;
};

// ==========================================
// DASHBOARD ANALYTICS GENERATION
// ==========================================

export const getDashboardStats = (): DashboardStats => {
  const orders = getOrders();
  const users = getUsers();
  const products = getProducts();

  // Completed (Delivered) orders total revenue
  const totalRevenue = orders
    .filter(o => o.status === 'delivered' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const averageBasket = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;

  // Let's generate daily revenue over last 7 days (including today)
  const dailyRevMap: { [date: string]: number } = {};
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyRevMap[dateStr] = 0;
  }

  orders.forEach(o => {
    if (o.status === 'delivered' || o.paymentStatus === 'paid') {
      const dateStr = o.createdAt.split('T')[0];
      if (dailyRevMap[dateStr] !== undefined) {
        dailyRevMap[dateStr] += o.total;
      }
    }
  });

  const dailyRevenue = Object.keys(dailyRevMap).map(date => ({
    date: date.substring(5), // formatted as MM-DD
    amount: parseFloat(dailyRevMap[date].toFixed(2))
  }));

  // Sales by Category
  const catSalesMap: { [cat: string]: number } = {
    Products: 0,
    meat: 0,
    dairy: 0,
    pantry: 0,
    bakery: 0
  };

  orders.forEach(o => {
    if (o.status === 'delivered' || o.paymentStatus === 'paid') {
      o.items.forEach(item => {
        const cat = item.product.category;
        const itemRevenue = item.product.price * item.quantity;
        if (catSalesMap[cat] !== undefined) {
          catSalesMap[cat] += itemRevenue;
        }
      });
    }
  });

  const categorySales = Object.keys(catSalesMap).map(category => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount: parseFloat(catSalesMap[category].toFixed(2))
  }));

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    revenueGrowth: 12.4, // Mock monthly growth percentage
    totalOrders,
    ordersGrowth: 8.2,
    averageBasket,
    basketGrowth: 4.1,
    totalCustomers,
    customersGrowth: 15.6,
    dailyRevenue,
    categorySales
  };
};
