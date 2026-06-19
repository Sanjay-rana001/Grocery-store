import { create } from 'zustand';
import { User, Address } from '../lib/types';
import { auth, googleProvider, appleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, sendEmailVerification, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  googleLogin: () => Promise<boolean>;
  appleLogin: () => Promise<boolean>;
  logout: () => void;
  updateAddress: (address: Address) => Promise<void>;
  updateProfile: (name: string, address: Address, profileImage?: string) => Promise<{success: boolean; message: string}>;
  updateSavedAddresses: (savedAddresses: Address[]) => Promise<{success: boolean; message: string}>;
  resetPassword: (email: string) => Promise<{success: boolean; message: string}>;
  clearError: () => void;
}

const isBrowser = typeof window !== 'undefined';

const getInitialUser = (): User | null => {
  if (!isBrowser) return null;
  try {
    const session = localStorage.getItem('freshmart_session') || sessionStorage.getItem('freshmart_session');
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  isAuthenticated: !!getInitialUser(),
  isLoading: false,
  error: null,

  login: async (email, password, rememberMe = false) => {
    set({ isLoading: true, error: null });
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Admin bypass: allow the admin email to bypass email verification for testing purposes
      if (!userCredential.user.emailVerified && userCredential.user.email !== 'sanjayranatanabana@gmail.com') {
        await signOut(auth);
        set({ error: 'Please verify your email address. Check your inbox for the verification link.', isLoading: false });
        return false;
      }
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        set({ error: 'User profile not found.', isLoading: false });
        return false;
      }
      
      const sessionUser = await res.json();
      if (isBrowser) {
        if (rememberMe) {
          localStorage.setItem('freshmart_session', JSON.stringify(sessionUser));
        } else {
          sessionStorage.setItem('freshmart_session', JSON.stringify(sessionUser));
        }
      }
      set({ user: sessionUser, isAuthenticated: true, isLoading: false });
      return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      let friendlyError = 'An error occurred during login.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        friendlyError = 'Invalid email or password. Please check your credentials or create an account.';
      } else if (err.code === 'auth/too-many-requests') {
        friendlyError = 'Too many failed login attempts. Please try again later.';
      }
      set({ error: friendlyError, isLoading: false });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send the verification email instantly with a redirect back to the login page
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/login?verified=true`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, uid: userCredential.user.uid }),
      });

      if (!res.ok) {
        set({ error: 'An error occurred during profile creation.', isLoading: false });
        return false;
      }

      // Do NOT log the user in locally yet. Sign them out so they must verify and log in.
      await signOut(auth);

      set({ isLoading: false });
      return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({ error: err.message || 'An error occurred during signup.', isLoading: false });
      return false;
    }
  },

  googleLogin: async () => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const { user } = userCredential;
      
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      if (!res.ok) {
        res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: user.displayName || 'Google User', email: user.email, uid: user.uid }),
        });
      }

      const sessionUser = await res.json();
      if (isBrowser) localStorage.setItem('freshmart_session', JSON.stringify(sessionUser));
      set({ user: sessionUser, isAuthenticated: true, isLoading: false });
      return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({ error: err.message || 'Google sign-in failed.', isLoading: false });
      return false;
    }
  },

  appleLogin: async () => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await signInWithPopup(auth, appleProvider);
      const { user } = userCredential;
      
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      if (!res.ok) {
        res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: user.displayName || 'Apple User', email: user.email, uid: user.uid }),
        });
      }

      const sessionUser = await res.json();
      if (isBrowser) localStorage.setItem('freshmart_session', JSON.stringify(sessionUser));
      set({ user: sessionUser, isAuthenticated: true, isLoading: false });
      return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({ error: err.message || 'Apple sign-in failed.', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    if (isBrowser) localStorage.removeItem('freshmart_session');
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateAddress: async (address) => {
    // Legacy support, reroute to updateProfile
    const { user } = get();
    if (!user) return;
    
    // Optimistic UI update
    const updatedUser = { ...user, address };
    if (isBrowser) localStorage.setItem('freshmart_session', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  updateProfile: async (name: string, address: Address, profileImage?: string) => {
    const { user } = get();
    if (!user) return { success: false, message: 'You must be logged in' };
    
    set({ isLoading: true, error: null });

    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name, address, profileImage }),
      });

      if (!res.ok) {
        set({ error: 'Failed to update profile.', isLoading: false });
        return { success: false, message: 'Failed to update profile to the database.' };
      }

      const updatedUser = await res.json();
      
      // Update local storage and state
      if (isBrowser) localStorage.setItem('freshmart_session', JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
      
      return { success: true, message: 'Profile updated successfully!' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({ error: 'An error occurred during profile update.', isLoading: false });
      return { success: false, message: 'Network error occurred while updating profile.' };
    }
  },

  updateSavedAddresses: async (savedAddresses: Address[]) => {
    const { user } = get();
    if (!user) return { success: false, message: 'You must be logged in' };
    
    set({ isLoading: true, error: null });

    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, savedAddresses }),
      });

      if (!res.ok) {
        set({ error: 'Failed to update saved addresses.', isLoading: false });
        return { success: false, message: 'Failed to update addresses to the database.' };
      }

      const updatedUser = await res.json();
      
      // Update local storage and state
      if (isBrowser) localStorage.setItem('freshmart_session', JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
      
      return { success: true, message: 'Addresses updated successfully!' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({ error: 'An error occurred during address update.', isLoading: false });
      return { success: false, message: 'Network error occurred while updating addresses.' };
    }
  },

  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent! Check your inbox.' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to send password reset email.' };
    }
  },

  clearError: () => set({ error: null })
}));
