'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary py-16 px-margin-mobile md:px-margin-desktop w-full mt-16">
      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="material-symbols-outlined text-[32px] text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
              nutrition
            </span>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              FreshMart <span className="text-secondary-fixed">NZ</span>
            </h2>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Sourcing the finest organic Products directly from New Zealand&apos;s best local farmers. Quality you can taste, sustainability you can trust.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-white font-display font-semibold text-lg mb-5">Shop</h4>
          <ul className="space-y-3">
            <li><Link href="/?category=Products" className="text-white/70 hover:text-secondary-fixed transition-colors text-sm">Fruit &amp; Veg</Link></li>
            <li><Link href="/?category=meat" className="text-white/70 hover:text-secondary-fixed transition-colors text-sm">Meat &amp; Poultry</Link></li>
            <li><Link href="/?category=dairy" className="text-white/70 hover:text-secondary-fixed transition-colors text-sm">Dairy</Link></li>
            <li><Link href="/?category=pantry" className="text-white/70 hover:text-secondary-fixed transition-colors text-sm">Organic Pantry</Link></li>
            <li><Link href="/?category=bakery" className="text-white/70 hover:text-secondary-fixed transition-colors text-sm">Bakery &amp; Drinks</Link></li>
          </ul>
        </div>

        {/* About */}
        <div>
          <h4 className="text-white font-display font-semibold text-lg mb-5">About</h4>
          <ul className="space-y-3">
            <li><Link href="/" className="text-white/70 hover:text-secondary-fixed transition-colors text-sm">Our Story</Link></li>
            <li><Link href="/" className="text-white/70 hover:text-secondary-fixed transition-colors text-sm">Local Farmers</Link></li>
            <li><Link href="/" className="text-white/70 hover:text-secondary-fixed transition-colors text-sm">Sustainability Report</Link></li>
            <li><Link href="/" className="text-white/70 hover:text-secondary-fixed transition-colors text-sm">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="text-white font-display font-semibold text-lg mb-5">Connect</h4>
          <div className="flex gap-3 mb-5">
            <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-secondary transition-colors">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-secondary transition-colors">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </a>
          </div>
          <p className="text-white/60 text-[12px]">© 2026 FreshMart NZ. Sustainably Sourced.</p>
          <p className="text-white/40 text-[11px] mt-1">All prices include GST. Free delivery on orders over $75 NZD.</p>
        </div>
      </div>
    </footer>
  );
}
