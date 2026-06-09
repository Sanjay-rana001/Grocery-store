'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addItem(product, 1);
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
      className="product-card-hover group relative bg-white rounded-[24px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden border border-outline-variant/10"
    >
      {/* Image area */}
      <div className="relative h-56 sm:h-64 bg-surface-container-low overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          priority={true}
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
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.organic && (
            <span className="bg-secondary-container text-on-secondary-container text-[11px] font-bold px-2.5 py-1 rounded-full">
              Organic
            </span>
          )}
          {product.bestSeller && (
            <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold px-2.5 py-1 rounded-full">
              Best Seller
            </span>
          )}
          {product.seasonal && (
            <span className="bg-primary-fixed text-on-primary-fixed text-[11px] font-bold px-2.5 py-1 rounded-full">
              Seasonal
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-error text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Out of Stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-on-surface text-white px-4 py-2 rounded-full text-sm font-bold">
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
      <div className="p-5">
        <div className="flex justify-between items-start mb-1.5">
          <a href={`/product/${product.id}`} className="hover:text-secondary transition-colors">
            <h3 className="font-display font-semibold text-lg text-primary leading-tight">
              {product.name}
            </h3>
          </a>
          <button
            onClick={handleWishlist}
            className={`transition-colors flex-shrink-0 active:scale-90 ${wishlisted ? 'text-error' : 'text-on-surface-variant/50 hover:text-error'}`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={wishlisted ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>
        </div>

        <p className="text-[12px] text-outline mb-1">{product.unit} • {product.origin}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: star <= Math.round(product.ratings) ? "'FILL' 1" : "'FILL' 0" }}
              >
                star
              </span>
            ))}
          </div>
          <span className="text-[11px] text-outline">({product.reviewsCount})</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-outline line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-primary text-white p-2.5 rounded-xl hover:bg-secondary transition-all active:scale-90 flex items-center gap-1.5 disabled:opacity-30 disabled:hover:bg-primary shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            <span className="font-semibold text-[13px] hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
