'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency } from '../lib/utils';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
    removeItem(product.id);
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

          {/* Wishlist sliding panel */}
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
                <h3 className="font-display text-headline-md text-primary">Your Wishlist</h3>
                <p className="text-label-sm text-outline mt-0.5">{items.length} {items.length === 1 ? 'item' : 'items'} saved</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Wishlist Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
                  <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[48px]">favorite</span>
                  </div>
                  <div>
                    <h4 className="font-display text-headline-md text-primary">Your wishlist is empty</h4>
                    <p className="text-body-md text-outline mt-2 max-w-xs mx-auto">
                      Save your favorite organic cuts, pantry items, and fresh Products to purchase later.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="bg-primary text-white font-label-md text-label-md px-6 py-3 rounded-xl hover:bg-secondary transition-colors shadow-md active:scale-95 duration-150"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                items.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 p-4 bg-surface-container-low/30 hover:bg-surface-container-low/60 rounded-2xl border border-outline-variant/10 transition-all"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 bg-surface-container-low rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/10">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
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
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="text-on-surface-variant/60 hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                        <p className="text-label-sm text-outline mt-0.5">{product.unit} • {product.brand}</p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {/* Price */}
                        <span className="font-display text-headline-sm text-primary font-bold">
                          {formatCurrency(product.price)}
                        </span>

                        {/* Quick Add */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="bg-primary text-white text-label-sm px-3.5 py-2 rounded-xl hover:bg-secondary disabled:opacity-35 disabled:hover:bg-primary transition-all active:scale-90 flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                          <span>Move to Cart</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
