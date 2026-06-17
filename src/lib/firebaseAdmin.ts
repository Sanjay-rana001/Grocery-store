import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export const getAdminApp = () => {
  if (!getApps().length) {
    try {
      const fs = require('fs');
      const path = require('path');
      const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      initializeApp({
        credential: cert(serviceAccount)
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
