'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import Image from 'next/image';

// Validation Schema for Product Editor
const productSchema = zod.object({
  name: zod.string().min(1, 'Product name is required').min(2, 'Name must be at least 2 characters'),
  category: zod.enum(['produce', 'meat', 'dairy', 'pantry', 'bakery']),
  subcategory: zod.string().min(1, 'Subcategory is required'),
  price: zod.coerce.number().min(0.01, 'Price must be greater than $0'),
  originalPrice: zod.coerce.number().min(0.01).optional(),
  description: zod.string().min(1, 'Description is required'),
  unit: zod.string().min(1, 'Unit size is required (e.g. 1kg Bag)'),
  origin: zod.string().min(1, 'New Zealand origin is required (e.g. Hawkes Bay)'),
  organic: zod.boolean().default(false),
  bestSeller: zod.boolean().default(false),
  seasonal: zod.boolean().default(false),
  stock: zod.coerce.number().min(0, 'Stock cannot be negative'),
  brand: zod.string().min(1, 'Brand is required'),
  imageUrl: zod.string().min(1, 'Image URL is required').url('Must be a valid URL'),
  dietaryVegan: zod.boolean().default(false),
  dietaryGlutenFree: zod.boolean().default(false),
  dietaryKeto: zod.boolean().default(false),
});

type ProductSchemaType = zod.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const { products, loadAllData, saveProduct, deleteProduct, isLoading } = useAdminStore();
  
  // States
  const [searchVal, setSearchVal] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductSchemaType>({
    resolver: zodResolver(productSchema) as any,
  });

  // Open modal for Adding new product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    reset({
      name: '',
      category: 'produce',
      subcategory: 'Vegetables',
      price: 0,
      originalPrice: undefined,
      description: '',
      unit: 'Each',
      origin: 'New Zealand',
      organic: false,
      bestSeller: false,
      seasonal: false,
      stock: 10,
      brand: 'FreshMart',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop',
      dietaryVegan: false,
      dietaryGlutenFree: false,
      dietaryKeto: false,
    });
    setIsModalOpen(true);
  };

  // Open modal for Editing existing product
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    reset({
      name: prod.name,
      category: prod.category,
      subcategory: prod.subcategory,
      price: prod.price,
      originalPrice: prod.originalPrice || undefined,
      description: prod.description,
      unit: prod.unit,
      origin: prod.origin,
      organic: prod.organic,
      bestSeller: prod.bestSeller,
      seasonal: prod.seasonal,
      stock: prod.stock,
      brand: prod.brand,
      imageUrl: prod.images[0] || '',
      dietaryVegan: prod.dietary?.includes('vegan') || false,
      dietaryGlutenFree: prod.dietary?.includes('gluten-free') || false,
      dietaryKeto: prod.dietary?.includes('keto') || false,
    });
    setIsModalOpen(true);
  };

  // Delete product action
  const handleDelete = (id: string) => {
    deleteProduct(id);
    setProductToDelete(null);
  };

  // Form Submit Add / Save Product
  const onSubmit = (data: ProductSchemaType) => {
    // Reconstruct dietary array
    const dietaryArr: ('vegan' | 'gluten-free' | 'keto' | 'organic')[] = [];
    if (data.dietaryVegan) dietaryArr.push('vegan');
    if (data.dietaryGlutenFree) dietaryArr.push('gluten-free');
    if (data.dietaryKeto) dietaryArr.push('keto');
    if (data.organic) dietaryArr.push('organic');

    const finalProduct: Product = {
      id: editingProduct ? editingProduct.id : '', // DB layer will assign a new ID if blank
      name: data.name,
      category: data.category,
      subcategory: data.subcategory,
      price: data.price,
      originalPrice: data.originalPrice || undefined, // Map 0 or NaN/undefined to undefined
      description: data.description,
      unit: data.unit,
      origin: data.origin,
      organic: data.organic,
      bestSeller: data.bestSeller,
      seasonal: data.seasonal,
      stock: data.stock,
      images: [data.imageUrl], // DBCrud supports singular string array easily
      brand: data.brand,
      ratings: editingProduct ? editingProduct.ratings : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      reviews: editingProduct ? editingProduct.reviews : [],
      dietary: dietaryArr,
    };

    saveProduct(finalProduct);
    setIsModalOpen(false);
    reset();
  };

  // Search filter
  const filteredProducts = useMemo(() => {
    if (!searchVal.trim()) return products;
    const q = searchVal.toLowerCase();
    return products.filter(
      p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, searchVal]);

  return (
    <div className="space-y-6">
      
      {/* Control Top bar */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Search Input bar */}
        <div className="relative w-full sm:max-w-md">
          <span className="material-symbols-outlined text-outline absolute left-3.5 top-[11px] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search inventory by title, brand, or category..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full text-xs py-3 pl-11 pr-4 bg-background rounded-2xl border border-outline-variant/40 text-primary font-medium focus:ring-2 focus:ring-secondary/25"
          />
        </div>

        {/* Add Product button */}
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto bg-secondary text-white font-extrabold text-xs py-3 px-6 rounded-2xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Add New Product</span>
        </button>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-outline-variant/10">
        <h3 className="font-display font-bold text-base sm:text-lg text-primary mb-4">Store Inventory</h3>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-outline text-xs">
            No matching inventory products found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/10">
            <table className="w-full text-left text-xs font-semibold text-primary border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low/60 text-outline border-b border-outline-variant/10">
                  <th className="p-4 font-bold">Image</th>
                  <th className="p-4 font-bold">Product Details</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Pricing</th>
                  <th className="p-4 font-bold">Stock</th>
                  <th className="p-4 font-bold">Badges</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredProducts.map((p) => {
                  const discountPercent = p.originalPrice
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0;

                  return (
                    <tr key={p.id} className="hover:bg-surface-container-low/20 transition-colors">
                      {/* Photo */}
                      <td className="p-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/10">
                          <img src={p.images[0]} alt={p.name} className="object-cover w-full h-full" />
                        </div>
                      </td>

                      {/* Details */}
                      <td className="p-4">
                        <div>
                          <p className="font-extrabold text-sm">{p.name}</p>
                          <p className="text-[10px] text-outline font-semibold mt-0.5">
                            {p.brand} • {p.unit} ({p.origin})
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="capitalize bg-surface-container-low text-primary px-3 py-1 rounded-full text-[10px] font-bold border border-outline-variant/10">
                          {p.category}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="p-4">
                        <div>
                          <p className="font-extrabold text-sm text-secondary">{formatCurrency(p.price)}</p>
                          {p.originalPrice && (
                            <p className="text-[10px] text-outline font-semibold line-through">
                              {formatCurrency(p.originalPrice)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Stock levels */}
                      <td className="p-4 font-bold">
                        {p.stock === 0 ? (
                          <span className="text-error bg-error/5 border border-error/15 px-2 py-0.5 rounded-full text-[10px]">Out of Stock</span>
                        ) : p.stock <= 5 ? (
                          <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px]">Low ({p.stock})</span>
                        ) : (
                          <span className="text-secondary bg-secondary-container/10 border border-secondary-container/20 px-2 py-0.5 rounded-full text-[10px]">
                            {p.stock} Available
                          </span>
                        )}
                      </td>

                      {/* Badges indicators */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {p.organic && (
                            <span className="bg-secondary-container text-on-secondary-container text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">Org</span>
                          )}
                          {p.bestSeller && (
                            <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">Best</span>
                          )}
                          {p.seasonal && (
                            <span className="bg-primary-fixed text-on-primary-fixed text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">Seas</span>
                          )}
                          {discountPercent > 0 && (
                            <span className="bg-error text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">Deals</span>
                          )}
                        </div>
                      </td>

                      {/* CRUD Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="w-9 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center text-secondary cursor-pointer active:scale-90 border border-outline-variant/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          
                          {productToDelete === p.id ? (
                            <div className="flex items-center gap-1 bg-error/10 p-1.5 rounded-xl border border-error/20">
                              <button 
                                onClick={() => handleDelete(p.id)}
                                className="text-[9px] font-black text-error hover:underline px-1 cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setProductToDelete(null)}
                                className="text-[9px] text-outline font-bold hover:underline px-1 cursor-pointer"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setProductToDelete(p.id)}
                              className="w-9 h-9 rounded-xl hover:bg-error/5 flex items-center justify-center text-error cursor-pointer active:scale-90 border border-outline-variant/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black z-45"
            />
            {/* Form modal container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="fixed inset-x-4 top-10 max-h-[85vh] max-w-2xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl z-50 flex flex-col mx-auto overflow-hidden border border-outline-variant/15"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-outline-variant/10">
                <h3 className="font-display font-bold text-headline-sm text-primary">
                  {editingProduct ? `Edit Inventory: ${editingProduct.name}` : 'Add New Inventory Item'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-primary cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Scrollable form */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-outline block mb-1">Product Name</label>
                    <input
                      type="text"
                      {...register('name')}
                      className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold"
                    />
                    {errors.name && <p className="text-[10px] text-error font-semibold mt-1">{errors.name.message}</p>}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">Store Category</label>
                    <select
                      {...register('category')}
                      className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold cursor-pointer"
                    >
                      <option value="produce">Produce</option>
                      <option value="meat">Meat & Poultry</option>
                      <option value="dairy">Dairy</option>
                      <option value="pantry">Pantry</option>
                      <option value="bakery">Bakery</option>
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">Subcategory</label>
                    <input
                      type="text"
                      {...register('subcategory')}
                      placeholder="e.g. Fruits, Milk, Spreads"
                      className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">Brand</label>
                    <input
                      type="text"
                      {...register('brand')}
                      className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold"
                    />
                  </div>

                  {/* Origin */}
                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">Origin Region (NZ)</label>
                    <input
                      type="text"
                      {...register('origin')}
                      className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold"
                    />
                  </div>

                  {/* Pricing */}
                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">Price (NZD)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('price')}
                      className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold font-mono"
                    />
                    {errors.price && <p className="text-[10px] text-error font-semibold mt-1">{errors.price.message}</p>}
                  </div>

                  {/* Original Price */}
                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">Original Price (For discount badges)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('originalPrice')}
                      placeholder="Leave blank for no deals"
                      className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold font-mono"
                    />
                  </div>

                  {/* Unit size */}
                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">Unit Weight/Size</label>
                    <input
                      type="text"
                      {...register('unit')}
                      placeholder="e.g. 1kg Bag, 500g Bunch"
                      className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold"
                    />
                  </div>

                  {/* Stock Level */}
                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">Stock Count</label>
                    <input
                      type="number"
                      {...register('stock')}
                      className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold font-mono"
                    />
                    {errors.stock && <p className="text-[10px] text-error font-semibold mt-1">{errors.stock.message}</p>}
                  </div>

                  {/* Image URL */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-outline block mb-1">Photo Image URL</label>
                    <input
                      type="text"
                      {...register('imageUrl')}
                      className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-semibold font-mono"
                    />
                    {errors.imageUrl && <p className="text-[10px] text-error font-semibold mt-1">{errors.imageUrl.message}</p>}
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-outline block mb-1">Description</label>
                    <textarea
                      rows={3}
                      {...register('description')}
                      className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-semibold leading-relaxed"
                    />
                  </div>
                </div>

                {/* Toggles Row */}
                <div className="border-t border-outline-variant/10 pt-4 space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2.5">Promotion Badges</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer bg-surface-container-low/40 p-2.5 rounded-xl border border-outline-variant/10">
                        <input type="checkbox" {...register('organic')} className="w-4.5 h-4.5 text-secondary accent-secondary" />
                        <span className="text-[11px] font-bold text-primary">Organic</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-surface-container-low/40 p-2.5 rounded-xl border border-outline-variant/10">
                        <input type="checkbox" {...register('bestSeller')} className="w-4.5 h-4.5 text-secondary accent-secondary" />
                        <span className="text-[11px] font-bold text-primary">Best Seller</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-surface-container-low/40 p-2.5 rounded-xl border border-outline-variant/10">
                        <input type="checkbox" {...register('seasonal')} className="w-4.5 h-4.5 text-secondary accent-secondary" />
                        <span className="text-[11px] font-bold text-primary">Seasonal</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2.5">Dietary Classifications</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer bg-surface-container-low/40 p-2.5 rounded-xl border border-outline-variant/10">
                        <input type="checkbox" {...register('dietaryVegan')} className="w-4.5 h-4.5 text-secondary accent-secondary" />
                        <span className="text-[11px] font-bold text-primary">Vegan</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-surface-container-low/40 p-2.5 rounded-xl border border-outline-variant/10">
                        <input type="checkbox" {...register('dietaryGlutenFree')} className="w-4.5 h-4.5 text-secondary accent-secondary" />
                        <span className="text-[11px] font-bold text-primary">Gluten Free</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-surface-container-low/40 p-2.5 rounded-xl border border-outline-variant/10">
                        <input type="checkbox" {...register('dietaryKeto')} className="w-4.5 h-4.5 text-secondary accent-secondary" />
                        <span className="text-[11px] font-bold text-primary">Keto Friendly</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="border-t border-outline-variant/10 pt-4 mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="border border-outline-variant/50 text-primary font-bold text-xs py-3 px-6 rounded-2xl active:scale-95 cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-secondary text-white font-extrabold text-xs py-3 px-8 rounded-2xl hover:bg-primary active:scale-95 shadow-md cursor-pointer text-center"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
