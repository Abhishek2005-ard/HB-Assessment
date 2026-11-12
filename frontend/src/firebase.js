import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
export const isFirebaseConfigured =
  Boolean(rawApiKey) &&
  rawApiKey !== 'your_firebase_api_key' &&
  !rawApiKey.includes('your_');

// Configure Firebase using environment variables from frontend/.env
const firebaseConfig = {
  apiKey: isFirebaseConfigured ? rawApiKey : 'AIzaSyDemoFallbackKeyForLocalDevelopment1234',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mern-auth-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mern-auth-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mern-auth-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export default app;

