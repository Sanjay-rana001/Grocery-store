'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { createOrder } from '@/lib/firebaseServices';

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

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router, isClient]);

  // Steps: 1 = Delivery, 2 = Payment, 3 = Confirmation
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliverySlot, setDeliverySlot] = useState({ date: '', time: '' });
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'cod'>('card');
  const [couponVal, setCouponVal] = useState('');
  const [step1Address, setStep1Address] = useState<AddressSchemaType | null>(null);

  // Future delivery slots generator
  const availableDates = generateDeliveryDates();

  useEffect(() => {
    if (availableDates.length > 0 && !deliverySlot.date) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <span className="material-symbols-outlined text-[48px] animate-bounce text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
          shopping_basket
        </span>
      </div>
    );
  }

  // Empty Cart View
  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 pb-20 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop bg-background text-primary flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0px_4px_24px_rgba(0,0,0,0.03)] border border-outline-variant/10 text-center max-w-md w-full"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full bg-secondary-container/10 flex items-center justify-center mx-auto mb-6 text-secondary"
            >
              <span className="material-symbols-outlined text-[48px]">shopping_basket</span>
            </motion.div>
            <h2 className="font-display font-bold text-headline-md mb-2">Oops! No items in your cart</h2>
            <p className="text-on-surface-variant text-sm mb-8">
              Your cart is currently empty. Add some fresh groceries to your cart first to proceed with checkout.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-secondary text-white font-bold py-3.5 px-8 rounded-2xl hover:bg-primary transition-all active:scale-95 shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">store</span>
              Start Shopping
            </Link>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  // Totals calculations
  const { subtotal, tax, shippingFee, discount, total, itemsCount } = getTotals();

  // Submit Step 1
  const proceedToPayment = async (data: AddressSchemaType) => {
    setStep1Address(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateAddress(data as any);
    setStep(2);
  };

  const handlePaymentSuccess = async () => {
    if (!step1Address || !user) return;
    
    setIsProcessing(true);

    const newOrder = {
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
      paymentMethod: selectedMethod === 'cod' ? 'cod' : 'mock_online'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any; // Cast as any temporarily to allow adding optional couponCode later

    if (coupon?.code) {
      newOrder.couponCode = coupon.code;
    }

    try {
      const finalOrder = await createOrder(newOrder);
      
      // Fire off the confirmation email in the background (non-blocking)
      fetch('/api/emails/order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newOrder, id: finalOrder.id || newOrder.id }) // Ensure ID is passed
      }).catch(err => console.error("Background email trigger failed:", err));

      clearCart();
      router.push('/orders');
      setIsProcessing(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Failed to place order:', error);
      alert(`There was an error placing your order: ${error.message || 'Unknown error'}. Please try again.`);
      setIsProcessing(false);
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

                {user?.savedAddresses && user.savedAddresses.length > 0 && (
                  <div className="mb-6 pb-6 border-b border-outline-variant/10">
                    <h3 className="text-sm font-bold text-primary mb-3">Quick Select Saved Address</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                      {user.savedAddresses.map((addr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setValue('fullName', addr.fullName);
                            setValue('street', addr.street);
                            setValue('city', addr.city);
                            setValue('postalCode', addr.postalCode);
                            setValue('phone', addr.phone);
                          }}
                          className="flex-shrink-0 snap-start w-64 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 text-left hover:border-secondary hover:bg-secondary/5 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-sm text-primary group-hover:text-secondary">{addr.fullName}</p>
                            {(user.address?.street === addr.street && user.address?.postalCode === addr.postalCode) && (
                              <span className="bg-secondary/10 text-secondary text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-xs text-outline font-semibold truncate">{addr.street}</p>
                          <p className="text-xs text-outline truncate">{addr.city}, {addr.postalCode}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(proceedToPayment)} className="space-y-5">
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
                        placeholder="e.g. Sanjay Rana"
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

            {/* STEP 2: Payment */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.03)] border border-outline-variant/10"
              >
                <h3 className="font-display font-bold text-headline-sm text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[26px]">payment</span>
                  Choose Payment Method
                </h3>
                
                <div className="space-y-4 mb-8">
                  {/* Card Option */}
                  <div 
                    onClick={() => setSelectedMethod('card')}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                      selectedMethod === 'card' ? 'border-secondary bg-secondary-container/5 ring-4 ring-secondary/5' : 'border-outline-variant/35 bg-white hover:border-outline-variant'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-[28px]">credit_card</span>
                        <div>
                          <p className="font-bold text-sm text-primary">Pay securely online (Card)</p>
                          <p className="text-[10px] text-outline font-semibold">Credit, Debit, Apple Pay, Google Pay</p>
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        checked={selectedMethod === 'card'} 
                        onChange={() => setSelectedMethod('card')}
                        className="w-5 h-5 accent-secondary"
                      />
                    </div>
                  </div>

                  {/* COD Option */}
                  <div 
                    onClick={() => setSelectedMethod('cod')}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                      selectedMethod === 'cod' ? 'border-secondary bg-secondary-container/5 ring-4 ring-secondary/5' : 'border-outline-variant/35 bg-white hover:border-outline-variant'
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
                        checked={selectedMethod === 'cod'} 
                        onChange={() => setSelectedMethod('cod')}
                        className="w-5 h-5 accent-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* Gateway / Action Area */}
                {selectedMethod === 'card' ? (
                  <div className="space-y-6">
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20 flex flex-col items-center text-center">
                      <span className="material-symbols-outlined text-[48px] text-secondary mb-2">science</span>
                      <h4 className="font-bold text-primary text-lg">Mock Payment Environment</h4>
                      <p className="text-sm text-outline mt-1 max-w-sm">
                        You are currently using the mock payment gateway for testing. No real money will be charged.
                      </p>
                    </div>

                    <button
                      onClick={handlePaymentSuccess}
                      disabled={isProcessing}
                      className={`w-full font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 ${
                        isProcessing
                          ? 'bg-surface-container-low text-outline cursor-wait shadow-none'
                          : 'bg-primary text-white hover:bg-primary/90 active:scale-95 cursor-pointer'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                          Processing Mock Payment...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">lock</span>
                          Simulate Payment of ${total.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      onClick={handlePaymentSuccess}
                      disabled={isProcessing}
                      className={`w-full font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 ${
                        isProcessing
                          ? 'bg-surface-container-low text-outline cursor-wait shadow-none'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 cursor-pointer'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                          Place Order (Pay on Delivery)
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-outline-variant/10">
                  <button
                    onClick={() => setStep(1)}
                    disabled={isProcessing}
                    className="text-on-surface-variant font-bold hover:text-primary transition-colors text-sm px-4 py-2 cursor-pointer"
                  >
                    Back to Delivery
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
