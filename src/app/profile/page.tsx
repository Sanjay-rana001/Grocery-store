'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import { motion, AnimatePresence } from 'framer-motion';
import { Address } from '@/lib/types';

const profileSchema = zod.object({
  fullName: zod.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters'),
  street: zod.string().min(1, 'Street address is required'),
  city: zod.string().min(1, 'Please select a city'),
  postalCode: zod.string().min(4, 'Postal code must be 4 digits').max(4, 'Postal code must be 4 digits'),
  phone: zod.string().min(8, 'Phone number must be at least 8 digits'),
});

type ProfileSchemaType = zod.infer<typeof profileSchema>;

const NZ_CITIES = [
  'Auckland', 'Wellington', 'Christchurch', 'Hamilton',
  'Dunedin', 'Tauranga', 'Palmerston North', 'Napier', 'Nelson'
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile, updateSavedAddresses, resetPassword } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<'info' | 'addresses'>('info');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [isAuthenticated, mounted, router]);

  // Main Profile Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset: resetProfileForm
  } = useForm<ProfileSchemaType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      street: '',
      city: 'Auckland',
      postalCode: '',
      phone: '',
    },
  });

  // Additional Address Form
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors },
    reset: resetAddressForm
  } = useForm<ProfileSchemaType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      street: '',
      city: 'Auckland',
      postalCode: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('fullName', user.name || '');
      setProfileImage(user.profileImage || null);
      if (user.address) {
        setValue('street', user.address.street || '');
        setValue('city', user.address.city || 'Auckland');
        setValue('postalCode', user.address.postalCode || '');
        setValue('phone', user.address.phone || '');
      }
    }
  }, [user, setValue]);

  // Handle Main Profile Update
  const onSubmit = async (data: ProfileSchemaType) => {
    setIsSaving(true);
    setSuccessMessage('');
    
    const addressData: Address = {
      fullName: data.fullName,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      country: 'New Zealand',
      phone: data.phone
    };

    const result = await updateProfile(data.fullName, addressData, profileImage || undefined);
    
    setIsSaving(false);
    
    if (result.success) {
      setSuccessMessage('Profile updated successfully! 🎉');
      resetProfileForm(data); // reset dirty state
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      alert(result.message);
    }
  };

  // Handle Adding New Saved Address
  const onAddAddress = async (data: ProfileSchemaType) => {
    if (!user) return;
    setIsSaving(true);
    
    const newAddress: Address = {
      fullName: data.fullName,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      country: 'New Zealand',
      phone: data.phone
    };

    const currentAddresses = user.savedAddresses || [];
    const updatedAddresses = [...currentAddresses, newAddress];
    
    const result = await updateSavedAddresses(updatedAddresses);
    
    setIsSaving(false);
    
    if (result.success) {
      setSuccessMessage('Address added successfully! 📍');
      setIsAddingAddress(false);
      resetAddressForm();
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      alert(result.message);
    }
  };

  const removeSavedAddress = async (index: number) => {
    if (!user) return;
    if (!confirm('Are you sure you want to remove this address?')) return;
    
    const currentAddresses = user.savedAddresses || [];
    const updatedAddresses = currentAddresses.filter((_, i) => i !== index);
    
    const result = await updateSavedAddresses(updatedAddresses);
    if (result.success) {
      setSuccessMessage('Address removed.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const setAsPrimaryAddress = async (address: Address) => {
    if (!user) return;
    setIsSaving(true);
    const result = await updateProfile(user.name, address, profileImage || undefined);
    setIsSaving(false);
    if (result.success) {
      setSuccessMessage('Default address updated! ✅');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'profiles');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Update local state so UI updates immediately
      setProfileImage(data.url);
      
      setIsUploadingImage(false);
    } catch (err) {
      console.error('Image processing error:', err);
      alert('Failed to upload image. Please try again.');
      setIsUploadingImage(false);
    }
  };

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] text-primary">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[48px] animate-spin text-secondary">
            progress_activity
          </span>
          <p className="font-semibold text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-28 pb-20 md:pb-12 max-w-5xl mx-auto px-margin-mobile lg:px-margin-desktop min-h-screen bg-background">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-headline-lg font-bold text-primary flex items-center gap-3">
            <span className="material-symbols-outlined text-[36px] text-secondary">manage_accounts</span>
            My Profile
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Manage your personal details and saved delivery addresses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar / Quick Info */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="bg-white rounded-[32px] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.03)] border border-outline-variant/10 sticky top-28">
              <div className="flex flex-col items-center text-center pb-6 border-b border-outline-variant/10">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="relative w-24 h-24 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center mb-4 overflow-hidden group border-2 border-transparent hover:border-secondary transition-all cursor-pointer shadow-sm"
                  title="Click to upload profile picture"
                >
                  {isUploadingImage ? (
                    <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
                  ) : profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[48px] fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                      face
                    </span>
                  )}
                  {/* Hover overlay */}
                  {!isUploadingImage && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-[28px]">photo_camera</span>
                    </div>
                  )}
                </button>
                <h2 className="font-bold text-primary text-headline-sm truncate w-full">{user?.name}</h2>
                <p className="text-xs text-outline font-semibold mt-1 truncate w-full">{user?.email}</p>
              </div>

              <nav className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-sm ${
                    activeTab === 'info' ? 'bg-secondary/10 text-secondary' : 'hover:bg-surface-container-low text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined">person</span>
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-sm ${
                    activeTab === 'addresses' ? 'bg-secondary/10 text-secondary' : 'hover:bg-surface-container-low text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined">location_on</span>
                  Saved Addresses
                </button>

                <div className="my-2 h-px bg-outline-variant/10" />

                <Link href="/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-all group font-semibold text-sm">
                  <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">receipt_long</span>
                  My Orders
                </Link>
                <button 
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!user?.email) return;
                    setSuccessMessage('Sending password reset email...');
                    const res = await resetPassword(user.email);
                    if (res.success) {
                      setSuccessMessage(res.message);
                      setTimeout(() => setSuccessMessage(''), 5000);
                    } else {
                      setSuccessMessage('');
                      alert('Error: ' + res.message);
                    }
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-error/5 text-on-surface-variant hover:text-error transition-all group font-semibold text-sm w-full text-left"
                >
                  <span className="material-symbols-outlined text-outline group-hover:text-error transition-colors">lock_reset</span>
                  Reset Password
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="md:col-span-8 lg:col-span-9">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.03)] border border-outline-variant/10 relative overflow-hidden min-h-[400px]"
            >
              {/* Success Notification Toast */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                    className="absolute top-4 left-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl z-[100] flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {activeTab === 'info' && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Account Details Section */}
                  <div>
                    <h3 className="font-display font-bold text-lg text-primary border-b border-outline-variant/10 pb-2 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">badge</span>
                      Account Details
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-outline block mb-1.5">Full Name</label>
                        <input
                          type="text"
                          {...register('fullName')}
                          className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                            errors.fullName ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                          } text-primary font-medium`}
                          placeholder="Sanjay Rana"
                        />
                        {errors.fullName && <p className="text-xs text-error font-semibold mt-1">{errors.fullName.message}</p>}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-outline block mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full text-sm p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20 text-outline font-medium cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Section */}
                  <div className="pt-4">
                    <h3 className="font-display font-bold text-lg text-primary border-b border-outline-variant/10 pb-2 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">home_pin</span>
                      Default Delivery Address
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-outline block mb-1.5">Street Address</label>
                        <input
                          type="text"
                          {...register('street')}
                          className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                            errors.street ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                          } text-primary font-medium`}
                          placeholder="52 Queen Street, CBD"
                        />
                        {errors.street && <p className="text-xs text-error font-semibold mt-1">{errors.street.message}</p>}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-outline block mb-1.5">City</label>
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

                      <div>
                        <label className="text-xs font-bold text-outline block mb-1.5">Postal Code</label>
                        <input
                          type="text"
                          maxLength={4}
                          {...register('postalCode')}
                          className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                            errors.postalCode ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                          } text-primary font-medium`}
                          placeholder="1010"
                        />
                        {errors.postalCode && <p className="text-xs text-error font-semibold mt-1">{errors.postalCode.message}</p>}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-outline block mb-1.5">Contact Phone Number</label>
                        <input
                          type="tel"
                          {...register('phone')}
                          className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                            errors.phone ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                          } text-primary font-medium`}
                          placeholder="021 123 4567"
                        />
                        {errors.phone && <p className="text-xs text-error font-semibold mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="pt-6 border-t border-outline-variant/10 flex justify-end gap-3">
                    <button
                      type="submit"
                      disabled={!isDirty || isSaving}
                      className={`font-bold py-3 px-8 rounded-2xl transition-all shadow-md flex items-center gap-2 ${
                        !isDirty
                          ? 'bg-surface-container-low text-outline cursor-not-allowed shadow-none'
                          : isSaving
                            ? 'bg-secondary/70 text-white cursor-wait'
                            : 'bg-secondary text-white hover:bg-primary active:scale-95 cursor-pointer'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">save</span>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'addresses' && (
                <div>
                  {!isAddingAddress ? (
                    <>
                      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4 mb-6">
                        <h3 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary">location_on</span>
                          Saved Addresses
                        </h3>
                        <button
                          onClick={() => setIsAddingAddress(true)}
                          className="flex items-center gap-1 text-secondary font-bold text-sm bg-secondary/10 px-4 py-2 rounded-full hover:bg-secondary/20 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          Add New
                        </button>
                      </div>

                      {(!user.savedAddresses || user.savedAddresses.length === 0) ? (
                        <div className="bg-surface-container-low/50 border border-dashed border-outline-variant/30 rounded-3xl p-12 text-center">
                          <span className="material-symbols-outlined text-[48px] text-outline mb-4">location_off</span>
                          <h3 className="font-bold text-primary text-lg mb-2">No Saved Addresses</h3>
                          <p className="text-outline text-sm mb-6 max-w-sm mx-auto">
                            Save multiple delivery addresses here (like Home or Work) for a faster checkout experience.
                          </p>
                          <button
                            onClick={() => setIsAddingAddress(true)}
                            className="bg-primary text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-secondary transition-colors inline-flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Add Your First Address
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {user.savedAddresses.map((addr, idx) => {
                            const isPrimary = user.address?.street === addr.street && user.address?.postalCode === addr.postalCode;
                            return (
                              <div key={idx} className={`relative bg-background p-5 rounded-3xl border transition-all ${isPrimary ? 'border-secondary ring-1 ring-secondary/20 shadow-md' : 'border-outline-variant/20 hover:border-outline-variant/50 hover:shadow-md'}`}>
                                {isPrimary && (
                                  <span className="absolute top-4 right-4 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                    Default
                                  </span>
                                )}
                                <p className="font-bold text-primary text-sm mb-1">{addr.fullName}</p>
                                <p className="text-xs text-outline font-semibold mb-1">{addr.street}</p>
                                <p className="text-xs text-outline font-semibold mb-1">{addr.city}, {addr.postalCode}</p>
                                <p className="text-xs text-outline font-semibold mt-3 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">call</span>
                                  {addr.phone}
                                </p>
                                
                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-outline-variant/10">
                                  {!isPrimary && (
                                    <button
                                      onClick={() => setAsPrimaryAddress(addr)}
                                      className="text-xs font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1 bg-secondary/5 px-2 py-1 rounded-md"
                                    >
                                      Set as Default
                                    </button>
                                  )}
                                  <button
                                    onClick={() => removeSavedAddress(idx)}
                                    className="text-xs font-bold text-error hover:text-red-700 transition-colors ml-auto flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-4 mb-6">
                        <button
                          onClick={() => setIsAddingAddress(false)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-outline-variant/20 transition-colors text-primary"
                        >
                          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                        <h3 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                          Add New Address
                        </h3>
                      </div>

                      <form onSubmit={handleAddressSubmit(onAddAddress)} className="space-y-4 max-w-2xl">
                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-outline block mb-1.5">Recipient Full Name</label>
                          <input
                            type="text"
                            {...registerAddress('fullName')}
                            className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                              addressErrors.fullName ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                            } text-primary font-medium`}
                            placeholder="e.g. John Doe"
                          />
                          {addressErrors.fullName && <p className="text-xs text-error font-semibold mt-1">{addressErrors.fullName.message}</p>}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-outline block mb-1.5">Street Address</label>
                          <input
                            type="text"
                            {...registerAddress('street')}
                            className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                              addressErrors.street ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                            } text-primary font-medium`}
                            placeholder="e.g. 100 Queen Street, Floor 5"
                          />
                          {addressErrors.street && <p className="text-xs text-error font-semibold mt-1">{addressErrors.street.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-outline block mb-1.5">City</label>
                            <select
                              {...registerAddress('city')}
                              className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                                addressErrors.city ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                              } text-primary font-medium cursor-pointer`}
                            >
                              {NZ_CITIES.map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                            {addressErrors.city && <p className="text-xs text-error font-semibold mt-1">{addressErrors.city.message}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-bold text-outline block mb-1.5">Postal Code</label>
                            <input
                              type="text"
                              maxLength={4}
                              {...registerAddress('postalCode')}
                              className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                                addressErrors.postalCode ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                              } text-primary font-medium`}
                              placeholder="1010"
                            />
                            {addressErrors.postalCode && <p className="text-xs text-error font-semibold mt-1">{addressErrors.postalCode.message}</p>}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-outline block mb-1.5">Contact Phone Number</label>
                          <input
                            type="tel"
                            {...registerAddress('phone')}
                            className={`w-full text-sm p-3.5 bg-background rounded-2xl border ${
                              addressErrors.phone ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20'
                            } text-primary font-medium`}
                            placeholder="021 123 4567"
                          />
                          {addressErrors.phone && <p className="text-xs text-error font-semibold mt-1">{addressErrors.phone.message}</p>}
                        </div>

                        <div className="pt-6 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setIsAddingAddress(false)}
                            className="font-bold py-3 px-6 rounded-2xl text-outline hover:bg-surface-container-low transition-all text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSaving}
                            className={`font-bold py-3 px-8 rounded-2xl transition-all shadow-md text-sm ${
                              isSaving
                                ? 'bg-secondary/70 text-white cursor-wait'
                                : 'bg-secondary text-white hover:bg-primary active:scale-95 cursor-pointer'
                            }`}
                          >
                            {isSaving ? 'Saving...' : 'Save Address'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </main>

      <MobileNav />
      <Footer />
    </>
  );
}
