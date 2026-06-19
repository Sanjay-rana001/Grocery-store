'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Category } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';

// Validation Schema for Category Editor
const categorySchema = zod.object({
  name: zod.string().min(1, 'Category name is required').min(2, 'Name must be at least 2 characters'),
  slug: zod.string().min(1, 'Slug is required'),
  description: zod.string().min(1, 'Description is required'),
  icon: zod.string().min(1, 'Icon name is required (e.g., kitchen, set_meal)'),
  order: zod.number().min(0, 'Order must be 0 or greater'),
  isActive: zod.boolean(),
});

type CategorySchemaType = zod.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const { categories, loadAllData, saveCategory, deleteCategory, isLoading } = useAdminStore();
  
  const [searchVal, setSearchVal] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategorySchemaType>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: 'category',
      order: 0,
      isActive: true,
    },
  });

  const watchName = watch('name');

  // Auto-generate slug from name if creating new
  useEffect(() => {
    if (!editingCategory && watchName) {
      setValue('slug', watchName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [watchName, editingCategory, setValue]);

  const filteredCategories = useMemo(() => {
    if (!searchVal.trim()) return categories;
    const q = searchVal.toLowerCase();
    return categories.filter(
      c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchVal]);

  const openCreateModal = () => {
    setEditingCategory(null);
    reset({
      name: '',
      slug: '',
      description: '',
      icon: 'category',
      order: categories.length,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    // Check for duplicate slugs
    const isDuplicate = categories.some(c => c.slug === data.slug && c.id !== (editingCategory?.id || ''));
    if (isDuplicate) {
      alert('A category with this slug already exists! Slugs must be unique.');
      return;
    }

    const categoryData: Category = {
      id: editingCategory ? editingCategory.id : data.slug, // Use slug as ID for new categories
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      order: data.order,
      isActive: data.isActive,
      createdAt: editingCategory ? editingCategory.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCategory(categoryData);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">Category Management</h1>
          <p className="text-sm font-medium text-outline">Create and manage your store categories</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-secondary hover:bg-primary text-white font-bold py-3 px-5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[20px] shadow-sm border border-outline-variant/15 flex items-center gap-3">
        <span className="material-symbols-outlined text-outline ml-2">search</span>
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search categories by name, slug, or description..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-primary py-2"
        />
        {searchVal && (
          <button onClick={() => setSearchVal('')} className="text-outline hover:text-primary p-1 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-[24px] shadow-sm border border-outline-variant/15 overflow-hidden">
        {isLoading && categories.length === 0 ? (
          <div className="p-12 text-center text-outline flex flex-col items-center">
            <span className="material-symbols-outlined animate-spin text-secondary text-[40px] mb-4">progress_activity</span>
            <p className="font-semibold text-sm">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-outline">
            <span className="material-symbols-outlined text-[48px] mb-3 opacity-50">category</span>
            <p className="font-semibold text-sm">No categories found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/15">
                  <th className="p-4 rounded-tl-[24px]">Icon</th>
                  <th className="p-4">Name & Slug</th>
                  <th className="p-4 hidden md:table-cell">Description</th>
                  <th className="p-4 text-center">Order</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right rounded-tr-[24px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm font-medium text-primary">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center border border-secondary/20">
                        <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-primary">{cat.name}</p>
                      <p className="text-[10px] text-outline bg-surface-container inline-block px-1.5 py-0.5 rounded mt-1">/{cat.slug}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell text-xs text-on-surface-variant max-w-[200px] truncate">
                      {cat.description}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono bg-surface-container px-2 py-1 rounded text-xs">{cat.order}</span>
                    </td>
                    <td className="p-4 text-center">
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#4CAF50] bg-[#4CAF50]/10 px-2.5 py-1 rounded-full border border-[#4CAF50]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-outline bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="w-8 h-8 rounded-lg bg-surface-container hover:bg-secondary hover:text-white text-on-surface-variant flex items-center justify-center transition-all cursor-pointer"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => setCategoryToDelete(cat.id)}
                          className="w-8 h-8 rounded-lg bg-error/10 hover:bg-error hover:text-white text-error flex items-center justify-center transition-all cursor-pointer"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {categoryToDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setCategoryToDelete(null)} className="fixed inset-0 bg-black z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl z-50 border border-error/20">
              <div className="flex items-center gap-3 text-error mb-4">
                <span className="material-symbols-outlined text-[32px]">warning</span>
                <h3 className="font-display font-bold text-lg">Delete Category?</h3>
              </div>
              <p className="text-sm font-medium text-on-surface-variant mb-6">
                Are you sure you want to delete this category? If there are any products still assigned to this category, the deletion will be prevented to avoid breaking the store.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setCategoryToDelete(null)} className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container cursor-pointer transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(categoryToDelete)} className="px-5 py-2 rounded-xl text-sm font-bold bg-error text-white shadow-sm hover:bg-error/90 cursor-pointer transition-colors">
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create/Edit Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setIsModalOpen(false)} className="fixed inset-0 bg-black z-50" />
            <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 border-l border-outline-variant/15 flex flex-col">
              <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50">
                <h3 className="font-display font-bold text-xl text-primary">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer disabled:opacity-50" disabled={isSubmitting}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <form id="categoryForm" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">Category Name</label>
                    <input type="text" {...register('name')} placeholder="e.g. Frozen Foods" className="w-full text-sm p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 focus:border-secondary focus:ring-1 focus:ring-secondary text-primary font-medium" />
                    {errors.name && <p className="text-xs text-error font-semibold mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">URL Slug</label>
                    <input type="text" {...register('slug')} placeholder="e.g. frozen-foods" className="w-full text-sm p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 focus:border-secondary focus:ring-1 focus:ring-secondary text-primary font-mono lowercase" />
                    <p className="text-[10px] text-outline mt-1 font-medium">Used in URLs. Must be unique.</p>
                    {errors.slug && <p className="text-xs text-error font-semibold mt-1">{errors.slug.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">Description</label>
                    <textarea {...register('description')} rows={3} placeholder="Brief description..." className="w-full text-sm p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 focus:border-secondary focus:ring-1 focus:ring-secondary text-primary font-medium resize-none" />
                    {errors.description && <p className="text-xs text-error font-semibold mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-outline block mb-1">Google Material Icon</label>
                      <input type="text" {...register('icon')} placeholder="e.g. ac_unit" className="w-full text-sm p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 focus:border-secondary focus:ring-1 focus:ring-secondary text-primary font-medium" />
                      {errors.icon && <p className="text-xs text-error font-semibold mt-1">{errors.icon.message}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-outline block mb-1">Display Order</label>
                      <input type="number" {...register('order', { valueAsNumber: true })} className="w-full text-sm p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 focus:border-secondary focus:ring-1 focus:ring-secondary text-primary font-medium" />
                      {errors.order && <p className="text-xs text-error font-semibold mt-1">{errors.order.message}</p>}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-primary">Active Status</h4>
                      <p className="text-[10px] text-outline font-medium">Show this category on the storefront?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" {...register('isActive')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-outline-variant/10 bg-surface-container-low/30">
                <button type="submit" form="categoryForm" disabled={isSubmitting} className="w-full bg-secondary hover:bg-primary text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {isSubmitting ? (
                    <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Saving...</>
                  ) : (
                    'Save Category'
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
