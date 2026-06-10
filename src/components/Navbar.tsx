'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import dynamic from 'next/dynamic';
import { useUiStore } from '../store/useUiStore';

const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false });
const WishlistDrawer = dynamic(() => import('./WishlistDrawer'), { ssr: false });

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { getTotals } = useCartStore();
  const wishlistItems = useWishlistStore(state => state.items);
  const { isCartOpen, isWishlistOpen, setCartOpen, setWishlistOpen } = useUiStore();
  
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { itemsCount } = getTotals();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      router.push('/');
    }
  };

  const handleLinkFilter = (filterKey: string) => {
    router.push(`/?filter=${filterKey}`);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-45 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 w-full max-w-container-max mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[32px] text-secondary fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>
              nutrition
            </span>
            <h1 className="font-display text-headline-lg font-bold text-primary tracking-tight">
              FreshMart <span className="text-secondary">NZ</span>
            </h1>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link 
              href="/"
              className="text-primary font-bold border-b-2 border-secondary font-label-md text-label-md py-1"
            >
              Shop
            </Link>
            <button
              onClick={() => handleLinkFilter('organic')}
              className="text-on-surface-variant hover:text-secondary transition-colors duration-200 font-label-md text-label-md cursor-pointer py-1"
            >
              Organic
            </button>
            <button
              onClick={() => handleLinkFilter('deals')}
              className="text-on-surface-variant hover:text-secondary transition-colors duration-200 font-label-md text-label-md cursor-pointer py-1"
            >
              Weekly Deals
            </button>
            <button
              onClick={() => handleLinkFilter('seasonal')}
              className="text-on-surface-variant hover:text-secondary transition-colors duration-200 font-label-md text-label-md cursor-pointer py-1"
            >
              Seasonal Picks
            </button>
          </nav>

          {/* Search, Cart, Wishlist, Profile Controls */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Live Search bar */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 focus-within:ring-2 focus-within:ring-secondary/20 focus-within:border-secondary transition-all">
              <span className="material-symbols-outlined text-outline">search</span>
              <input
                type="text"
                placeholder="Search fresh Products..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-label-md font-label-md w-48 ml-2 text-primary"
              />
            </form>

            {/* Wishlist Button */}
            <button 
              onClick={() => setWishlistOpen(true)}
              className="relative text-on-surface-variant hover:text-primary transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-[28px]">favorite</span>
              {isMounted && wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => setCartOpen(true)}
              className="relative text-on-surface-variant hover:text-primary transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-[28px]">shopping_cart</span>
              {isMounted && itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {itemsCount}
                </span>
              )}
            </button>

            {/* Account Profile Trigger */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="text-on-surface-variant hover:text-primary transition-all active:scale-90 flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[28px]">person</span>
              </button>

              {/* Profile drop-down menu */}
              {isUserMenuOpen && (
                <>
                  <div 
                    onClick={() => setIsUserMenuOpen(false)}
                    className="fixed inset-0 z-10"
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-outline-variant/10 rounded-2xl shadow-xl py-2 z-20 animate-fade-in">
                    {isMounted && isAuthenticated && user ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-outline-variant/10 bg-surface-container-low/40">
                          <p className="text-label-sm text-outline">Logged in as</p>
                          <p className="text-label-md font-bold text-primary truncate mt-0.5">{user.name}</p>
                          <p className="text-[11px] text-outline truncate">{user.email}</p>
                        </div>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-label-md text-primary hover:bg-surface-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px] text-secondary">dashboard</span>
                            <span className="font-bold">Admin Dashboard</span>
                          </Link>
                        )}
                        <Link
                          href="/checkout"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
                          <span>My Checkout</span>
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                            router.push('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-label-md text-error hover:bg-error/5 transition-colors border-t border-outline-variant/10 text-left cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">logout</span>
                          <span>Log Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-outline-variant/10">
                          <p className="text-label-sm text-outline font-semibold">Welcome to FreshMart</p>
                        </div>
                        <Link
                          href="/auth/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-label-md text-primary hover:bg-surface-container transition-colors font-bold"
                        >
                          <span className="material-symbols-outlined text-[20px] text-secondary">login</span>
                          <span>Log In</span>
                        </Link>
                        <Link
                          href="/auth/signup"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">person_add</span>
                          <span>Create Account</span>
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />

      {/* Wishlist Drawer */}
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
}
