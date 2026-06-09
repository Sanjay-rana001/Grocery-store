'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUiStore } from '../store/useUiStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { setCartOpen } = useUiStore();
  const { getTotals } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const { itemsCount } = getTotals();

  const handleProfileClick = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/checkout');
      }
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-3 px-margin-mobile bg-white shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] border-t border-outline-variant/10 z-40 rounded-t-[20px]">
      {/* Home */}
      <button 
        onClick={() => router.push('/')}
        className={`flex flex-col items-center justify-center active:scale-95 transition-all duration-150 cursor-pointer ${pathname === '/' ? 'text-secondary font-bold' : 'text-on-surface-variant/80'}`}
      >
        <span className="material-symbols-outlined">home</span>
        <span className="text-[10px] mt-0.5 font-sans">Home</span>
      </button>

      {/* Search / Browse */}
      <button 
        onClick={() => router.push('/')}
        className={`flex flex-col items-center justify-center active:scale-95 transition-all duration-150 cursor-pointer ${pathname === '/browse' ? 'text-secondary font-bold' : 'text-on-surface-variant/80'}`}
      >
        <span className="material-symbols-outlined">search</span>
        <span className="text-[10px] mt-0.5 font-sans">Browse</span>
      </button>

      {/* Cart Drawer Toggle */}
      <button 
        onClick={() => setCartOpen(true)}
        className="relative flex flex-col items-center justify-center text-on-surface-variant/80 active:scale-95 transition-all duration-150 cursor-pointer"
      >
        <span className="material-symbols-outlined">shopping_basket</span>
        <span className="text-[10px] mt-0.5 font-sans">Cart</span>
        {itemsCount > 0 && (
          <span className="absolute -top-1 right-2 bg-secondary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {itemsCount}
          </span>
        )}
      </button>

      {/* Profile */}
      <button 
        onClick={handleProfileClick}
        className={`flex flex-col items-center justify-center active:scale-95 transition-all duration-150 cursor-pointer ${pathname.startsWith('/auth') || pathname.startsWith('/admin') ? 'text-secondary font-bold' : 'text-on-surface-variant/80'}`}
      >
        <span className="material-symbols-outlined font-normal">person</span>
        <span className="text-[10px] mt-0.5 font-sans">
          {isAuthenticated && user ? user.name.split(' ')[0] : 'Profile'}
        </span>
      </button>
    </nav>
  );
}
