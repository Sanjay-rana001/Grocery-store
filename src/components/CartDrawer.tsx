'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency } from '../lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, coupon, couponError, updateQuantity, removeItem, applyCouponCode, removeCouponCode, getTotals } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  
  const { subtotal, tax, shippingFee, discount, total, itemsCount } = getTotals();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    applyCouponCode(couponCode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Cart sliding panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col border-l border-outline-variant/10 rounded-l-[32px] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/40">
              <div>
                <h3 className="font-display text-headline-md text-primary">Your Cart</h3>
                <p className="text-label-sm text-outline mt-0.5">{itemsCount} {itemsCount === 1 ? 'item' : 'items'} selected</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
                  <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[48px]">shopping_basket</span>
                  </div>
                  <div>
                    <h4 className="font-display text-headline-md text-primary">Your basket is empty</h4>
                    <p className="text-body-md text-outline mt-2 max-w-xs mx-auto">
                      Fill it with fresh, organic produce sourced directly from local New Zealand farmers.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="bg-primary text-white font-label-md text-label-md px-6 py-3 rounded-xl hover:bg-secondary transition-colors shadow-md active:scale-95 duration-150"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 p-4 bg-surface-container-low/30 hover:bg-surface-container-low/60 rounded-2xl border border-outline-variant/10 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 bg-surface-container-low rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/10">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    {/* Product details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-display font-semibold text-primary leading-snug">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-on-surface-variant/60 hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                        <p className="text-label-sm text-outline mt-0.5">{item.product.unit} • {item.product.brand}</p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {/* Qty selectors */}
                        <div className="flex items-center bg-white border border-outline-variant/20 rounded-xl px-1 py-0.5 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg active:scale-90 transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <span className="w-8 text-center text-label-md font-bold text-primary">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg active:scale-90 transition-all disabled:opacity-35"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-display text-headline-sm text-primary font-bold">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary (if items in cart) */}
            {items.length > 0 && (
              <div className="border-t border-outline-variant/10 p-6 space-y-4 bg-surface-container-low/40">
                {/* Coupon Form */}
                {coupon ? (
                  <div className="flex justify-between items-center bg-secondary-container/40 px-4 py-2.5 rounded-xl border border-secondary/20">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-on-secondary-container">local_offer</span>
                      <span className="text-label-md font-bold text-on-secondary-container">
                        COUPON APPLIED: {coupon.code}
                      </span>
                    </div>
                    <button
                      onClick={removeCouponCode}
                      className="text-on-secondary-container/70 hover:text-error font-semibold text-label-sm underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. KIWI10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow bg-white border border-outline-variant/30 px-4 py-2.5 rounded-xl text-label-md focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    />
                    <button
                      type="submit"
                      className="bg-primary text-white font-label-md text-label-md px-5 py-2.5 rounded-xl hover:bg-secondary active:scale-95 transition-all shadow-sm flex-shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-label-sm text-error font-medium px-1">
                    {couponError}
                  </p>
                )}

                {/* Subtotal table */}
                <div className="space-y-2 border-b border-outline-variant/10 pb-4">
                  <div className="flex justify-between text-body-md text-on-surface-variant">
                    <span>Subtotal</span>
                    <span className="font-semibold text-primary">{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-body-md text-secondary">
                      <span>Discount</span>
                      <span className="font-semibold">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-body-md text-on-surface-variant">
                    <span>GST (15% included)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-body-md text-on-surface-variant">
                    <span>Shipping Fee</span>
                    <span>{shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}</span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-[11px] text-outline text-right mt-0.5">
                      Add {formatCurrency(75 - subtotal)} more for FREE shipping
                    </p>
                  )}
                </div>

                {/* Grand total */}
                <div className="flex justify-between items-center py-1">
                  <span className="font-display text-headline-md text-primary font-bold">Total (NZD)</span>
                  <span className="font-display text-headline-lg text-primary font-bold">
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Checkout Link */}
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full bg-primary text-white font-label-md text-label-md py-4 rounded-2xl hover:bg-secondary active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 group mt-2"
                >
                  <span>Proceed to Checkout</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
