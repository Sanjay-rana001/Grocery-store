'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getOrderById } from '@/lib/db';
import { Order } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      const loadOrder = async () => {
        try {
          const found = await getOrderById(orderId);
          if (found) setOrder(found);
        } catch (error) {
          console.error('Error loading order:', error);
        }
      };
      loadOrder();
    }
  }, [orderId]);

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-32 min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-[64px] text-outline">receipt_long</span>
            <h2 className="font-display text-2xl font-bold text-primary">Order Not Found</h2>
            <p className="text-outline">We couldn&apos;t find that order. Please check your order history.</p>
            <Link href="/" className="inline-block bg-primary text-white px-6 py-3 rounded-xl hover:bg-secondary transition-colors">
              Return to Shop
            </Link>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </>
    );
  }

  const statusSteps = ['pending', 'packed', 'shipped', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[48px] text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-outline text-lg">
            Thank you for shopping with FreshMart NZ 🥝
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10"
          >
            <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-primary">Order #{order.id}</h2>
                <p className="text-sm text-outline mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 bg-secondary-container/40 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-[16px] text-on-secondary-container">local_shipping</span>
                <span className="text-sm font-bold text-on-secondary-container">
                  Tracking: {order.trackingNumber}
                </span>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="mb-8">
              <h3 className="font-display font-semibold text-primary mb-4">Delivery Progress</h3>
              <div className="flex items-center justify-between relative">
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-surface-container-high rounded-full" />
                <div
                  className="absolute top-5 left-0 h-1 bg-secondary rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                />
                {statusSteps.map((step, idx) => (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      idx <= currentStep
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-white text-outline border-outline-variant'
                    }`}>
                      {idx <= currentStep ? (
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className={`text-[11px] font-semibold capitalize ${
                      idx <= currentStep ? 'text-secondary' : 'text-outline'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <h3 className="font-display font-semibold text-primary mb-4">Items Ordered</h3>
            <div className="space-y-3 mb-6">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-surface-container-low/30 rounded-xl">
                  <div>
                    <span className="font-semibold text-primary">{item.product.name}</span>
                    <span className="text-sm text-outline ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-display font-bold text-primary">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-outline-variant/10">
              <div>
                <h4 className="text-sm font-bold text-primary mb-2">Delivery Address</h4>
                <p className="text-sm text-outline leading-relaxed">
                  {order.address.fullName}<br />
                  {order.address.street}<br />
                  {order.address.city}, {order.address.postalCode}<br />
                  {order.address.phone}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary mb-2">Delivery Slot</h4>
                <p className="text-sm text-outline">
                  {order.deliverySlot.date}<br />
                  {order.deliverySlot.time}
                </p>
                <h4 className="text-sm font-bold text-primary mt-4 mb-2">Payment</h4>
                <p className="text-sm text-outline capitalize">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                  {' '}<span className={`inline-block ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    order.paymentStatus === 'paid' ? 'bg-secondary-container text-on-secondary-container' : 'bg-amber-100 text-amber-800'
                  }`}>{order.paymentStatus}</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Invoice Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 h-fit"
          >
            <h3 className="font-display text-lg font-bold text-primary mb-6">Tax Invoice</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-semibold text-primary">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-secondary">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span className="font-semibold">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant">
                <span>GST (15% incl.)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="border-t border-outline-variant/10 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-display text-lg font-bold text-primary">Total (NZD)</span>
                  <span className="font-display text-xl font-bold text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/"
                className="block w-full bg-primary text-white text-center py-3.5 rounded-xl font-semibold hover:bg-secondary transition-colors"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => window.print()}
                className="block w-full bg-surface-container-low text-primary text-center py-3.5 rounded-xl font-semibold hover:bg-surface-container transition-colors"
              >
                Print Invoice
              </button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
