'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Coupon } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';

// Zod Validation Schema for Coupon
const couponSchema = zod.object({
  code: zod.string().min(1, 'Coupon code is required').min(3, 'Code must be at least 3 characters').toUpperCase(),
  type: zod.enum(['percentage', 'fixed']),
  value: zod.coerce.number().min(1, 'Value must be at least 1'),
  minAmount: zod.coerce.number().optional(),
  isActive: zod.boolean().default(true),
});

type CouponSchemaType = zod.infer<typeof couponSchema>;

export default function AdminCouponsPage() {
  const { coupons, loadAllData, saveCoupon, deleteCoupon, isLoading } = useAdminStore();
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponSchemaType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(couponSchema) as any,
    defaultValues: {
      code: '',
      type: 'percentage',
      value: 10,
      minAmount: undefined,
      isActive: true,
    }
  });

  const onSubmit = (data: CouponSchemaType) => {
    const finalCoupon: Coupon = {
      code: data.code.toUpperCase().trim(),
      type: data.type,
      value: data.value,
      minAmount: data.minAmount || undefined, // Map 0 or NaN/undefined to undefined
      isActive: data.isActive,
    };

    saveCoupon(finalCoupon);
    reset();
  };

  const handleDelete = (code: string) => {
    deleteCoupon(code);
    setCouponToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="material-symbols-outlined text-[48px] animate-spin text-secondary">
          progress_activity
        </span>
        <p className="font-semibold text-sm">Validating active vouchers...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Table listing coupons */}
      <div className="lg:col-span-2 bg-white rounded-[32px] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-outline-variant/10">
        <h3 className="font-display font-bold text-base sm:text-lg text-primary mb-4">Active Promo Codes</h3>

        {coupons.length === 0 ? (
          <div className="text-center py-12 text-outline text-xs">
            No discount coupons created yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/10">
            <table className="w-full text-left text-xs font-semibold text-primary border-collapse">
              <thead>
                <tr className="bg-surface-container-low/60 text-outline border-b border-outline-variant/10">
                  <th className="p-4 font-bold">Code</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Benefit</th>
                  <th className="p-4 font-bold">Minimum Spend</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {coupons.map((c) => (
                  <tr key={c.code} className="hover:bg-surface-container-low/10 transition-colors">
                    <td className="p-4 font-bold font-mono text-secondary tracking-wider text-sm">{c.code}</td>
                    <td className="p-4 capitalize text-outline font-semibold">{c.type}</td>
                    <td className="p-4 font-extrabold text-primary">
                      {c.type === 'percentage' ? `${c.value}% off` : `${formatCurrency(c.value)} off`}
                    </td>
                    <td className="p-4 font-medium text-outline">
                      {c.minAmount ? `Min ${formatCurrency(c.minAmount)}` : 'No Minimum'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        c.isActive 
                          ? 'bg-secondary-container/10 border-secondary-container/20 text-secondary' 
                          : 'bg-outline-variant/20 border-outline-variant/30 text-outline'
                      }`}>
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        {couponToDelete === c.code ? (
                          <div className="flex items-center gap-1 bg-error/10 p-1 rounded-xl border border-error/20">
                            <button
                              onClick={() => handleDelete(c.code)}
                              className="text-[9px] font-black text-error hover:underline px-1 cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setCouponToDelete(null)}
                              className="text-[9px] text-outline font-bold hover:underline px-1 cursor-pointer"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCouponToDelete(c.code)}
                            className="w-9 h-9 rounded-xl hover:bg-error/5 flex items-center justify-center text-error cursor-pointer border border-outline-variant/10 transition-all active:scale-90"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creator Form */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-outline-variant/10 h-fit">
        <h3 className="font-display font-bold text-base sm:text-lg text-primary mb-4">Create Coupon</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Coupon Code */}
          <div>
            <label className="text-[10px] font-bold text-outline block mb-1">Coupon Code (Uppercase)</label>
            <input
              type="text"
              placeholder="e.g. AUTUMN15"
              {...register('code')}
              className="w-full text-xs p-3.5 bg-background rounded-2xl border border-outline-variant/30 text-primary font-extrabold tracking-wider"
            />
            {errors.code && <p className="text-[10px] text-error font-semibold mt-1">{errors.code.message}</p>}
          </div>

          {/* Type selection */}
          <div>
            <label className="text-[10px] font-bold text-outline block mb-1">Benefit Type</label>
            <select
              {...register('type')}
              className="w-full text-xs p-3.5 bg-background rounded-2xl border border-outline-variant/30 text-primary font-bold cursor-pointer"
            >
              <option value="percentage">Percentage Discount (%)</option>
              <option value="fixed">Fixed Cash Discount ($ NZD)</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label className="text-[10px] font-bold text-outline block mb-1">Discount Value</label>
            <input
              type="number"
              {...register('value')}
              className="w-full text-xs p-3.5 bg-background rounded-2xl border border-outline-variant/30 text-primary font-bold font-mono"
            />
            {errors.value && <p className="text-[10px] text-error font-semibold mt-1">{errors.value.message}</p>}
          </div>

          {/* Min Subtotal */}
          <div>
            <label className="text-[10px] font-bold text-outline block mb-1">Minimum Subtotal Required ($ NZD)</label>
            <input
              type="number"
              placeholder="No minimum limit"
              {...register('minAmount')}
              className="w-full text-xs p-3.5 bg-background rounded-2xl border border-outline-variant/30 text-primary font-semibold font-mono"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2.5 py-1">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-4.5 h-4.5 text-secondary rounded accent-secondary cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-primary cursor-pointer select-none">
              Activate instantly on creation
            </label>
          </div>

          {/* Create Button */}
          <button
            type="submit"
            className="w-full bg-secondary hover:bg-primary text-white font-extrabold text-xs py-3.5 rounded-2xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-4"
          >
            <span className="material-symbols-outlined text-[18px]">stars</span>
            <span>Create Promo Code</span>
          </button>
        </form>
      </div>

    </div>
  );
}
