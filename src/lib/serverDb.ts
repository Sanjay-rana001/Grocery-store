import fs from 'fs';
import path from 'path';
import { Product, User, Order, Coupon, DashboardStats, OrderStatus, Review } from './types';
import { mockProducts, mockCoupons } from './mockData';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Default accounts
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
        { product: products[0], quantity: 2 },
        { product: products[1], quantity: 3 }
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
        { product: products[6], quantity: 1 },
        { product: products[9], quantity: 2 },
        { product: products[16], quantity: 1 }
      ],
      status: 'delivered',
      subtotal: 44.00,
      tax: 6.60,
      shippingFee: 5.00,
      discount: 4.40,
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
        { product: products[5], quantity: 4 },
        { product: products[13], quantity: 1 }
      ],
      status: 'delivered',
      subtotal: 24.80,
      tax: 3.72,
      shippingFee: 5.00,
      discount: 5.00,
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
    }
  ];
};

interface DbStructure {
  products: Product[];
  users: User[];
  orders: Order[];
  coupons: Coupon[];
}

// Ensure database file exists and is populated
const initDb = (): DbStructure => {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DbStructure = {
      products: mockProducts,
      users: defaultUsers,
      coupons: mockCoupons,
      orders: createDefaultOrders(mockProducts)
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading DB file, recreating...', error);
    const initialDb: DbStructure = {
      products: mockProducts,
      users: defaultUsers,
      coupons: mockCoupons,
      orders: createDefaultOrders(mockProducts)
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
};

const saveDb = (db: DbStructure): void => {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to DB file:', error);
  }
};

// ==========================================
// PRODUCTS CRUD OPERATIONS
// ==========================================

export const getProducts = (): Product[] => {
  const db = initDb();
  return db.products;
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const saveProduct = (product: Product): Product => {
  const db = initDb();
  const index = db.products.findIndex(p => p.id === product.id);

  if (index >= 0) {
    db.products[index] = product;
  } else {
    // Generate new ID
    const newId = (Math.max(...db.products.map(p => parseInt(p.id) || 0)) + 1).toString();
    product.id = newId;
    db.products.push(product);
  }

  saveDb(db);
  return product;
};

export const deleteProduct = (id: string): boolean => {
  const db = initDb();
  const filtered = db.products.filter(p => p.id !== id);
  if (filtered.length === db.products.length) return false;
  db.products = filtered;
  saveDb(db);
  return true;
};

export const decrementStock = (productId: string, quantity: number): boolean => {
  const db = initDb();
  const product = db.products.find(p => p.id === productId);
  if (!product || product.stock < quantity) return false;

  product.stock -= quantity;
  saveDb(db);
  return true;
};

export const addProductReview = (productId: string, review: Omit<Review, 'id' | 'date'>): Review | null => {
  const db = initDb();
  const product = db.products.find(p => p.id === productId);
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

  saveDb(db);
  return newReview;
};

// ==========================================
// USERS CRUD OPERATIONS
// ==========================================

export const getUsers = (): User[] => {
  const db = initDb();
  return db.users;
};

export const getUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const saveUser = (user: User): User => {
  const db = initDb();
  const index = db.users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());

  if (index >= 0) {
    db.users[index] = { ...db.users[index], ...user };
  } else {
    user.id = user.id || `u-${Date.now()}`;
    user.role = user.role || 'customer';
    db.users.push(user);
  }

  saveDb(db);
  return user;
};

// ==========================================
// COUPONS CRUD OPERATIONS
// ==========================================

export const getCoupons = (): Coupon[] => {
  const db = initDb();
  return db.coupons;
};

export const saveCoupon = (coupon: Coupon): Coupon => {
  const db = initDb();
  const index = db.coupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());

  if (index >= 0) {
    db.coupons[index] = coupon;
  } else {
    db.coupons.push(coupon);
  }

  saveDb(db);
  return coupon;
};

export const deleteCoupon = (code: string): boolean => {
  const db = initDb();
  const filtered = db.coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
  if (filtered.length === db.coupons.length) return false;
  db.coupons = filtered;
  saveDb(db);
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

  discount = Math.min(discount, subtotal);

  return { success: true, discount, message: 'Coupon applied successfully!' };
};

// ==========================================
// ORDERS CRUD OPERATIONS
// ==========================================

export const getOrders = (): Order[] => {
  const db = initDb();
  return db.orders;
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
  const db = initDb();
  
  // Calculate next Order ID
  const numericIds = db.orders
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
    const prod = db.products.find(p => p.id === item.product.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  db.orders.unshift(newOrder);
  saveDb(db);
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): boolean => {
  const db = initDb();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return false;

  order.status = status;
  if (status === 'delivered') {
    order.paymentStatus = 'paid';
  }
  
  saveDb(db);
  return true;
};

// ==========================================
// DASHBOARD ANALYTICS GENERATION
// ==========================================

export const getDashboardStats = (): DashboardStats => {
  const db = initDb();
  const orders = db.orders;
  const users = db.users;

  // Completed revenue
  const totalRevenue = orders
    .filter(o => o.status === 'delivered' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const averageBasket = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;

  // Last 7 days daily revenue
  const dailyRevMap: { [date: string]: number } = {};
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
    date: date.substring(5),
    amount: parseFloat(dailyRevMap[date].toFixed(2))
  }));

  // Sales by category
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
    revenueGrowth: 12.4,
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
