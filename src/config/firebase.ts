import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyA_9iU14NCB9fLgnc9MYIWDQ0Pd1aZhhV0",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "chandu-8ce33.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "chandu-8ce33",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "chandu-8ce33.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "856407713044",
  appId: env.VITE_FIREBASE_APP_ID || "1:856407713044:web:440f756b48da855db4ce01",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-K6GSMHH2EC"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Auth & Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore & Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics conditionally
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
