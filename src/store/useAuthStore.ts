import { create } from 'zustand';
import { User, Address } from '../lib/types';
import { getUserByEmail, saveUser } from '../lib/db';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAddress: (address: Address) => void;
  clearError: () => void;
}

const isBrowser = typeof window !== 'undefined';

const getInitialUser = (): User | null => {
  if (!isBrowser) return null;
  try {
    const session = localStorage.getItem('freshmart_session');
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

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API lag
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dbUser = getUserByEmail(email);
      if (!dbUser || dbUser.password !== password) {
        set({ error: 'Invalid email or password.', isLoading: false });
        return false;
      }

      // Safe copy without password
      const sessionUser: User = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        address: dbUser.address
      };

      if (isBrowser) {
        localStorage.setItem('freshmart_session', JSON.stringify(sessionUser));
      }

      set({ user: sessionUser, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ error: 'An error occurred during login.', isLoading: false });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const existingUser = getUserByEmail(email);
      if (existingUser) {
        set({ error: 'An account with this email already exists.', isLoading: false });
        return false;
      }

      const newUser: User = {
        id: `u-${Date.now()}`,
        name,
        email,
        role: 'customer', // Default role
        password,
        address: undefined
      };

      saveUser(newUser);

      // Log in automatically after sign up
      const sessionUser: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      };

      if (isBrowser) {
        localStorage.setItem('freshmart_session', JSON.stringify(sessionUser));
      }

      set({ user: sessionUser, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ error: 'An error occurred during signup.', isLoading: false });
      return false;
    }
  },

  logout: () => {
    if (isBrowser) {
      localStorage.removeItem('freshmart_session');
    }
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateAddress: (address) => {
    const { user } = get();
    if (!user) return;

    const updatedUser = { ...user, address };
    
    // Save to LocalStorage session
    if (isBrowser) {
      localStorage.setItem('freshmart_session', JSON.stringify(updatedUser));
    }

    // Save to user DB
    saveUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address
    });

    set({ user: updatedUser });
  },

  clearError: () => set({ error: null })
}));
