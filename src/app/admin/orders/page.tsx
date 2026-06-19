'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { OrderStatus, Product, Order } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function AdminOrdersPage() {
  const { orders, loadAllData, initializeRealtimeOrders, updateOrderStatus, deleteOrder, isLoading } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadAllData();
    const unsubscribe = initializeRealtimeOrders();
    return () => unsubscribe();
  }, [loadAllData, initializeRealtimeOrders]);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    if (viewOrder && viewOrder.id === orderId) {
      setViewOrder({ ...viewOrder, status });
    }
  };

  const executeDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      await deleteOrder(id);
      setViewOrder(null);
    }
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) || 
        o.userName.toLowerCase().includes(q) ||
        o.userEmail.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      result = result.filter(o => o.paymentStatus === paymentFilter);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      result = result.filter(o => {
        const d = new Date(o.createdAt);
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dateRange === '7') return diffDays <= 7;
        if (dateRange === '30') return diffDays <= 30;
        return true;
      });
    }

    return result;
  }, [orders, searchQuery, statusFilter, paymentFilter, dateRange]);

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="material-symbols-outlined text-[48px] animate-spin text-secondary">
          progress_activity
        </span>
        <p className="font-semibold text-sm">Synchronizing store logistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top Area */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h3 className="font-display font-bold text-2xl text-primary flex items-center gap-2">
            Orders
            {pendingCount > 0 && (
              <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </h3>
          <p className="text-sm text-outline font-medium">Manage and fulfill customer orders in real-time</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input 
            type="text" 
            placeholder="Search by ID, Name or Email"
            className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-secondary/20 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-secondary/20"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select 
          className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-secondary/20"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Unpaid</option>
        </select>

        <select 
          className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-secondary/20"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-outline-variant/10 overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold text-primary border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-surface-container-low/60 text-outline border-b border-outline-variant/10">
              <th className="p-4 font-bold">Order ID</th>
              <th className="p-4 font-bold">Customer</th>
              <th className="p-4 font-bold">Date & Delivery Slot</th>
              <th className="p-4 font-bold">Items</th>
              <th className="p-4 font-bold">Total</th>
              <th className="p-4 font-bold">Payment</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-outline">No orders match your criteria.</td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-surface-container-low/10 transition-all">
                  <td className="p-4 font-bold font-mono text-secondary text-[11px]">{o.id}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-extrabold">{o.userName}</p>
                      <p className="text-[10px] text-outline">{o.userEmail}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-[10px] text-outline mb-0.5">Placed: {formatDate(o.createdAt)}</p>
                    <div className="flex items-center gap-1 mt-1 text-secondary">
                      <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                      <span className="text-[11px] font-bold">{o.deliverySlot?.date} • {o.deliverySlot?.time?.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td className="p-4 text-outline">{o.items.length} items</td>
                  <td className="p-4 font-bold text-secondary-fixed-variant">{formatCurrency(o.total)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      o.paymentStatus === 'paid' ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'
                    }`}>
                      {o.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                      className={`text-[10px] font-black rounded-full px-3 py-1 cursor-pointer border outline-none capitalize ${
                        o.status === 'delivered' ? 'bg-secondary-container/10 border-secondary-container/30 text-secondary'
                        : o.status === 'out_for_delivery' ? 'bg-secondary/20 border-secondary/30 text-secondary-fixed-variant'
                        : o.status === 'shipped' ? 'bg-primary-fixed/20 border-primary-fixed/30 text-primary'
                        : o.status === 'packed' ? 'bg-blue-100 border-blue-200 text-blue-800'
                        : o.status === 'processing' ? 'bg-blue-50 border-blue-100 text-blue-600'
                        : o.status === 'confirmed' ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : o.status === 'cancelled' ? 'bg-surface-container-high border-outline-variant/30 text-outline'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setViewOrder(o)}
                      className="bg-primary text-white px-4 py-1.5 rounded-lg text-[11px] font-bold hover:bg-secondary transition-all"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal/Slide-over */}
      <AnimatePresence>
        {viewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full border-l border-outline-variant/20 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 bg-surface-container-low">
                <div>
                  <h2 className="text-xl font-display font-bold text-primary">Order Details</h2>
                  <p className="text-xs font-mono font-bold text-secondary">{viewOrder.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={viewOrder.status}
                    onChange={(e) => handleStatusChange(viewOrder.id, e.target.value as OrderStatus)}
                    className={`text-xs font-black rounded-lg px-4 py-2 cursor-pointer border outline-none capitalize ${
                      viewOrder.status === 'delivered' ? 'bg-secondary-container/10 border-secondary-container/30 text-secondary'
                      : viewOrder.status === 'cancelled' ? 'bg-surface-container-high border-outline-variant/30 text-outline'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button 
                    onClick={() => setViewOrder(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-outline-variant/20 text-primary transition-all"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/10">
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-4 border-b border-outline-variant/10 pb-2">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      Customer Details
                    </h3>
                    <div className="space-y-2 text-xs">
                      <p><span className="text-outline font-semibold">Name:</span> <span className="font-bold">{viewOrder.userName}</span></p>
                      <p><span className="text-outline font-semibold">Email:</span> {viewOrder.userEmail}</p>
                      <p><span className="text-outline font-semibold">Phone:</span> {viewOrder.address.phone}</p>
                    </div>
                  </div>

                  {/* Order Meta */}
                  <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/10">
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-4 border-b border-outline-variant/10 pb-2">
                      <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                      Order Info
                    </h3>
                    <div className="space-y-2 text-xs">
                      <p><span className="text-outline font-semibold">Placed On:</span> {formatDate(viewOrder.createdAt)}</p>
                      <p><span className="text-outline font-semibold">Delivery Slot:</span> <span className="font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{viewOrder.deliverySlot?.date} ({viewOrder.deliverySlot?.time})</span></p>
                      <p><span className="text-outline font-semibold">Payment:</span> <span className="uppercase">{viewOrder.paymentMethod}</span></p>
                      <p><span className="text-outline font-semibold">Payment Status:</span> <span className={`font-bold ${viewOrder.paymentStatus === 'paid' ? 'text-secondary' : 'text-error'}`}>{viewOrder.paymentStatus}</span></p>
                      <p><span className="text-outline font-semibold">Tracking:</span> <span className="font-mono bg-surface-container px-1.5 py-0.5 rounded text-[10px]">{viewOrder.trackingNumber}</span></p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/10">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-4 border-b border-outline-variant/10 pb-2">
                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                    Shipping Address (Also Billing)
                  </h3>
                  <div className="text-xs space-y-1 text-primary font-medium">
                    <p>{viewOrder.address.fullName}</p>
                    <p>{viewOrder.address.street}</p>
                    <p>{viewOrder.address.city}, {viewOrder.address.postalCode}</p>
                    <p>{viewOrder.address.country}</p>
                  </div>
                </div>

                {/* Ordered Items */}
                <div>
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                    Ordered Products ({viewOrder.items.length})
                  </h3>
                  <div className="border border-outline-variant/20 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs font-semibold text-primary">
                      <thead className="bg-surface-container-low/80 text-outline border-b border-outline-variant/10">
                        <tr>
                          <th className="p-3 w-14"></th>
                          <th className="p-3">Product</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Price</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {viewOrder.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-container-low/10">
                            <td className="p-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container relative">
                                <Image src={item.product.images?.[0] || '/placeholder.png'} alt={item.product.name} fill className="object-cover" />
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="font-bold">{item.product.name}</p>
                              <p className="text-[10px] text-outline font-medium">{item.product.category || item.product.categoryId}</p>
                            </td>
                            <td className="p-3 text-center">x{item.quantity}</td>
                            <td className="p-3 text-right text-outline">{formatCurrency(item.product.price)}</td>
                            <td className="p-3 text-right font-bold text-secondary-fixed-variant">{formatCurrency(item.product.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/10 ml-auto w-full max-w-sm">
                  <h3 className="text-sm font-bold text-primary mb-4 border-b border-outline-variant/10 pb-2">Order Summary</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-outline font-semibold">
                      <span>Subtotal</span>
                      <span className="text-primary">{formatCurrency(viewOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-outline font-semibold">
                      <span>Shipping Fee</span>
                      <span className="text-primary">{formatCurrency(viewOrder.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-outline font-semibold">
                      <span>Tax (GST)</span>
                      <span className="text-primary">{formatCurrency(viewOrder.tax)}</span>
                    </div>
                    {viewOrder.discount > 0 && (
                      <div className="flex justify-between text-secondary font-bold">
                        <span>Discount ({viewOrder.couponCode})</span>
                        <span>-{formatCurrency(viewOrder.discount)}</span>
                      </div>
                    )}
                    <div className="pt-3 mt-3 border-t border-outline-variant/20 flex justify-between items-center">
                      <span className="font-bold text-sm text-primary">Grand Total</span>
                      <span className="font-black text-xl text-secondary-fixed-variant">{formatCurrency(viewOrder.total)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-outline-variant/10 bg-surface-container-low/30 flex justify-between">
                <button 
                  onClick={() => executeDelete(viewOrder.id)}
                  className="px-4 py-2 text-error text-xs font-bold hover:bg-error/10 rounded-xl transition-all"
                >
                  Delete Order
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print Invoice
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
