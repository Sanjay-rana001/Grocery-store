'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { updateOrderStatus } from '@/lib/db';
import { subscribeToCustomerOrders } from '@/lib/firebaseServices';
import { Order, OrderStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect if not authenticated after client mounts
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/orders');
      return;
    }

    if (!user?.email) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    const unsubscribe = subscribeToCustomerOrders(user.email, (fetchedOrders) => {
      setOrders(fetchedOrders);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user, router]);

  // Statistics summaries
  const stats = useMemo(() => {
    const total = orders.length;
    const spent = orders
      .filter(o => o.paymentStatus === 'paid' || o.paymentMethod === 'cod')
      .reduce((acc, o) => acc + o.total, 0);
    const active = orders.filter(
      o => o.status === 'pending' || o.status === 'packed' || o.status === 'shipped'
    ).length;

    return { total, spent, active };
  }, [orders]);

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  const handleReorder = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent collapsing/expanding card
    try {
      for (const item of order.items) {
        await addItem(item.product, item.quantity);
      }
      setReorderSuccess(order.id);
      setTimeout(() => setReorderSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to reorder items', err);
    }
  };

  const handleCancelOrder = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        const success = await updateOrderStatus(order.id, 'cancelled');
        if (success) {
          // Update local state
          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
          alert('Order cancelled successfully.');
        } else {
          alert('Failed to cancel order. Please try again or contact support.');
        }
      } catch (err) {
        console.error('Error cancelling order:', err);
      }
    }
  };

  const getStatusBadgeStyles = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'out_for_delivery':
        return 'bg-secondary/20 text-secondary-fixed-variant border-secondary/30';
      case 'shipped':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'packed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'confirmed':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'cancelled':
        return 'bg-surface-container-high text-outline border-outline-variant/30';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'shipped':
        return 'Shipped';
      case 'packed':
        return 'Packed';
      case 'processing':
        return 'Processing';
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] text-primary">
        <span className="material-symbols-outlined text-[48px] animate-bounce text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
          shopping_basket
        </span>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 md:pb-12 max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop min-h-screen bg-background">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-headline-lg font-bold text-primary">My Orders</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Track, view detailed bills, and reorder your fresh organic groceries.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-secondary text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-primary active:scale-95 transition-all shadow-sm self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            Shop More
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px] w-full">
            <span className="material-symbols-outlined text-[48px] animate-bounce text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              shopping_basket
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[32px] py-16 px-6 text-center shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10">
            <span className="material-symbols-outlined text-[64px] text-outline/35 mb-4">
              receipt_long
            </span>
            <h3 className="font-display font-bold text-headline-md text-primary">No orders found</h3>
            <p className="text-on-surface-variant text-sm max-w-sm mx-auto mt-2">
              You haven&apos;t placed any orders yet. Fill your cart with premium local Products to get started!
            </p>
            <Link
              href="/"
              className="inline-block mt-6 bg-secondary text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-primary active:scale-95 shadow-md transition-all cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-container/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">receipt_long</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-outline">Total Orders</p>
                  <p className="text-headline-md font-bold text-primary mt-0.5">{stats.total}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-container/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">payments</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-outline">Total Spent</p>
                  <p className="text-headline-md font-bold text-primary mt-0.5">{formatCurrency(stats.spent)}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-container/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">local_shipping</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-outline">Active Orders</p>
                  <p className="text-headline-md font-bold text-primary mt-0.5">{stats.active}</p>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {orders.map(order => {
                const isExpanded = expandedOrderId === order.id;
                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-NZ', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });
                
                return (
                  <div
                    key={order.id}
                    className={`bg-white border rounded-2xl transition-all duration-300 shadow-[0px_4px_20px_rgba(0,0,0,0.015)] overflow-hidden ${
                      isExpanded ? 'border-secondary/40 ring-1 ring-secondary/10' : 'border-outline-variant/15 hover:border-outline-variant/50'
                    }`}
                  >
                    {/* Collapsible Header */}
                    <div
                      onClick={() => toggleExpandOrder(order.id)}
                      className="p-5 lg:p-6 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none"
                    >
                      <div className="grid grid-cols-2 lg:flex lg:items-center lg:gap-8 flex-grow">
                        <div>
                          <p className="text-[10px] lg:text-xs font-semibold text-outline">Order Date</p>
                          <p className="text-sm font-bold text-primary mt-0.5">{formattedDate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] lg:text-xs font-semibold text-outline">Order ID</p>
                          <p className="text-sm font-bold text-primary mt-0.5 font-mono truncate max-w-[120px] lg:max-w-none">
                            #{order.id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] lg:text-xs font-semibold text-outline">Total Amount</p>
                          <p className="text-sm font-bold text-secondary mt-0.5">{formatCurrency(order.total)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] lg:text-xs font-semibold text-outline">Delivery Slot</p>
                          <p className="text-sm font-semibold text-on-surface-variant mt-0.5 truncate max-w-[150px] lg:max-w-none">
                            {order.deliverySlot.date} ({order.deliverySlot.time.split(' ')[0]})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t border-outline-variant/5 lg:border-t-0">
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyles(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>

                        <div className="flex items-center gap-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={(e) => handleCancelOrder(order, e)}
                              className="flex items-center gap-1 text-xs font-bold py-1.5 px-3 rounded-full transition-all border border-outline-variant/50 text-error hover:bg-error/10 active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[16px]">cancel</span>
                              <span>Cancel</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => handleReorder(order, e)}
                            className={`flex items-center gap-1 text-xs font-bold py-1.5 px-3 rounded-full transition-all border ${
                              reorderSuccess === order.id
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-secondary text-white border-transparent hover:bg-primary active:scale-95'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {reorderSuccess === order.id ? 'check' : 'replay'}
                            </span>
                            <span>{reorderSuccess === order.id ? 'Added to Cart!' : 'Reorder'}</span>
                          </button>

                          <span className={`material-symbols-outlined text-outline transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}>
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Details */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="border-t border-outline-variant/10 bg-surface-container-low/20"
                        >
                          <div className="p-5 lg:p-6 space-y-6">
                            {/* Products Purchased */}
                            <div>
                              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Items Ordered</h4>
                              <div className="space-y-3">
                                {order.items.map(item => (
                                  <div
                                    key={item.product.id}
                                    className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-outline-variant/10 shadow-[0px_2px_8px_rgba(0,0,0,0.01)]"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="relative w-14 h-14 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                          src={item.product.images[0] || '/placeholder.png'}
                                          alt={item.product.name}
                                          fill
                                          sizes="56px"
                                          className="object-cover"
                                        />
                                      </div>
                                      <div>
                                        <h5 className="text-sm font-bold text-primary line-clamp-1">{item.product.name}</h5>
                                        <p className="text-xs text-outline mt-0.5">
                                          {item.product.unit} • {formatCurrency(item.product.price)} / {item.product.unit}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-xs font-semibold text-on-surface-variant">Qty: {item.quantity}</p>
                                      <p className="text-sm font-bold text-primary mt-0.5">
                                        {formatCurrency(item.product.price * item.quantity)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery & Payment Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/10">
                              {/* Shipping & Delivery Address */}
                              <div>
                                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Delivery Address</h4>
                                <div className="text-sm text-on-surface-variant space-y-0.5 bg-white p-4 rounded-xl border border-outline-variant/10">
                                  <p className="font-bold text-primary">{order.address.fullName}</p>
                                  <p>{order.address.street}</p>
                                  <p>{order.address.city}, {order.address.postalCode}</p>
                                  <p>{order.address.country}</p>
                                  <p className="text-xs text-outline mt-1">Phone: {order.address.phone}</p>
                                </div>
                              </div>

                              {/* Billing Summary */}
                              <div>
                                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Order Summary</h4>
                                <div className="bg-white p-4 rounded-xl border border-outline-variant/10 space-y-2 text-sm">
                                  <div className="flex justify-between text-on-surface-variant">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.subtotal)}</span>
                                  </div>
                                  {order.discount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-medium">
                                      <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                                      <span>-{formatCurrency(order.discount)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-on-surface-variant">
                                    <span>Shipping Fee</span>
                                    <span>{order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee)}</span>
                                  </div>
                                  <div className="flex justify-between text-on-surface-variant text-xs">
                                    <span>GST (15% Included)</span>
                                    <span>{formatCurrency(order.tax)}</span>
                                  </div>
                                  <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-outline-variant/10">
                                    <span>Total</span>
                                    <span className="text-secondary">{formatCurrency(order.total)}</span>
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-outline-variant/10 grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <p className="font-semibold text-outline">Payment Method</p>
                                      <p className="font-bold text-primary uppercase mt-0.5">{order.paymentMethod}</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-outline">Payment Status</p>
                                      <p className="font-bold text-primary capitalize mt-0.5">{order.paymentStatus}</p>
                                    </div>
                                  </div>

                                  {order.trackingNumber && (
                                    <div className="mt-3 bg-secondary-container/5 border border-secondary/15 p-2.5 rounded-lg flex items-center justify-between text-xs">
                                      <div>
                                        <span className="font-semibold text-outline">Tracking Link: </span>
                                        <span className="font-bold text-primary font-mono select-all">{order.trackingNumber}</span>
                                      </div>
                                      <button 
                                        onClick={() => alert(`Tracking status: Order is currently ${getStatusLabel(order.status).toLowerCase()}.`)}
                                        className="text-secondary hover:underline font-bold"
                                      >
                                        Track Shipment
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <MobileNav />
      <Footer />
    </>
  );
}
