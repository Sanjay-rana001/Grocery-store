'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/db';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const filterParam = searchParams.get('filter') || '';

  // Local state for interactive filters
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Filter States
  const [organicOnly, setOrganicOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50);
  const [dietary, setDietary] = useState<Record<string, boolean>>({
    vegan: false,
    'gluten-free': false,
    keto: false,
  });
  const [brands, setBrands] = useState<Record<string, boolean>>({
    'Meadow Fresh': false,
    "Pic's": false,
    'Lewis Road': false,
    'Ceres Organics': false,
    'Anchor': false,
  });
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // On mount and category/search update
  useEffect(() => {
    // Load fresh data (including potential admin updates)
    setProducts(getProducts());
  }, [categoryParam, searchParam, filterParam]);

  // Sync organicOnly and deals filters from URL parameter triggers
  useEffect(() => {
    if (filterParam === 'organic') {
      setOrganicOnly(true);
    } else if (filterParam === 'deals') {
      // Keep organicOnly false but we will filter by deals
    } else if (filterParam === 'seasonal') {
      // handled in custom filter
    }
  }, [filterParam]);

  // Unique list of categories
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'produce', label: 'Produce' },
    { id: 'meat', label: 'Meat & Poultry' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'pantry', label: 'Pantry' },
    { id: 'bakery', label: 'Bakery' },
  ];

  // Unique list of brands from current products
  const availableBrands = useMemo(() => {
    const allBrands = products.map(p => p.brand).filter(Boolean);
    return Array.from(new Set(allBrands));
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Search Query Filter
    if (searchParam) {
      const q = searchParam.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // 2. Category Tab Filter
    if (categoryParam !== 'all') {
      result = result.filter(p => p.category === categoryParam);
    }

    // 3. Special URL Filters (filter=organic, filter=deals, filter=seasonal)
    if (filterParam === 'organic') {
      result = result.filter(p => p.organic);
    } else if (filterParam === 'deals') {
      result = result.filter(p => p.originalPrice && p.originalPrice > p.price);
    } else if (filterParam === 'seasonal') {
      result = result.filter(p => p.seasonal);
    }

    // 4. Sidebar Organic Only Filter
    if (organicOnly) {
      result = result.filter(p => p.organic);
    }

    // 5. Price Range Filter
    result = result.filter(p => p.price <= maxPrice);

    // 6. Dietary Filter
    const activeDietary = Object.keys(dietary).filter(k => dietary[k]);
    if (activeDietary.length > 0) {
      result = result.filter(p => 
        activeDietary.every(d => p.dietary?.includes(d as any))
      );
    }

    // 7. Brand Filter
    const activeBrands = Object.keys(brands).filter(b => brands[b]);
    if (activeBrands.length > 0) {
      result = result.filter(p => activeBrands.includes(p.brand));
    }

    // 8. Rating Filter
    if (minRating !== null) {
      result = result.filter(p => p.ratings >= minRating);
    }

    // 9. Sort Logic
    if (sortBy === 'popularity') {
      result.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.ratings - a.ratings);
    }

    return result;
  }, [products, searchParam, categoryParam, filterParam, organicOnly, maxPrice, dietary, brands, minRating, sortBy]);

  // Pagination slice
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  // Clear all filters
  const handleClearAll = () => {
    setOrganicOnly(false);
    setMaxPrice(50);
    setDietary({ vegan: false, 'gluten-free': false, keto: false });
    setBrands({ 'Meadow Fresh': false, "Pic's": false, 'Lewis Road': false, 'Ceres Organics': false, 'Anchor': false });
    setMinRating(null);
    setSortBy('popularity');
    setCurrentPage(1);
    router.push('/');
  };

  const handleDietaryToggle = (key: string) => {
    setDietary(prev => ({ ...prev, [key]: !prev[key] }));
    setCurrentPage(1);
  };

  const handleBrandToggle = (brandName: string) => {
    setBrands(prev => ({ ...prev, [brandName]: !prev[brandName] }));
    setCurrentPage(1);
  };

  const handleCategoryChange = (catId: string) => {
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', catId);
    router.push(`/?${params.toString()}`);
  };

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 md:pb-12 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop bg-background text-on-background min-h-screen">
        
        {/* Category Pills at top */}
        <div className="flex gap-3 overflow-x-auto py-4 mb-6 scrollbar-hide">
          {categories.map(cat => {
            const isActive = categoryParam === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap active:scale-95 cursor-pointer shadow-sm ${
                  isActive
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-white text-on-surface-variant hover:bg-surface-container-low border border-outline-variant/15'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/15">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-headline-md font-bold text-primary">Filters</h2>
                <button
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              {/* Organic Toggle */}
              <div className="flex items-center justify-between py-4 border-b border-outline-variant/10">
                <span className="font-medium text-sm text-primary">Organic Only</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={organicOnly}
                    onChange={(e) => {
                      setOrganicOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                </label>
              </div>

              {/* Price Range Slider */}
              <div className="py-6 border-b border-outline-variant/10">
                <h3 className="font-semibold text-sm text-primary mb-3">Price Range (Max: {formatCurrency(maxPrice)})</h3>
                <div className="px-1">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full h-1.5 bg-outline-variant/40 rounded-lg appearance-none cursor-pointer accent-secondary"
                  />
                  <div className="flex justify-between mt-2 text-xs text-outline font-medium">
                    <span>$0</span>
                    <span>$50+</span>
                  </div>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div className="py-6 border-b border-outline-variant/10">
                <h3 className="font-semibold text-sm text-primary mb-3">Dietary</h3>
                <div className="space-y-3">
                  {['vegan', 'gluten-free', 'keto'].map((key) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={dietary[key]}
                        onChange={() => handleDietaryToggle(key)}
                        className="w-5 h-5 rounded border-outline-variant/60 text-secondary focus:ring-secondary/20 accent-secondary"
                      />
                      <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors capitalize">
                        {key.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="py-6 border-b border-outline-variant/10">
                <h3 className="font-semibold text-sm text-primary mb-3">Brand</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                  {availableBrands.map((brandName) => (
                    <label key={brandName} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={brands[brandName] || false}
                        onChange={() => handleBrandToggle(brandName)}
                        className="w-5 h-5 rounded border-outline-variant/60 text-secondary focus:ring-secondary/20 accent-secondary"
                      />
                      <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">
                        {brandName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Star Rating Filter */}
              <div className="py-6">
                <h3 className="font-semibold text-sm text-primary mb-3">Customer Rating</h3>
                <div className="space-y-2">
                  {[4, 3].map((ratingVal) => (
                    <button
                      key={ratingVal}
                      onClick={() => {
                        setMinRating(minRating === ratingVal ? null : ratingVal);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2.5 w-full hover:bg-surface-container-low p-2 rounded-xl transition-colors group cursor-pointer border text-left ${
                        minRating === ratingVal
                          ? 'border-secondary bg-secondary-container/10'
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="material-symbols-outlined text-[18px]"
                            style={{
                              fontVariationSettings:
                                star <= ratingVal ? "'FILL' 1" : "'FILL' 0",
                            }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-on-surface-variant group-hover:text-primary">
                        {ratingVal} & Up
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <section className="flex-grow">
            
            {/* Sorting & Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-[24px] shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10">
              <div>
                <span className="text-headline-md font-display font-bold text-primary capitalize">
                  {categoryParam === 'all'
                    ? searchParam
                      ? `Search: "${searchParam}"`
                      : filterParam
                      ? `${filterParam} organic goods`
                      : 'Fresh Produce & Groceries'
                    : `${categoryParam} selection`}
                </span>
                <p className="text-xs font-semibold text-outline mt-0.5">
                  Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
                  {filteredProducts.length} results
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-surface-container px-4 py-2 rounded-xl text-primary font-semibold text-sm active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  <span>Filters</span>
                </button>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-on-surface-variant">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-surface-container-low border-none rounded-xl text-xs font-semibold px-3.5 py-2.5 text-primary focus:ring-2 focus:ring-secondary/20 cursor-pointer"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-[32px] py-16 px-6 text-center shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10">
                <span className="material-symbols-outlined text-[64px] text-outline/35 mb-4">
                  sentiment_dissatisfied
                </span>
                <h3 className="font-display font-bold text-headline-md text-primary">No products found</h3>
                <p className="text-on-surface-variant text-sm max-w-sm mx-auto mt-2">
                  We couldn't find any matches. Try adjusting your filters, searching for something else, or clearing filters.
                </p>
                <button
                  onClick={handleClearAll}
                  className="mt-6 bg-secondary text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-primary active:scale-95 shadow-md transition-all cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2 mt-12">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  const isActive = currentPage === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        isActive
                          ? 'bg-secondary text-white shadow-md'
                          : 'bg-white border border-outline-variant/25 text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </nav>
            )}
          </section>
        </div>
      </main>

      <MobileNav />
      <Footer />

      {/* Mobile Drawer Filter Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />
            {/* Content Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl p-6 z-55 flex flex-col lg:hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-headline-md font-bold text-primary">Filters</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-outline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-hide pb-8">
                {/* Organic Toggle */}
                <div className="flex items-center justify-between py-4 border-b border-outline-variant/10">
                  <span className="font-medium text-sm text-primary">Organic Only</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={organicOnly}
                      onChange={(e) => {
                        setOrganicOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>

                {/* Price Slider */}
                <div className="py-4 border-b border-outline-variant/10">
                  <h3 className="font-semibold text-sm text-primary mb-3">Price Range (Max: {formatCurrency(maxPrice)})</h3>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full h-1.5 bg-outline-variant/40 rounded-lg appearance-none cursor-pointer accent-secondary"
                  />
                  <div className="flex justify-between mt-2 text-xs text-outline font-medium">
                    <span>$0</span>
                    <span>$50+</span>
                  </div>
                </div>

                {/* Dietary */}
                <div className="py-4 border-b border-outline-variant/10">
                  <h3 className="font-semibold text-sm text-primary mb-3">Dietary</h3>
                  <div className="space-y-3">
                    {['vegan', 'gluten-free', 'keto'].map((key) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={dietary[key]}
                          onChange={() => handleDietaryToggle(key)}
                          className="w-5 h-5 rounded border-outline-variant/60 text-secondary"
                        />
                        <span className="text-sm font-medium text-on-surface-variant capitalize">
                          {key.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="py-4 border-b border-outline-variant/10">
                  <h3 className="font-semibold text-sm text-primary mb-3">Brand</h3>
                  <div className="space-y-3">
                    {availableBrands.map((brandName) => (
                      <label key={brandName} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={brands[brandName] || false}
                          onChange={() => handleBrandToggle(brandName)}
                          className="w-5 h-5 rounded border-outline-variant/60 text-secondary"
                        />
                        <span className="text-sm font-medium text-on-surface-variant">
                          {brandName}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="py-4">
                  <h3 className="font-semibold text-sm text-primary mb-3">Customer Rating</h3>
                  <div className="space-y-2">
                    {[4, 3].map((ratingVal) => (
                      <button
                        key={ratingVal}
                        onClick={() => {
                          setMinRating(minRating === ratingVal ? null : ratingVal);
                          setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 w-full hover:bg-surface-container-low p-2 rounded-xl transition-colors group cursor-pointer border ${
                          minRating === ratingVal
                            ? 'border-secondary bg-secondary-container/10'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="material-symbols-outlined text-[16px]"
                              style={{
                                fontVariationSettings:
                                  star <= ratingVal ? "'FILL' 1" : "'FILL' 0",
                              }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-on-surface-variant">
                          {ratingVal} & Up
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Action buttons */}
              <div className="pt-4 border-t border-outline-variant/10 flex gap-4">
                <button
                  onClick={() => {
                    handleClearAll();
                    setIsMobileSidebarOpen(false);
                  }}
                  className="flex-1 border border-outline-variant text-primary font-semibold text-sm py-3 rounded-full active:scale-95 cursor-pointer text-center"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex-1 bg-secondary text-white font-semibold text-sm py-3 rounded-full active:scale-95 cursor-pointer shadow-md text-center"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[48px] animate-spin text-secondary">
            progress_activity
          </span>
          <p className="font-semibold text-sm">Harvesting fresh groceries...</p>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
