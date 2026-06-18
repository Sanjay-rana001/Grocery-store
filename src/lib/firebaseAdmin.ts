import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

export const getAdminApp = () => {
  if (!getApps().length) {
    try {
      let serviceAccount;
      
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Vercel deployment: read from environment variable
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } else {
        // Local development: read from file
        const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      }
      
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: 'freshmart-11c48.firebasestorage.app'
      });
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
    }
  }
};

export const getAdminAuth = () => {
  getAdminApp();
  return getAuth();
};

export const getAdminDb = () => {
  getAdminApp();
  return getFirestore();
};

export const getAdminStorage = () => {
  getAdminApp();
  return getStorage();
};
