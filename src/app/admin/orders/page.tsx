'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { OrderStatus, Product, Order } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminOrdersPage() {
  const { orders, products, loadAllData, updateOrderStatus, deleteOrder, createOrder, updateOrder, isLoading } = useAdminStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form State
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fStreet, setFStreet] = useState('');
  const [fCity, setFCity] = useState('Auckland');
  const [fPostal, setFPostal] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fStatus, setFStatus] = useState<OrderStatus>('pending');
  const [fPayment, setFPayment] = useState<'pending' | 'paid'>('pending');
  
  const [fItems, setFItems] = useState<{product: Product, quantity: number}[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const openCreateModal = () => {
    setEditingOrder(null);
    setFName(''); setFEmail(''); setFStreet(''); setFCity('Auckland'); setFPostal(''); setFPhone('');
    setFStatus('pending'); setFPayment('pending');
    setFItems([]);
    setIsModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setFName(order.address.fullName || order.userName);
    setFEmail(order.userEmail);
    setFStreet(order.address.street);
    setFCity(order.address.city);
    setFPostal(order.address.postalCode);
    setFPhone(order.address.phone);
    setFStatus(order.status);
    setFPayment(order.paymentStatus === 'paid' ? 'paid' : 'pending');
    setFItems(order.items);
    setIsModalOpen(true);
  };

  const addItem = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;
    
    setFItems(prev => {
      const exists = prev.find(i => i.product.id === prod.id);
      if (exists) {
        return prev.map(i => i.product.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const removeItem = (pid: string) => {
    setFItems(prev => prev.filter(i => i.product.id !== pid));
  };

  const updateQuantity = (pid: string, qty: number) => {
    if (qty <= 0) return removeItem(pid);
    setFItems(prev => prev.map(i => i.product.id === pid ? { ...i, quantity: qty } : i));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fItems.length === 0) return alert('Please add at least one item.');

    const subtotal = fItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const address = {
      fullName: fName,
      street: fStreet,
      city: fCity,
      postalCode: fPostal,
      phone: fPhone,
    };

    if (editingOrder) {
      await updateOrder(editingOrder.id, {
        userName: fName,
        userEmail: fEmail,
        address,
        status: fStatus,
        paymentStatus: fPayment,
        items: fItems,
        subtotal,
        total: subtotal,
      });
    } else {
      await createOrder({
        userId: 'manual_admin_creation',
        userName: fName,
        userEmail: fEmail,
        items: fItems,
        subtotal,
        discount: 0,
        total: subtotal,
        address,
        deliverySlot: { date: new Date().toISOString().split('T')[0], time: 'As soon as possible' },
      });
    }

    setIsModalOpen(false);
  };

  const executeDelete = async (id: string) => {
    await deleteOrder(id);
    setOrderToDelete(null);
  };

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
      
      {/* Top Bar */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10 flex justify-between items-center">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-primary">Store Orders Tracker</h3>
          <p className="text-xs text-outline font-medium">Manage and fulfill customer orders</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-secondary text-white font-extrabold text-xs py-3 px-6 rounded-2xl active:scale-95 shadow flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          <span>New Manual Order</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-[32px] text-center py-16 text-outline text-xs border border-outline-variant/10 shadow-[0px_4px_24px_rgba(0,0,0,0.02)]">
          No customer orders placed yet.
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-outline-variant/10 overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-primary border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-surface-container-low/60 text-outline border-b border-outline-variant/10">
                <th className="p-4 w-10"></th>
                <th className="p-4 font-bold">Order ID</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Placed Date</th>
                <th className="p-4 font-bold">Revenue</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Payment</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {orders.map((o) => {
                const isExpanded = expandedOrderId === o.id;

                return (
                  <React.Fragment key={o.id}>
                    <tr className="hover:bg-surface-container-low/10 transition-all">
                      <td className="p-4">
                        <button
                          onClick={() => toggleExpand(o.id)}
                          className="w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline hover:text-primary transition-all active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                            chevron_right
                          </span>
                        </button>
                      </td>
                      <td className="p-4 font-bold font-mono text-secondary text-[10px]">{o.id}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-extrabold">{o.userName}</p>
                          <p className="text-[10px] text-outline font-semibold">{o.userEmail}</p>
                        </div>
                      </td>
                      <td className="p-4 text-outline font-semibold">{formatDate(o.createdAt)}</td>
                      <td className="p-4 font-bold text-secondary-fixed-variant">{formatCurrency(o.total)}</td>
                      <td className="p-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                          className={`text-[10px] font-black rounded-full px-3 py-1 cursor-pointer border focus:ring-2 focus:ring-secondary/20 capitalize font-sans ${
                            o.status === 'delivered' ? 'bg-secondary-container/10 border-secondary-container/30 text-secondary'
                            : o.status === 'shipping' ? 'bg-primary-fixed/20 border-primary-fixed/30 text-primary'
                            : o.status === 'packing' ? 'bg-blue-50 border-blue-200 text-blue-800'
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
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${
                          o.paymentStatus === 'paid' ? 'text-secondary' : 'text-error'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${o.paymentStatus === 'paid' ? 'bg-secondary' : 'bg-error animate-pulse'}`} />
                          {o.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(o)}
                            className="w-8 h-8 rounded-xl hover:bg-surface-container flex items-center justify-center text-secondary active:scale-90 border border-outline-variant/10"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          
                          {orderToDelete === o.id ? (
                            <div className="flex items-center gap-1 bg-error/10 p-1 rounded-xl border border-error/20">
                              <button onClick={() => executeDelete(o.id)} className="text-[9px] font-black text-error hover:underline px-1">Confirm</button>
                              <button onClick={() => setOrderToDelete(null)} className="text-[9px] font-bold text-outline hover:underline px-1">X</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setOrderToDelete(o.id)}
                              className="w-8 h-8 rounded-xl hover:bg-error/5 flex items-center justify-center text-error active:scale-90 border border-outline-variant/10"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable item details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="bg-surface-container-low/30 px-6 py-5 border-t border-b border-outline-variant/10">
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                            <div className="bg-white p-4 rounded-2xl border border-outline-variant/10 shadow-sm">
                              <h4 className="font-bold text-primary flex items-center gap-1.5 mb-2.5">
                                <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span> Shipment Information
                              </h4>
                              <p className="font-bold text-primary">{o.address.fullName}</p>
                              <p className="text-on-surface-variant font-medium">{o.address.street}</p>
                              <p className="text-on-surface-variant font-medium">{o.address.city}, NZ {o.address.postalCode}</p>
                              <p className="text-on-surface-variant font-bold pt-1.5">Phone: {o.address.phone}</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-outline-variant/10 shadow-sm">
                              <h4 className="font-bold text-primary flex items-center gap-1.5 mb-1">
                                <span className="material-symbols-outlined text-secondary text-[16px]">shopping_basket</span> Ordered Goods
                              </h4>
                              <div className="space-y-2 mt-2">
                                {o.items.map((item) => (
                                  <div key={item.product.id} className="flex justify-between items-center text-[11px] font-semibold text-primary">
                                    <span className="truncate">{item.product.name} ({item.quantity}x)</span>
                                    <span className="text-outline">{formatCurrency(item.product.price * item.quantity)}</span>
                                  </div>
                                ))}
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

      {/* Editor Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black z-45"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="fixed inset-x-4 top-10 max-h-[85vh] max-w-4xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl z-50 flex flex-col mx-auto overflow-hidden border border-outline-variant/15"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-outline-variant/10">
                <h3 className="font-display font-bold text-headline-sm text-primary">
                  {editingOrder ? `Edit Order: ${editingOrder.id}` : 'Create Manual Order'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-primary">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer Details */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-primary border-b pb-2">Customer & Shipping Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">Full Name</label>
                        <input required type="text" value={fName} onChange={e => setFName(e.target.value)} className="w-full text-xs p-2 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">Email</label>
                        <input required type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} className="w-full text-xs p-2 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-outline block mb-1">Street Address</label>
                        <input required type="text" value={fStreet} onChange={e => setFStreet(e.target.value)} className="w-full text-xs p-2 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">City</label>
                        <input required type="text" value={fCity} onChange={e => setFCity(e.target.value)} className="w-full text-xs p-2 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">Postal Code</label>
                        <input required type="text" value={fPostal} onChange={e => setFPostal(e.target.value)} className="w-full text-xs p-2 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-outline block mb-1">Phone Number</label>
                        <input required type="text" value={fPhone} onChange={e => setFPhone(e.target.value)} className="w-full text-xs p-2 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold" />
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-primary border-b pb-2 mt-6">Order Status</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">Fulfillment Status</label>
                        <select value={fStatus} onChange={e => setFStatus(e.target.value as OrderStatus)} className="w-full text-xs p-2 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold cursor-pointer">
                          <option value="pending">Pending</option>
                          <option value="packing">Packing</option>
                          <option value="shipping">Shipping</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">Payment Status</label>
                        <select value={fPayment} onChange={e => setFPayment(e.target.value as 'pending'|'paid')} className="w-full text-xs p-2 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold cursor-pointer">
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4 bg-surface-container-low/30 p-4 rounded-2xl border border-outline-variant/10">
                    <h4 className="font-bold text-sm text-primary border-b pb-2">Order Items</h4>
                    
                    <div className="flex gap-2">
                      <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="flex-1 text-xs p-2 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold">
                        <option value="">Select a product to add...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
                      </select>
                      <button type="button" onClick={addItem} className="bg-secondary text-white px-4 rounded-xl text-xs font-bold hover:bg-secondary-fixed-variant">Add</button>
                    </div>

                    <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto">
                      {fItems.length === 0 && <p className="text-xs text-outline text-center py-4">No items added to this order yet.</p>}
                      {fItems.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between bg-white p-2 rounded-xl border border-outline-variant/20 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-container">
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-primary leading-tight">{item.product.name}</p>
                              <p className="text-[10px] font-semibold text-secondary">{formatCurrency(item.product.price)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              min="1" 
                              value={item.quantity} 
                              onChange={e => updateQuantity(item.product.id, parseInt(e.target.value) || 1)} 
                              className="w-12 text-center text-xs p-1 bg-background border border-outline-variant/30 rounded"
                            />
                            <button type="button" onClick={() => removeItem(item.product.id)} className="text-error hover:text-error-container">
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3 mt-4 flex justify-between items-center text-sm">
                      <span className="font-bold text-outline">Total Estimated Price:</span>
                      <span className="font-black text-secondary">{formatCurrency(fItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-outline-variant/10 pt-4 mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="border border-outline-variant/50 text-primary font-bold text-xs py-3 px-6 rounded-2xl">Cancel</button>
                  <button type="submit" className="bg-secondary text-white font-extrabold text-xs py-3 px-8 rounded-2xl hover:bg-primary shadow-md">Save Order</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
