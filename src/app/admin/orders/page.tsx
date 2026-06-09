'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { OrderStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminOrdersPage() {
  const { orders, loadAllData, updateOrderStatus, isLoading } = useAdminStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (isLoading) {
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
    <div className="bg-white rounded-[32px] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-outline-variant/10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-primary">Store Orders Tracker</h3>
          <p className="text-xs text-outline font-medium">Update order status flows and inspect client receipts</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-outline text-xs">
          No customer orders placed yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/10">
          <table className="w-full text-left text-xs font-semibold text-primary border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-surface-container-low/60 text-outline border-b border-outline-variant/10">
                <th className="p-4 w-10"></th>
                <th className="p-4 font-bold">Order ID</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Placed Date</th>
                <th className="p-4 font-bold">Quantity</th>
                <th className="p-4 font-bold">Revenue Total</th>
                <th className="p-4 font-bold">Order Status</th>
                <th className="p-4 font-bold">Payment Method</th>
                <th className="p-4 font-bold">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {orders.map((o) => {
                const isExpanded = expandedOrderId === o.id;
                const totalQuantity = o.items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <React.Fragment key={o.id}>
                    {/* Primary summary row */}
                    <tr className="hover:bg-surface-container-low/10 transition-all">
                      <td className="p-4">
                        <button
                          onClick={() => toggleExpand(o.id)}
                          className="w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline hover:text-primary transition-all cursor-pointer active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                            chevron_right
                          </span>
                        </button>
                      </td>
                      <td className="p-4 font-bold font-mono text-secondary">{o.id}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-extrabold">{o.userName}</p>
                          <p className="text-[10px] text-outline font-semibold">{o.userEmail}</p>
                        </div>
                      </td>
                      <td className="p-4 text-outline font-semibold">{formatDate(o.createdAt)}</td>
                      <td className="p-4 font-bold">{totalQuantity} units</td>
                      <td className="p-4 font-bold text-secondary-fixed-variant">{formatCurrency(o.total)}</td>
                      <td className="p-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                          className={`text-[10px] font-black rounded-full px-3 py-1 cursor-pointer border focus:ring-2 focus:ring-secondary/20 capitalize font-sans ${
                            o.status === 'delivered'
                              ? 'bg-secondary-container/10 border-secondary-container/30 text-secondary'
                              : o.status === 'shipping'
                                ? 'bg-primary-fixed/20 border-primary-fixed/30 text-primary'
                                : o.status === 'packing'
                                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                                  : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="packing">Packing</option>
                          <option value="shipping">Shipping</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold text-outline uppercase font-mono">{o.paymentMethod}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${
                          o.paymentStatus === 'paid' ? 'text-secondary' : 'text-error'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${o.paymentStatus === 'paid' ? 'bg-secondary' : 'bg-error animate-pulse'}`} />
                          {o.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>

                    {/* Expandable item details row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} className="bg-surface-container-low/30 px-6 py-5 border-t border-b border-outline-variant/10">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                              
                              {/* Left Column: Shipment Details */}
                              <div className="bg-white p-4 rounded-2xl border border-outline-variant/10 shadow-sm space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-1.5 mb-2.5">
                                  <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span>
                                  Shipment Information
                                </h4>
                                <p className="font-bold text-primary">{o.address.fullName}</p>
                                <p className="text-on-surface-variant font-medium">{o.address.street}</p>
                                <p className="text-on-surface-variant font-medium">{o.address.city}, NZ {o.address.postalCode}</p>
                                <p className="text-on-surface-variant font-bold pt-1.5">Phone: {o.address.phone}</p>
                                <p className="text-[10px] font-bold font-mono text-outline pt-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">local_shipping</span>
                                  Tracking: {o.trackingNumber}
                                </p>
                              </div>

                              {/* Center Column: Scheduled delivery slots */}
                              <div className="bg-white p-4 rounded-2xl border border-outline-variant/10 shadow-sm space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-1.5 mb-2.5">
                                  <span className="material-symbols-outlined text-secondary text-[16px]">schedule</span>
                                  Logistics Scheduling
                                </h4>
                                <p className="text-on-surface-variant font-medium">Scheduled Date:</p>
                                <p className="text-secondary font-bold text-sm">{o.deliverySlot.date}</p>
                                <p className="text-on-surface-variant font-medium mt-1">Timeslot Window:</p>
                                <p className="text-primary font-bold">{o.deliverySlot.time}</p>
                              </div>

                              {/* Right Column: Ordered Items List & Reciepts breakdown */}
                              <div className="bg-white p-4 rounded-2xl border border-outline-variant/10 shadow-sm space-y-3">
                                <h4 className="font-bold text-primary flex items-center gap-1.5 mb-1">
                                  <span className="material-symbols-outlined text-secondary text-[16px]">shopping_basket</span>
                                  Ordered Goods
                                </h4>
                                <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                                  {o.items.map((item) => (
                                    <div key={item.product.id} className="flex justify-between items-center gap-2 text-[11px] font-semibold text-primary">
                                      <span className="truncate max-w-[150px]">{item.product.name} ({item.quantity}x)</span>
                                      <span className="text-outline">{formatCurrency(item.product.price * item.quantity)}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t border-outline-variant/10 pt-2.5 space-y-1.5 text-[11px] font-semibold text-on-surface-variant">
                                  <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-primary">{formatCurrency(o.subtotal)}</span>
                                  </div>
                                  {o.discount > 0 && (
                                    <div className="flex justify-between text-secondary">
                                      <span>Discount</span>
                                      <span>-{formatCurrency(o.discount)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-primary font-extrabold text-xs">
                                    <span>Total (GST Inc)</span>
                                    <span className="text-secondary">{formatCurrency(o.total)}</span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
