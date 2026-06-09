'use client';

import React, { useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { saveUser } from '@/lib/db';
import { User } from '@/lib/types';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminUsersPage() {
  const { users, loadAllData, isLoading } = useAdminStore();
  const currentUser = useAuthStore(state => state.user);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleRoleToggle = (user: User) => {
    // Prevent self-demotion
    if (currentUser && currentUser.email === user.email) {
      alert('Security Protocol: You cannot change your own admin privileges.');
      return;
    }

    const updatedUser: User = {
      ...user,
      role: user.role === 'admin' ? 'customer' : 'admin'
    };

    saveUser(updatedUser);
    loadAllData(); // Refresh admin store users list
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="material-symbols-outlined text-[48px] animate-spin text-secondary">
          progress_activity
        </span>
        <p className="font-semibold text-sm">Reviewing staff directories...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-outline-variant/10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-primary">Registered Accounts</h3>
          <p className="text-xs text-outline font-medium">Verify client shoppers and adjust administrator privileges</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-outline-variant/10">
        <table className="w-full text-left text-xs font-semibold text-primary border-collapse">
          <thead>
            <tr className="bg-surface-container-low/60 text-outline border-b border-outline-variant/10">
              <th className="p-4 font-bold">Account Holder</th>
              <th className="p-4 font-bold">Email Address</th>
              <th className="p-4 font-bold">Access Permissions</th>
              <th className="p-4 font-bold">Assigned Address</th>
              <th className="p-4 font-bold text-center">Privilege Adjustment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {users.map((u) => {
              const isAdmin = u.role === 'admin';
              const isSelf = currentUser && currentUser.email === u.email;

              return (
                <tr key={u.id} className="hover:bg-surface-container-low/10 transition-colors">
                  {/* Account Name */}
                  <td className="p-4 font-extrabold text-sm flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-bold text-[11px] uppercase border border-outline-variant/10">
                      {u.name.slice(0, 2)}
                    </div>
                    <div>
                      <p>{u.name}</p>
                      <p className="text-[10px] text-outline font-semibold">UID: {u.id}</p>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-4 font-semibold text-outline">{u.email}</td>

                  {/* Role Access Badge */}
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                      isAdmin 
                        ? 'bg-secondary-container/10 border-secondary-container/30 text-secondary' 
                        : 'bg-primary-fixed/20 border-primary-fixed/30 text-primary'
                    }`}>
                      <span className="material-symbols-outlined text-[13px]">
                        {isAdmin ? 'admin_panel_settings' : 'person'}
                      </span>
                      <span className="capitalize">{u.role}</span>
                    </span>
                  </td>

                  {/* Street Address */}
                  <td className="p-4 text-outline font-medium">
                    {u.address ? (
                      <p className="truncate max-w-[200px]" title={`${u.address.street}, ${u.address.city}`}>
                        {u.address.street}, {u.address.city}
                      </p>
                    ) : (
                      <span className="italic text-[10px] text-outline/65">No Address Saved</span>
                    )}
                  </td>

                  {/* Promotion controls */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleRoleToggle(u)}
                      disabled={!!isSelf}
                      className={`text-[10px] font-black px-4 py-2 rounded-xl border active:scale-95 transition-all shadow-sm flex items-center gap-1.5 mx-auto ${
                        isSelf 
                          ? 'opacity-40 border-outline-variant bg-surface-container text-outline cursor-not-allowed'
                          : isAdmin
                            ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 cursor-pointer'
                            : 'bg-secondary text-white border-secondary hover:bg-primary cursor-pointer'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isAdmin ? 'lock_open' : 'shield'}
                      </span>
                      <span>{isAdmin ? 'Demote to Customer' : 'Promote to Admin'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
