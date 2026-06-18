import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, runTransaction, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Product, User, Order, Coupon, DashboardStats, OrderStatus, Review } from './types';

// ==========================================
// PRODUCTS CRUD OPERATIONS
// ==========================================
const productsCol = collection(db, 'products');

export const getProducts = async (): Promise<Product[]> => {
  const q = query(productsCol);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as Product;
  }
  return undefined;
};

export const saveProduct = async (product: Product): Promise<Product> => {
  let docRef;
  if (product.id && product.id.trim() !== '') {
    docRef = doc(db, 'products', product.id);
  } else {
    docRef = doc(productsCol);
    product.id = docRef.id;
  }
  await setDoc(docRef, product);
  return product;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'products', id));
    return true;
  } catch (error) {
    return false;
  }
};

export const decrementStock = async (productId: string, quantity: number): Promise<boolean> => {
  try {
    const docRef = doc(db, 'products', productId);
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      if (!docSnap.exists()) throw new Error('Product not found');
      const data = docSnap.data() as Product;
      if (data.stock < quantity) throw new Error('Insufficient stock');
      transaction.update(docRef, { stock: data.stock - quantity });
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const addProductReview = async (productId: string, review: Omit<Review, 'id' | 'date'>): Promise<Review | null> => {
  try {
    const docRef = doc(db, 'products', productId);
    let newReview: Review | null = null;
    
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      if (!docSnap.exists()) throw new Error('Product not found');
      const data = docSnap.data() as Product;
      
      newReview = {
        id: `r-${Date.now()}`,
        userName: review.userName,
        userId: review.userId,
        rating: review.rating,
        comment: review.comment,
        date: new Date().toISOString().split('T')[0]
      };

      const newReviews = [newReview, ...(data.reviews || [])];
      const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
      const newRatings = parseFloat((totalRating / newReviews.length).toFixed(1));

      transaction.update(docRef, {
        reviews: newReviews,
        reviewsCount: newReviews.length,
        ratings: newRatings
      });
    });
    return newReview;
  } catch (error) {
    return null;
  }
};

export const editProductReview = async (productId: string, reviewId: string, userId: string, newRating: number, newComment: string): Promise<Review | null> => {
  try {
    const docRef = doc(db, 'products', productId);
    let updatedReview: Review | null = null;
    
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      if (!docSnap.exists()) throw new Error('Product not found');
      const data = docSnap.data() as Product;
      
      const reviews = data.reviews || [];
      const reviewIndex = reviews.findIndex(r => r.id === reviewId);
      
      if (reviewIndex === -1) throw new Error('Review not found');
      if (reviews[reviewIndex].userId !== userId) throw new Error('Unauthorized');

      updatedReview = {
        ...reviews[reviewIndex],
        rating: newRating,
        comment: newComment,
        date: new Date().toISOString().split('T')[0] // Update the date to show it was edited
      };

      reviews[reviewIndex] = updatedReview;

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const newRatings = parseFloat((totalRating / reviews.length).toFixed(1));

      transaction.update(docRef, {
        reviews,
        ratings: newRatings
      });
    });
    return updatedReview;
  } catch (error) {
    return null;
  }
};

// ==========================================
// USERS CRUD OPERATIONS
// ==========================================
const usersCol = collection(db, 'users');

export const getUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(usersCol);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const q = query(usersCol, where('email', '==', email));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { ...docSnap.data(), id: docSnap.id } as User;
  }
  return undefined;
};

export const saveUser = async (user: User): Promise<User> => {
  let docRef;
  if (user.id && user.id.trim() !== '') {
    docRef = doc(db, 'users', user.id);
  } else {
    docRef = doc(usersCol);
    user.id = docRef.id;
  }
  if (!user.role) user.role = 'customer';
  await setDoc(docRef, user, { merge: true });
  return user;
};

// ==========================================
// COUPONS CRUD OPERATIONS
// ==========================================
const couponsCol = collection(db, 'coupons');

export const getCoupons = async (): Promise<Coupon[]> => {
  const snapshot = await getDocs(couponsCol);
  return snapshot.docs.map(doc => doc.data() as Coupon);
};

export const saveCoupon = async (coupon: Coupon): Promise<Coupon> => {
  const docRef = doc(db, 'coupons', coupon.code.toUpperCase());
  await setDoc(docRef, coupon);
  return coupon;
};

export const deleteCoupon = async (code: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'coupons', code.toUpperCase()));
    return true;
  } catch (error) {
    return false;
  }
};

export const validateCoupon = async (code: string, subtotal: number): Promise<{ success: boolean; discount: number; message: string }> => {
  const docRef = doc(db, 'coupons', code.toUpperCase());
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return { success: false, discount: 0, message: 'Invalid or expired coupon code.' };
  }
  
  const coupon = docSnap.data() as Coupon;
  if (!coupon.isActive) {
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
const ordersCol = collection(db, 'orders');

export const getOrders = async (): Promise<Order[]> => {
  const q = query(ordersCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  const docRef = doc(db, 'orders', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as Order;
  }
  return undefined;
};

export const getOrdersByEmail = async (email: string): Promise<Order[]> => {
  const q = query(ordersCol, where('userEmail', '==', email));
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber' | 'paymentStatus'>): Promise<Order> => {
  const newId = `FM-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
  const trackingNumber = `TRK${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder: Order = {
    ...orderData,
    id: newId,
    status: 'pending',
    paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
    trackingNumber,
    createdAt: new Date().toISOString()
  };

  const docRef = doc(db, 'orders', newId);
  await setDoc(docRef, newOrder);

  for (const item of newOrder.items) {
     await decrementStock(item.product.id, item.quantity);
  }

  return newOrder;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const updateData: any = { status };
    if (status === 'delivered') {
      updateData.paymentStatus = 'paid';
    }
    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    return false;
  }
};

export const updateOrder = async (orderId: string, orderData: Partial<Order>): Promise<boolean> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, orderData);
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteOrder = async (orderId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    return false;
  }
};

// ==========================================
// DASHBOARD ANALYTICS GENERATION
// ==========================================
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const orders = await getOrders();
  const users = await getUsers();

  const totalRevenue = orders
    .filter(o => o.status === 'delivered' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const averageBasket = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;

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

  const catSalesMap: { [cat: string]: number } = {
    Products: 0, meat: 0, dairy: 0, pantry: 0, bakery: 0
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

// System Settings
export const getSystemSettings = async () => {
  const settingsRef = doc(db, 'system', 'settings');
  const snap = await getDoc(settingsRef);
  if (snap.exists()) {
    return snap.data() as { activePaymentProvider: 'stripe' | 'mock' };
  }
  // Default fallback if document doesn't exist
  return { activePaymentProvider: 'mock' };
};

export const updateSystemSettings = async (settings: { activePaymentProvider: 'stripe' | 'mock' }) => {
  const settingsRef = doc(db, 'system', 'settings');
  await setDoc(settingsRef, settings, { merge: true });
};
