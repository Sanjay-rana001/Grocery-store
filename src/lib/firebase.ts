import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCF4CBOxr3ya8tdO-sRNg0Cznj9gvjK_oI",
  authDomain: "freshmart-11c48.firebaseapp.com",
  projectId: "freshmart-11c48",
  storageBucket: "freshmart-11c48.firebasestorage.app",
  messagingSenderId: "317852513370",
  appId: "1:317852513370:web:76f2511e6f66f9de025463",
  measurementId: "G-B3SM30HMZ1"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
