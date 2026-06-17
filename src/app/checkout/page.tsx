'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { createOrder } from '@/lib/db';
import { formatCurrency, generateDeliveryDates } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import { motion, AnimatePresence } from 'framer-motion';

// Schema for Step 1 Address details
const addressSchema = zod.object({
  fullName: zod.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters'),
  street: zod.string().min(1, 'Street address is required'),
  city: zod.string().min(1, 'Please select a city'),
  postalCode: zod.string().min(4, 'Postal code must be 4 digits').max(4, 'Postal code must be 4 digits'),
  phone: zod.string().min(8, 'Phone number must be at least 8 digits'),
});

type AddressSchemaType = zod.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  
  // State Stores
  const { items, getTotals, coupon, couponError, applyCouponCode, removeCouponCode, clearCart } = useCartStore();
  const { user, isAuthenticated, updateAddress } = useAuthStore();

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (items.length === 0) {
      router.push('/');
    }
  }, [isAuthenticated, items, router]);

  // Steps: 1 = Delivery, 2 = Payment, 3 = Confirmation
  const [step, setStep] = useState(1);
  const [deliverySlot, setDeliverySlot] = useState({ date: '', time: '' });
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay' | 'cod'>('stripe');
  const [stripeForm, setStripeForm] = useState({ cardNumber: '4111 2222 3333 4444', expiry: '12/28', cvv: '123' });
  const [razorpayBank, setRazorpayBank] = useState('ANZ Bank');
  const [couponVal, setCouponVal] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [step1Address, setStep1Address] = useState<AddressSchemaType | null>(null);

  // Future delivery slots generator
  const availableDates = generateDeliveryDates();

  useEffect(() => {
    if (availableDates.length > 0 && !deliverySlot.date) {
      setDeliverySlot({
        date: availableDates[0],
        time: 'Morning (8AM - 12PM)'
      });
    }
  }, [availableDates, deliverySlot]);

  // Form handling prefilled with user address
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressSchemaType>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: user?.address?.fullName || user?.name || '',
      street: user?.address?.street || '',
      city: user?.address?.city || 'Auckland',
      postalCode: user?.address?.postalCode || '',
      phone: user?.address?.phone || '',
    },
  });

  // Pre-fill form if user logs in / changes address
  useEffect(() => {
    if (user?.address) {
      setValue('fullName', user.address.fullName);
      setValue('street', user.address.street);
      setValue('city', user.address.city);
      setValue('postalCode', user.address.postalCode);
      setValue('phone', user.address.phone);
    }
  }, [user, setValue]);

  if (!isAuthenticated || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[48px] animate-spin text-secondary">
            progress_activity
          </span>
          <p className="font-semibold text-sm">Verifying shopping cart status...</p>
        </div>
      </div>
    );
  }

  // Totals calculations
  const { subtotal, tax, shippingFee, discount, total, itemsCount } = getTotals();

  // Submit Step 1
  const handleStep1Submit = (data: AddressSchemaType) => {
    setStep1Address(data);
    
    // Save address back to user profile for convenience
    updateAddress({
      fullName: data.fullName,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      country: 'New Zealand',
      phone: data.phone
    });

    setStep(2);
  };

  // Process payment Step 2
  const handlePaymentProcessing = async () => {
    setIsProcessingPayment(true);
    // Simulate payment gateway API delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessingPayment(false);
    setStep(3);
  };

  // Complete checkout & write to DB Step 3
  const handlePlaceOrder = async () => {
    if (!step1Address || !user) return;

    const orderData = {
      userEmail: user.email,
      userName: step1Address.fullName,
      items: items,
      subtotal,
      tax,
      shippingFee,
      discount,
      total,
      address: {
        fullName: step1Address.fullName,
        street: step1Address.street,
        city: step1Address.city,
        postalCode: step1Address.postalCode,
        country: 'New Zealand',
        phone: step1Address.phone
      },
      deliverySlot: {
        date: deliverySlot.date,
        time: deliverySlot.time
      },
      couponCode: coupon?.code || undefined,
      paymentMethod
    };

    try {
      const finalOrder = await createOrder(orderData);
      
      // Clear Zustand cart
      clearCart();
      
      // Redirect to success page
      router.push(`/order-success?orderId=${finalOrder.id}`);
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('There was an error placing your order. Please try again.');
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponVal.trim()) return;
    await applyCouponCode(couponVal.trim());
  };

  const NZ_CITIES = [
    'Auckland', 'Wellington', 'Christchurch', 'Hamilton',
    'Dunedin', 'Tauranga', 'Palmerston North', 'Napier', 'Nelson'
  ];

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 md:pb-12 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop bg-background text-on-background">
        
        {/* Step Visual Indicator */}
        <div className="max-w-3xl mx-auto mb-8 bg-white rounded-3xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10">
          <div className="flex justify-between items-center relative px-2 sm:px-8">
            {/* Step lines */}
            <div className="absolute top-[21px] left-[15%] right-[15%] h-0.5 bg-outline-variant/30 -z-0" />
            <div 
              className="absolute top-[21px] left-[15%] h-0.5 bg-secondary -z-0 transition-all duration-300"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />

            {/* Step 1 indicator */}
            <button 
              disabled={step < 1}
              onClick={() => step > 1 && setStep(1)}
              className="flex flex-col items-center gap-1.5 z-10 focus:outline-none cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step > 1 
                  ? 'bg-secondary border-secondary text-white shadow-md' 
                  : step === 1 
                    ? 'border-secondary bg-white text-secondary ring-4 ring-secondary/10 font-black' 
                    : 'border-outline-variant/40 bg-white text-outline'
              }`}>
                {step > 1 ? <span className="material-symbols-outlined text-[20px]">check</span> : '1'}
              </div>
              <span className={`text-[11px] font-bold ${step === 1 ? 'text-secondary' : 'text-outline'}`}>Delivery</span>
            </button>

            {/* Step 2 indicator */}
            <button 
              disabled={step < 2}
              onClick={() => step > 2 && setStep(2)}
              className="flex flex-col items-center gap-1.5 z-10 focus:outline-none cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step > 2 
                  ? 'bg-secondary border-secondary text-white shadow-md' 
                  : step === 2 
                    ? 'border-secondary bg-white text-secondary ring-4 ring-secondary/10 font-black' 
                    : 'border-outline-variant/40 bg-white text-outline'
              }`}>
                {step > 2 ? <span className="material-symbols-outlined text-[20px]">check</span> : '2'}
              </div>
              <span className={`text-[11px] font-bold ${step === 2 ? 'text-secondary' : 'text-outline'}`}>Payment</span>
            </button>

            {/* Step 3 indicator */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step === 3 
                  ? 'border-secondary bg-white text-secondary ring-4 ring-secondary/10 font-black' 
                  : 'border-outline-variant/40 bg-white text-outline'
              }`}>
                3
              </div>
              <span className={`text-[11px] font-bold ${step === 3 ? 'text-secondary' : 'text-outline'}`}>Confirm</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Checkout Step Card */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STEP 1: Delivery details */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.03)] border border-outline-variant/10"
              >
                <h2 className="font-display text-headline-md font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[26px]">local_shipping</span>
                  Delivery Information
                </h2>

                <form onSubmit={handleSubmit(handleStep1Submit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-outline block mb-1.5">Recipient Full Name</label>
                      <input
                        type="text"
                        {...register('fullName')}
                        className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                          errors.fullName ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                        } text-primary font-medium`}
                        placeholder="e.g. John Carter"
                      />
                      {errors.fullName && <p className="text-xs text-error font-semibold mt-1">{errors.fullName.message}</p>}
                    </div>

                    {/* Street Address */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-outline block mb-1.5">Street Address</label>
                      <input
                        type="text"
                        {...register('street')}
                        className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                          errors.street ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                        } text-primary font-medium`}
                        placeholder="e.g. 52 Queen Street, CBD"
                      />
                      {errors.street && <p className="text-xs text-error font-semibold mt-1">{errors.street.message}</p>}
                    </div>

                    {/* CityDropdown */}
                    <div>
                      <label className="text-xs font-bold text-outline block mb-1.5">City (New Zealand)</label>
                      <select
                        {...register('city')}
                        className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                          errors.city ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                        } text-primary font-medium cursor-pointer`}
                      >
                        {NZ_CITIES.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      {errors.city && <p className="text-xs text-error font-semibold mt-1">{errors.city.message}</p>}
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="text-xs font-bold text-outline block mb-1.5">Postal Code</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 1010"
                        {...register('postalCode')}
                        className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                          errors.postalCode ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                        } text-primary font-medium`}
                      />
                      {errors.postalCode && <p className="text-xs text-error font-semibold mt-1">{errors.postalCode.message}</p>}
                    </div>

                    {/* Phone Number */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-outline block mb-1.5">Contact Phone Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. 021 123 4567"
                        {...register('phone')}
                        className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                          errors.phone ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                        } text-primary font-medium`}
                      />
                      {errors.phone && <p className="text-xs text-error font-semibold mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>

                  {/* Delivery Slot Scheduling */}
                  <div className="border-t border-outline-variant/10 pt-6 mt-6">
                    <h3 className="font-semibold text-sm text-primary mb-3.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">schedule</span>
                      Schedule Your Delivery Slot
                    </h3>

                    {/* Dates Pill Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                      {availableDates.map(date => {
                        const isSel = deliverySlot.date === date;
                        return (
                          <button
                            key={date}
                            type="button"
                            onClick={() => setDeliverySlot(prev => ({ ...prev, date }))}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
                              isSel 
                                ? 'bg-secondary text-white border-secondary shadow-md' 
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border-outline-variant/10'
                            }`}
                          >
                            {date}
                          </button>
                        );
                      })}
                    </div>

                    {/* Morning / Afternoon timeslot radios */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {[
                        { time: 'Morning (8AM - 12PM)', icon: 'light_mode' },
                        { time: 'Afternoon (1PM - 5PM)', icon: 'wb_twilight' }
                      ].map(slot => {
                        const isSel = deliverySlot.time === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setDeliverySlot(prev => ({ ...prev, time: slot.time }))}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left active:scale-95 transition-all cursor-pointer ${
                              isSel 
                                ? 'border-secondary bg-secondary-container/10' 
                                : 'border-outline-variant/40 bg-white hover:bg-surface-container-low'
                            }`}
                          >
                            <span className="material-symbols-outlined text-outline text-[20px]">{slot.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-primary">{slot.time}</p>
                              <p className="text-[10px] text-outline font-medium">Standard Slot</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-outline-variant/10 pt-6 mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="bg-secondary text-white font-bold py-3.5 px-8 rounded-2xl hover:bg-primary transition-all active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Payment</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: Payment Method */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.03)] border border-outline-variant/10"
              >
                <h2 className="font-display text-headline-md font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[26px]">payment</span>
                  Choose Payment Method
                </h2>

                <div className="space-y-4">
                  {/* Stripe Card Selection */}
                  <div 
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'stripe' ? 'border-secondary bg-secondary-container/5 ring-4 ring-secondary/5' : 'border-outline-variant/35 bg-white hover:border-outline-variant'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-[28px]">credit_card</span>
                        <div>
                          <p className="font-bold text-sm text-primary">Stripe Payment Gateway</p>
                          <p className="text-[10px] text-outline font-semibold">Credit/Debit Card (Secured)</p>
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        checked={paymentMethod === 'stripe'} 
                        onChange={() => setPaymentMethod('stripe')}
                        className="w-5 h-5 accent-secondary"
                      />
                    </div>

                    {paymentMethod === 'stripe' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 pt-3 border-t border-outline-variant/10 overflow-hidden"
                      >
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-3">
                            <label className="text-[10px] font-bold text-outline block mb-1">Card Number</label>
                            <input
                              type="text"
                              value={stripeForm.cardNumber}
                              onChange={(e) => setStripeForm({ ...stripeForm, cardNumber: e.target.value })}
                              className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-mono"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] font-bold text-outline block mb-1">Expiration Date</label>
                            <input
                              type="text"
                              value={stripeForm.expiry}
                              onChange={(e) => setStripeForm({ ...stripeForm, expiry: e.target.value })}
                              className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-outline block mb-1">CVV</label>
                            <input
                              type="password"
                              maxLength={3}
                              value={stripeForm.cvv}
                              onChange={(e) => setStripeForm({ ...stripeForm, cvv: e.target.value })}
                              className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-mono"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-outline font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-secondary">verified_user</span>
                          Fully simulated sandbox client - secure click is safe.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Razorpay Option Selection */}
                  <div 
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'razorpay' ? 'border-secondary bg-secondary-container/5 ring-4 ring-secondary/5' : 'border-outline-variant/35 bg-white hover:border-outline-variant'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-[28px]">account_balance</span>
                        <div>
                          <p className="font-bold text-sm text-primary">Razorpay Online Banking</p>
                          <p className="text-[10px] text-outline font-semibold">NZ Bank Direct Transfer</p>
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        checked={paymentMethod === 'razorpay'} 
                        onChange={() => setPaymentMethod('razorpay')}
                        className="w-5 h-5 accent-secondary"
                      />
                    </div>

                    {paymentMethod === 'razorpay' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 pt-3 border-t border-outline-variant/10 overflow-hidden"
                      >
                        <div>
                          <label className="text-[10px] font-bold text-outline block mb-1">Select Bank</label>
                          <select
                            value={razorpayBank}
                            onChange={(e) => setRazorpayBank(e.target.value)}
                            className="w-full text-xs p-3 bg-background rounded-xl border border-outline-variant/30 text-primary font-semibold"
                          >
                            <option>ANZ Bank</option>
                            <option>ASB Bank</option>
                            <option>Westpac New Zealand</option>
                            <option>KiwiBank</option>
                            <option>BNZ (Bank of New Zealand)</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Cash on Delivery */}
                  <div 
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'cod' ? 'border-secondary bg-secondary-container/5 ring-4 ring-secondary/5' : 'border-outline-variant/35 bg-white hover:border-outline-variant'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-[28px]">payments</span>
                        <div>
                          <p className="font-bold text-sm text-primary">Cash on Delivery (COD)</p>
                          <p className="text-[10px] text-outline font-semibold">Pay with cash at your doorstep</p>
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        checked={paymentMethod === 'cod'} 
                        onChange={() => setPaymentMethod('cod')}
                        className="w-5 h-5 accent-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-outline-variant/10 pt-6 mt-8 flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="border border-outline-variant/60 text-primary font-bold py-3.5 px-6 rounded-2xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handlePaymentProcessing}
                    className="bg-secondary text-white font-bold py-3.5 px-8 rounded-2xl hover:bg-primary transition-all active:scale-95 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        <span>Authorizing payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Process Payment ({formatCurrency(total)})</span>
                        <span className="material-symbols-outlined">payments</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Confirmation Summary */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.03)] border border-outline-variant/10 text-center"
              >
                <span className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary mx-auto mb-4 animate-bounce">
                  <span className="material-symbols-outlined text-[36px] fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                </span>
                <h2 className="font-display text-headline-lg font-bold text-primary mb-2">Order Confirmed</h2>
                <p className="text-on-surface-variant text-sm max-w-sm mx-auto mb-6">
                  Your simulated payment was authorized successfully. Please review the details below before placing your final order.
                </p>

                {/* Final summaries box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border border-outline-variant/15 p-5 rounded-2xl bg-surface-container-low/40 mb-6 text-sm">
                  <div>
                    <h4 className="font-bold text-primary mb-1">Delivery Address</h4>
                    <p className="text-on-surface-variant font-medium">{step1Address?.fullName}</p>
                    <p className="text-on-surface-variant text-xs">{step1Address?.street}</p>
                    <p className="text-on-surface-variant text-xs">{step1Address?.city}, NZ {step1Address?.postalCode}</p>
                    <p className="text-on-surface-variant text-xs font-semibold mt-1">Phone: {step1Address?.phone}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1">Delivery Slot</h4>
                    <p className="text-secondary font-bold">{deliverySlot.date}</p>
                    <p className="text-on-surface-variant text-xs font-semibold">{deliverySlot.time}</p>
                    <h4 className="font-bold text-primary mt-3 mb-0.5">Payment Authorized via</h4>
                    <p className="text-on-surface-variant text-xs font-bold uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">done</span>
                      {paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="border border-outline-variant/60 text-primary font-bold py-3.5 px-6 rounded-2xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    <span>Edit Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    className="flex-1 bg-secondary text-white font-extrabold py-3.5 px-8 rounded-2xl hover:bg-primary transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Place Order Now</span>
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Checkout Right Side: Order Summary Panel */}
          <div className="col-span-1">
            <div className="bg-white rounded-[28px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10 sticky top-24">
              <h3 className="font-display text-headline-sm font-bold text-primary mb-4 pb-3 border-b border-outline-variant/10 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary">shopping_basket</span>
                Order Summary
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-56 overflow-y-auto pr-1 scrollbar-hide mb-4">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative w-12 h-12 bg-surface-container-low rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/10">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-xs text-primary truncate leading-tight">{item.product.name}</p>
                        <p className="text-[10px] text-outline font-semibold mt-0.5">{item.quantity} x {formatCurrency(item.product.price)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary text-right">{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon applying section */}
              {step < 3 && (
                <div className="border-t border-b border-outline-variant/10 py-4 mb-4">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponVal}
                      onChange={(e) => setCouponVal(e.target.value)}
                      placeholder="e.g. KIWI10"
                      className="flex-1 text-xs p-3.5 bg-background rounded-xl border border-outline-variant/30 text-primary font-bold focus:ring-1 focus:ring-secondary"
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-secondary text-white font-bold text-xs px-4 py-2 rounded-xl active:scale-95 shadow-sm cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                  {coupon && (
                    <div className="mt-2.5 flex items-center justify-between bg-secondary-container/10 p-2.5 rounded-xl border border-secondary-container/20">
                      <span className="text-[10px] font-bold text-secondary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] fill-1">stars</span>
                        Code: {coupon.code} (-{formatCurrency(discount)})
                      </span>
                      <button 
                        type="button" 
                        onClick={() => {
                          removeCouponCode();
                          setCouponVal('');
                        }}
                        className="text-error hover:scale-110 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px] font-bold">close</span>
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-[10px] text-error font-semibold mt-1.5">{couponError}</p>}
                </div>
              )}

              {/* Calculations breakdowns */}
              <div className="space-y-3.5 text-xs font-semibold text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-primary">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (15% Included)</span>
                  <span className="text-primary">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-primary">
                    {shippingFee === 0 ? <span className="text-secondary font-bold">FREE</span> : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-outline-variant/10 pt-4 text-sm font-extrabold text-primary">
                  <span>Order Total</span>
                  <span className="text-secondary text-base">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <MobileNav />
      <Footer />
    </>
  );
}
