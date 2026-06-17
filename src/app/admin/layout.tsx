'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Protected Route Guard check
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (!mounted || isLoading || !isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary text-white">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[48px] animate-spin text-secondary-fixed">
            progress_activity
          </span>
          <p className="font-semibold text-sm">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Products', path: '/admin/products', icon: 'inventory' },
    { name: 'Orders', path: '/admin/orders', icon: 'shopping_cart' },
    { name: 'Coupons', path: '/admin/coupons', icon: 'percent' },
    { name: 'Users', path: '/admin/users', icon: 'group' },
  ];

  return (
    <div className="min-h-screen bg-background text-primary flex">
      
      {/* Sidebar Navigation Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Mobile backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Sidebar content drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-64 bg-primary text-white z-50 shadow-2xl flex flex-col justify-between border-r border-outline-variant/10 lg:sticky lg:h-screen"
            >
              <div>
                {/* Header branding */}
                <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-1.5 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-[28px] text-secondary-fixed">nutrition</span>
                    <span className="font-display font-extrabold text-lg text-white tracking-tight">
                      FreshMart <span className="text-secondary-fixed">Admin</span>
                    </span>
                  </Link>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden text-white/70 hover:text-white cursor-pointer w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="p-4 space-y-1 mt-4">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-secondary text-white shadow-lg ring-1 ring-white/10'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar bottom */}
              <div className="p-4 border-t border-white/10">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  <span>Exit Storefront</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Admin Contents */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Admin Header */}
        <header className="h-16 bg-white border-b border-outline-variant/10 shadow-sm px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 rounded-xl hover:bg-surface-container flex items-center justify-center text-primary cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <h2 className="font-display font-bold text-base sm:text-lg text-primary tracking-tight hidden sm:block">
              FreshMart Control Console
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-extrabold text-primary">{user.name}</p>
              <p className="text-[10px] font-semibold text-secondary-fixed-dim uppercase tracking-wider">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase border border-outline-variant/15">
              {user.name.slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Content body slot */}
        <div className="flex-1 p-6 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
