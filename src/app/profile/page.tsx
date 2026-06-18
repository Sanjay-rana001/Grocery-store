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
  const { user, isAuthenticated, updateProfile, resetPassword } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [isAuthenticated, mounted, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
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

  const onSubmit = async (data: ProfileSchemaType) => {
    setIsSaving(true);
    setSuccessMessage('');
    
    const addressData = {
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
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      alert(result.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingImage(true);

    try {
      // Import client storage
      const { storage } = await import('@/lib/firebase');
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `profiles/${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      setProfileImage(url);
    } catch (err) {
      console.error('Firebase Client Upload Error:', err);
      alert('An error occurred while uploading. Ensure your Firebase Storage Rules allow uploads.');
    } finally {
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

      <main className="pt-28 pb-20 md:pb-12 max-w-4xl mx-auto px-margin-mobile lg:px-margin-desktop min-h-screen bg-background">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-headline-lg font-bold text-primary flex items-center gap-3">
            <span className="material-symbols-outlined text-[36px] text-secondary">manage_accounts</span>
            My Profile
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Update your personal details and default delivery address for faster checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar / Quick Info */}
          <aside className="md:col-span-4">
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
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Active Customer
                </div>
              </div>

              <nav className="pt-4 flex flex-col gap-2">
                <Link href="/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-all group font-semibold text-sm">
                  <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">receipt_long</span>
                  My Orders
                </Link>
                <Link href="/checkout" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-all group font-semibold text-sm">
                  <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">shopping_basket</span>
                  Checkout Dashboard
                </Link>
                <button 
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!user?.email) {
                      alert('Error: No email address associated with this account.');
                      return;
                    }
                    // Provide immediate feedback that something is happening
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

          {/* Main Form Area */}
          <div className="md:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.03)] border border-outline-variant/10 relative overflow-hidden"
            >
              {/* Success Notification Toast */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 50, x: '-50%' }}
                    className="fixed bottom-8 left-1/2 bg-emerald-500 text-white px-6 py-3.5 rounded-full text-sm font-bold shadow-xl z-[100] flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">task_alt</span>
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

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
                        placeholder="John Carter"
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
                      <p className="text-[10px] text-outline font-medium mt-1">Email cannot be changed.</p>
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
            </motion.div>
          </div>
        </div>
      </main>

      <MobileNav />
      <Footer />
    </>
  );
}
