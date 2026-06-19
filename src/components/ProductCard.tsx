'use client';

import { createPortal } from 'react-dom';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/types';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
}

export default function ProductCard({ product, onQuickView, priority = false }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);
  const [flyingItems, setFlyingItems] = useState<{ id: number, startX: number, startY: number, endX: number, endY: number, url: string }[]>([]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addItem(product, 1);
      
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const id = Date.now();
      
      const cartIcon = document.getElementById('navbar-cart-button');
      const cartRect = cartIcon?.getBoundingClientRect();
      
      setFlyingItems(prev => [...prev, {
        id,
        startX: rect.left + rect.width / 2 - 20,
        startY: rect.top + rect.height / 2 - 20,
        endX: cartRect ? cartRect.left + cartRect.width / 2 - 10 : window.innerWidth - 50,
        endY: cartRect ? cartRect.top + cartRect.height / 2 - 10 : 20,
        url: product.images[0]
      }]);

      setTimeout(() => {
        setFlyingItems(prev => prev.filter(item => item.id !== id));
      }, 800);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="product-card-hover group relative bg-white rounded-xl lg:rounded-[24px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden border border-outline-variant/10 flex flex-col"
    >
      {/* Image area */}
      <div className="relative w-full aspect-square bg-surface-container-low overflow-hidden shrink-0">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Quick View overlay */}
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <a
            href={`/product/${product.id}`}
            className="bg-white text-primary font-semibold text-sm px-6 py-2.5 rounded-full shadow-lg hover:bg-secondary hover:text-white transition-colors"
          >
            Quick View
          </a>
        </div>

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 lg:top-3 lg:left-3 flex flex-col gap-1 lg:gap-1.5">
          {product.organic && (
            <span className="bg-secondary-container text-on-secondary-container text-[8px] lg:text-[11px] font-bold px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded-full">
              Organic
            </span>
          )}
          {product.bestSeller && (
            <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[8px] lg:text-[11px] font-bold px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded-full">
              Best Seller
            </span>
          )}
          {product.seasonal && (
            <span className="bg-primary-fixed text-on-primary-fixed text-[8px] lg:text-[11px] font-bold px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded-full">
              Seasonal
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-error text-white text-[8px] lg:text-[11px] font-bold px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded-full">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Out of Stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-on-surface text-white px-2 py-1 lg:px-4 lg:py-2 rounded-full text-[10px] lg:text-sm font-bold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute bottom-3 left-3 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Content area */}
      <div className="p-2 lg:p-3.5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-0.5 lg:mb-1">
          <a href={`/product/${product.id}`} className="hover:text-secondary transition-colors line-clamp-2 pr-1">
            <h3 className="font-display font-semibold text-[11px] lg:text-[13px] text-primary leading-tight">
              {product.name}
            </h3>
          </a>
          <button
            onClick={handleWishlist}
            className={`transition-colors flex-shrink-0 active:scale-90 ${wishlisted ? 'text-pink-600' : 'text-on-surface-variant/50 hover:text-pink-600'}`}
          >
            <motion.span
              animate={wishlisted ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="material-symbols-outlined text-[14px] lg:text-[18px] inline-block"
              style={wishlisted ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </motion.span>
          </button>
        </div>

        <p className="text-[8px] lg:text-[10px] text-outline mb-1 line-clamp-1">{product.unit} • {product.origin}</p>

        {/* Rating */}
        <div className="flex items-center gap-0 mb-1.5 lg:mb-2 mt-auto">
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className="material-symbols-outlined text-[9px] lg:text-[11px] scale-75 lg:scale-[0.60] origin-left -mx-[1.5px] lg:-mx-[3px]"
                style={{ fontVariationSettings: star <= Math.round(product.ratings) ? "'FILL' 1" : "'FILL' 0" }}
              >
                star
              </span>
            ))}
          </div>
          <span className="text-[7px] lg:text-[9px] font-medium text-outline ml-1 lg:ml-0.5">({product.reviewsCount})</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1 lg:pt-0">
          <div className="flex items-baseline gap-1 lg:gap-1.5 flex-wrap">
            <span className="font-display text-sm lg:text-[15px] font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[8px] lg:text-[10px] text-outline line-through hidden sm:inline-block">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-primary text-white p-1.5 lg:p-1.5 lg:px-2 rounded-lg lg:rounded-[10px] hover:bg-secondary transition-all active:scale-90 flex items-center gap-1 disabled:opacity-30 disabled:hover:bg-primary shadow-sm"
          >
            <span className="material-symbols-outlined text-[12px] lg:text-[14px]">add_shopping_cart</span>
            <span className="font-semibold text-[10px] lg:text-[11px] hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
      
      {/* Flying Animation Images */}
      {typeof document !== 'undefined' && createPortal(
        flyingItems.map(item => (
          <motion.img
            key={item.id}
            src={item.url}
            alt=""
            className="fixed top-0 left-0 z-[99999] object-cover rounded-full shadow-2xl pointer-events-none border-2 border-secondary"
            initial={{ 
              x: item.startX, 
              y: item.startY, 
              width: 50, 
              height: 50, 
              opacity: 1, 
              scale: 1 
            }}
            animate={{ 
              x: item.endX, 
              y: item.endY, 
              width: 24, 
              height: 24, 
              opacity: 0.1, 
              scale: 0.5 
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.25, 0.1, 0.25, 1.0]
            }}
          />
        )),
        document.body
      )}

      {/* Added to Cart Pop Text */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {flyingItems.map(item => (
            <motion.div
              key={`text-${item.id}`}
              initial={{ opacity: 0, y: item.startY - 10, x: item.startX - 20, scale: 0.5 }}
              animate={{ opacity: 1, y: item.startY - 50, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="fixed top-0 left-0 z-[99999] bg-secondary text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md pointer-events-none whitespace-nowrap flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              Added
            </motion.div>
          ))}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
